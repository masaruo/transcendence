import json
import asyncio
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from game.models import GameRoom
from asgiref.sync import sync_to_async

class GameConsumer(AsyncJsonWebsocketConsumer):
    game_states = {}
    game_loops = {}

    # @database_sync_to_async
    # def check_if_player1(self, game_room):
    #     print(f"Checking player1: game_room.player1_id={game_room.player1_id}, self.user_id={self.user_id}")
    #     return game_room.player1_id == self.user_id

    @database_sync_to_async
    def get_player_role(self, game_room):
        print(f"Game room: player1_id={game_room.player1_id}, player2_id={game_room.player2_id}, user_id={self.user_id}")
        if game_room.player1_id == self.user_id:
            return 1
        else:
            # 必ずplayer2として返す
            return 2

    async def connect(self):
        self.user = self.scope['user']
        if not self.user.is_authenticated:
            await self.close()
            return
        self.user_id = self.user.id
        print(f"User {self.user.id} connected with ID: {self.user_id}")
        await self.accept()

        game_room = await self.find_or_create_game()
        self.game_id = game_room.id
        # self.player_id = 1 if await self.check_if_player1(game_room) else 2
        self.player_id = await self.get_player_role(game_room)
        print(f"Assigned player_id: {self.player_id} for user {self.user.id}")
        self.game_group_name = f"game_{self.game_id}"

        await self.channel_layer.group_add(
            self.game_group_name, self.channel_name
        )

        # game state intialization
        if self.game_id not in self.game_states:
            self.game_states[self.game_id] = self.initialize_game_state(game_room)

        if game_room.status == 'playing':
            if self.player_id == 2:
                self.game_loops[self.game_id] = asyncio.create_task(
                    self.game_loop(self.game_id)
                )

            await self.channel_layer.group_send(
                self.game_group_name,
                {
                    'type': 'game_start',
                    'game_id': self.game_id,
                    'player_id': self.player_id
                }
            )

    async def disconnect(self, code):
        if hasattr(self, 'game_group_name'):
            await self.channel_layer.group_discard(self.game_group_name, self.channel_name)

        if self.game_id in self.game_loops and self.game_loops[self.game_id]:
            self.game_loops[self.game_id].cancel()

        if self.game_id in self.game_states:
            self.game_states[self.game_id]['status'] = 'finished'
            await database_sync_to_async(self.update_game_status)('finished')

    async def receive_json(self, content):
        message_type = content.get('type')

        if message_type == 'paddle_move':
            player_id = int(content.get('player_id', self.player_id))
            y_pos = float(content.get('y', 0))

            if self.game_id in self.game_states:
                self.game_states[self.game_id]['paddles'][player_id] = y_pos

    async def find_or_create_game(self):
        waiting_game = await self.find_waiting_game()

        if waiting_game:
            return await self.update_waiting_game(waiting_game)
        else:
            return await self.create_new_game()

    @database_sync_to_async
    def find_waiting_game(self):
        return GameRoom.objects.filter(
            status='waiting',
            player2__isnull=True
        ).first()

    @database_sync_to_async
    def update_waiting_game(self, game):
        if game.player1_id != self.user_id:
            game.player2_id = self.user_id
            game.status = 'playing'
            game.save()
            return game
        else:
            # 自分が既にplayer1の場合は新しいゲームを作成する
            new_game = GameRoom.objects.create(
                player1_id=self.user_id,
                status='waiting'
            )
            return new_game

    @database_sync_to_async
    def create_new_game(self):
        return GameRoom.objects.create(
            player1_id=self.user_id,  # self.user_idを事前に設定必要
            status='waiting'
        )

    async def game_start(self, event):
        await self.send_json(
            {
                'type': 'game_start',
                'game_id': event['game_id'],
                'player_id': self.player_id
            }
        )

    async def game_state(self, event):
        event_copy = event.copy()
        event_copy.pop('type', None)  # typeキーを削除
        await self.send_json({
            'type': 'game_state',
            **event_copy  # 残りのデータを展開
        })

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
                    self.game_group_name,
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

    def initialize_game_state(self, game_room):
        width = 800
        height = 600
        paddle_height = 80
        paddle_width = 20

        return {
            'status': 'playing' if game_room.status == 'playing' else 'waiting',
            'ball': {
                'x': width / 2,
                'y': height / 2,
                'dx': 5,
                'dy': 0,
                'radius': 10
            },
            'paddles': {
                1: height / 2,
                2: height / 2,
            },
            'score': {
                '1': 0,
                '2': 0
            },
            'width': width,
            'height': height,
            'paddle_height': paddle_height,
            'paddle_width': paddle_width
        }

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
            self.game_group_name,
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
