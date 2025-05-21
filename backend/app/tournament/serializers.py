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
    team1_score = serializers.SerializerMethodField(read_only=True)
    team2_score = serializers.SerializerMethodField(read_only=True)
    winner = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Match
        fields = ['id', 'tournament', 'team1', 'team2', 'created_at', 'match_status', 'round', 'match_size',
                 'team1_score', 'team2_score', 'winner']

    def get_team1_score(self, obj):
        try:
            score = Score.objects.get(match=obj)
            return score.team1_score
        except Score.DoesNotExist:
            return 0

    def get_team2_score(self, obj):
        try:
            score = Score.objects.get(match=obj)
            return score.team2_score
        except Score.DoesNotExist:
            return 0

    def get_winner(self, obj):
        try:
            score = Score.objects.get(match=obj)
            if score.winner:
                return TeamSerializer(score.winner).data
            return None
        except Score.DoesNotExist:
            return None


class ScoreSerializer(serializers.ModelSerializer):
    winner = TeamSerializer(read_only=True)

    class Meta:
        model = Score
        fields = '__all__'
