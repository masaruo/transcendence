from time import timezone, sleep
import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import Q
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
# from django.contrib.auth import get_user_model

# from app.app import settings
from django.conf import settings

# from app import tournament


class MatchStatusType(models.IntegerChoices):
    WAITING = 1
    PLAYING = 2
    FINISHED = 3

class PlayerStatusType(models.IntegerChoices):
    ACTIVE = 1
    ELIMINATED = 2
    WINNER = 3

class MatchModeType(models.IntegerChoices):
    PRACTICE = 0
    SINGLES = 1
    DOUBLES = 2

class TeamType(models.IntegerChoices):
    TEAM1 = 1
    TEAM2 = 2

class RoundType(models.IntegerChoices):
    PRELIMINARY = 0
    QUARTERFINAL = 1
    SEMIFINAL = 2
    FINAL = 3


class TournamentManager(models.Manager):
    def get_or_create_tournament(self, player, match_type:MatchModeType=MatchModeType.SINGLES, size:int=4):
        waiting_tournament = self.filter(status=MatchStatusType.WAITING).order_by('created_at').first()
        if not waiting_tournament:
            tournament = self.create(match_type=match_type, size=size)
            tournament.add_player(player=player)
            tournament.save()
            return tournament
        else:
            waiting_tournament.add_player(player=player)
            waiting_tournament.save()
            return waiting_tournament

class Tournament(models.Model):
    players = models.ManyToManyField(to=settings.AUTH_USER_MODEL, through='TournamentPlayer', through_fields=('tournament', 'player'))
    status = models.IntegerField(choices=MatchStatusType.choices, default=MatchStatusType.WAITING)
    created_at = models.DateTimeField(auto_now_add=True)
    match_type = models.IntegerField(choices=MatchModeType.choices, default=MatchModeType.SINGLES)
    is_ready_to_start = models.BooleanField(default=False)

    objects = TournamentManager()

    def __str__(self):
        return f"Tournament #{self.id} ({self.get_status_display()})"

    def to_dict(self):
        player_list = [
            {'id': player.id, 'nickname': player.nickname}
            for player in self.players.all()
        ]
        return {
            'id': self.id,
            'status': self.status,
            'match_type': self.match_type,
            'players': player_list,
        }

    def add_player(self, player:'User', round=RoundType.PRELIMINARY) -> 'TournamentPlayer':
        return TournamentPlayer.objects.create(player=player, tournament=self, final_round=round)

    def start_tournament(self) -> bool:
        if self.status != MatchStatusType.WAITING:
            return False

        required_number = 4
        if self.match_type == MatchModeType.DOUBLES:
            required_number = 8

        player_count = self.player_entries.count()
        if player_count < required_number:
            return False

        self.status = MatchStatusType.PLAYING
        self.save()
        self.generate_matches()
        return True

    def generate_matches(self) -> None:
        players = list(self.players.all())
        import random
        random.shuffle(players)

        if self.match_type == MatchModeType.DOUBLES:
            for i in range(0, len(players), 4):
                if i + 3 < len(players):
                    team1 = Team.objects.create(player1=players[i], player2=players[i + 1])
                    team2 = Team.objects.create(player1=players[i + 2], player2=players[i + 3])
                    match = Match.objects.create(tournament=self, team1=team1, team2=team2, round=RoundType.QUARTERFINAL)
                    self._notify_match_start(match)
        else:
            # For singles, we need to handle odd numbers of players
            remaining_players = players.copy()
            while len(remaining_players) >= 2:
                team1 = Team.objects.create(player1=remaining_players.pop(0))
                team2 = Team.objects.create(player1=remaining_players.pop(0))
                match = Match.objects.create(tournament=self, team1=team1, team2=team2, round=RoundType.QUARTERFINAL)
                self._notify_match_start(match)

    def _notify_match_start(self, match):
        print(f"[DEBUG] Notifying match start for match {match.id}")
        channel_layer = get_channel_layer()
        tournament_group_name = f'tournament_{self.id}'
        print(f"[DEBUG] Sending to tournament group: {tournament_group_name}")

        async_to_sync(channel_layer.group_send)(
            tournament_group_name,
            {
                'type': 'match_start',
                'match': match.to_dict()
            }
        )
        print(f"[DEBUG] Match notification sent for match {match.id}")

    def check_matches_status(self) -> bool:
        return Match.objects.is_round_complete(tournament=self)

    def update_tournament_status(self):
        prev_round = Match.objects.get_current_round(tournament=self)

        if prev_round == RoundType.FINAL:
            self.status = MatchStatusType.FINISHED
            self.save()
            return

        self.generate_next_round(prev_round)

    def generate_next_round(self, prev_round:RoundType):
        won_teams = Match.objects.get_winner(tournament=self, prev_round=prev_round)

        for i in range(0, len(won_teams), 2):
            if i + 1 < len(won_teams):
                Match.objects.create(
                    tournament=self,
                    team1=won_teams[i],
                    team2=won_teams[i + 1],
                    match_status=MatchStatusType.WAITING,
                    # game_type=self.game_type,
                    round=prev_round + 1)

