"""
Custom model for user
"""
from datetime import timedelta
import os
import uuid
from django.utils import timezone
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

# AVATAR_DEFAULT = "defalt"

class UserManager(BaseUserManager):
    """manager for User model"""

    def create_user(self, email, nickname, avatar=None, password=None, **kwargs):
        """Create, save and return a new User"""
        if not email:
            raise(ValueError("User must have an email address."))
        elif not nickname:
            raise(ValueError("User must have an nickname."))

        user = self.model(email=self.normalize_email(email), nickname=nickname, **kwargs)

        if avatar:
            user.avatar = avatar

        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, email, password):
        """create new superuser"""
        user = self.create_user(email=email, nickname="root", password=password)
        user.is_active = True
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)

        return user


def get_avatar_image_path(instance, filename):
    """helper function to get unique image file path using uuid"""
    ext = os.path.splitext(filename)[1]
    new_name = f'{uuid.uuid4()}{ext}'
    return os.path.join('uploads', 'avatar', new_name)


class User(AbstractBaseUser, PermissionsMixin):
    """customized User model for the game"""

    email = models.EmailField(verbose_name="Email", max_length=255, unique=True, blank=False, null=False)
    nickname = models.CharField(verbose_name="Nickname", max_length=255, blank=False, null=False)
    avatar = models.ImageField(verbose_name="Avatar", null=True, blank=True, upload_to=get_avatar_image_path, default="default_avatar.jpg")
    is_active = models.BooleanField(verbose_name="Active User", default=True)
    is_staff = models.BooleanField(default=False)
    friends = models.ManyToManyField('self', symmetrical=True, blank=True)
    last_seen = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = 'email'

    def __str__(self):
        return self.email

    @property
    def is_online(self):
        return timezone.now() - self.last_seen < timedelta(seconds=60)

    def make_friend(self, friend):
        if self == friend:
            raise ValueError("You cannot make friend with yourself.")
        if self.friends.filter(id=friend.id).exists():
            raise ValueError("You guys are already friends.")

        self.friends.add(friend)

    def delete_friend(self, friend):
        if self == friend:
            raise ValueError("You cannot delete yourself.")
        if not self.friends.filter(id=friend.id).exists():
            raise ValueError("You guys are not friends.")

        self.friends.remove(friend)

    def update_timestamp(self):
        self.last_seen = timezone.now()
        self.save()
