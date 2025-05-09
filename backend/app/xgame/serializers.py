from rest_framework import serializers
from game import models


class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.GameRoom
        fields = '__all__'


class TournamentSerializer(serializers.ModelSerializer):
    games = GameSerializer(many=True, read_only=True)
    class Meta:
        model = models.TournamentModel
        fields = '__all__'

# class GameCreateSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = models.GameModel
#         fields = ['id','player1', 'player2']
#         unique_together = ['player1', 'player2']


# class GameResultSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = models.GameModel
#         fields = ['id', 'player1_score', 'player2_score']
#         unique_together = ['player1_score', 'player2_score']


# class GameSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = models.GameModel
#         fields = '__all__'
# from .models import GameModel, TournamentModel, TournamentPlayerModel, TournamentRoundModel

# class GameSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = GameModel
#         fields = '__all__'

# class TournamentSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = TournamentModel
#         fields = '__all__'

# class TournamentPlayerSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = TournamentPlayerModel
#         fields = '__all__'

# class TournamentRoundSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = TournamentRoundModel
#         fields = '__all__'


