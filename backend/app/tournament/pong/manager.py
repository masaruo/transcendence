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
        self.connected_count : int = 0

    def start(self):
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
        try:
            # print("Game loop started")
            while self.is_continue:
                # DBからMatchを取得
                self._match = await Match.objects.aget(id=self._match_id)
                # オブジェクトの位置更新
                self.update()
                # 試合状況更新
                await self.update_score()
                await self._match.asave()
                # オブジェクトの位置情報送信
                await self.send_objects_status()
                # 試合状況送信
                if self._need_update_score:
                    await self.send_match_status()
                    self._need_update_score = False
                # 1 / 60 秒待つ
                await asyncio.sleep(1/60)

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

    def update(self):
        for obj in self.objs:
            if isinstance(obj, Ball):
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
                logging.info(loser)
                self._losers.append(loser)
            for paddle in paddles:
                ball.check_with_paddle(paddle=paddle)

    def is_ready(self) -> bool:
        return self.connected_count == 2

    async def init(self):
        await self.channel_layer.group_send(
            self._group_name,
            {
                'type': 'game_initialization',
                'data': self.to_dict()
            }
        )

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
            if loser == LOSER.LEFT:
                logging.info("LEFT")
                score.add_score(team_type=TeamType.TEAM1)
            elif loser == LOSER.RIGHT:
                score.add_score(team_type=TeamType.TEAM2)
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

    async def send_objects_status(self):
        await self.channel_layer.group_send(
            self._group_name,
            {
                'type': 'game_update',
                'data': self.to_dict()
            }
        )

    async def send_match_status(self):
        score, _ = await Score.objects.aget_or_create(match=self._match)
        match_dict = await sync_to_async(self._match.to_dict)()
        score_dict = score.to_dict()
        await self.channel_layer.group_send(
            self._group_name,
            {
                'type': 'status_update',
                'data': {
                    'match': match_dict,
                    'score': score_dict,
                }
            }
        )

    def finish(self):
        if self.task is not None:
            if not self.task.done():
                self.task.cancel()
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
