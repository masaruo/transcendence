from rest_framework import serializers
from tournament.models import Tournament, Match, Score, Team

# from tournament.serializers import TeamSerializer
from user.serializers import UserSerializer

from tournament.models import MatchModeType

class TeamSerializer(serializers.ModelSerializer):
    player1 = UserSerializer(read_only=True)
    player2 = UserSerializer(read_only=True, required=False)

    class Meta:
        model = Team
        fields = '__all__'


class TournamentSerializer(serializers.ModelSerializer):
    players = UserSerializer(many=True, read_only=True)
    class Meta:
        model = Tournament
        fields = ['id', 'players', 'size', 'status', 'created_at', 'match_type']
        read_only_fields = ['id', 'players', 'status', 'created_at']

    def create(self, validated_data):
        size = validated_data.get('size', 2)
        match_type = validated_data.get('match_type', MatchModeType.SINGLES)

        user = self.context['request'].user
        tournament = Tournament.objects.create(size=size, match_type=match_type)
        tournament.add_player(user)
        return tournament

class MatchSerializer(serializers.ModelSerializer):
    tournament = TournamentSerializer(read_only=True)
    team1 = TeamSerializer(read_only=True)
    team2 = TeamSerializer(read_only=True)

    class Meta:
        model = Match
        fields = '__all__'


class ScoreSerializer(serializers.ModelSerializer):
    match = MatchSerializer(read_only=True)
    winner = TeamSerializer(read_only=True)
    class Meta:
        model = Score
        fields = '__all__'
