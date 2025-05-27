from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AIBattleViewSet

router = DefaultRouter()
router.register(r'battles', AIBattleViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 