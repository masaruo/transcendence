from django.urls import re_path
# from .import consumers
# from game.consumers import GameConsumer
# from game.consumers.GameConsumer import GameConsumer
from game.pong.consumer import GameConsumer

game_urlpatterns = [
    re_path(r"ws/game/$", GameConsumer.as_asgi())
]
