from game.pong.APongObj import PongObj
from game.pong.paddle import Paddle
from game.pong.wall import Wall
from game.pong.constants import SCREEN_HEIGHT, SCREEN_WITDH, BALL_RADIUS, BALL_SPEED
import random


class Ball(PongObj):
    def __init__(self, x=SCREEN_WITDH//2, y=SCREEN_HEIGHT//2, radius=BALL_RADIUS, color="white"):
        self.x = x
        self.y = y
        self.radius = radius
        self.color = color
        self.dx = self.getRandomDx()
        self.dy = self.getRandomDy()

    @staticmethod
    def getRandomDx():
        direction = random.choice([-1, 1])
        return direction * BALL_SPEED

    @staticmethod
    def getRandomDy():
        return random.uniform(-3, 3)

    @property
    def left(self):
        return self.x - self.radius

    @property
    def right(self):
        return self.x + self.radius

    @property
    def top(self):
        return self.y - self.radius

    @property
    def bottom(self):
        return self.y + self.radius

    def get_bounds(self):
        """Return the bounding box as (left, right, top, bottom)"""
        return self.left, self.right, self.top, self.bottom

    def check_with_paddle(self, paddle: Paddle)-> None:
        if (not isinstance(paddle, Paddle)):
            return

        """left, right, top, bottom"""
        bl, br, bt, bb = self.get_bounds()
        pl, pr, pt, pb = paddle.get_bounds()

        if (paddle.type == Paddle.SIDE.L1 or paddle.type == Paddle.SIDE.L2):  #if left sides
            if(bl <= pr and bb >= pt and bt <= pb):
                self.reverseDx()
        else:
            if(br >= pl and bb >= pt and bt <= pb):
                self.reverseDx()

    def check_to_continue_with_wall(self, wall: Wall)-> bool:
        if (not isinstance(wall, Wall)):
            return

        bl, br, bt, bb = self.get_bounds()
        wl, wr, wt, wb = wall.get_bounds()

        if bt < wt:
            self.reverseDy()
        elif bb > wb:
            self.reverseDy()
        elif bl > wr or br < wl:
            return False
        return True

    def to_dict(self):
        return {
            'x': self.x,
            'y': self.y,
            'radius': self.radius,
            'color': self.color,
        }

    def reset(self):
        self.x = SCREEN_WITDH // 2
        self.y = SCREEN_HEIGHT // 2
        self.dx = self.getRandomDx()
        self.dy = self.getRandomDy()

    def update(self, *args, **kwargs):
        self.x += self.dx
        self.y += self.dy

    def reverseDx(self):
        abs_dx = abs(self.dx)
        if self.dx < 0:
            self.dx = abs_dx
        else:
            self.dx = abs_dx * -1

    def reverseDy(self):
        abs_dy = abs(self.dy)
        if self.dy < 0:
            self.dy = abs_dy
        else:
            self.dy = abs_dy * -1
