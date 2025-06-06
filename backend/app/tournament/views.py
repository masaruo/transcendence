from rest_framework import viewsets, mixins, permissions, status
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import action
from rest_framework.response import Response
from tournament.serializers import TournamentSerializer
from tournament.models import MatchStatusType, Tournament, Match
import time
# from django.contrib.auth import get_user_model

# User = get_user_model()

class TournamentViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet
):
    queryset = Tournament.objects.all().order_by('-id')
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

        if not user.is_authenticated:
            return Response(serializer.data, status=status.HTTP_404_NOT_FOUND)
        elif tournament.status != MatchStatusType.WAITING:
            return Response({'message': 'the tournament is full.'}, status=status.HTTP_200_OK)
        else:
            tournament.add_player(user)

        if tournament.is_tournament_players_ready():
            tournament.is_ready_to_start = True
            tournament.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

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
                    'player1': match.team1.player1.nickname,
                    'player2': match.team1.player2.nickname if match.team1.player2 else None,
                    'score': match.score.team1_score if hasattr(match, 'score') else 0
                },
                'team2': {
                    'id': match.team2.id,
                    'player1': match.team2.player1.nickname,
                    'player2': match.team2.player2.nickname if match.team2.player2 else None,
                    'score': match.score.team2_score if hasattr(match, 'score') else 0
                },
                'status': match.match_status,
                'match_round': match.round,
                'winner': {
                    'team_id': match.score.winner.id if match.score.winner else None,
                    'players': [
                        {
                            'id': match.score.winner.player1.id,
                            'nickname': match.score.winner.player1.nickname
                        },
                        {
                            'id': match.score.winner.player2.id if match.score.winner.player2 else None,
                            'nickname': match.score.winner.player2.nickname if match.score.winner.player2 else None
                        },
                    ] if match.score.winner else []
                }
            } for match in matches]
        }
        return Response(data)
