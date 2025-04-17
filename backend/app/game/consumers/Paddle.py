from enum import Enum
from game.consumers.constants import SCREEN_WITDH, SCREEN_HEIGHT, PADDLE_WITH, PADDLE_HEIGHT, MOVE_VALUE
from typing import Dict


class PaddleType(Enum):
    RIGHT = 1,
    LEFT = 2,
    TOP = 3,
    BOTTOM = 4


class Paddle:

    def __init__(self, paddle_type=PaddleType.RIGHT, x=0, y=SCREEN_HEIGHT//2, width=PADDLE_WITH, height=PADDLE_HEIGHT, color="white"):
        self.type = paddle_type
        if self.type == PaddleType.RIGHT:
            self.x = SCREEN_WITDH - width
        else:
            self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.color = color

    def get_bounds(self):
        """Return the bounding box as (left, right, top, bottom)"""
        return self.left, self.right, self.top, self.bottom

    @property
    def left(self):
        return self.x

    @property
    def right(self):
        return self.x + self.width

    @property
    def top(self):
        return self.y

    @property
    def bottom(self):
        return self.y + self.height

    def move_up(self):
        amount = MOVE_VALUE
        if (self.top - amount <= 0):
            amount = self.top
        self.y -= amount

    def move_down(self):
        amount = MOVE_VALUE
        if (self.bottom + amount >= SCREEN_HEIGHT):
            amount = SCREEN_HEIGHT - self.bottom
        self.y += amount

    def to_dict(self)-> Dict:
        """Convert obj to dict"""
        return {
            'x': self.x,
            'y': self.y,
            'width': self.width,
            'height': self.height,
            'color': self.color,
        }

    def reset(self, height=600)-> None:
        self.y = height // 2
