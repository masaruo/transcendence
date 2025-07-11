# from rest_framework.generics import GenericAPIView
from rest_framework import viewsets, mixins
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404
from tournament.models import Match
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
