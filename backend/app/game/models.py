from django.db import models
from django.db.models.manager import BaseManager
from django.contrib.auth import get_user_model

import datetime

User = get_user_model()

class GameModel(models.Model):
    """
    model for a indiv game contains 2 players
    """
    player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player1')
    player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player2')
    player1_score = models.IntegerField(default=0)
    player2_score = models.IntegerField(default=0)
    winner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='winner', null=True)
    # status = models.CharField(
    #     max_length=50,
    #     choices=[('scheduled', 'Scheduled'), ('in_progress', 'In Progress'), ('completed', 'Completed'), ('cancelled', 'Cancelled')],
    #     default='scheduled'
    # )
    # scheduled_time = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f'{self.player1.nickname} vs {self.player2.nickname}'

    def set_result(self):
        if self.player1_score > self.player2_score:
            self.winner = self.player1
        else:
            self.winner = self.player2

# class TournamentManager(BaseManager):
#     def create(self, size=4, **kwargs):
#         tournament = super().create(**kwargs)
#         games_data = []
#         for i in range(size):
#             games_data.append({
#                 'player1': kwargs.get('player1'),
#                 'player2': kwargs.get('player2'),
#                 'player1_score': 0,
#                 'player2_score': 0,
#                 'winner': None
#             })
#         in games_data:
#             game = GameModel.objects.create(**game_data)
#             tournament.games.add(game)
#         return super().create(**kwargs)

class Tournament(models.Model):
    """
    model for a tournament contains multiple games
    """
    name = models.CharField(max_length=255)
    games = models.ManyToManyField(GameModel, blank=True)
    size = models.IntegerField(default=4)

    # status = models.CharField(
    #     max_length=50,
    #     choices=[('not_started', 'Not Started'), ('in_progress', 'In Progress'), ('completed', 'Completed'), ('cancelled', 'Cancelled')],
    #     default='not_started'
    # )

    def __str__(self):
        return self.name


# class TournamentPlayerModel(models.Model):
#     """
#     model for a player in a tournament
#     """
#     tournament = models.ForeignKey(TournamentModel, on_delete=models.CASCADE)
#     player = models.ForeignKey(User, on_delete=models.CASCADE)

#     def __str__(self):
#         return f'{self.player.nickname} in {self.tournament}'


# class TournamentRoundModel(models.Model):
#     """
#     model for a round in a tournament
#     """
#     tournament = models.ForeignKey(TournamentModel, on_delete=models.CASCADE, related_name='rounds')
#     round_number = models.IntegerField()
#     games = models.ManyToManyField(GameModel)

#     def __str__(self):
#         return f'Round {self.round_number} of {self.tournament}'
