import os
import django
from django.core.asgi import get_asgi_application

# Django設定を先に初期化
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')
django.setup()

# その後にDjangoアプリのインポート
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
from app.middleware import JWTAuthMiddleware
from chat.routing import chat_urlpatterns
from tournament.routing import tournament_urlpatterns
from user.routing import status_urlpatterns

class LoggingOriginMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        headers_dict = dict(scope.get('headers', []))
        return await self.inner(scope, receive, send)

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
