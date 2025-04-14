from chat import models
from rest_framework import serializers
from user.serializers import UserSerializer


class MessageSerializer(serializers.Serializer):
    created_at_formatted = serializers.SerializerMethodField()
    user = UserSerializer

    class Meta:
        model = models.Message
        exclude = []
        depth = 1

    def get_created_at_formatted(self, obj:models.Message):
        return obj.created_at.strftime("%d-%m-%Y %H:%M:%S")


class RoomSerializer(serializers.Serializer):
    last_message = serializers.SerializerMethodField()
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = models.Room
        fields = ['pk', 'name', 'messages', 'current_users', 'last_message']
        depth = 1
        read_only_fields = ['messages', 'last_message']

    def __str__(self, obj:models.Room):
        return MessageSerializer(obj.mesages.order_by('created_at').last()).data
