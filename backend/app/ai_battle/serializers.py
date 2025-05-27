from rest_framework import serializers
from .models import AIBattle

class AIBattleSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIBattle
        fields = ['id', 'player', 'score', 'ai_score', 'status', 'created_at'] 