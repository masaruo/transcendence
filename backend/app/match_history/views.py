from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404, get_list_or_404
from tournament.models import Tournament, Match, Team, Score, TournamentPlayer
from django.contrib.auth import get_user_model

User = get_user_model()

class UserMatchHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request, user_id=None):
        if user_id == None:
            user = request.user
        else:
            user = get_object_or_404(User, id=user_id)

        matches = Match.objects.get_my_matches(user)
