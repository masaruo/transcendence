from django.urls import path, include
from match_history.views import UserMatchHistoryViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('', UserMatchHistoryViewSet, basename='matches')

urlpatterns = [
    path('', include(router.urls)),
]
