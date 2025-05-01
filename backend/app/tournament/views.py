from rest_framework import viewsets, mixins, permissions, status
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import action
from rest_framework.response import Response
from yaml import serialize
from tournament.serializers import TournamentSerializer
from tournament.models import Tournament

from django.contrib.auth import get_user_model
# from tournament.models import MatchModeType

User = get_user_model()

class TournamentViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet
):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        tournament = serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def add_player(self, request, pk=None):
        tournament = self.get_object()
        user = request.user

        if user.is_authenticated:
            tournament.add_player(user)
            tournament.start_tournament()
            serializer = self.get_serializer(tournament)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.data, status=status.HTTP_404_NOT_FOUND)
