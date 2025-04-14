import json

from channels.db import database_sync_to_async
from djangochannelsrestframework.generics import GenericAsyncAPIConsumer
from djangochannelsrestframework.observer import model_observer
from djangochannelsrestframework.observer.generics import ObserverModelInstanceMixin, action
from djangochannelsrestframework.mixins import CreateModelMixin

from .models import Message, Room
from .serializers import MessageSerializer, RoomSerializer
from user.serializers import UserSerializer


from channels.generic.websocket import WebsocketConsumer
# chat/consumers.py
import json

from channels.generic.websocket import WebsocketConsumer


# chat/consumers.py
import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer


# chat/consumers.py
import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer


class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_{self.room_name}"

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name, self.channel_name
        )

    # Receive message from WebSocket
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]

        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name, {"type": "chat.message", "message": message}
        )

    # Receive message from room group
    def chat_message(self, event):
        message = event["message"]

        # Send message to WebSocket
        self.send(text_data=json.dumps({"message": message}))

"""

* A channel is a mailbox where messages can be sent to.
Each channel has a name. Anyone who has the name of a channel can send a message
to the channel.

* A group is a group of related channels. A group has a name.
Anyone who has the name of a group can add/remove a channel to
the group by name and send a message to all channels in the group.
It is not possible to enumerate what channels are in a particular group.

* Every consumer instance has an automatically generated unique channel name,
and so can be communicated with via a channel layer.

* An event has a special 'type' key corresponding to the name of the method that
should be invoked on consumers that receive the event. This translation is done
by replacing . with _, thus in this example, chat.message calls the chat_message method.
"""

# class RoomConsumer(
#         CreateModelMixin,
#         ObserverModelInstanceMixin,
#         GenericAsyncAPIConsumer
#     ):
#     queryset = Room.objects.all()
#     serializer_class = RoomSerializer
#     lookup_field = "pk"

#     @action()
#     async def create(self, data: dict, request_id: str, **kwargs):
#         response, status = await super().create(data, **kwargs)
#         room_pk = response["pk"]
#         await self.subscribe_instance(request_id=request_id, pk=room_pk)
#         return response, status

#     @action()
#     async def join_room(self, pk, request_id, **kwargs):
#         room = await database_sync_to_async(self.get_object)(pk=pk)
#         await self.subscribe_instance(request_id=request_id, pk=room.pk)
#         await self.message_activity.subscribe(room=pk, request_id=request_id)
#         await self.add_user_to_room(room)

#     @action()
#     async def leave_room(self, pk, **kwargs):
#         room = await database_sync_to_async(self.get_object)(pk=pk)
#         await self.remove_user_from_room(room)
#         await self.message_activity.unsubscribe(room=room.pk)
#         await self.unsubscribe_instance(pk=room.pk)

#     @action()
#     async def create_message(self, message, room, **kwargs):
#         room: "Room" = await database_sync_to_async(self.get_object)(pk=room)
#         await database_sync_to_async(Message.objects.create)(
#             room=room,
#             user=self.scope["user"],
#             text=message
#         )

#     @database_sync_to_async
#     def add_user_to_room(self, room: Room):
#         user: "User" = self.scope["user"]
#         room.current_users.add(user)

#     @database_sync_to_async
#     def remove_user_from_room(self, room: Room):
#         user: "User" = self.scope["user"]
#         room.current_users.remove(user)

#     @model_observer(Message)
#     async def message_activity(self, message, observer=None, subscribing_request_ids=[], **kwargs):
#         for request_id in subscribing_request_ids:
#             message_body = dict(request_id=request_id)
#             message_body.update(message)
#             await self.send_json(message_body)

#     @message_activity.groups_for_signal
#     def message_activity(self, instance: Message, **kwargs):
#         yield f"room_{instance.room_id}"

#     @message_activity.groups_for_consumer
#     def message_activity(self, room=None, **kwargs):
#         if room is not None:
#             yield f"room_{room}"

#     @message_activity.serializer
#     def message_activity(self, instance: Message, action, **kwargs):
#         """
#         this is evaluated fore the update is sent out to all the consumers
#         """
#         return dict(
#             data=MessageSerializer(instance).data,
#             action=action.value,
#             pk=instance.pk
#         )

# """
# create new room by {action: "create", request_id: 1, data: {"name": "Lobby"}}
# join the room by {action: "join_room", pk: 42}
# send message by {action: "create_message", message: "Hello Alice!", room: 42}
# """
