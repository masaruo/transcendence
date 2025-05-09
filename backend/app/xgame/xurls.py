from django.urls import path, include
from rest_framework.routers import DefaultRouter
# from .views import GameViewSet, TournamentViewSet, TournamentPlayerViewSet, TournamentRoundViewSet
# from .views import CreateTournament

from game import views

router = DefaultRouter()
router.register(r'game', views.GameViewSet, basename="game")
# router.register(r'', views.TournamentViewSet, basename="tournament")
# router.register(r'games', GameViewSet, basename='game')
# router.register(r'tournaments', TournamentViewSet, basename='tournament')
# router.register(r'tournament-players', TournamentPlayerViewSet, basename='tournamentplayer')
# router.register(r'tournament-rounds', TournamentRoundViewSet, basename='tournamentround')

urlpatterns = [
    path('', include(router.urls)),
    # path('create-tournament/', create_tournament, name='create_tournament'),
    # path('create-tournament/', CreateTournament.as_view(), name='create_tournament'),
    # path('create/', views.GameView.as_view(), name='create_game'),
]
