import asyncio
from re import I, Match

from tournament.models import MatchStatusType, TeamType, Match, Score, Tournament, MatchModeType
from .APongObj import PongObj
from .ball import Ball, LOSER
from .paddle import Paddle
from .wall import Wall
from channels.layers import get_channel_layer
from channels.db import database_sync_to_async
import logging
from asgiref.sync import sync_to_async
import time

class Manager:
    _instances: dict[str, 'Manager'] = {}

    @classmethod
    async def get_instance(cls, match_id)-> 'Manager':
        if match_id not in cls._instances:
            instance = cls(match_id)
            await instance.initialize_with_db()
            cls._instances[match_id] = instance
        return cls._instances[match_id]

    @classmethod
    def remove_instance(cls, match_id)-> None:
        if match_id in cls._instances:
            del cls._instances[match_id]

    def __init__(self, match_id) -> None:
        self.objs: list[PongObj] = [
            Ball(),
            Paddle(side=Paddle.SIDE.R1, color="#ef3d2d"),
            Paddle(side=Paddle.SIDE.L1, color="#2d80f3"),
        ]
        self.wall = Wall()
        self._match_id = match_id
        self._group_name = f'match_{self._match_id}'
        self.channel_layer = get_channel_layer()
        self.task = None
        self.is_continue = True
        self._need_update_score : bool = True # 最初に0 - 0のスコアを送信
        self._match : Match = None # 毎フレーム更新する
        self._losers : list[LOSER] = []
        self.connected_user_id : set[int] = set()

    def start(self):
        if self.task:
            return
        self.task = asyncio.create_task(self.run_game_loop())
        self.task.add_done_callback(lambda _:
            asyncio.create_task(
                self.channel_layer.group_send(
                    self._group_name,
                    {
                        'type': 'match_finished'
                    }
                )
            )
        )

    async def run_game_loop(self):
        draw_requests = asyncio.Queue()
        draw_task = asyncio.create_task(self.draw_loop(draw_requests))
        try:
            while self.is_continue:
                start_time : float = time.perf_counter()
                # DBからMatchを取得
                self._match = await Match.objects.aget(id=self._match_id)
                # オブジェクトの位置更新
                self.update()
                # 試合状況更新
                await self.update_score()
                await self._match.asave()
                # 試合状況を非同期で送信
                if self._need_update_score:
                    match_status = await self.get_match_status()
                else:
                    match_status = None
                draw_requests.put_nowait(
                    {
                        'object': self.to_dict(),
                        'match': match_status
                    }
                )
                self._need_update_score = False
                # 1 / 30 秒待つ
                now = time.perf_counter()
                wait_time : float = 1/30 - (max(0, now - start_time))
                if wait_time > 0:
                    await asyncio.sleep(wait_time)

        except asyncio.CancelledError:
            logging.info("Game loop cancelled")
            self.is_continue = False
            # 必要に応じてクリーンアップ処理
        except Exception:
            logging.exception("Error in game loop")
            self.is_continue = False
        finally:
            logging.info("Game loop ended")
            # 最終的なクリーンアップ処理
            draw_requests.put_nowait(None)
            await draw_task

    def request_send_score(self):
        self._need_update_score = True

    async def draw_loop(self, requests: asyncio.Queue):
        while True:
            request = await requests.get()
            if not request:
                break
            # オブジェクトの位置情報送信
            await self.send_objects_status(request['object'])
            # 試合状況送信
            if request['match']:
                await self.send_match_status(request['match'])

    def update(self):
        for obj in self.objs:
            obj.update()
        self.check_collisions()

    def reset_match(self):
        for obj in self.objs:
            if isinstance(obj, PongObj):
                obj.reset()

    def to_dict(self):
        obj_dict = {}
        ball_arr = []
        paddle_arr = []
        for obj in self.objs:
            if not isinstance(obj, PongObj):
                continue
            elif isinstance(obj, Ball):
                ball_arr.append(obj.to_dict())
            elif isinstance(obj, Paddle):
                paddle_arr.append(obj.to_dict())
        obj_dict["balls"] = ball_arr
        obj_dict['paddles'] = paddle_arr
        return (obj_dict)

    def check_collisions(self) -> None:
        balls: list[Ball] = [obj for obj in self.objs if isinstance(obj, Ball)]
        paddles: list[Paddle] = [obj for obj in self.objs if isinstance(obj, Paddle)]

        for ball in balls:
            loser = ball.check_to_continue_with_wall(wall=self.wall)
            if loser in [LOSER.LEFT, LOSER.RIGHT]:
                self._losers.append(loser)
            for paddle in paddles:
                ball.check_with_paddle(paddle=paddle)

    async def is_ready(self) -> bool:
        my_match = await Match.objects.aget(id=self._match_id)
        return len(self.connected_user_id) == await sync_to_async(my_match.get_required_people)()

    def get_paddle(self, side: Paddle.SIDE) -> Paddle | None:
        for obj in self.objs:
            if isinstance(obj, Paddle) and obj.type == side:
                return obj
        return None

    async def update_score(self):
        if self._match.match_status == MatchStatusType.FINISHED or not self._losers:
            return

        self._need_update_score = True

        score, _ = await Score.objects.aget_or_create(match=self._match)

        for loser in self._losers:
            if loser == LOSER.LEFT: # TEAM1の負け
                score.add_score(team_type=TeamType.TEAM2)
            elif loser == LOSER.RIGHT: # TEAM2の負け
                score.add_score(team_type=TeamType.TEAM1)
            if score.check_finish():
                self.is_continue = False
                await sync_to_async(score.set_winner)()
                break

        self._losers.clear()
        await score.asave()

        if self.is_continue:
            self.reset_match()
        else:
            await sync_to_async(self._match.finish_match)()

    async def send_objects_status(self, info):
        await self.channel_layer.group_send(
            self._group_name,
            {
                'type': 'game_update',
                'data': info
            }
        )

    async def get_match_status(self):
        if not self._match:
            match = await Match.objects.aget(id=self._match_id)
        else:
            match = self._match
        score, _ = await Score.objects.aget_or_create(match=match)
        match_dict = await sync_to_async(match.to_dict)()
        score_dict = await sync_to_async(score.to_dict)()
        return {
            'match': match_dict,
            'score': score_dict,
        }

    async def send_match_status(self, info):
        await self.channel_layer.group_send(
            self._group_name,
            {
                'type': 'status_update',
                'data': info
            }
        )

    async def finish(self):
        if self.task:
            if not self.task.done():
                try:
                    self.task.cancel()
                    await self.task
                except asyncio.CancelledError:
                    pass
                except Exception as e:
                    self.logger.exception(f"Task cancel error: {e}")
            self.task = None

    async def initialize_with_db(self):
        own_tournament = await self._get_own_tournament()

        if own_tournament.match_type == MatchModeType.DOUBLES:
            self.objs.append(Paddle(side=Paddle.SIDE.R2, color="#f6a498"))
            self.objs.append(Paddle(side=Paddle.SIDE.L2, color="#ccc8fd"))

        ball_number = own_tournament.ball_number
        if ball_number >= 2:
            self.objs.append(Ball(color='#ffb200'))


    @database_sync_to_async
    def _get_own_tournament(self):
        own_match = Match.objects.get(id=self._match_id)
        own_tournament = own_match.tournament
        return own_tournament
