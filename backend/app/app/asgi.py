"""
ASGI config for app project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application
from app.middleware import JWTAuthMiddleware

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')

from chat.routing import chat_urlpatterns
from tournament.routing import tournament_urlpatterns
from user.routing import status_urlpatterns


# Add this class before your application definition
class LoggingOriginMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        headers_dict = dict(scope.get('headers', []))
        return await self.inner(scope, receive, send)

# Then update your application definition to use this class
application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": LoggingOriginMiddleware(
            AllowedHostsOriginValidator(
                JWTAuthMiddleware(
                    AuthMiddlewareStack(
                        URLRouter(chat_urlpatterns + tournament_urlpatterns + status_urlpatterns)
                    )
                )
            )
        )
    }
)


