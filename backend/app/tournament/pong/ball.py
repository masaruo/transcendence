from .APongObj import PongObj
from .paddle import Paddle
from .wall import Wall
from .constants import SCREEN_HEIGHT, SCREEN_WITDH, BALL_RADIUS, BALL_SPEED
import random
from enum import Enum

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
        self.dx: int = self.getRandomDx()#todo game speed
        self.dy: int = self.getRandomDy()#todo game speed

    @staticmethod
    def getRandomDx() -> int:
        direction:int = random.choice(seq=[-1, 1])
        return direction * BALL_SPEED

    @staticmethod
    def getRandomDy() -> int:
        return int(random.uniform(a=-3, b=3))

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

        if (paddle.type == Paddle.SIDE.L1 or paddle.type == Paddle.SIDE.L2):  #if left sides
            if(bl <= pr and bb >= pt and bt <= pb):
                self.reverseDx()
        else:
            if(br >= pl and bb >= pt and bt <= pb):
                self.reverseDx()

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

        # if bl > wr or br < wl:
        #     print(f"Ball out of bounds: {bl},{br} wall: {wl},{wr}")
        #     return False
        # return True

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
        self.dx = self.getRandomDx()
        self.dy = self.getRandomDy()

    def update(self) -> None:
        self.x += self.dx
        self.y += self.dy

    def reverseDx(self) -> None:
        abs_dx: int = abs(self.dx)
        if self.dx < 0:
            self.dx = abs_dx
        else:
            self.dx = abs_dx * -1

    def reverseDy(self) -> None:
        abs_dy: int = abs(self.dy)
        if self.dy < 0:
            self.dy = abs_dy
        else:
            self.dy = abs_dy * -1
