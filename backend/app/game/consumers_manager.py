from typing import Final
from game.models import GameRoom, GameStatus
from game.consumers_parts import Ball, Paddle, Score, Canvas

class GameManager:
    # game_room: GameRoom
    _group_name: str
    # status: GameStatus
    canvas: Canvas
    ball: Ball
    left_paddle: Paddle
    right_paddle: Paddle
    score:Score

    def __init__(self, group_name: str):
        # self.game_room = game_room
        self._group_name = group_name
        # self.status = self.game_room.status
        # self.canvas = Canvas()
        # self.ball = Ball()
        # self.left_paddle = Paddle()
        # self.right_paddle = Paddle()
        # self.score = Score()

    @property
    def group_name(self)-> str:
        return self._group_name

    @group_name.setter
    def group_name(self, name:str)-> None:
        self._group_name = name

    @property
    def status(self):
        return self.status
