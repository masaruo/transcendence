from django.urls import path
from tournament.consumer import TournamentConsumer, MatchConsumer

tournament_urlpatterns = [
    path(r"ws/tournament/<str:tournament_id>/", TournamentConsumer.as_asgi()),
    path(r"ws/match/<str:match_id>/", MatchConsumer.as_asgi())
]
#todo ws -> wss
