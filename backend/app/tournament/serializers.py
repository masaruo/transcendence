from rest_framework import serializers
from tournament.models import Tournament, Match, Score, Team

# from tournament.serializers import TeamSerializer
from user.serializers import UserSerializer

from tournament.models import MatchModeType, MatchSizeType

def to_int(number) -> int:
    if not isinstance(number, int):
        return int(number)
    else:
        return number

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
        fields = ['id', 'players', 'status', 'created_at', 'match_type', 'match_size']
        read_only_fields = ['id', 'players', 'status', 'created_at']

    def create(self, validated_data):
        match_size = to_int(validated_data.get('match_size', MatchSizeType.FOUR))
        match_type = to_int(validated_data.get('match_type', MatchModeType.SINGLES))
        ball_count = to_int(validated_data.get('ball_count', 1))
        ball_speed = to_int(validated_data.get('ball_speed', 1))#? option

        user = self.context['request'].user

        tournament = Tournament.objects.create(match_type=match_type, match_size=match_size)
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
