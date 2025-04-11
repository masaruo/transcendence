import random
from django.contrib.auth import get_user_model
from enum import Enum

class PlayerType(Enum):
    PLAYER1 = 1
    PLAYER2 = 2
    OBSERVER = 3

class Canvas:
    width: int
    height: int

    def __init__(self, width=800, height=600):
        self.width = width
        self.height = height

    @property
    def width(self):
        return self.width

    @property
    def height(self):
        return self.height

class Score:
    player1: int
    player2: int
    def __init__(self):
        self.player1 = 0
        self.player2 = 0

    def add(self, user_type: PlayerType):
        if user_type == PlayerType.PLAYER1:
            self.player1_score += 1
        else:
            self.player2_score += 1

    def to_dict(self):
        return {
            'player1': self.player1,
            'player2': self.player2_score
        }

class Paddle:
    x: int
    x: int
    height: int
    width: int

    def __init__(self, **kwargs):
        self.x = kwargs.get('x', 50)
        self.y = kwargs.get('y', 50)
        self.height = kwargs.get('height', 40)
        self.width = kwargs.get('width', 40)

    def getTopY(self):
        return self.y

    def getBottomY(self):
        return self.y + self.height

    def getLeftX(self):
        return self.x

    def getRightX(self):
        return self.x + self.width

    def move(self, delta_y):
        self.y += delta_y

    def to_dict(self):
        return {
            'x': self.x,
            'y': self.y,
            'height': self.height,
            'width': self.width
        }

    def reset(self, window_height=600):
        self.y = window_height // 2 - self.height // 2

class Ball:
    x: int
    y: int
    dx: int
    dy: int
    radius: int

    def __init__(self, **kwargs):
        self.x = kwargs.get('x', 20)
        self.y = kwargs.get('y', 30)
        self.dx = kwargs.get('dx', 5)
        self.dy = kwargs.get('dy', 0)
        self.radius = kwargs.get('radius', 10)

    def assign(self, **kwargs):
        for key in ['x', 'y', 'dx', 'dy', 'radius']:
            if key in kwargs:
                setattr(self, key, kwargs[key])

    def move(self):
        self.x += self.dx
        self.y += self.dy

    def to_dict(self):
        return {
            'x': self.x,
            'y': self.y,
            'radius': self.radius
        }

    @classmethod
    def from_dict(cls, data):
        """Create ball from data"""
        return cls(**data)

    def getX(self):
        return (self.x)

    def getY(self):
        return (self.y)

    def getRightX(self):
        return (self.x + self.radius)

    def getLeftX(self):
        return (self.x - self.radius)

    def getTopY(self):
        return (self.y - self.radius)

    def getBottomY(self):
        return (self.y + self.radius)

    def setDx(self, new_dx):
        self.dx = new_dx

    def setDy(self, new_dy):
        self.dy = new_dy

    def reset(self, width=800, height=600):
        self.x = width // 2
        self.y = height // 2
        direction = random.choice([-1, 1])
        self.setDx(direction * 5)
        self.setDy(random.uniform(-3, 3))
