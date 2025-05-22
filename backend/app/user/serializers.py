from django.contrib.auth import get_user_model, authenticate

from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ["id", "email", "nickname", "avatar", "password"]
        extra_kwargs = {"password": {"write_only": True, "min_length": 5}}  # todo need validation more
        read_only_fields = ['id']

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
    class Meta:
        model = get_user_model()
        fields = ['id', 'nickname', 'is_online']
        read_only_fields = fields

