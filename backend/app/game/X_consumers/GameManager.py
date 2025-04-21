import asyncio
from typing import Dict, Optional, Coroutine
from game.X_consumers.Ball import Ball
from game.X_consumers.Paddle import Paddle, PaddleType
from game.X_consumers.Wall import Wall
from game.models import GameRoom, GameStatus
from game.X_consumers.constants import SCREEN_WITDH, SCREEN_HEIGHT
from channels.layers import get_channel_layer


class GameManager:
    """
    handle game logic
    """
    _instances: Dict[str, 'GameManager'] = {}

    @classmethod
    def get_instance(cls, group_name: str)-> 'GameManager':
        if group_name not in cls._instances:
            cls._instances[group_name] = cls(group_name)
        return cls._instances[group_name]

    @classmethod
    def remove_instance(cls, group_name: str)-> None:
        if group_name in cls._instances:
            del cls._instances[group_name]

    def __init__(self, group_name: str):
        self._group_name = group_name
        self._wall = Wall()
        self._ball = Ball()
        # self._paddles = [Paddle(position=Paddle.PaddleType.RIGHT), Paddle(position=Paddle.PaddleType.LEFT)]
        self._left_paddle = Paddle(paddle_type=PaddleType.LEFT, color='green')
        self._right_paddle = Paddle(paddle_type=PaddleType.RIGHT, color='blue')
        self._game_room: Optional[GameRoom] = None
        self._channel_layer = get_channel_layer()
        self._is_continue: bool = True
        self._task: Coroutine = None

    @property
    def group_name(self)-> str:
        return self._group_name

    @group_name.setter
    def group_name(self, name: str)-> None:
        self._group_name = name

    def check_collison(self)-> None:
        ''' left, right, top, bottom '''
        bl, br, bt, bb = self._ball.get_bounds()
        rl, rr, rt, rb = self._right_paddle.get_bounds()
        ll, lr, lt, lb = self._left_paddle.get_bounds()
        wl, wr, wt, wb = self._wall.get_bounds()

        # check right paddle
        if br >= rl and bb >= rt and bt <= rb:
            self._ball.reverse_dx()
        # check left paddle
        elif bl <= lr and bb >= lt and bt <= lb:
            self._ball.reverse_dx()
        # check wall top
        elif bt < wt:
            self._ball.reverse_dy()
        # check wall bottom
        elif bb > wb:
            self._ball.reverse_dy()
        # check wall right
        elif bl > wr:
            self._is_continue = False
        # check wall left
        elif br < wl:
            self._is_continue = False

    def update(self)-> None:
        self._ball.move()
        self.check_collison()

    def to_dict(self)-> Dict:
        """
        #!returns dict of game state. Game state as follows.
        {
            'type': 'game_update',
            'data': {
                'ball': {
                    'x': 170.0118982458349,
                    'y': 140.4899380171883,
                    'radius': 10,
                    'color': 'white'
                    },
                'left_paddle': {
                    'x': 0,
                    'y': 300,
                    'width': 20,
                    'height': 80,
                    'color': 'white'
                },
                'right_paddle': {
                    'x': 880,
                    'y': 300,
                    'width': 20,
                    'height': 80,
                    'color': 'white'
                }
            }
        }
        #! format to send to front end
        await self._channel_layer.group_send(
            self.group_name,
            {
                'type': 'game_update',
                'data': self.to_dict()
            }
        )
        """
        return {
            'ball': self._ball.to_dict(),
            'left_paddle': self._left_paddle.to_dict(),
            'right_paddle': self._right_paddle.to_dict(),
        }

    def reset(self)-> None:
        self._ball.reset()
        self._left_paddle.reset()
        self._right_paddle.reset()

    async def initialization(self)-> None:
        await self._channel_layer.group_send(
            self.group_name,
            {
                'type': 'game_initialization',
                'data': self.to_dict()
            }
        )

    async def start(self)-> None:
        self._task = asyncio.create_task(self.run_game_loop())

    def stop(self)->None:
        pass

    async def run_game_loop(self)-> None:
        try:
            while self._is_continue:
                self.update()
                await self._channel_layer.group_send(
                    self.group_name,
                    {
                        'type': 'game_update',
                        'data': self.to_dict()
                    }
                )
                await asyncio.sleep(1/10)#! speed
        except asyncio.CancelledError:
            self._is_continue = False
