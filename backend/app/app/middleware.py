# middleware.py
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.conf import settings
from urllib.parse import parse_qs

@database_sync_to_async
def get_user(token_key):
    try:
        access_token = AccessToken(token_key)
        user_id = access_token['user_id']
        from django.contrib.auth import get_user_model
        User = get_user_model()
        return User.objects.get(id=user_id)
    except (InvalidToken, TokenError, User.DoesNotExist):
        return AnonymousUser()

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        # print("JWTAuthMiddleware running")
        query_params = parse_qs(scope["query_string"].decode())
        token = query_params.get("token", [None])[0]

        # print(f"Token found: {token is not None}")
        if token:
            try:
                # Set the user in the scope
                scope["user"] = await get_user(token)
                # print(f"User authenticated: {scope['user'].is_authenticated}")
            except Exception as e:
                # print(f"Error authenticating user: {str(e)}")
                scope["user"] = AnonymousUser()
        else:
            # print("No token provided")
            scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)
