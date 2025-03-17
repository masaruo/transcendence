from rest_framework import generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
# from rest_framework.authtoken.views import ObtainAuthToken
# from rest_framework.settings import api_settings

from rest_framework_simplejwt.authentication import JWTAuthentication

from user.serializers import UserSerializer


class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer


class ManageUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
