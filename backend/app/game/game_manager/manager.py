from typing import Dict, Optional
from game.models import GameRoom, GameStatus
from game.consumers_parts import Ball, Paddle, Score, Screen, PlayerType
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class GameManager:
    """
    Standalone GameManager class that monitors games independently.
    This class manages the game state and handles game logic.
    """
    _instances: Dict[str, 'GameManager'] = {}
    
    @classmethod
    def get_instance(cls, group_name: str) -> 'GameManager':
        """
        Get or create a GameManager instance for a specific game room.
        """
        if group_name not in cls._instances:
            cls._instances[group_name] = cls(group_name)
        return cls._instances[group_name]
    
    @classmethod
    def remove_instance(cls, group_name: str) -> None:
        """
        Remove a GameManager instance when a game is finished.
        """
        if group_name in cls._instances:
            del cls._instances[group_name]
    
    def __init__(self, group_name: str):
        """
        Initialize a new GameManager instance.
        """
        self._group_name = group_name
        self._screen = Screen()
        self._ball = Ball()
        self._left_paddle = Paddle()
        self._right_paddle = Paddle()
        self._game_room: Optional[GameRoom] = None
        self._channel_layer = get_channel_layer()
    
    @property
    def group_name(self) -> str:
        """
        Get the group name for this game.
        """
        return self._group_name
    
    @group_name.setter
    def group_name(self, name: str) -> None:
        """
        Set the group name for this game.
        """
        self._group_name = name
    
    def set_game_room(self, game_room: GameRoom) -> None:
        """
        Set the game room for this manager.
        """
        self._game_room = game_room
    
    def _collision_ball_and_wall(self) -> None:
        """
        Handle collision between the ball and walls.
        """
        if self._ball.getTopY() < 0 or self._ball.getBottomY() > self._screen.height:
            self._ball.setDy(-self._ball.getDy())
    
    def _collision_ball_and_paddles(self) -> None:
        """
        Handle collision between the ball and paddles.
        """
        if (self._ball.getLeftX() <= self._left_paddle.getRightX() and
            self._ball.getY() >= self._left_paddle.getTopY() and
            self._ball.getY() <= self._left_paddle.getBottomY()):
            self._ball.setDx(abs(self._ball.getDx()))
        
        if (self._ball.getRightX() >= self._right_paddle.getLeftX() and
            self._ball.getY() >= self._right_paddle.getTopY() and
            self._ball.getY() <= self._right_paddle.getBottomY()):
            self._ball.setDx(-abs(self._ball.getDx()))
    
    def _check_collision(self) -> None:
        """
        Check all collisions in the game.
        """
        self._collision_ball_and_wall()
        self._collision_ball_and_paddles()
    
    def update(self) -> None:
        """
        Update the game state.
        """
        self._ball.move()
        self._check_collision()
    
    def move_paddle(self, player_type: PlayerType, delta_y: int) -> None:
        """
        Move a paddle based on player input.
        """
        if player_type == PlayerType.PLAYER1:
            self._right_paddle.move(delta_y)
        elif player_type == PlayerType.PLAYER2:
            self._left_paddle.move(delta_y)
    
    def to_dict(self) -> dict:
        """
        Convert the game state to a dictionary for sending to clients.
        """
        return {
            'type': 'game_update',
            'data': {
                'ball': {
                    'x': self._ball.getX(),
                    'y': self._ball.getY(),
                },
                'left_paddle': {
                    'y': self._left_paddle.getTopY(),
                },
                'right_paddle': {
                    'y': self._right_paddle.getTopY(),
                }
            }
        }
    
    def reset(self) -> None:
        """
        Reset the game state.
        """
        self._ball.reset(self._screen.width, self._screen.height)
        self._left_paddle.reset(self._screen.height)
        self._right_paddle.reset(self._screen.height)
