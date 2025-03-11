from rest_framework import generics, authentication, permissions
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.settings import api_settings

from user.serializers import UserSerializer

class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer
