from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import AIBattle
from .serializers import AIBattleSerializer

class AIBattleViewSet(viewsets.ModelViewSet):
    queryset = AIBattle.objects.all()
    serializer_class = AIBattleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AIBattle.objects.filter(player=self.request.user)

    @action(detail=False, methods=['post'])
    def start_battle(self, request):
        try:
            # 既存の進行中のバトルを確認
            active_battle = AIBattle.objects.filter(
                player=request.user,
                status='PLAYING'
            ).first()

            if active_battle:
                return Response(
                    self.get_serializer(active_battle).data,
                    status=status.HTTP_200_OK
                )

            # 新しいバトルを作成
            battle = AIBattle.objects.create(
                player=request.user,
                status='PLAYING'
            )
            return Response(
                self.get_serializer(battle).data,
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 