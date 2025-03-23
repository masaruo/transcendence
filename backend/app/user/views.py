from rest_framework import generics, permissions, viewsets, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework import status
# from rest_framework.authtoken.views import ObtainAuthToken
# from rest_framework.settings import api_settings

from rest_framework_simplejwt.authentication import JWTAuthentication

from user.serializers import UserSerializer, FriendshipSerializer


class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer


class ManageUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class FriendViewSet(viewsets.ModelViewSet):
    serializer_class = FriendshipSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return user.friends.all().order_by("-nickname")

    def create(self, request, *args, **kwargs):
        try:
            friend_id = request.data.get('id')
            friend = get_user_model().objects.get(id=friend_id)
            self.request.user.make_friend(friend)
            serializer = self.get_serializer(friend)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        try:
            friend_id = kwargs.get('pk')
            friend = get_user_model().objects.get(id=friend_id)
            self.request.user.delete_friend(friend)
            serializer = self.get_serializer(friend)
            return Response(serializer.data, status=status.HTTP_204_NO_CONTENT)
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_OK)
