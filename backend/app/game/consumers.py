import json
import asyncio
from typing import Tuple, Coroutine
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

    _user: UserType
    _player_type: PlayerType  #* PLAYER2 = left paddle, PLAYER1 = right paddle
    _manager: GameManager  #? keep NULL apart from Player2
    _status: GameStatus
    _game_room: GameRoom
    _coroutine: Coroutine

    async def connect(self):
        self._user = self.scope['user']
        if not self._user.is_authenticated:
            await self.close()
            return
        await self.accept()

        game_room, self._player_type = await self.find_or_create_game_and_set_usertype()
        self._manager = GameManager(f"room_{str(game_room.id)}")

        await self.channel_layer.group_add(
            self._manager.group_name, self.channel_name
        )

        # if self.manager.status() == GameStatus.PLAYING:
        if self._player_type == PlayerType.PLAYER2:
            await self.channel_layer.group_send(
                self._manager.group_name,
                {
                    'type': 'game_start',
                    'data': "hello world",
                }
            )
            self._coroutine = asyncio.create_task(self.game_loop())  #!game loop only in player2

    async def game_loop(self):
        try:
            while True:
                self._manager.update()
                await self.channel_layer.group_send(
                    self._manager.group_name,
                    # self._manager.to_dict()
                    {   'type': 'game_update',
                        'data': {
                            'ball': {
                                'x': self._manager._ball.getX(),
                                'y': self._manager._ball.getY(),
                            },
                            'left_paddle': {
                                'y': self._manager._left_paddle.getTopY(),
                            },
                            'right_paddle': {
                                'y': self._manager._right_paddle.getTopY(),
                            }
                        }
                    })
                await asyncio.sleep(1)
        except ValueError as e:
            pass

    async def game_start(self, event):
        await self.send_json({
            'type': 'game_start',
            'data': {
                'ball': {
                    'x': '150',
                    'y': '100',
                    'radius': '10',
                    'color': 'white',
                },
                'left_paddle': {
                    'x': '0',
                    'y': '150',
                    'width': '20',
                    'height': '80',
                    'color': 'green',
                },
                'right_paddle': {
                    'x': '300',
                    'y': '150',
                    'width': '20',
                    'height': '80',
                    'color': 'blue',
                },
            }
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
        if not message_type == 'paddle_movement':
            return

        direction = content.get('direction')
        move_value = 0
        if self._player_type == PlayerType.PLAYER1:  #* right
            if direction == 'ArrowUp':
                move_value = -10
                self._manager._right_paddle.move(move_value)
            elif direction == 'ArrowDown':
                move_value = 10
                self._manager._right_paddle.move(move_value)
            await self.channel_layer.group_send(
                self._manager.group_name,
                {
                    'type': 'right_paddle_move',
                    'move_value': move_value,
                }
            )
        elif self._player_type == PlayerType.PLAYER2:  #* left
            if direction == 'w':
                self._manager._left_paddle.move(-10)
            elif direction == 's':
                self._manager._left_paddle.move(10)
        else:
            pass
    # async def receive_json(self, content):
    #     message_type = content.get('type')

    #     if message_type == 'paddle_move':
    #         player_id = int(content.get('player_id', self.player_id))
    #         y_pos = float(content.get('y', 0))

    #         if self.game_id in self.game_states:
    #             self.game_states[self.game_id]['paddles'][player_id] = y_pos

    async def right_paddle_move(self, event):
        move_value = event.get('move_value')
        self._manager._right_paddle.move(move_value)

    @database_sync_to_async
    def find_or_create_game_and_set_usertype(self)->Tuple[GameRoom, PlayerType]:
        waiting_game = GameRoom.objects.filter(status='waiting', player2__isnull=True).first()

        if not waiting_game:
            return GameRoom.objects.create(player1=self._user), PlayerType.PLAYER1
        elif waiting_game.player1 == self._user:
            raise ValueError("User cannot participate in same game.")
        else:
            waiting_game.player2 = self._user
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

    async def game_update(self, event):
        # event_copy = event.copy()
        # event_copy.pop('type', None)  # typeキーを削除
        # await self.send_json({
        #     'type': 'game_state',
        #     **event_copy  # 残りのデータを展開
        # }
        await self.send_json({
            **event
        })

    async def game_over(self, event):
        await self.send_json({
            'type': 'game_over',
            'winner': event['winner'],
            'score': event['score']
        })

    async def x_game_loop(self, game_id):
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
            self._game_room.id,
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
