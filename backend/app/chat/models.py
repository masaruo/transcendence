from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Room(models.Model):
    """
    model for chat room
    """
    name = models.CharField(max_length=255, null=False, blank=False, unique=True)
    current_users = models.ManyToManyField(User, related_name="current_rooms", blank=True)

    def __str__(self):
        return f"Room({self.name} {self.host})"


class Message(models.Model):
    room = models.ForeignKey("chat.Room", on_delete=models.CASCADE, related_name="messages")
    text = models.TextField(max_length=500)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="messages")  #?
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message({self.user} {self.room})"
