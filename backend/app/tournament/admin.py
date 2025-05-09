from django.contrib import admin
import nested_admin
from tournament.models import Tournament, Match, Team, Score, TournamentPlayer


class TournamentPlayerInline(nested_admin.NestedTabularInline):
    model = TournamentPlayer
    extra = 1

class TeamInline(nested_admin.NestedTabularInline):
    model = Team
    extra = 1
    inlines = [TournamentPlayerInline]

class MatchInline(nested_admin.NestedTabularInline):
    model = Match
    extra = 1
    inlines = [TeamInline]

@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
    inlines = [MatchInline]
    list_display = ['id', 'status', 'match_type', 'created_at']

# admin.site.register(TournamentAdmin)
# admin.site.register(Match)
# admin.site.register(Team)
# admin.site.register(Score)
