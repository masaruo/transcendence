from game.pong.APongObj import PongObj
from enum import Enum
from game.pong.constants import SCREEN_HEIGHT, PADDLE_HEIGHT, PADDLE_WIDTH, SCREEN_WITDH, MOVE_VALUE


class Paddle(PongObj):
    class SIDE(Enum):
        R1 = 1,
        R2 = 2,
        L1 = 3,
        L2 = 4

    def __init__(self, side:SIDE=SIDE.R1, x:int=0, y:int=SCREEN_HEIGHT//2, width:int=PADDLE_WIDTH, height:int=PADDLE_HEIGHT, color:str="white") -> None:
        self.type: Paddle.SIDE = side
        self.y: int = y
        self.width: int = width
        self.height: int = height
        self.color: str = color
        self.x: int = x
        if self.type == self.SIDE.R1:
            self.x = SCREEN_WITDH - self.width
        elif self.type == self.SIDE.L1:
            self.x = x
        elif self.type == self.SIDE.R2:
            self.x = SCREEN_WITDH - self.width - 20
        elif self.type == self.SIDE.L2:
            self.x = x + 20

    def get_bounds(self) -> tuple[int, int, int, int]:
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

    def to_dict(self)-> dict[str, int | str]:
        """Convert obj to dict"""
        return {
            'x': self.x,
            'y': self.y,
            'width': self.width,
            'height': self.height,
            'color': self.color,
        }

    def reset(self)-> None:
        self.y = SCREEN_HEIGHT // 2

    def moveUp(self):
        amt = MOVE_VALUE
        if (self.top - amt <= 0):
            amt = self.top
        self.y -= amt

    def moveDown(self):
        amt = MOVE_VALUE
        if (self.bottom + amt >= SCREEN_HEIGHT):
            amt = SCREEN_HEIGHT - self.bottom
        self.y += amt
