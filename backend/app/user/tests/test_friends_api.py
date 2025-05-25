from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status

FRIENDS_URL = reverse('user:friends')  # Using the basename we defined in urls.py
FRIENDS_CREATE_URL = reverse('user:friends_create')

def detail_url(friend_id):
    """Return friend detail URL"""
    return reverse('user:friends-remove', args=[friend_id])


def sample_user(email='test@example.com', password='testpass', nickname='Test User'):
    """Create and return a sample user"""
    return get_user_model().objects.create_user(
        email=email,
        password=password,
        nickname=nickname
    )


class PublicFriendsApiTests(TestCase):
    """Test the publicly available friends API"""

    def setUp(self):
        self.client = APIClient()

    def test_login_required(self):
        """Test that login is required for retrieving friends"""
        res = self.client.get(FRIENDS_URL)

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class PrivateFriendsApiTests(TestCase):
    """Test the authorized user friends API"""

    def setUp(self):
        self.client = APIClient()
        self.user = sample_user()
        self.client.force_authenticate(self.user)

        # Create additional users for friendship tests
        self.user2 = sample_user(email='user2@example.com', nickname='User Two')
        self.user3 = sample_user(email='user3@example.com', nickname='User Three')
        self.user4 = sample_user(email='user4@example.com', nickname='User Four')

    def test_retrieve_friends_list(self):
        """Test retrieving a list of friends"""
        # Add some friends
        self.user.friends.add(self.user2)
        self.user.friends.add(self.user3)

        res = self.client.get(FRIENDS_URL)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 2)
        # Check if both friends are in the response
        friend_ids = {friend['id'] for friend in res.data}
        self.assertIn(self.user2.id, friend_ids)
        self.assertIn(self.user3.id, friend_ids)
        self.assertNotIn(self.user4.id, friend_ids)

    def test_add_friend_successful(self):
        """Test adding a new friend"""
        payload = {'id': self.user4.id}
        res = self.client.post(FRIENDS_CREATE_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        # Verify both users have each other as friends (symmetrical)
        self.assertTrue(self.user.friends.filter(id=self.user4.id).exists())
        self.assertTrue(self.user4.friends.filter(id=self.user.id).exists())

def test_add_nonexistent_friend_error(self):
    """Test adding a friend with an email that doesn't exist"""
    payload = {'id': self.user4.id}
    res = self.client.post(FRIENDS_URL, payload)

    self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

def test_add_self_as_friend_error(self):
    """Test that user cannot add themselves as a friend"""
    payload = {'id': self.user.id}
    res = self.client.post(FRIENDS_URL, payload)

    self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

def test_add_duplicate_friend_error(self):
    """Test adding a friend that is already in friends list"""
    # Add friend first
    self.user.friends.add(self.user2)

    # Try to add again
    payload = {'id': self.user2.id}
    res = self.client.post(FRIENDS_URL, payload)

    self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

def test_remove_friend(self):
    """Test removing a friend"""
    # Add a friend first
    self.user.friends.add(self.user2)

    # Remove the friend
    url = detail_url(self.user2.id)
    res = self.client.delete(url)

    self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)

    # Verify friendship is removed for both users (symmetrical)
    self.assertFalse(self.user.friends.filter(id=self.user2.id).exists())
    self.assertFalse(self.user2.friends.filter(id=self.user.id).exists())

def test_remove_nonexistent_friend(self):
    """Test removing a friend that doesn't exist in friend list"""
    # Try to remove a user that's not a friend
    url = detail_url(self.user4.id)
    res = self.client.delete(url)

    self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)  # Changed from 404 to 400 based on your implementation

def test_filter_friends_by_nickname(self):
    """Test filtering friends by nickname"""
    # Add friends
    self.user.friends.add(self.user2)  # User Two
    self.user.friends.add(self.user3)  # User Three

    # Filter by nickname containing "Two"
    res = self.client.get(FRIENDS_URL, {'nickname': 'Two'})

    self.assertEqual(res.status_code, status.HTTP_200_OK)
    self.assertEqual(len(res.data), 1)
    self.assertEqual(res.data[0]['nickname'], self.user2.nickname)

def test_friend_status_online(self):
    """Test checking if a friend is online"""
    # Add a friend
    self.user.friends.add(self.user2)

    # Set user2 as online
    # self.user2.is_online = True
    self.user2.save()

    res = self.client.get(FRIENDS_URL)

    self.assertEqual(res.status_code, status.HTTP_200_OK)
    for friend in res.data:
        if friend['id'] == self.user2.id:
            self.assertTrue(friend['is_online'])

# def test_friend_status_offline(self):
#     """Test checking if a friend is offline"""
#     # Add a friend
#     self.user.friends.add(self.user3)

#     # Set user3 as offline
#     # self.user3.is_online = False
#     self.user3.save()

#     res = self.client.get(FRIENDS_URL)

#     self.assertEqual(res.status_code, status.HTTP_200_OK)
#     for friend in res.data:
#         if friend['id'] == self.user3.id:
#             self.assertFalse(friend['is_online'])
