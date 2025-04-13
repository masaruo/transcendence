import { Ball } from "./ball";
import { Paddle } from "./paddle";
import { IdEvent } from "./IdEvent";

const keyState: {[key: string]: boolean} = {};

document.addEventListener("keydown", (e) => {
	keyState[e.key] = true;
})

document.addEventListener("keyup", (e) => {
	keyState[e.key] = false;
})

type GameData = {
	ball?: {
	  x: number;
	  y: number;
	  dx: number;
	  dy: number;
	};
	players?: {
	  [key: string]: number;
	};
	score?: {
	  [key: string]: number;
	};
  }

enum GameState {
	DISCONNECTED,
	WAITING,
	PLAYING,
	FINISHED
}

export class Pong {
	private gameState: GameState = GameState.DISCONNECTED;
	private gameId: string | null = null;
	private _playerId: number | null = null;
	private _socket: WebSocket | null = null;
	private _waitingMessage: string = "Waiting for an opponent";
	private _score: {[key: string]: number} = {1: 0, 2: 0};

	readonly _canvas: HTMLCanvasElement;
	readonly _ctx: CanvasRenderingContext2D;
	readonly _width: number;
	readonly _height: number;
	readonly _x_center: number;
	readonly _y_center: number;
	readonly ball: Ball;
	readonly r_paddle: Paddle;
	readonly l_paddle:Paddle;
	private intervalID: number = 0;
	private join_: IdEvent;
	private start_: IdEvent;
	private stop_: IdEvent;

	constructor (canvas: HTMLCanvasElement | null) {
		if (!canvas)
			throw Error("Canvas not propertly allocated.");
		this._canvas = canvas;
		const ctx = canvas.getContext("2d");
		if (!ctx)
			throw Error("Failed to get 2D context.");
		this._ctx = ctx;
		this._width = this._canvas.width;
		this._height = this._canvas.height;
		this._x_center = this._width / 2;
		this._y_center = this._height / 2;
		this.ball = new Ball(this._x_center, this._y_center, 10);
		this.l_paddle = new Paddle(0,this._y_center, 20, 80);
		this.r_paddle = new Paddle(this._width - 20, this._y_center, 20, 80);

		this.join_ = new IdEvent("join", "click", async () => {
			// this.join_.attach();
			this.showWaitingScreen();
			this.gameState = GameState.WAITING;
			this.connectWebSocket();
		})

		this.start_ = new IdEvent("start", "click", () => {
			// if (this.intervalID == 0)
				// this.intervalID = setIntervsxal(() => this.draw(), 20); // アロー関数で修正
		})
		this.stop_ = new IdEvent("end", "click", ()=> {
			clearInterval(this.intervalID);
			this.intervalID = 0;
		})
		this.join_.attach();
	}

	connectWebSocket(): void {
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

		const token = sessionStorage.getItem('access');
		console.log("token ", token)
		this._socket = new WebSocket(`${protocol}//localhost:8000/ws/game/?token=${token}`);

		this._socket.onopen = () => {
			console.log("WebSocket接続成功", new Date().toISOString());
			// console.log("readyState:", this._socket.readyState);
		  }
		  this._socket.onmessage = (event) => {
			console.log("受信メッセージ:", event.data);
			const data = JSON.parse(event.data);
			this.handleGameMessage(data);
		  }

		this._socket.onclose = () => {
			this.gameState = GameState.DISCONNECTED;
			// setTimeout(() => this.connectWebSocket(), 3000);
		}

		this._socket.onerror = (error) => {
			console.error("Websocket Error", error);
		}
	}

	handleGameMessage(data: any): void {
		console.log("受信メッセージ", data);
		switch (data.type) {
			case 'game_start':
				// this.gameId = data.game_id;
				// this._playerId = data.player_id;
				// this.gameState = GameState.PLAYING;
				console.log(data.message);
				this.hideWaitingScreen();
				// this.start();
				break;

			case 'game_state':
				if (this.gameState !== GameState.PLAYING) return ;
				this.updateGameState(data);
				break ;

			case 'game_over':
				this.gameState = GameState.FINISHED;
				this.showGameOver(data.winner, data.score);
				break ;
		}
	}

