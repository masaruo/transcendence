from django.contrib import admin
from django.utils.html import format_html
import nested_admin
from tournament.models import Tournament, Match, Team, Score, TournamentPlayer

class ScoreInline(nested_admin.NestedTabularInline):
    model = Score
    fk_name = 'match'
    extra = 0
    max_num = 1
    fields = ['team1_score', 'team2_score', 'winner']
    verbose_name = "スコア"
    verbose_name_plural = "スコア"

class TournamentPlayerInline(nested_admin.NestedTabularInline):
    model = TournamentPlayer
    extra = 1
    fields = ['user', 'display_name']

class TeamInline(nested_admin.NestedTabularInline):
    model = Team
    extra = 1
    fields = ['name', 'created_at']
    inlines = [TournamentPlayerInline]

class MatchInline(nested_admin.NestedTabularInline):
    model = Match
    extra = 1
    fields = ['match_display', 'match_status']  # カスタムフィールドを使用
    readonly_fields = ['match_display']  # 読み取り専用として表示
    inlines = [TeamInline, ScoreInline]

    def match_display(self, obj):
        """マッチの情報を表示するためのカスタムメソッド"""
        if not obj.id:
            return "新規マッチ"
        return format_html("マッチ #{}: {} vs {}", obj.id, obj.team1, obj.team2)
    match_display.short_description = "マッチ情報"

class TournamentAdmin(admin.ModelAdmin):
    inlines = [MatchInline]
    list_display = ['id', 'status', 'match_type', 'created_at']

# 別途MatchとScoreのための管理ページも追加
class MatchAdmin(admin.ModelAdmin):
    inlines = [ScoreInline]
    list_display = ['id', 'tournament', 'team1', 'team2', 'match_status']
    list_filter = ['tournament', 'match_status']

class ScoreAdmin(admin.ModelAdmin):
    list_display = ['match', 'team1_score', 'team2_score', 'winner']
    list_filter = ['match__tournament']

admin.site.register(Tournament, TournamentAdmin)
admin.site.register(Match, MatchAdmin)
admin.site.register(Score, ScoreAdmin)
