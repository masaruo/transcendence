from django.contrib.auth import get_user_model
from rest_framework import serializers



class UserSerializer(serializers.ModelSerializer):
    # avatar = serializers.SerializerMethodField()

    class Meta:
        model = get_user_model()
        fields = ["id", "email", "nickname", "avatar", "password"]
        extra_kwargs = {"password": {"write_only": True, "min_length": 5}}
        read_only_fields = ['id']

    # def get_avatar(self, obj):
    #     request = self.context.get('request')
    #     if obj.avatar and request:
    #         return request.build_absolute_uri(obj.avatar.url)
    #     return None

    def create(self, validated_data):
        user = get_user_model().objects.create_user(**validated_data)
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        avatar = validated_data.pop("avatar", None)
        user = super().update(instance, validated_data)

        if password:
            user.set_password(password)
        if avatar:
            user.avatar = avatar
        if password or avatar:
            user.save()
        return user


class FriendshipSerializer(serializers.ModelSerializer):
    is_online = serializers.SerializerMethodField()
    class Meta:
        model = get_user_model()
        fields = ['id', 'nickname', 'is_online', 'email']
        read_only_fields = fields

    def get_is_online(self, obj) -> bool:
        return obj.is_online
