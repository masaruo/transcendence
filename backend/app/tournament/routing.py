from django.urls import path
from tournament.consumer import TournamentConsumer, MatchConsumer

tournament_urlpatterns = [
    path("ws/tournament/<str:tournament_id>/", TournamentConsumer.as_asgi()),
    path("ws/match/<str:match_id>/", MatchConsumer.as_asgi())
]
