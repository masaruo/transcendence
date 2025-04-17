from typing import Tuple

from game.models import GameRoom, GameStatus
from game.consumers.PlayerType import PlayerType

from game.consumers.GameManager import GameManager

from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async

class GameConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self._user = self.scope['user']
        if not self._user.is_authenticated:
            await self.close()
            return
        await self.accept()

        self._game_room, self._player_type = await self.find_or_create_game_and_set_usertype()
        self._group_name = f"room_gameroom{str(self._game_room.id)}"
        self._game_manager = GameManager.get_instance(self._group_name)
        # game_manager.set_game_room(self._game_room)

        await self.channel_layer.group_add(self._group_name, self.channel_name)

        await self._game_manager.initialization()

        if self._player_type == PlayerType.PLAYER2_LEFT:
            await self._game_manager.start()

    async def disconnect(self, code):
        #todo
        pass

    async def receive_json(self, content):
        message_type = content.get('type')
        if not message_type == 'paddle_movement':
            return

        direction = content.get('direction')
        if self._player_type == PlayerType.PLAYER1_RIGHT:
            if direction == 'ArrowUp':
                self._game_manager._right_paddle.move_up()
            elif direction == 'ArrowDown':
                self._game_manager._right_paddle.move_down()
        elif self._player_type == PlayerType.PLAYER2_LEFT:
            if direction == 'ArrowUp':
                self._game_manager._left_paddle.move_up()
            elif direction == 'ArrowDown':
                self._game_manager._left_paddle.move_down()

    @database_sync_to_async
    def find_or_create_game_and_set_usertype(self)->Tuple[GameRoom, PlayerType]:
        #todo ゲーム開始ロジックにおいてトーナメントメンバーでのマッチングの対応が必要
        waiting_game = GameRoom.objects.filter(status=GameStatus.WAITING, player2__isnull=True).first()

        if not waiting_game:
            return GameRoom.objects.create(player1=self._user), PlayerType.PLAYER1_RIGHT
        else:
            waiting_game.player2 = self._user
            waiting_game.status = GameStatus.PLAYING
            waiting_game.save()
            return waiting_game, PlayerType.PLAYER2_LEFT

    async def game_initialization(self, state):
        await self.send_json(
            {
                'type': 'game_initialization',
                'data': state
            }
        )

    async def game_update(self, state):
        await self.send_json(
            {
                'type': 'game_update',
                'data': state
            }
        )
