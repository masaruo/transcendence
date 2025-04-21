from typing import Final
from game.models import GameRoom, GameStatus
from app.game.X_consumers_parts import Ball, Paddle, Score, Screen

class GameManager:
    # game_room: GameRoom
    _group_name: str
    # status: GameStatus
    _screen: Screen
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

    def _ball_vs_wall(self)-> None:
        if self._ball.getTopY() < 0 or self._ball.getBottomY() > self._screen.height:
            self._ball.setDy(-self._ball.getDy())

    def _ball_vs_paddles(self)-> None:
        # vs left
        if self._ball.getLeftX() <= self._left_paddle.getRightX() and self._ball.getBottomY() >= self._left_paddle.getTopY() and self._ball.getTopY() <= self._left_paddle.getBottomY():
            self._ball.setDx(abs(self._ball.getDx()))
            relative_y = (self._ball.getY() - self._left_paddle.getTopY()) / self._left_paddle.getHeight()
            self._ball.setDy(relative_y * 2)
            print("left paddle collison")
        # vs right
        elif self._ball.getRightX() >= self._right_paddle.getLeftX() and self._ball.getBottomY() >= self._right_paddle.getTopY() and self._ball.getTopY() <= self._right_paddle.getBottomY():
            self._ball.setDx(-abs(self._ball.getDx()))
            relative_y = (self._ball.getY() - self._right_paddle.getTopY()) / self._right_paddle.getHeight()
            self._ball.setDy(relative_y * 2)
            print("right paddle collision")

    def _check_collision(self)-> None:
        self._ball_vs_wall()
        self._ball_vs_paddles()

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
