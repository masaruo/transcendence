from rest_framework import viewsets, mixins, permissions, status
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import action
from rest_framework.response import Response
from tournament.serializers import TournamentSerializer
from tournament.models import Tournament, Match
import time
# from django.contrib.auth import get_user_model

# User = get_user_model()

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
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def add_player(self, request, pk=None):
        tournament = self.get_object()
        user = request.user
        serializer = self.get_serializer(tournament)

        if user.is_authenticated:
            tournament.add_player(user)
            #todo only SINGLES so far
            # Only start tournament if we have enough players after adding this one
            if tournament.player_entries.count() >= 4:  # For singles tournament
                # tournament.start_tournament()
                tournament.is_ready_to_start = True
                tournament.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.data, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'])
    def status(self, request, pk=None):
        tournament = self.get_object()
        matches = Match.objects.filter(tournament=tournament)

        data = {
            'user_id': request.user.id,
            'status': tournament.status,
            'matches': [{
                'id': match.id,
                'team1': {
                    'id': match.team1.id,
                    'player1': match.team1.player1.id,
                    'player2': match.team1.player2.id if match.team1.player2 else None
                },
                'team2': {
                    'id': match.team2.id,
                    'player1': match.team2.player1.id,
                    'player2': match.team2.player2.id if match.team2.player2 else None
                },
                'status': match.match_status,
                'match_round': match.round,
            } for match in matches]
        }
        return Response(data)
