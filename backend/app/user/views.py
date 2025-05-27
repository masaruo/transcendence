from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from rest_framework_simplejwt.authentication import JWTAuthentication

from user.serializers import UserSerializer, FriendshipSerializer

User = get_user_model()

class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer


class ManageUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        return self.request.user


class FriendListView(APIView):
    serializer_class = FriendshipSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        friends = user.friends.all().order_by("-nickname")
        serializer = self.serializer_class(friends, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class FriendAddView(APIView):
    serializer_class = FriendshipSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return (Response({"detail": "Email is required"}, status=status.HTTP_400_BAD_REQUEST))
        friend = get_object_or_404(User, email=email)
        try:
            request.user.make_friend(friend)
            serializer = self.serializer_class(friend)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class FriendRemoveView(APIView):
    serializer_class = FriendshipSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        try:
            friend = User.objects.get(id=pk)
            request.user.delete_friend(friend)
            serializer = self.serializer_class(friend)
            return Response(serializer.data, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
