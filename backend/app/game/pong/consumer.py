from enum import Enum
from game.models import GameRoom, GameStatus
from game.pong.manager import Manager

from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async

class GameConsumer(AsyncJsonWebsocketConsumer):
    class Type(Enum):
        P1 = 0,
        p2 = 1,
        p3 = 2,
        p4 = 3,

    async def connect(self):
        self.user = self.scope['user']
        if not self.user.is_authenticated:
            await self.close()
            return
        await self.accept()

        self.game, self.type = await self.find_or_create_game_and_set_user_type()
        self.group_name = f"room_gameroom{str(self.game.id)}"
        self.manager = Manager.get_instance(self.group_name)

        await self.channel_layer.group_add(self.group_name, self.channel_name)

        await self.manager.init()

        # if self.type == self.Type.p4:
        #     await self.manager.start()
        await self.manager.start()

    @database_sync_to_async
    def find_or_create_game_and_set_user_type(self):
        waiting_game = GameRoom.objects.filter(status=GameStatus.WAITING).first()

        if waiting_game is None:
            game = GameRoom.objects.create(player1=self.user)
            return game, self.Type.P1
        # elif waiting_game.player2 is None:
        #     waiting_game.player2 = self.user
        #     waiting_game.save()
        #     return waiting_game, self.Type.p2
        # elif waiting_game.player3 is None:
        #     waiting_game.player3 = self.user
        #     waiting_game.save()
        #     return waiting_game, self.Type.p3
        # elif waiting_game.player4 is None:
        #     waiting_game.player4 = self.user
        #     waiting_game.save()
        #     return waiting_game, self.Type.p4

    async def game_initialization(self, state):
        await self.send_json(state)

    async def game_update(self, state):
        await self.send_json(state)
