from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class AIBattle(models.Model):
    player = models.ForeignKey(User, on_delete=models.CASCADE)
    score = models.IntegerField(default=0)
    ai_score = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=[
        ('WAITING', 'Waiting'),
        ('PLAYING', 'Playing'),
        ('FINISHED', 'Finished')
    ], default='WAITING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Battle {self.id} - {self.player.username}" 