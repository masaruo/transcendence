from .APongObj import PongObj
from enum import Enum
from .constants import SCREEN_HEIGHT, PADDLE_HEIGHT, PADDLE_WIDTH, SCREEN_WITDH, MOVE_VALUE

class Paddle(PongObj):
    class SIDE(Enum):
        R1 = 1
        R2 = 2
        L1 = 3
        L2 = 4

    class Direction(Enum):
        DOWN = -1
        NONE = 0
        UP = 1

    def __init__(self, side:SIDE=SIDE.R1, x:int=0, y:int=SCREEN_HEIGHT//2, width:int=PADDLE_WIDTH, height:int=PADDLE_HEIGHT, color:str="white") -> None:
        self.type: Paddle.SIDE = side
        self.y: int = y
        self.width: int = width
        self.height: int = height
        self.color: str = color
        self.x: int = x
        self.speed: float = 0
        self.direction: int = 0

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

    def setDirection(self, direction: Direction):
        self.direction = direction.value

    def update(self) -> None:
        power = 0.14
        resistance = 0.07

        self.speed += self.direction * power
        if self.speed > 0:
            self.speed = min(1, max(0, self.speed - resistance))
        elif self.speed < 0:
            self.speed = max(-1, min(0, self.speed + resistance))

        self.y += self.speed * MOVE_VALUE
        if self.bottom > SCREEN_HEIGHT:
            self.y = SCREEN_HEIGHT - self.height
        elif self.top < 0:
            self.y = 0
