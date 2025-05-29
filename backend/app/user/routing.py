from django.urls import path
from user.consumer import StatusConsumer

status_urlpatterns = [
    path(r"ws/status/", StatusConsumer.as_asgi())
]
