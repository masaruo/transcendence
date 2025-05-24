import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import AIBattle

class AIBattleConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        print("WebSocket connection accepted")

    async def disconnect(self, close_code):
        print(f"WebSocket disconnected with code: {close_code}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            print(f"Received WebSocket message: {data}")

            if data['type'] == 'start_battle':
                battle_id = data.get('battle_id')
                if battle_id:
                    # バトル開始の処理
                    await self.send(text_data=json.dumps({
                        'type': 'battle_started',
                        'message': 'Battle started!',
                        'battle_id': battle_id
                    }))
                else:
                    await self.send(text_data=json.dumps({
                        'type': 'error',
                        'message': 'Battle ID is required'
                    }))
        except Exception as e:
            print(f"Error in WebSocket receive: {str(e)}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': str(e)
            })) 