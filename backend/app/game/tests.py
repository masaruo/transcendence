from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from game import models
User = get_user_model()

GAME_URL = reverse("game-list")
TOURNAMENT_URL = reverse("tournament-list")
# GAME_UPDATE_URL = reverse("game-detail", kwargs={"pk": game_id})

def get_game_detail(game_id):
    return reverse("game-detail", kwargs={"pk": game_id})

def get_tournament_detail(tournament_id):
    return reverse("tournament-detail", kwargs={"pk": tournament_id})

class GameModelTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.player1 = User.objects.create(email="testplayer1@example.com", nickname="Player1")
        self.player2 = User.objects.create(email="testplayer2@example.com", nickname="Player2")
        self.payload = {
            "player1": self.player1.id,
            "player2": self.player2.id
        }
        self.client.force_authenticate(self.player1)

    def test_create_game_success(self):
        res = self.client.post(GAME_URL, self.payload)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_update_game_result_success(self):
        game = models.GameModel.objects.create(player1=self.player1, player2=self.player2)
        payload = {"player1_score": 10, "player2_score": 6}
        res = self.client.patch(get_game_detail(game.id), payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)


class TournamentTest(TestCase):
    def setUp(self):
        self.player1 = User.objects.create(email="testplayer1@example.com", nickname="Player1")
        self.player2 = User.objects.create(email="testplayer2@example.com", nickname="Player2")
        self.player3 = User.objects.create(email="testplayer3@example.com", nickname="Player3")
        self.player4 = User.objects.create(email="testplayer4@example.com", nickname="Player4")
        self.client = APIClient()
        self.client.force_authenticate(self.player1)
        self.tournament_payload = {
            "name": "Test Tournament",
            "players": [self.player1.id, self.player2.id, self.player3.id, self.player4.id]
        }

    def test_create_tournament_success(self):
        """トーナメントの作成が成功することを確認します。"""
        res = self.client.post(reverse("tournament-list"), self.tournament_payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["name"], self.tournament_payload["name"])

    def test_create_tournament_missing_name(self):
        """トーナメント名がない場合、fail確認します。"""
        payload = {**self.tournament_payload, "name": ""}
        res = self.client.post(reverse("tournament-list"), payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_tournament_success(self):
        """トーナメントの更新が成功することを確認します。"""
        tournament = models.Tournament.objects.create(name="Old Tournament")
        payload = {"name": "Updated Tournament"}
        res = self.client.patch(reverse("tournament-detail", kwargs={"pk": tournament.id}), payload)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["name"], payload["name"])

    def test_delete_tournament_success(self):
        """トーナメントの削除が成功することを確認します。"""
        tournament = models.Tournament.objects.create(name="Test Tournament")
        res = self.client.delete(reverse("tournament-detail", kwargs={"pk": tournament.id}))
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(models.Tournament.objects.filter(id=tournament.id).exists())

    def test_add_game_to_tournament(self):
        """トーナメントにゲームを追加できることを確認します。"""
        tournament = models.Tournament.objects.create(name="Test Tournament")
        game = models.GameModel.objects.create(player1=self.player1, player2=self.player2)
        payload = {"games": [game.id]}
        res = self.client.patch(reverse("tournament-detail", kwargs={"pk": tournament.id}), payload)
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_list_tournaments(self):
        """トーナメントのリストを取得できることを確認します。"""
        models.Tournament.objects.create(name="Tournament 1")
        models.Tournament.objects.create(name="Tournament 2")
        res = self.client.get(reverse("tournament-list"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 2)
