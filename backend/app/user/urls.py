from django.urls import path
from user.views import CreateUserView, ManageUserView

app_name = 'user'

urlpatterns = [
    path('create/', CreateUserView.as_view(), name="create"),
    path('me/', ManageUserView.as_view(), name="me"),
]
