from  game.pong.constants import SCREEN_HEIGHT, SCREEN_WITDH

class Wall:
    def __init__(self, width:int=SCREEN_WITDH, height:int=SCREEN_HEIGHT):
        self.x = 0
        self.y = 0
        self.width = width
        self.height = height

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
