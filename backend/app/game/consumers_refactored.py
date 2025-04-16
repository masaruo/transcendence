import json
import asyncio
from typing import Optional
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from game.models import GameRoom, GameStatus
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User as UserType

from game.consumers_parts import PlayerType
from game.game_manager.manager import GameManager
from game.game_manager.game_loop import GameLoop

User = get_user_model()

class GameConsumer(AsyncJsonWebsocketConsumer):
    """
    WebSocket consumer for game connections.
    Uses the standalone GameManager for game state management.
    """
    _user: UserType
    _player_type: PlayerType  #* PLAYER2 = left paddle, PLAYER1 = right paddle
    _game_room: Optional[GameRoom] = None
    _group_name: Optional[str] = None

    async def connect(self):
        """
        Handle WebSocket connection.
        """
        self._user = self.scope['user']
        if not self._user.is_authenticated:
            await self.close()
            return
        await self.accept()

        game_room, self._player_type = await self.find_or_create_game_and_set_usertype()
        self._game_room = game_room
        self._group_name = f"room_{str(game_room.id)}"

        game_manager = GameManager.get_instance(self._group_name)
        game_manager.set_game_room(game_room)

        await self.channel_layer.group_add(
            self._group_name, self.channel_name
        )

        if self._player_type == PlayerType.PLAYER2:
            await self.channel_layer.group_send(
                self._group_name,
                {
                    'type': 'game_start',
                    'data': "hello world",
                }
            )
            game_loop = GameLoop.get_instance(self._group_name)
            await game_loop.start()

    async def disconnect(self, code):
        """
        Handle WebSocket disconnection.
        """
        if self._group_name:
            await self.channel_layer.group_discard(
                self._group_name, self.channel_name
            )
            
            game_loop = GameLoop.get_instance(self._group_name)
            await game_loop.stop()
            
            if self._game_room and self._game_room.status == GameStatus.PLAYING:
                await database_sync_to_async(self.update_game_status)('finished')

    async def receive_json(self, content):
        """
        Handle incoming WebSocket messages.
        """
        message_type = content.get('type')
        if not message_type == 'paddle_movement':
            return

        direction = content.get('direction')
        
        if not self._group_name:
            return
            
        game_manager = GameManager.get_instance(self._group_name)
        
        if self._player_type == PlayerType.PLAYER1:  #* right
            if direction == 'ArrowUp':
                game_manager.move_paddle(PlayerType.PLAYER1, -10)
            elif direction == 'ArrowDown':
                game_manager.move_paddle(PlayerType.PLAYER1, 10)
        elif self._player_type == PlayerType.PLAYER2:  #* left
            if direction == 'w':
                game_manager.move_paddle(PlayerType.PLAYER2, -10)
            elif direction == 's':
                game_manager.move_paddle(PlayerType.PLAYER2, 10)

    async def find_or_create_game_and_set_usertype(self):
        """
        Find an existing game or create a new one.
        """
        return await self._find_or_create_game_and_set_usertype_sync()
        
    @database_sync_to_async
    def _find_or_create_game_and_set_usertype_sync(self) -> tuple:
        """
        Synchronous implementation of find_or_create_game_and_set_usertype.
        """
        waiting_game = GameRoom.objects.filter(status='waiting', player2__isnull=True).first()

        if not waiting_game:
            return GameRoom.objects.create(player1=self._user), PlayerType.PLAYER1
        elif waiting_game.player1 == self._user:
            raise ValueError("User cannot participate in same game.")
        else:
            waiting_game.player2 = self._user
            waiting_game.status = GameStatus.PLAYING
            waiting_game.save()
            return waiting_game, PlayerType.PLAYER2

    async def game_start(self, event):
        """
        Handle game start event.
        """
        await self.send_json({
            'type': 'game_start',
            'data': {
                'ball': {
                    'x': '150',
                    'y': '100',
                    'radius': '10',
                    'color': 'white',
                },
                'left_paddle': {
                    'x': '0',
                    'y': '150',
                    'width': '20',
                    'height': '80',
                    'color': 'green',
                },
            }
        })

    async def game_update(self, event):
        """
        Handle game update event.
        """
        await self.send_json(event)

    async def game_over(self, event):
        """
        Handle game over event.
        """
        await self.send_json({
            'type': 'game_over',
            'winner': event['winner'],
            'score': event['score']
        })

    def update_game_status(self, status):
        """
        Update the game status in the database.
        """
        try:
            if self._game_room:
                self._game_room.status = status
                self._game_room.save()
        except GameRoom.DoesNotExist:
            pass
