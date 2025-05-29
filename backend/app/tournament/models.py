from time import timezone, sleep
import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import Q
from channels.layers import channel_layers, get_channel_layer
from asgiref.sync import async_to_sync

from django.conf import settings

WIN_SCORE = 3

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

class MatchSizeType(models.IntegerChoices):
    TWO = 2
    FOUR = 4
    # EIGHT = 8

class TournamentManager(models.Manager):
    def get_or_create_tournament(self, player, match_type = MatchModeType.SINGLES, match_size = MatchSizeType.FOUR):
        waiting_tournament = self.filter(status=MatchStatusType.WAITING).order_by('created_at').first()
        if not waiting_tournament:
            tournament = self.create(match_type=match_type, match_size=match_size)
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
    match_size = models.IntegerField(choices=MatchSizeType.choices, default=MatchSizeType.FOUR)
    ball_number = models.IntegerField(default=1, null=False, blank=False)

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
            'match_size': self.match_size,
            'players': player_list,
            'created_at': self.created_at,
        }

    def add_player(self, player, round=RoundType.PRELIMINARY) -> 'TournamentPlayer':
        is_player_in_tournament = self.players.filter(id=player.id).exists()
        if is_player_in_tournament:
            return self.player_entries.get(player=player)
        else:
            return TournamentPlayer.objects.create(player=player, tournament=self, final_round=round)

    def start_tournament(self) -> bool:
        if self.status != MatchStatusType.WAITING:
            return False

        if not self.is_tournament_players_ready():
            return False

        self.status = MatchStatusType.PLAYING
        self.save()
        self.generate_matches()
        return True

    def generate_matches(self) -> None:
        players = list(self.players.all())
        import random
        random.shuffle(players)

        #* refactor : team creationのリファクタ
        if self.match_type == MatchModeType.DOUBLES:
            for i in range(0, len(players), 4):
                if i + 3 < len(players):
                    team1 = Team.objects.create(player1=players[i], player2=players[i + 1])
                    team2 = Team.objects.create(player1=players[i + 2], player2=players[i + 3])
                    match = Match.objects.create(tournament=self, team1=team1, team2=team2)
                    score = Score.objects.create(match=match)
                    if self.match_size == MatchSizeType.TWO:
                        match.round = RoundType.FINAL
                        match.save()
                    self._notify_match_start(match)
        else:
            remaining_players = players.copy()
            while len(remaining_players) >= 2:
                team1 = Team.objects.create(player1=remaining_players.pop(0))
                team2 = Team.objects.create(player1=remaining_players.pop(0))
                match = Match.objects.create(tournament=self, team1=team1, team2=team2)
                score = Score.objects.create(match=match)
                if self.match_size == MatchSizeType.TWO:
                    match.round = RoundType.FINAL
                    match.save()
                self._notify_match_start(match)

    def _notify_match_start(self, match):
        channel_layer = get_channel_layer()
        tournament_group_name = f'tournament_{self.id}'

        async_to_sync(channel_layer.group_send)(
            tournament_group_name,
            {
                'type': 'match_start',
                'match': match.to_dict()
            }
        )

    #todo end of match (frontend too)
    def _notify_match_end(self, match):
        channel_layer = get_channel_layer()
        # match_group_name = f'match_{match.id}'
        tournament_group_name = f'tournament_{self.id}'

        # async_to_sync(channel_layer.group_send)(
        #     match_group_name,
        #     {
        #         'type': 'match_finish',
        #     }
        # )

        #todo notify match end for all consumers
        # async_to_sync(channel_layer.group_send)(
        #     tournament_group_name,
        #     {
        #         'type': 'match_end',
        #         'match': match.to_dict(),
        #         'winner': match.winner.to_dict() if match.winner else None,
        #     }
        # )

    def _notify_tournament_end(self):
        channel_layers = get_channel_layer()
        #todo

    def is_tournament_players_ready(self) -> bool:
        required_number = self.match_size * self.match_type
        if self.player_entries.count() >= required_number:
            return True
        else:
            return False

    def check_matches_status(self) -> bool:
        return Match.objects.is_round_complete(tournament=self)

    #todo refactor
    def update_tournament_status(self) -> None:
        prev_round = Match.objects.get_current_round(tournament=self)

        if prev_round == RoundType.FINAL:
            self.status = MatchStatusType.FINISHED
            self.save()
            self._notify_tournament_end()
            return
        self.generate_next_round(prev_round)

    def generate_next_round(self, prev_round:RoundType):
        won_teams = Match.objects.get_winners(tournament=self, prev_round=prev_round)
        for i in range(0, len(won_teams),2):
            if i + 1 < len(won_teams):
                new_match = Match.objects.create(
                    tournament=self,
                    team1=won_teams[i],
                    team2=won_teams[i + 1],
                    match_status=MatchStatusType.PLAYING,
                    round=prev_round + 1)
                score = Score.objects.create(match=new_match)
                self._notify_match_start(match=new_match)

