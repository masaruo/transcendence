from django.urls import include, path
from rest_framework.routers import DefaultRouter

from tournament.views import TournamentViewSet

router = DefaultRouter()

router.register(r'', viewset=TournamentViewSet, basename='tournament')

urlpatterns = [
    path('', include(router.urls))
]