class MatchManager(models.Manager):
    def is_round_complete(self, tournament: 'Tournament') -> bool:
        related_matches = Match.objects.filter(tournament=tournament)
        unfinished_matches = related_matches.filter(~Q(match_status=MatchStatusType.FINISHED))
        if unfinished_matches.exists():
            return False
        else:
            return True

    def get_current_round(self, tournament: 'Tournament') -> RoundType:
        latest_round_match = Match.objects.filter(tournament=tournament).order_by('-round').first()
        return latest_round_match.round

    def get_winners(self, tournament: 'Tournament', prev_round: RoundType) -> list['Team']:
        won_teams = []
        prev_matches = Match.objects.filter(tournament=tournament, round=prev_round)

        for match in prev_matches:
            won_team = Score.objects.filter(match=match).first().winner
            won_teams.append(won_team)

        return won_teams

class Match(models.Model):
    tournament = models.ForeignKey(to='Tournament', on_delete=models.CASCADE)
    team1 = models.ForeignKey(to='Team', on_delete=models.DO_NOTHING, related_name='team1_matches')
    team2 = models.ForeignKey(to='Team', on_delete=models.DO_NOTHING, related_name='team2_matches')
    created_at = models.DateTimeField(auto_now_add=True)
    match_status = models.IntegerField(choices=MatchStatusType.choices, default=MatchStatusType.WAITING)
    # game_type = models.IntegerField(choices=MatchModeType.choices, default=MatchModeType.SINGLES)
    round = models.IntegerField(choices=RoundType.choices, default=RoundType.PRELIMINARY)
    # websocket_key = models.UUIDField(default=uuid.uuid4, editable=False)
    # todo create Score model -> FK to Match

    objects = MatchManager()

    def __str__(self):
        return f"Match #{self.id}: {self.team1} vs {self.team2}"

    def to_dict(self):
        # ids = [self.team1.to_dict()['playerIds'], self.team2.to_dict()['playerIds']]
        team1Ids = self.team1.to_dict()['playerIds']
        team2Ids = self.team2.to_dict()['playerIds']
        ids = team1Ids + team2Ids
        # breakpoint()
        return {
            'id': self.id,
            'team1': self.team1.to_dict(),
            'team2': self.team2.to_dict(),
            'status': self.match_status,
            'round': self.round,
            'playerIds': ids
        }

    def get_match_type(self):
        return self.tournament.match_type

    def add_score(self, team_type: TeamType) -> None:
        score, created = Score.objects.get_or_create(match=self)
        if team_type == TeamType.TEAM1:
            score.team1_score += 1
        else:
            score.team2_score += 1
        score.save()

    def get_match_status(self):
        score = Score.objects.filter(match=self).first()
        if not score:
            return {
                "team1": str(self.team1),
                "team2": str(self.team2),
                "team1_score": 0,
                "team2_score": 0,
                "status": self.match_status,
                "winner": None
            }

        return {
            "team1": str(self.team1),
            "team2": str(self.team2),
            "team1_score": score.team1_score,
            "team2_score": score.team2_score,
            "status": self.match_status,
            "winner": score.winner
        }

    def finish_match(self, team1_score: int, team2_score: int) -> bool:
        if self.match_status != MatchStatusType.PLAYING:
            return False

        score, created = Score.objects.get_or_create(match=self)
        score.team1_score = team1_score
        score.team2_score = team2_score
        score.set_winner()
        score.save()

        self.match_status = MatchStatusType.FINISHED
        self.save()
        self.tournament.update_tournament_status()
        return True

class Team(models.Model):
    player1 = models.ForeignKey(to=settings.AUTH_USER_MODEL, on_delete=models.DO_NOTHING, related_name='teams_as_player1')
    player2 = models.ForeignKey(to=settings.AUTH_USER_MODEL, on_delete=models.DO_NOTHING, null=True, blank=True, related_name='teams_as_player2')

    def __str__(self):
        if self.player2:
            return f"Team {self.player1.nickname} & {self.player2.nickname}"
        return f"Player {self.player1.nickname}"

    def to_dict(self):
        ids = [self.player1.id]
        if self.player2:
            ids.append(self.player2.id)

        return {
            'id': self.id,
            'player1_id': self.player1.id,
            'player2_id': self.player2.id if self.player2 else None,
            'player1_nickname': self.player1.nickname,
            'player2_nickname': self.player2.nickname if self.player2 else None,
            'playerIds': ids
        }

class TournamentPlayer(models.Model):
    player = models.ForeignKey(to=settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tournament_entries')
    tournament = models.ForeignKey(to='Tournament', on_delete=models.CASCADE, related_name='player_entries')
    final_round = models.IntegerField(choices=RoundType.choices)


class Score(models.Model):
    match = models.ForeignKey(to='Match', on_delete=models.CASCADE)
    team1_score = models.IntegerField(default=0)
    team2_score = models.IntegerField(default=0)
    winner = models.ForeignKey(to='Team', on_delete=models.DO_NOTHING, blank=True, null=True)

    def __str__(self) -> str:
        return f"team1's score is {self.team1_score} and team2's is {self.team2_score} and winner is {self.winner}"

    def set_winner(self) -> None:
        if self.team1_score > self.team2_score:
            self.winner = self.match.team1
        elif self.team2_score > self.team1_score:
            self.winner = self.match.team2
        else:
            self.winner = None

