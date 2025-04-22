from django.urls import re_path
from game.pong.consumer import GameConsumer

game_urlpatterns = [
    re_path(r"ws/game/$", GameConsumer.as_asgi())
]
