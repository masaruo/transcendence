from django.test import TestCase
from django.contrib.auth import get_user_model


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

    # def test_creating_new_user_with_wrong_email_formats_fail(self):
    #     emails = [
    #         "test@", "test@example", "test@exmaple.", "test"
    #     ]
    #     for email in emails:
    #         with self.assertRaises(ValueError):
    #             get_user_model().objects.create_user(email=email, nickname="hoge", password="sample123")

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