	updateGameState(data: GameData): void {
		if (data.ball) {
			this.ball.setX(data.ball.x);
			this.ball.setY(data.ball.y);
			// this.ball.setDX(data.ball.dx);
			// this.ball.setDY(data.ball.dy);
		}

		if (data.players) {
			this.l_paddle.setY(data.players[1]);
			this.r_paddle.setY(data.players[2]);
		}

		if (data.score) {
			this._score = data.score;
		}
	}

	showWaitingScreen() {
		// キャンバスに待機メッセージを表示
		this._ctx.clearRect(0, 0, this._width, this._height);
		this._ctx.fillStyle = "black";
		this._ctx.fillRect(0, 0, this._width, this._height);
		this._ctx.fillStyle = "white";
		this._ctx.font = "20px Arial";
		this._ctx.textAlign = "center";
		this._ctx.fillText(this._waitingMessage, this._x_center, this._y_center);
	}

    showGameOver(winner: number, score: {[key: number]: number}): void {
        this._ctx.clearRect(0, 0, this._width, this._height);
        this._ctx.fillStyle = "black";
        this._ctx.fillRect(0, 0, this._width, this._height);
        this._ctx.fillStyle = "white";
        this._ctx.font = "30px Arial";
        this._ctx.textAlign = "center";
        this._ctx.fillText(`Game Over! Player ${winner} wins!`, this._x_center, this._y_center - 40);
        this._ctx.font = "24px Arial";
        this._ctx.fillText(`Score: ${score['1']} - ${score['2']}`, this._x_center, this._y_center + 20);

        // 再開ボタン表示など、必要に応じて追加
    }

	hideWaitingScreen(): void {
		this._ctx.clearRect(0, 0, this._width, this._height);
	}

	moveElems(): void {
		if (this.gameState != GameState.PLAYING) return;

		// this.ball.move();

		if (this._playerId === 1)
			this.l_paddle.move(this._canvas.height, keyState["w"], keyState["s"]);
		else if (this._playerId === 2)
			this.r_paddle.move(this._canvas.height, keyState["ArrowUp"], keyState["ArrowDown"]);

		if (this._socket && this._socket.readyState === WebSocket.OPEN) {
			const paddleY = this._playerId === 1 ? this.l_paddle.getY() : this.r_paddle.getY();
			this._socket.send(JSON.stringify({
				type: "paddle_move",
				game_id: this.gameId,
				player_id: this._playerId,
				y: paddleY,
			}))
		}
	}

	draw(): void {
		if (this.gameState === GameState.WAITING) {
			this.showWaitingScreen();
			return ;
		}

		if (this.gameState !== GameState.PLAYING) {
			return ;
		}

		// this.ball.checkCollision(this._height, this._width, this.l_paddle, this.r_paddle);

		if (!this.ball.checkGameContinue())
			this.stop();

		this.moveElems();
		this._ctx.clearRect(0, 0, this._width, this._height);
		this._ctx.fillStyle = "black";
		this._ctx.fillRect(0, 0, this._width, this._height);
		this.ball.draw(this._ctx);
		this.r_paddle.draw(this._ctx, "green");
		this.l_paddle.draw(this._ctx, "blue");

		// 追加: スコア表示
		this._ctx.fillStyle = "white";
		this._ctx.font = "24px Arial";
		this._ctx.textAlign = "center";
		this._ctx.fillText(`${this._score['1']}`, this._width / 4, 30);
		this._ctx.fillText(`${this._score['2']}`, (this._width / 4) * 3, 30);
	}

	start(): void
	{
		this.start_.attach();
		if (this.intervalID == 0)
			this.intervalID = setInterval(() => this.draw(), 20); // アロー関数で修正
	}

	stop(): void
	{
		this.stop_.attach();
	}
}
