import json
import asyncio
from typing import Tuple
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from game.models import GameRoom, GameStatus
from asgiref.sync import sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User as UserType

from game.consumers_parts import PlayerType
from game.consumers_manager import GameManager

User = get_user_model()

class GameConsumer(AsyncJsonWebsocketConsumer):

    user: UserType
    player_type: PlayerType
    manager: GameManager
    status: GameStatus
    game_room: GameRoom

    async def connect(self):
        self.user = self.scope['user']
        if not self.user.is_authenticated:
            await self.close()
            return
        await self.accept()

        game_room, self.player_type = await self.find_or_create_game_and_get_usertype()
        self.manager = GameManager(f"room_{str(game_room.id)}")

        await self.channel_layer.group_add(
            self.manager.group_name, self.channel_name
        )

        # if self.manager.status() == GameStatus.PLAYING:
        if self.player_type == PlayerType.PLAYER2:
            #! game loop logic
            await self.channel_layer.group_send(
                self.manager.group_name,
                {
                    'type': 'game_start',
                    'message': "hello world",
                }
            )

        # game state intialization
        # self.game_states = self.initialize_game_state(game_room)

        # if game_room.status == 'playing':
        #     if self.player_id == 2:
        #         self.game_loops[self.game_id] = asyncio.create_task(
        #             self.game_loop(self.game_id)
        #         )

        #     await self.channel_layer.group_send(
        #         self.game_room.id,
        #         {
        #             'type': 'game_start',
        #             'game_id': self.game_id,
        #             'player_id': self.player_id
        #         }
        #     )

    async def game_start(self, event):
        await self.send_json({
            'type': 'game_start',
            'message': event['message']
            })

    async def disconnect(self, code):
        pass
        # if hasattr(self, 'game_group_name'):
        #     await self.channel_layer.group_discard(self.game_room.id, self.channel_name)

        # if self.game_id in self.game_loops and self.game_loops[self.game_id]:
        #     self.game_loops[self.game_id].cancel()

        # if self.game_id in self.game_states:
        #     self.game_states[self.game_id]['status'] = 'finished'
        #     await database_sync_to_async(self.update_game_status)('finished')

    async def receive_json(self, content):
        message_type = content.get('type')

        if message_type == 'paddle_move':
            player_id = int(content.get('player_id', self.player_id))
            y_pos = float(content.get('y', 0))

            if self.game_id in self.game_states:
                self.game_states[self.game_id]['paddles'][player_id] = y_pos

    @database_sync_to_async
    def find_or_create_game_and_get_usertype(self)->Tuple[GameRoom, PlayerType]:
        waiting_game = GameRoom.objects.filter(status='waiting', player2__isnull=True).first()

        if not waiting_game:
            return GameRoom.objects.create(player1=self.user), PlayerType.PLAYER1
        else:
            waiting_game.player2 = self.user
            waiting_game.status = GameStatus.PLAYING
            waiting_game.save()
            return waiting_game, PlayerType.PLAYER2

    # async def game_start(self, event):
    #     await self.send_json(
    #         {
    #             'type': 'game_start',
    #             'game_id': event['game_id'],
    #             'player_id': self.player_id
    #         }
    #     )

    # async def game_state(self, event):
    #     event_copy = event.copy()
    #     event_copy.pop('type', None)  # typeキーを削除
    #     await self.send_json({
    #         'type': 'game_state',
    #         **event_copy  # 残りのデータを展開
    #     })

    async def game_over(self, event):
        await self.send_json({
            'type': 'game_over',
            'winner': event['winner'],
            'score': event['score']
        })

    async def game_loop(self, game_id):
        """
        dealing with loop and check collision
        """
        try:
            while game_id in self.game_states and self.game_states[game_id]['status'] == 'playing':
                game_state = self.game_states[game_id]

                ball = game_state['ball']
                ball['x'] += ball['dx']
                ball['y'] += ball['dy']

                # 上下の壁との接触
                if ball['y'] - ball['radius'] <= 0 or ball['y'] + ball['radius'] >= game_state['height']:
                    ball['dy'] = -ball['dy']

                # パドルとの衝突
                left_paddle_x = 0 + game_state['paddle_width']
                right_paddle_x = game_state['width'] - game_state['paddle_width']

                # 左パドルとの衝突
                if (ball['x'] - ball['radius'] <= left_paddle_x and
                    ball['y'] >= game_state['paddles'][1] - game_state['paddle_height']/2 and
                    ball['y'] <= game_state['paddles'][1] + game_state['paddle_height']/2):
                    ball['dx'] = abs(ball['dx'])

                    # 反射角の調整？
                    relative_y = (ball['y'] - game_state['paddles'][1]) / (game_state['paddle_height']/2)
                    ball['dy'] = relative_y * 2

                # 右パドルとの衝突
                if (ball['x'] + ball['radius'] >= right_paddle_x and
                    ball['y'] >= game_state['paddles'][2] - game_state['paddle_height']/2 and
                    ball['y'] <= game_state['paddles'][2] + game_state['paddle_height']/2):
                    ball['dx'] = -abs(ball['dx'])
                    # 衝突角度によって反射を変更
                    relative_y = (ball['y'] - game_state['paddles'][2]) / (game_state['paddle_height']/2)
                    ball['dy'] += relative_y * 2  # 反射角を調整

                # score
                if ball['x'] < 0:
                    game_state['score'][2] += 1
                    self.reset_ball(game_state)
                    await database_sync_to_async(self.update_score)(2)
                    if game_state['score'][2] >= 5:
                        await self.end_game(game_id, 2)
                        break
                elif ball['x'] > game_state['width']:
                    game_state['score'][1] += 1
                    self.reset_ball(game_state)
                    await database_sync_to_async(self.update_score)(1)
                    if game_state['score'][1] >= 5:
                        await self.end_game(game_id, 1)
                        break

                # max_speed = 10
                # speed = (ball['dx']**2 + ball['dy']**2)**0.5
                # if speed > max_speed:

                await self.channel_layer.group_send(
                    self.game_group.id,
                    {
                        'type': 'game_state',
                        # 'state': game_state
                        'ball': game_state['ball'],
                        'players': {
                            '1': game_state['paddles'][1],
                            '2': game_state['paddles'][2]
                        },
                        'score': game_state['score']
                    }
                )

                await asyncio.sleep(1/30)

        except asyncio.CancelledError:
            pass
        except Exception as e:
            print(f"Game loop error: {e}")

    # def initialize_game_state(self, game_room):
    #     width = 800
    #     height = 600
    #     paddle_height = 80
    #     paddle_width = 20

    #     return {
    #         'status': 'playing' if game_room.status == 'playing' else 'waiting',
    #         'ball': {
    #             'x': width / 2,
    #             'y': height / 2,
    #             'dx': 5,
    #             'dy': 0,
    #             'radius': 10
    #         },
    #         'paddles': {
    #             1: height / 2,
    #             2: height / 2,
    #         },
    #         'score': {
    #             '1': 0,
    #             '2': 0
    #         },
    #         'width': width,
    #         'height': height,
    #         'paddle_height': paddle_height,
    #         'paddle_width': paddle_width
    #     }

    def reset_ball(self,game_state):
        import random

        game_state['ball']['x'] = game_state['width']/2
        game_state['ball']['y'] = game_state['height']/2

        direction = random.choice([-1, 1])
        game_state['ball']['dx'] = direction * 5
        game_state['ball']['dy'] = random.uniform(-3, 3)

    async def end_game(self, game_id, winner):
        if game_id in self.game_states:
            self.game_states[game_id]['status'] = 'finished'

        await database_sync_to_async(self.update_game_status)('finished')
        #todo update winner to model
        await self.channel_layer.group_send(
            self.game_room.id,
            {
                'type': 'game_over',
                'winner': winner,
                'score': self.game_states[game_id]['score']
            }
        )

    def update_game_status(self, status):
        try:
            game = GameRoom.objects.get(id=self.game_id)
            game.status = status
            game.save()
        except GameRoom.DoesNotExist:
            pass

    def update_score(self, player_id):
        try:
            game = GameRoom.objects.get(id=self.game_id)
            score = self.game_states[self.game_id]['score'][player_id]

            if player_id == 1:
                game.player1_score = score
            else:
                game.player2_score = score
            game.save()
        except GameRoom.DoesNotExist:
            pass
