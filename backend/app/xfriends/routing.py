from django.urls import path
from xfriends import consumers

websocket_urlpatterns = [
    path('ws/new-user/', consumers.UserStatusConsumer.as_asgi()),
]