class MatchManager(models.Manager):
    def is_round_complete(self, tournament: 'Tournament') -> bool:
        related_matches = Match.objects.filter(tournament=tournament)
        unfinished_matches = related_matches.filter(~Q(match_status=MatchStatusType.FINISHED))
        if unfinished_matches.exists():
            return False
        else:
            return True

    def get_current_round(self, tournament: 'Tournament') -> int | None:
        latest_match = Match.objects.filter(tournament=tournament).order_by('-round').first()
        return latest_match.round if latest_match else None

    def get_winners(self, tournament: 'Tournament', prev_round: RoundType) -> list['Team']:
        won_teams = []
        prev_matches = Match.objects.filter(tournament=tournament, round=prev_round)

        for match in prev_matches:
            won_team = Score.objects.get(match=match).winner
            won_teams.append(won_team)
        return won_teams

    def get_my_matches(self, user):
        user_teams = Team.objects.get_user_teams(user)
        matches = self.filter(Q(team1__in=user_teams) | Q(team2__in=user_teams)).order_by('-created_at')
        return matches

class Match(models.Model):
    tournament = models.ForeignKey(to='Tournament', on_delete=models.CASCADE)
    team1 = models.ForeignKey(to='Team', on_delete=models.DO_NOTHING, related_name='team1_matches')
    team2 = models.ForeignKey(to='Team', on_delete=models.DO_NOTHING, related_name='team2_matches')
    created_at = models.DateTimeField(auto_now_add=True)
    match_status = models.IntegerField(choices=MatchStatusType.choices, default=MatchStatusType.WAITING)
    round = models.IntegerField(choices=RoundType.choices, default=RoundType.SEMIFINAL)
    match_size = models.IntegerField(choices=MatchSizeType.choices, default=MatchSizeType.FOUR)

    objects = MatchManager()

    def __str__(self):
        return f"Match #{self.id}: {self.team1} vs {self.team2}"

    def to_dict(self):
        team1Ids = self.team1.to_dict()['playerIds']
        team2Ids = self.team2.to_dict()['playerIds']
        ids = team1Ids + team2Ids
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
        elif team_type == TeamType.TEAM2:
            score.team2_score += 1
        score.save()
        if score.team1_score >= WIN_SCORE or score.team2_score >= WIN_SCORE:
            score.set_winner()
            score.save()
            self.finish_match()

        score.save()

    #* calling next round of the tournament
    def finish_match(self) -> None:
        self.match_status = MatchStatusType.FINISHED
        self.save()

        channel_layer = get_channel_layer()
        match_group_name = f'match_{self.id}'

        async_to_sync(channel_layer.group_send)(
            match_group_name,
            {
                'type': 'match_finished',
            }
        )

        # self.tournament._notify_match_end(self)
        if Match.objects.is_round_complete(self.tournament):
            self.tournament.update_tournament_status()

class TeamManager(models.Manager):
    def get_user_teams(self, user):
        return self.filter(Q(player1=user) | Q(player2=user))

class Team(models.Model):
    player1 = models.ForeignKey(to=settings.AUTH_USER_MODEL, on_delete=models.DO_NOTHING, related_name='teams_as_player1')
    player2 = models.ForeignKey(to=settings.AUTH_USER_MODEL, on_delete=models.DO_NOTHING, null=True, blank=True, related_name='teams_as_player2')

    objects = TeamManager()

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
    #todo final_round logic not correct


class Score(models.Model):
    match = models.OneToOneField(to='Match', on_delete=models.CASCADE)
    team1_score = models.IntegerField(default=0)
    team2_score = models.IntegerField(default=0)
    winner = models.ForeignKey(to='Team', on_delete=models.DO_NOTHING, blank=True, null=True)

    def __str__(self) -> str:
        return f"team1's score is {self.team1_score} and team2's is {self.team2_score} and winner is {self.winner}"

    def to_dict(self):
        return {
            'team1_score': self.team1_score,
            'team2_score': self.team2_score,
            'winner': self.winner if self.winner else None
        }

    def set_winner(self) -> None:
        if self.team1_score > self.team2_score:
            self.winner = self.match.team1
        elif self.team2_score > self.team1_score:
            self.winner = self.match.team2
        else:
            self.winner = None

