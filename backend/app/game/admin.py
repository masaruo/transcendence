from django.contrib import admin

from game import views


admin.site.register(views.GameRoom)
admin.site.register(views.Tournament)

# admin.site.register(views.GameModel)

# admin.site.register(views.TournamentModel)
# admin.site.register(views.TournamentPlayerModel)
# admin.site.register(views.TournamentRoundModel)
