from game.models import GameRoom, GameStatus
from game.pong.manager import Manager
from game.pong.paddle import Paddle

from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async

class GameConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self) -> None:
        self.user = self.scope['user']
        if not self.user.is_authenticated:
            await self.close()
            return
        await self.accept()

        self.game, self.paddle = await self.find_or_create_game_and_set_user_type()
        self.group_name = f"room_gameroom{str(self.game.id)}"
        self.manager = Manager.get_instance(self.group_name)

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.manager.init()
        await self.manager.start()

    async def disconnect(self, code) -> None:
        #todo
        pass

    async def receive_json(self, content: dict[str, str]) -> None:
        print(f"key recved: {content}")
        message_type: str = content.get('type')
        if not message_type == 'paddle_movement':
            return

        paddle: Paddle | None = self.manager.get_paddle(self.paddle)
        if paddle == None:
            return

        direction: str = content.get('direction')
        if (direction == 'ArrowUp'):
            paddle.moveUp()
        elif (direction == 'ArrowDown'):
            paddle.moveDown()

    @database_sync_to_async
    def find_or_create_game_and_set_user_type(self):
        waiting_game: GameRoom | None = GameRoom.objects.filter(status=GameStatus.WAITING).first()

        if waiting_game is None:
            game: GameRoom = GameRoom.objects.create(player1=self.user)
            return game, Paddle.SIDE.R1
        elif waiting_game.player2 is None:
            waiting_game.player2 = self.user
            waiting_game.save()
            return waiting_game, Paddle.SIDE.L1
        # elif waiting_game.player3 is None:
        #     waiting_game.player3 = self.user
        #     waiting_game.save()
        #     return waiting_game, self.Type.p3
        # elif waiting_game.player4 is None:
        #     waiting_game.player4 = self.user
        #     waiting_game.save()
        #     return waiting_game, self.Type.p4

    async def game_initialization(self, state: dict[str, str]) -> None:
        await self.send_json(content=state)

    async def game_update(self, state: dict[str, str]) -> None:
        await self.send_json(content=state)
