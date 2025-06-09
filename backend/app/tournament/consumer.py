import asyncio
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
import json
from tournament.models import Match, MatchModeType, Tournament, MatchStatusType
from tournament.pong.manager import Manager
from tournament.pong.paddle import Paddle
from asgiref.sync import sync_to_async
import logging

class TournamentConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.tournament_id = self.scope['url_route']['kwargs']['tournament_id']
        self.tournament_group_name = f"tournament_{self.tournament_id}"

        tournament = await database_sync_to_async(Tournament.objects.get)(id=self.tournament_id)
        if tournament.status == MatchStatusType.FINISHED:
            await self.close()
            return

        await self.channel_layer.group_add(self.tournament_group_name, self.channel_name)
        await self.accept()

        await self.check_tournament_ready()

    async def disconnect(self, code):
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
                # print(f"トーナメント{self.tournament_id}開始: {success}")

        except Exception as e:
            import traceback
            print(f"エラー: {e}")
            print(traceback.format_exc())

    # async def tournament_update(self, event):
    #     await self.send(text_data=json.dumps({
    #         'type': 'tournament_update',
    #         'match': event['data']
    #     }))

    async def match_start(self, event):
        await self.send(text_data=json.dumps({
            'type': 'match_start',
            'match': event['match']
        }))

    async def tournament_finish(self, event):
        await self.disconnect(1000)


class MatchConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        if not self.user.is_authenticated:
            await self.close()
            return

        self.match_id = self.scope['url_route']['kwargs']['match_id']

        try:
            match = await database_sync_to_async(Match.objects.get)(id=self.match_id)
            if match.match_status == MatchStatusType.FINISHED:
                await self.close()
                return
        except Match.DoesNotExist:
            logging.error(f"Match with ID {self.match_id} does not exist.")
            await self.close()
            return

        await self.accept()
        self.paddle = await sync_to_async(self.assign_paddle)()
        self.match_group_name = f'match_{self.match_id}'
        self.manager = await Manager.get_instance(self.match_id)

        await self.channel_layer.group_add(
            self.match_group_name,
            self.channel_name
        )

        self._is_finished : bool = False

        self.manager.connected_count += 1
        if await sync_to_async(self.manager.is_ready)():
            await self.manager.init()
            self.manager.start()

    async def disconnect(self, code):
        # グループからの退出
        if hasattr(self, 'match_group_name'):
            await self.channel_layer.group_discard(
                self.match_group_name,
                self.channel_name
            )

        # 1000正常終了であれば、マッチを終了処理
        if code == 1000 and hasattr(self, 'manager') and hasattr(self, 'match_id') and self.manager:
            await self.manager.finish()
            Manager.remove_instance(match_id=self.match_id)

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
        try:
            await self.send_json(content=state)
        except Exception as e:
            print(f'Error sending message: {e}')

    async def game_update(self, state: dict[str, str]) -> None:
        try:
            await self.send_json(state)
        except Exception as e:
            print(f'Error sending message: {e}')

    def assign_paddle(self):
        """同期的にマッチを取得してパドルを割り当てる"""
        match = Match.objects.get(id=self.match_id)

        # 同期的なコンテキストの中で関連オブジェクトにアクセス
        if match.team1.player1 and match.team1.player1.id == self.user.id:
            return Paddle.SIDE.L1
        elif match.team2.player1 and match.team2.player1.id == self.user.id:
            return Paddle.SIDE.R1

        if match.get_match_type() == MatchModeType.DOUBLES:
            if match.team1.player2 and match.team1.player2.id == self.user.id:
                return Paddle.SIDE.L2
            elif match.team2.player2 and match.team2.player2.id == self.user.id:
                return Paddle.SIDE.R2

        return None

    async def match_finished(self, event):
        if self._is_finished:
            return
        self._is_finished = True
        logging.info("finish match")
        try:
            await asyncio.sleep(0.5)
            await self.close(1000)
        except Exception as e:
            print(f'Error sending message: {e}')


    async def status_update(self, event):
        try:
            match_dict = event['data']['match']
            score_dict = event['data']['score']
            await self.send_json({
                'type': 'update_status',
                'data': {
                    'match': match_dict,
                    'score': score_dict,
                }
            })
        except Exception as e:
            print(f'Error sending message: {e}')
