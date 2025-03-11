from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse

from rest_framework.test import APIClient
from rest_framework import status

CREATE_USER_URL = reverse("user:create")

def create_user(**kwargs):
    """helper function to create user"""
    user = get_user_model().objects.create_user(**kwargs)
    return user


class PublicUserApiTests(TestCase):
    """test cases for non authorized actions"""
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
