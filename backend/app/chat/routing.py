from django.urls import re_path
from .import consumers

chat_urlpatterns = [
    re_path(r"ws/chat/(?P<room_name>\w+)/$", consumers.ChatConsumer.as_asgi()),
    # re_path(r'ws/chat/room/$', consumers.RoomConsumer.as_asgi()),
]
