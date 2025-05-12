from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
import json
from tournament.models import Match, MatchStatusType, Tournament
from tournament.pong.manager import Manager

class TournamentConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.tournament_id = self.scope['url_route']['kwargs']['tournament_id']
        self.tournament_group_name = f"tournament_{self.tournament_id}"

        await self.channel_layer.group_add(self.tournament_group_name, self.channel_name)
        await self.accept()

        await self.check_tournament_ready()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.tournament_group_name, self.channel_name)

    async def check_tournament_ready(self):
        try:
            # 同期関数を直接渡す
            tournament = await database_sync_to_async(Tournament.objects.get)(id=self.tournament_id)

            # フィールドの値を取得
            is_ready = await database_sync_to_async(lambda t: t.is_ready_to_start)(tournament)

            if is_ready:
                # メソッド呼び出し
                success = await database_sync_to_async(lambda t: t.start_tournament())(tournament)
                print(f"トーナメント{self.tournament_id}開始: {success}")

        except Exception as e:
            import traceback
            print(f"エラー: {e}")
            print(traceback.format_exc())

    async def tournament_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'tournament_update',
            'match': event['data']
        }))

    async def match_start(self, event):
        await self.send(text_data=json.dumps({
            'type': 'match_start',
            'match': event['match']
        }))


class MatchConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        if not self.user.is_authenticated:
            await self.close()
            return
        await self.accept()

        self.match_id = self.scope['url_route']['kwargs']['match_id']
        self.match_group_name = f'match_{self.match_id}'
        self.manager = Manager.get_instance(self.match_group_name)

        await self.channel_layer.group_add(
            self.match_group_name,
            self.channel_name
        )

        await self.manager.init()
        await self.manager.start()

    async def disconnect(self, code):
        #todo
        pass

    async def receive_json(self, content: dict[str, str]) -> None:
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

    async def game_initialization(self, state: dict[str, str]) -> None:
        await self.send_json(content=state)

    async def game_update(self, state: dict[str, str]) -> None:
        await self.send_json(content=state)
