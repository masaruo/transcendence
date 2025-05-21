from rest_framework import serializers
from tournament.models import Tournament, Match, Team, Score, TournamentPlayer
from django.contrib.auth import get_user_model

User = get_user_model()

class UserMatchHistorySerializer(serializers.Serializer):
    class Meta:
        model = [User]
