from typing import Final
from game.models import GameRoom, GameStatus
from game.consumers_parts import Ball, Paddle, Score, Screen

class GameManager:
    # game_room: GameRoom
    _group_name: str
    # status: GameStatus
    _canvas: Screen
    _ball: Ball
    _left_paddle: Paddle
    _right_paddle: Paddle
    # score:Score

    def __init__(self, group_name: str):
        # self.game_room = game_room
        self._group_name = group_name
        # self.status = self.game_room.status
        self._screen = Screen()
        self._ball = Ball()
        self._left_paddle = Paddle()
        self._right_paddle = Paddle()
        # self.score = Score()

    @property
    def group_name(self)-> str:
        return self._group_name

    @group_name.setter
    def group_name(self, name:str)-> None:
        self._group_name = name

    def _collision_ball_and_wall(self)-> None:
        if self._ball.getTopY() < 0 or self._ball.getBottomY() > self._screen.height:
            self._ball.setDy(-self._ball.getDy())

    def _check_collision(self)-> None:
        self._collision_ball_and_wall()

    def update(self)-> None:
        self._ball.move()
        self._check_collision()

    def to_dict(self)-> dict:
        return {
            'type': 'game_state',
            'ball': self._ball.to_dict(),
            'left_paddle': self._left_paddle.to_dict(),
            'right_paddle': self._right_paddle.to_dict(),
        }



    # @property
    # def status(self):
    #     return self.status
