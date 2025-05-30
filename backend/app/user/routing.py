from django.urls import path
from user.consumer import StatusConsumer

status_urlpatterns = [
    path("ws/status/", StatusConsumer.as_asgi())
]
