# from rest_framework.generics import GenericAPIView
from rest_framework import viewsets, mixins
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404
from tournament.models import Tournament, Match, Team, Score, TournamentPlayer
from django.contrib.auth import get_user_model
from tournament.serializers import MatchSerializer

User = get_user_model()

class UserMatchHistoryViewSet(
    mixins.ListModelMixin,
    viewsets.GenericViewSet
):
    serializer_class = MatchSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        user = self.request.user
        user_id = self.kwargs.get('user_id')

        if user_id:
            target_user = get_object_or_404(User, id=user_id)
        else:
            target_user = user
        # breakpoint()
        my_matches = Match.objects.get_my_matches(target_user)
        #todo prefetch_related / select_related
        return my_matches

# class UserMatchHistoryView(GenericAPIView):
#     permission_classes = [permissions.IsAuthenticated]
#     authentication_classes = [JWTAuthentication]

#     def get(self, request, user_id=None):
#         if user_id == None:
#             user = request.user
#         else:
#             user = get_object_or_404(User, id=user_id)

#         matches = Match.objects.get_my_matches(user)
#         # prefetch_relatedでN+1問題を回避
#         # matches = Match.objects.get_my_matches(user).prefetch_related(
#         #     'team1', 'team2',
#         #     'team1__player1', 'team1__player2',
#         #     'team2__player1', 'team2__player2'
#         # ).select_related('score')

#         serializer = MatchSerializer(matches, many=True)
#         return Response(serializer.data)
