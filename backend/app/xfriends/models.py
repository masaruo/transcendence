from django.db import models
from django.conf import settings

class Status(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='status')
    is_online = models.BooleanField(default=False)
    last_active_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} is online = {self.is_online} and last seen at {self.last_active_at}"
