from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
import json

class TournamentConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.tournament_id = self.scope['url_route']['kwargs']['tournement_id']
        self.tournament_group_name = f"tournament_{self.tournament_id}"

        await self.channel_layer.group_add(self.tournament_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.tournament_group_name, self.channel_name)

    async def tournament_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'tournament_update',
            'data': event['data']
        }))

    async def match_start(self, event):
        await self.send(text_data=json.dumps({
            'type': 'match_start',
            'data': event['players']
        }))
