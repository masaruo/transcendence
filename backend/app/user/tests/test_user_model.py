from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse

# django rest framework
from rest_framework import status
from rest_framework.test import APIClient, force_authenticate

# for avatar test
import tempfile
import os
from PIL import Image
from django.core.files.uploadedfile import SimpleUploadedFile


class UserModelTest(TestCase):
    """test customized User model"""
    def test_create_user_with_email_success(self):
        """test creating a user with valid email as success"""
        email = "test@example.com"
        nickname = "hoge"
        password = "testpass123"
        user = get_user_model().objects.create_user(email=email, nickname=nickname, password=password)

        self.assertEqual(user.email, email)
        self.assertTrue(user.check_password(password))

    def test_new_user_email_normalized(self):
        """test email is normalized for new user"""
        emails = [
                ["test1@ExamPle.com", "test1@example.com"],
                ["test2@example.CoM", "test2@example.com"],
                ["TeST2@example.com", "TeST2@example.com"]
                ]
        for input, expected in emails:
            user = get_user_model().objects.create_user(email=input, nickname="dummy", password="sample123")
            self.assertEqual(user.email, expected)

    def test_creating_new_user_without_nickname_fail(self):
        with self.assertRaises(ValueError):
            get_user_model().objects.create_user(email="test@email.com", nickname="", password="sample123")

    def test_creating_new_user_without_email_fail(self):
        with self.assertRaises(ValueError):
            get_user_model().objects.create_user(email="", nickname="hoge", password="sample123")

    def test_create_super_user(self):
        user = get_user_model(). objects.create_superuser(
            email="sample@example.com",
            password="sample123"
        )
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.is_staff)


class AvatarUploadTest(TestCase):
    def setUp(self):
        self.client = APIClient()

        temp_image = tempfile.NamedTemporaryFile(suffix=".jpeg")
        image = Image.new("RGB", (100, 100))
        image.save(temp_image, format="JPEG")
        temp_image.seek(0)

        self.user = get_user_model().objects.create_user(
            email="test@example.com",
            nickname="testuser",
            avatar=SimpleUploadedFile(
                name="test_avatar.jpeg",
                content=temp_image.read(),
                content_type='image/jpeg'
                ),
            password="password123"
        )
        temp_image.close()
        self.client.force_authenticate(self.user)

    def tearDown(self):
        if (self.user.avatar):
            self.user.avatar.delete()

    def test_create_avatar_at_user_create(self):
        self.assertTrue(self.user.avatar)
        self.assertTrue(os.path.exists(self.user.avatar.path))

    def test_default_avatar_at_user_create(self):
        user = get_user_model().objects.create_user(
            email="new@example.com",
            nickname="newuser",
            password="password123"
        )

        self.assertTrue(user.avatar)
        self.assertTrue(os.path.exists(user.avatar.path))
        self.assertEqual(user.avatar.name, "default_avatar.jpeg")

    def test_avatar_update_with_patch(self):
        original_avatar_path = self.user.avatar.path if self.user.avatar else None
        temp_image = tempfile.NamedTemporaryFile(suffix=".jpeg")
        image = Image.new("RGB", (100, 100))
        image.save(temp_image, format="JPEG")
        temp_image.seek(0)
        payload = {
            "avatar":SimpleUploadedFile(
                name="updated_avatar.jpeg",
                content=temp_image.read(),
                content_type='image/jpeg'
            )
        }
        upload_url = reverse('user:me')
        res = self.client.patch(upload_url, payload, format="multipart")
        self.user.refresh_from_db()
        temp_image.close()

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        if original_avatar_path:
            self.assertNotEqual(self.user.avatar.path, original_avatar_path)
