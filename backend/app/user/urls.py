from django.urls import path, include
from user.views import CreateUserView, ManageUserView, FriendListView, FriendAddView, FriendRemoveView

app_name = 'user'

urlpatterns = [
    path('create/', CreateUserView.as_view(), name="create"),
    path('me/', ManageUserView.as_view(), name="me"),
    path('me/matches/', include('match_history.urls')),
    path('matches/', include('match_history.urls')),
    path('<int:user_id>/matches/', include('match_history.urls')),
    path('friends/', FriendListView.as_view(), name="friends"),
    path('friends/create', FriendAddView.as_view(), name="friends_create"),
    path('friends/remove/<int:pk>/', FriendRemoveView.as_view(), name="friends_remove"),
]
