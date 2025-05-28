import asyncio
from re import I, Match

from tournament.models import MatchStatusType, TeamType, Match, Score, Tournament, MatchModeType
from .APongObj import PongObj
from .ball import Ball, LOSER
from .paddle import Paddle
from .wall import Wall
from channels.layers import get_channel_layer
from channels.db import database_sync_to_async

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

    def start(self):
        self.task = asyncio.create_task(self.run_game_loop())
        self.task.add_done_callback(lambda _:
            asyncio.create_task(
                self.channel_layer.group_send(
                    self.group_name,
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
                await self.update()
                await self.channel_layer.group_send(
                    self._group_name,
                    {
                        'type': 'game_update',
                        'data': self.to_dict()
                    }
                )
                if self._need_update_score:
                    await self.update_status(Match.objects.get(id=self._match_id))
                    self._need_update_score = False
                await asyncio.sleep(1/60)
        except asyncio.CancelledError:
            print("Game loop cancelled")
            self.is_continue = False
            # 必要に応じてクリーンアップ処理
        except Exception as e:
            print(f"Error in game loop: {e}")
            self.is_continue = False
        finally:
            print("Game loop ended")
            # 最終的なクリーンアップ処理

    async def update(self):
        for obj in self.objs:
            if isinstance(obj, Ball):
                obj.update()
        await self.check_collisions()

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

    async def check_collisions(self) -> None:
        balls: list[Ball] = [obj for obj in self.objs if isinstance(obj, Ball)]
        paddles: list[Paddle] = [obj for obj in self.objs if isinstance(obj, Paddle)]

        for ball in balls:
            loser = ball.check_to_continue_with_wall(wall=self.wall)
            if loser in [LOSER.LEFT, LOSER.RIGHT]:
                self.update_score(loser)
            for paddle in paddles:
                ball.check_with_paddle(paddle=paddle)

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

    def update_score(self, loser):
        match = Match.objects.get(id=self._match_id)
        if match.match_status == MatchStatusType.FINISHED:
            return

        self._need_update_score = True

        if loser == LOSER.LEFT:
            match.add_score(team_type=TeamType.TEAM1)
        elif loser == LOSER.RIGHT:
            match.add_score(team_type=TeamType.TEAM2)
        
        self.is_continue = not match.check_finish()

        if self.is_continue:
            self.reset_match()

    async def update_status(self, match: Match):
        score = Score.objects.get(match=match)
        await self.channel_layer.group_send(
            self._group_name,
            {
                'type': 'status_update',
                'data': {
                    'match': match.to_dict(),
                    'score': score.to_dict(),
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
