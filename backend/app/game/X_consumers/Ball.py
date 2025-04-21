from game.X_consumers.constants import SCREEN_HEIGHT, SCREEN_WITDH
import random

class Ball:
    def __init__(self, x=SCREEN_WITDH//2, y=SCREEN_HEIGHT//2, radius=10, color="white"):
        self.x = x
        self.y = y
        self.radius = radius
        self.color = color
        self.dx = self.getRandomDx()
        self.dy = self.getRandomDy()

    @staticmethod
    def getRandomDx():
        direction = random.choice([-1, 1])
        speed = random.uniform(4, 5)
        return direction * speed

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

    def to_dict(self):
        return {
            'x': self.x,
            'y': self.y,
            'radius': self.radius,
            'color': self.color,
        }

    def reset(self, width=900, height=600):
        self.x = width // 2
        self.y = height // 2
        self.dx = self.getRandomDx()
        self.dy = self.getRandomDy()

    def move(self):
        self.x += self.dx
        self.y += self.dy

    def reverse_dx(self):
        abs_dx = abs(self.dx)
        if self.dx < 0:
            self.dx = abs_dx
        else:
            self.dx = abs_dx * -1

    def reverse_dy(self):
        abs_dy = abs(self.dy)
        if self.dy < 0:
            self.dy = abs_dy
        else:
            self.dy = abs_dy * -1
