# backends.py
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

class EmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        UserModel = get_user_model()
        try:
            # Check if username contains @ to determine if it's an email
            if username and '@' in username:
                user = UserModel.objects.get(email=username)
            # else:
            #     # This is likely not needed if you only use email
            #     user = UserModel.objects.get(username=username)

            if user.check_password(password):
                return user
        except UserModel.DoesNotExist:
            return None

    def get_user(self, user_id):
        UserModel = get_user_model()
        try:
            return UserModel.objects.get(pk=user_id)
        except UserModel.DoesNotExist:
            return None
