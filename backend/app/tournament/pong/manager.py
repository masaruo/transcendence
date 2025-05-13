import asyncio
from re import Match
from asgiref.sync import sync_to_async

from tournament.models import MatchStatusType, TeamType, Match
from .APongObj import PongObj
from .ball import Ball, LOSER
from .paddle import Paddle
from .wall import Wall
from channels.layers import get_channel_layer # type: ignore

class Manager:
    _instances: dict[str, 'Manager'] = {}

    @classmethod
    def get_instance(cls, name: str, match_id=None, websocket=None)-> 'Manager':
        if name not in cls._instances:
            cls._instances[name] = cls(name, match_id)
        return cls._instances[name]

    @classmethod
    def remove_instance(cls, name: str)-> None:
        if name in cls._instances:
            del cls._instances[name]

    def __init__(self, group_name: str, match_id=None, websocket=None) -> None:
        self.objs: list[PongObj] = [
            Ball(),
            #todo add multiple balls and paddles
            # Ball(y=150, color='yellow'),
            # Ball(y=100, color='red'),
            Paddle(side=Paddle.SIDE.R1, color="green"),
            # Paddle(side=Paddle.SIDE.R2, color="white"),
            Paddle(side=Paddle.SIDE.L1, color="blue"),
            # Paddle(side=Paddle.SIDE.L2, color="red"),
        ]
        self.wall = Wall()
        self._group_name: str = group_name
        self._match_id = match_id
        self._websocket = websocket
        self.channel_layer = get_channel_layer()
        self.task = None
        self.is_continue = True

    @property
    def group_name(self)-> str:
        return self._group_name

    @group_name.setter
    def group_name(self, name: str)-> None:
        self._group_name = name

    async def start(self):
        self.task = asyncio.create_task(self.run_game_loop())

    async def run_game_loop(self):
        try:
            print("Game loop started")
            while self.is_continue:
                await self.update()
                await self.channel_layer.group_send(
                    self.group_name,
                    {
                        'type': 'game_update',
                        'data': self.to_dict()
                    }
                )
                await asyncio.sleep(1/10)
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

    async def update(self):  #todo PADDLE update
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

        to_continue: bool = True

        for ball in balls:
            loser = ball.check_to_continue_with_wall(wall=self.wall)
            if loser in [LOSER.LEFT, LOSER.RIGHT]:
                await sync_to_async(self.update_score)(loser)
            for paddle in paddles:
                ball.check_with_paddle(paddle=paddle)

        self.is_continue: bool = to_continue

    async def init(self):
        await self.channel_layer.group_send(
            self.group_name,
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
        if loser == LOSER.LEFT:
            match.add_score_and_check_finished(team_type=TeamType.TEAM1)
            match.save()
        elif loser == LOSER.RIGHT:
            match.add_score_and_check_finished(team_type=TeamType.TEAM2)
            match.save()

        if match.match_status == MatchStatusType.FINISHED:
            self.finish_sync()

        self.reset_match()

    async def finish(self):
        print("async finish called")
        if hasattr(self, 'task') and self.task:
            print(f"Cancelling task: {self.task}")
            self.task.cancel()

            try:
                # キャンセルされたタスクの完了を待つ
                await asyncio.shield(asyncio.wait_for(self.task, timeout=2.0))
                print("Task completed successfully after cancellation")
            except asyncio.CancelledError:
                print("Task was cancelled as expected")
            except asyncio.TimeoutError:
                print("Warning: Task cancellation timed out")
            except Exception as e:
                print(f"Error during task cancellation: {e}")

        await self.channel_layer.group_send(
            self._group_name,
            {
                'type': 'game_finished',
                'message': 'Game has ended'
            }
        )

        # 確実にis_continueをFalseに設定
        self.is_continue = False


    def finish_sync(self):
        from asgiref.sync import async_to_sync
        print("finish_sync called - wrapping async finish")
        async_to_sync(self.finish)()
