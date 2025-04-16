import asyncio
from typing import Dict, Optional
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from game.game_manager.manager import GameManager

class GameLoop:
    """
    Manages the game loop for a specific game.
    This class is responsible for updating the game state and sending updates to clients.
    """
    _instances: Dict[str, 'GameLoop'] = {}
    _tasks: Dict[str, asyncio.Task] = {}
    
    @classmethod
    def get_instance(cls, group_name: str) -> 'GameLoop':
        """
        Get or create a GameLoop instance for a specific game room.
        """
        if group_name not in cls._instances:
            cls._instances[group_name] = cls(group_name)
        return cls._instances[group_name]
    
    @classmethod
    def remove_instance(cls, group_name: str) -> None:
        """
        Remove a GameLoop instance and cancel its task when a game is finished.
        """
        if group_name in cls._tasks:
            task = cls._tasks[group_name]
            if not task.done():
                task.cancel()
            del cls._tasks[group_name]
        
        if group_name in cls._instances:
            del cls._instances[group_name]
    
    def __init__(self, group_name: str):
        """
        Initialize a new GameLoop instance.
        """
        self._group_name = group_name
        self._manager = GameManager.get_instance(group_name)
        self._channel_layer = get_channel_layer()
        self._running = False
    
    async def start(self) -> None:
        """
        Start the game loop.
        """
        if self._running:
            return
        
        self._running = True
        task = asyncio.create_task(self._run())
        GameLoop._tasks[self._group_name] = task
    
    async def stop(self) -> None:
        """
        Stop the game loop.
        """
        self._running = False
        if self._group_name in GameLoop._tasks:
            task = GameLoop._tasks[self._group_name]
            if not task.done():
                task.cancel()
            del GameLoop._tasks[self._group_name]
    
    async def _run(self) -> None:
        """
        Run the game loop.
        """
        try:
            while self._running:
                self._manager.update()
                
                await self._channel_layer.group_send(
                    self._group_name,
                    self._manager.to_dict()
                )
                
                await asyncio.sleep(1/30)  # 30 FPS
        except asyncio.CancelledError:
            self._running = False
        except Exception as e:
            print(f"Game loop error: {e}")
            self._running = False
