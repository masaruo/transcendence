"""
Custom model for user
"""

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class UserManager(BaseUserManager):
    """manager for User model"""

    def create_user(self, email, nickname, password=None, **kwargs):
        """Create, save and return a new User"""
        if not email:
            raise(ValueError("User must have an email address."))
        elif not nickname:
            raise(ValueError("User must have an nickname."))

        user = self.model(email = self.normalize_email(email), nickname = nickname, **kwargs)

        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, email, password):
        """create new superuser"""
        user = self.create_user(email=email, nickname="root", password=password)
        user.is_online = True
        user.is_active = True
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)

        return user


class User(AbstractBaseUser, PermissionsMixin):
    """customized User model for the game"""

    email = models.EmailField(verbose_name="Email", max_length=255, unique=True, blank=False, null=False)
    nickname = models.CharField(verbose_name="Nickname", max_length=255, blank=False, null=False)
    avatar = models.ImageField(verbose_name="Avatar", upload_to="image/", blank=True, null=True)#todo upload_to?
    is_online = models.BooleanField(verbose_name="Online Status", default=True)
    is_active = models.BooleanField(verbose_name="Active User", default=True)
    is_staff = models.BooleanField(default=False)

    # register UserManager class for this User model
    objects = UserManager()

    # primary key
    USERNAME_FIELD = 'email'

    def __str__(self):
        return self.email
