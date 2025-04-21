from abc import ABC, abstractmethod
import random
from enum import Enum
from typing import Dict, List
from channels.layers import get_channel_layer

SCREEN_WITDH = 900
SCREEN_HEIGHT = 600
PADDLE_WIDTH = 20
PADDLE_HEIGHT = 80
MOVE_VALUE = 10
BALL_RADIUS = 10
BALL_SPEED = 5

class PongObj(ABC):
    @abstractmethod
    def get_bounds(self):
        pass

    @abstractmethod
    def to_dict(self):
        pass

    @abstractmethod
    def reset(self):
        pass

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

    def check_collision_with_paddle(self, Paddle):
        if (Paddle.type == Paddle.TYPE.)

    def to_dict(self):
        return {
            'ball': {
                'x': self.x,
                'y': self.y,
                'radius': self.radius,
                'color': self.color,
            }
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

class Paddle(PongObj):
    class SIDE(Enum):
        R1 = 1,
        R2 = 2,
        L1 = 3,
        L2 = 4

    def __init__(self, side=SIDE.R1, x=0, y=SCREEN_HEIGHT//2, width=PADDLE_WIDTH, height=PADDLE_HEIGHT, color="white"):
        self.type = side
        self.y = y
        self.width = width
        self.height = height
        self.color = color
        if self.type == self.SIDE.R1:
            self.x = SCREEN_WITDH - self.width
        elif self.type == self.SIDE.L1:
            self.x = x
        elif self.type == self.SIDE.R2:
            self.x = SCREEN_WITDH - self.width - 20
        elif self.type == self.SIDE.R1:
            self.x = x + 20

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

    def to_dict(self)-> Dict:
        """Convert obj to dict"""
        return {
            'paddle': {
                'x': self.x,
                'y': self.y,
                'width': self.width,
                'height': self.height,
                'color': self.color,
            }
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

class Manager:
    _instances: Dict[str, 'Manager'] = {}

    @classmethod
    def get_instatance(cls, name: str)-> 'Manager':
        if name not in cls._instances:
            cls._instances[name] = cls(name)
        return cls._instances[name]

    @classmethod
    def remove_instance(cls, name: str)-> None:
        if name in cls._instances:
            del cls._instances[name]

    def __init__(self, group_name: str):
        self.objs: List[PongObj] = [
            Ball(),
            Paddle(side=Paddle.SIDE.R1, color="green"),
            Paddle(side=Paddle.SIDE.L1, color="blue"),
        ]
        self.group_name = group_name
        self.channel_layer = get_channel_layer()
        self.task = None
        self.is_continue = True

    @property
    def group_name(self)-> str:
        return self.group_name

    @group_name.setter
    def group_name(self, name: str)-> None:
        self.group_name = name

    def update(self):
        for obj in self.objs:
            if isinstance(obj, Ball):
                obj.update()

    def reset(self):
        for obj in self.objs:
            if isinstance(obj, PongObj):
                obj.reset()

    def to_dict(self):
        for obj in self.objs:
            if isinstance(obj, PongObj):
                obj.to_dict()

    def check_collisions(self):

