from django.urls import path, include
from user.views import CreateUserView, ManageUserView, FriendViewSet

from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('list', FriendViewSet, basename='friend')

app_name = 'user'

urlpatterns = [
    path('create/', CreateUserView.as_view(), name="create"),
    path('me/', ManageUserView.as_view(), name="me"),
    path('friends/', include(router.urls))
]
