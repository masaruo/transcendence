from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse

from rest_framework.test import APIClient
from rest_framework import status

CREATE_USER_URL = reverse("user:create")
TOKEN_URL = reverse("token_obtain_pair")
ME_URL = reverse("user:me")


def create_user(**kwargs):
    """helper function to create user"""
    user = get_user_model().objects.create_user(**kwargs)
    return user


class PublicUserApiTests(TestCase):
    """test case for a user without login"""
    def setUp(self):
        self.client = APIClient()

        self.payload = {
            "email": "test@example.com",
            "nickname": "hoge",
            "password": "testpass123",
        }

    def test_create_user_success(self):
        res = self.client.post(CREATE_USER_URL, self.payload)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        user = get_user_model().objects.get(email=self.payload["email"])
        self.assertTrue(user.check_password(self.payload["password"]))
        self.assertNotIn(self.payload["password"], "password")

    def test_create_user_with_email_exists(self):

        dummy = {
            "email": "test@example.com",
            "nickname": "piyo",
            "password": "testpass321",
        }
        create_user(**self.payload)
        res = self.client.post(CREATE_USER_URL, dummy)

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_too_short_error(self):
        dummy = {
            "email": "dummy@example.com",
            "nickname": "piyo",
            "password": "pw",
        }
        res = self.client.post(CREATE_USER_URL, dummy)

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        user_exists = get_user_model().objects.filter(email=dummy["email"]).exists()
        self.assertFalse(user_exists)

    def test_create_token_for_user(self):
        create_user(**self.payload)
        res = self.client.post(TOKEN_URL, self.payload)

        self.assertIn("access", res.data)
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_create_token_for_bad_creditial_fail(self):
        create_user(**self.payload)
        dummy = {
            "email": "test@example.com",
            "nickname": "piyo",
            "password": "badpassword",
        }
        res = self.client.post(TOKEN_URL, dummy)
        self.assertNotIn("access", res.data)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_token_with_blank_password(self):
        create_user(**self.payload)

        dummy = {
            "email": "test@example.com",
            "nickname": "piyo",
            "password": "",
        }
        res = self.client.post(TOKEN_URL, dummy)
        self.assertNotIn("access", res.data)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_retrieve_user_without_auth_fail(self):
        res = self.client.get(ME_URL)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class PrivateUserApiTest(TestCase):
    """Test for authorized user"""
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email="test@example.com",
            nickname="testuser",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_retrieve_profile_success(self):
        """test profile with auth user"""
        res = self.client.get(ME_URL)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["email"], self.user.email)

    def test_post_me_not_allowed(self):
        """posting user profile not allowed"""
        res = self.client.post(ME_URL, {"email":"new@example.com", "nickname":"new"})
        self.assertEqual(res.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_update_user_profile(self):
        """updating user profile"""
        payload = {
            "email":"new@exmaple.com",
            "nickname": "updated",
            "password": "newPassword123",
        }
        res = self.client.patch(ME_URL, payload)

        self.user.refresh_from_db()
        self.assertEqual(self.user.email, payload["email"])
        self.assertEqual(self.user.nickname, payload["nickname"])
        self.assertTrue(self.user.check_password(payload["password"]))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
