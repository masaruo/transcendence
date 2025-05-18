from django.urls import re_path
from game.consumer import GameConsumer

game_urlpatterns = [
    re_path(r"ws/game/$", GameConsumer.as_asgi())
]
#todo ws -> wss
