from django.urls import re_path
from .import consumers

game_urlpatterns = [
    re_path(r"ws/game/$", consumers.GameConsumer.as_asgi())
]
