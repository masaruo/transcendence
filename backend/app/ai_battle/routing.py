from django.urls import re_path
from . import consumer

websocket_urlpatterns = [
    re_path(r'ws/ai_battle/$', consumer.AIBattleConsumer.as_asgi()),
] 