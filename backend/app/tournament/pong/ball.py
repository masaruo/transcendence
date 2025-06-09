from .APongObj import PongObj
from .paddle import Paddle
from .wall import Wall
from .constants import SCREEN_HEIGHT, SCREEN_WITDH, BALL_RADIUS, BALL_SPEED
import random
from enum import Enum
import math

class LOSER(Enum):
    CONTINUE = 0
    RIGHT = 1
    LEFT = 2

class Ball(PongObj):
    def __init__(self, x: int = SCREEN_WITDH // 2, y: int = SCREEN_HEIGHT // 2, radius: int = BALL_RADIUS, color: str = "white"):
        self.x: int = x
        self.y: int = y
        self.radius: int = radius
        self.color: str = color
        self.dx: int
        self.dy: int

        self.set_delta_randomly() #todo game speed

    def set_delta_randomly(self):
        x_border: float = 0.5
        x_angle = random.choice([-1, 1]) * random.uniform(x_border, 1)
        y_angle = random.choice([-1, 1]) * math.sqrt(1 - x_angle ** 2)
        self.set_delta(x_angle, y_angle)

    def set_delta(self, x_angle: float, y_angle: float):
        self.dx = x_angle * BALL_SPEED
        self.dy = y_angle * BALL_SPEED

    @property
    def left(self) -> int:
        return self.x - self.radius

    @property
    def right(self) -> int:
        return self.x + self.radius

    @property
    def top(self) -> int:
        return self.y - self.radius

    @property
    def bottom(self) -> int:
        return self.y + self.radius

    def get_bounds(self) -> tuple[int, int, int, int]:
        """Return the bounding box as (left, right, top, bottom)"""
        return self.left, self.right, self.top, self.bottom

    def check_with_paddle(self, paddle: Paddle)-> None:
        """left, right, top, bottom"""
        bl, br, bt, bb = self.get_bounds()
        pl, pr, pt, pb = paddle.get_bounds()

        if(br >= pl and bl <= pr and bb >= pt and bt <= pb):
            y_max = 0.85
            y_angle = self.get_angle(paddle) * y_max
            x_angle = math.sqrt(1 - y_angle ** 2)
            if paddle.type == Paddle.SIDE.L1 or paddle.type == Paddle.SIDE.L2:
                self.x = pr + self.radius
            else:
                x_angle *= -1
                self.x = pl - self.radius
            self.set_delta(x_angle=x_angle, y_angle=y_angle)

    def check_to_continue_with_wall(self, wall: Wall)-> 'LOSER':
        bl, br, bt, bb = self.get_bounds()
        wl, wr, wt, wb = wall.get_bounds()

        if bt < wt:
            self.reverseDy()
        elif bb > wb:
            self.reverseDy()

        if bl > wr:
            return LOSER.RIGHT
        elif br < wl:
            return LOSER.LEFT
        else:
            return LOSER.CONTINUE

    def to_dict(self) -> dict[str, int | str]:
        return {
            'x': self.x,
            'y': self.y,
            'radius': self.radius,
            'color': self.color,
        }

    def reset(self) -> None:
        self.x = SCREEN_WITDH // 2
        self.y = SCREEN_HEIGHT // 2
        self.set_delta_randomly()

    def update(self) -> None:
        self.x += self.dx
        self.y += self.dy

    def get_angle(self, paddle: Paddle) -> float:
        _, _, pt, pb = paddle.get_bounds()
        top = pt - self.radius
        bottom = pb + self.radius
        origin = (top + bottom) / 2

        return (self.y - origin) / (bottom - origin)

    def reverseDy(self) -> None:
        self.dy *= -1
