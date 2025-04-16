from django.urls import re_path
from game.consumers_refactored import GameConsumer

game_urlpatterns = [
    re_path(r"ws/game/$", GameConsumer.as_asgi())
]
