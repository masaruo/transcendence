from django.shortcuts import render
from django.contrib.auth import get_user_model
from rest_framework import viewsets, mixins
from rest_framework import generics, permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import GameModel, Tournament
from game import serializers

import random

User = get_user_model()

class GameViewSet(
        mixins.ListModelMixin,
        mixins.CreateModelMixin,
        mixins.UpdateModelMixin,
        viewsets.GenericViewSet
    ):
    queryset = GameModel.objects.all()
    serializer_class = serializers.GameSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    # def get_serializer_class(self):
    #     if self.action == 'create':
    #         return serializers.GameCreateSerializer
    #     # elif self.action == 'update':
    #     #     return serializers.GameResultSerializer
    #     else:
    #         return super().get_serializer_class()

    # def create(self, request, *args, **kwargs):
    #     serializer = self.get_serializer(data=request.data)
    #     serializer.is_valid(raise_exception=True)
    #     self.perform_create(serializer)
    #     headers = self.get_success_headers(serializer.data)
    #     return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    # def partial_update(self, request, *args, **kwargs):
    #     instance = self.get_object()
    #     serializer = self.get_serializer(instance, data=request.data, partial=True)
    #     serializer.is_valid(raise_exception=True)
    #     self.perform_update(serializer)
    #     headers = self.get_success_headers(serializer.data)
    #     return Response(serializer.data, status=status.HTTP_200_OK)


class TournamentViewSet(
                # mixins.ListModelMixin,
                mixins.RetrieveModelMixin,
                mixins.CreateModelMixin,
                mixins.UpdateModelMixin,
                mixins.DestroyModelMixin,
                viewsets.GenericViewSet):
    queryset = Tournament.objects.all()
    serializer_class = serializers.TournamentSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def create(self, request, *args, **kwargs):
        size = int(request.data.get('size', 4))
        users = list(User.objects.filter(is_online=True))
        if len(users) < size:
            return Response({"error": "Not enough users to fill the tournament"}, status=status.HTTP_400_BAD_REQUEST)
        random_users = random.sample(users, size)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tournament = serializer.save()
        # super().create(request, *args, **kwargs)

        for i in range(0, len(random_users), 2):
            if i + 1 < len(random_users):
                game = GameModel.objects.create(
                    player1=random_users[i],
                    player2=random_users[i + 1]
                )
                tournament.games.add(game)

        return Response(serializer.data, status=status.HTTP_201_CREATED)
