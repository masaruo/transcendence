from game.consumers.constants import SCREEN_HEIGHT, SCREEN_WITDH

class Wall:
    # def __init__(self, **kwargs):
    #     super().__init__(
    #         x=0,
    #         y=0,
    #         width=kwargs.get('width', SCREEN_WITDH),
    #         height=kwargs.get('height', SCREEN_HEIGHT)
    #     )
    def __init__(self, x=0, y=0, width=SCREEN_WITDH, height=SCREEN_HEIGHT):
        self.x = x
        self.y = y
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
