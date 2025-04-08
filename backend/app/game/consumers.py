import json
from channels.generic.websocket import JsonAsyncWebsocketConsumer

class GameConsumer(JsonAsyncWebsocketConsumer):
    async def connect(self):
        self.game_id = self.scope["url_route"]["kwargs"]["game_id"]
        self.game_group_name = f"game_{self.game_id}"

        await self.channel_layer.group_add(
            self.game_group_name, self.channel_name
        )

        self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            self.game_group_name, self.channel_name
        )

    async def recieve_json(self, content):
        role = content.get("role")
        ball_coord = content.get("ball_coord")

        if (role == "right-paddle"):
            await self.channel_layer.group_send(
                self.game_group_name,
                {
                    "type": "update.ball",
                    "ball_coord": ball_coord,
                }
            )
        elif (role == "left-paddle"):
            pass
        else:
            return

    def update_ball(self, event):
        ball_coord = event.get("ball_coord")
        self.send(text_data=json.dumps({"ball_coord": ball_coord}))

    # def update_right_paddle(self, event):
    #     y = event.get("y")
    #     self.send(te)
