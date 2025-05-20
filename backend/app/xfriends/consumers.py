from channels.generic.websocket import AsyncJsonWebsocketConsumer
from asgiref.sync import sync_to_async
from xfriends.models import Status

class UserStatusConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.channel_layer.group_add("users", self.channel_name)

        user = self.scope['user']
        if user.is_authenticated:
            await self.update_user_status(user, True)

    async def disconnect(self, code):
        await self.channel_layer.group_discard("user", self.channel_name)

        user = self.scope['user']
        if user.is_authenticated:
            await self.update_user_status(user, False)

    @sync_to_async
    def update_user_status(self, user, status):
        return Status.objects.filter(user_id=user.pk).update(is_online=status)

