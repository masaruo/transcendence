import { Ball } from "./ball";
import { Paddle } from "./paddle";
import { IdEvent } from "../classes/IdEvent";
import { State, GameData } from "./state";



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
	private socket_: WebSocket | null = null;
	private _waitingMessage: string = "Waiting for an opponent";
	private _score: {[key: string]: number} = {1: 0, 2: 0};
	private state_: State | null = null;

	readonly	canvas_: HTMLCanvasElement;
	readonly	ctx_: CanvasRenderingContext2D;
	readonly	width_: number;
	readonly	height_: number;
	private	intervalID_: NodeJS.Timeout | number = 0;
	private keyState_: {[key: string]: boolean} = {};

	constructor (canvas: HTMLCanvasElement | null) {
		if (!canvas)
			throw Error("Canvas not propertly allocated.");
		this.canvas_ = canvas;
		const ctx = canvas.getContext("2d");
		if (!ctx)
			throw Error("Failed to get 2D context.");
		this.ctx_ = ctx;
		this.width_ = this.canvas_.width;
		this.height_ = this.canvas_.height;

		document.addEventListener("keydown", (e) => {
			this.keyState_[e.key] = true;
		})

		document.addEventListener("keyup", (e) => {
			this.keyState_[e.key] = false;
		})

		const join = document.getElementById('join');
		const start = document.getElementById('start');
		const end = document.getElementById('end');
		if (!join || !start || !end)
			throw Error("join/start/end elements not found.")

		join.addEventListener('click', async () => {
			this.connectWebSocket();
		})

		start.addEventListener('click', async () => {
			if (this.intervalID_ == 0)
				this.intervalID_ = setInterval(() => {
					this.draw();
				}, 16);
		})


		// this.join_ = new IdEvent("join", "click", async () => {
		// 	this.join_.attach();
		// 	// this.showWaitingScreen();
		// 	this.gameState = GameState.WAITING;
		// 	this.connectWebSocket();
		// })

		// this.start_ = new IdEvent("start", "click", () => {
		// 	// if (this.intervalID == 0)
		// 		// this.intervalID = setIntervsxal(() => this.draw(), 20); // アロー関数で修正
		// })
		// this.stop_ = new IdEvent("end", "click", ()=> {
		// 	clearInterval(this.intervalID);
		// 	this.intervalID = 0;
		// })
		// this.join_.attach();
	}

	connectWebSocket(): void {
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

		const token = sessionStorage.getItem('access');
		console.log("token ", token)
		this.socket_ = new WebSocket(`${protocol}//localhost:8000/ws/game/?token=${token}`);

		this.socket_.onopen = () => {
			console.log("WebSocket接続成功", new Date().toISOString());
			// console.log("readyState:", this._socket.readyState);
		  }

		this.socket_.onmessage = (event) => {
			// console.log("received data: ", event.data);
			const parsedData = JSON.parse(event.data);
			this.handleEvent(parsedData)
		}

		this.socket_.onclose = () => {
			this.gameState = GameState.DISCONNECTED;
			// setTimeout(() => this.connectWebSocket(), 3000);
		}

		this.socket_.onerror = (error) => {
			console.error("Websocket Error", error);
		}
	}

	handleEvent(parsedData: { type: string; data?: GameData }): void {
		switch (parsedData.type) {
			case 'game_initialization':
				if (parsedData.data) {
					this.state_ = new State(parsedData.data);
				} else {
					console.error("Event data is undefined.");
				}
				break;
			case 'game_update':
				if (this.state_)
					this.state_.update(parsedData.data);
				else
					console.error("State is not initialized");
				break;

		}
	}

	// handleGameMessage(data: any): void {
	// 	switch (data.type) {
	// 		case 'game_start':
	// 			// this.gameId = data.game_id;
	// 			// this._playerId = data.player_id;
	// 			// this.gameState = GameState.PLAYING;
	// 			console.log(data.message);
	// 			this.hideWaitingScreen();
	// 			// this.start();
	// 			break;

	// 		case 'game_state':
	// 			if (this.gameState !== GameState.PLAYING) return ;
	// 			this.updateGameState(data);
	// 			break ;

	// 		case 'game_over':
	// 			this.gameState = GameState.FINISHED;
	// 			this.showGameOver(data.winner, data.score);
	// 			break ;
	// 	}
	// }

	// updateGameState(data: GameData): void {
	// 	if (data.ball) {
	// 		this.ball.setX(data.ball.x);
	// 		this.ball.setY(data.ball.y);
	// 		// this.ball.setDX(data.ball.dx);
	// 		// this.ball.setDY(data.ball.dy);
	// 	}

	// 	if (data.players) {
	// 		this.l_paddle.setY(data.players[1]);
	// 		this.r_paddle.setY(data.players[2]);
	// 	}

	// 	if (data.score) {
	// 		this._score = data.score;
	// 	}
	// }

	// showWaitingScreen() {
	// 	// キャンバスに待機メッセージを表示
	// 	this.ctx_.clearRect(0, 0, this.width_, this.height_);
	// 	this.ctx_.fillStyle = "black";
	// 	this.ctx_.fillRect(0, 0, this.width_, this.height_);
	// 	this.ctx_.fillStyle = "white";
	// 	this.ctx_.font = "20px Arial";
	// 	this.ctx_.textAlign = "center";
	// 	this.ctx_.fillText(this._waitingMessage, this._x_center, this._y_center);
	// }

    // showGameOver(winner: number, score: {[key: number]: number}): void {
    //     this.ctx_.clearRect(0, 0, this.width_, this.height_);
    //     this.ctx_.fillStyle = "black";
    //     this.ctx_.fillRect(0, 0, this.width_, this.height_);
    //     this.ctx_.fillStyle = "white";
    //     this.ctx_.font = "30px Arial";
    //     this.ctx_.textAlign = "center";
    //     this.ctx_.fillText(`Game Over! Player ${winner} wins!`, this._x_center, this._y_center - 40);
    //     this.ctx_.font = "24px Arial";
    //     this.ctx_.fillText(`Score: ${score['1']} - ${score['2']}`, this._x_center, this._y_center + 20);

    //     // 再開ボタン表示など、必要に応じて追加
    // }

	// hideWaitingScreen(): void {
	// 	this.ctx_.clearRect(0, 0, this.width_, this.height_);
	// }

	// moveElems(): void {
	// 	if (this.gameState != GameState.PLAYING) return;

	// 	// this.ball.move();

	// 	if (this._playerId === 1)
	// 		this.l_paddle.move(this.canvas_.height, keyState["w"], keyState["s"]);
	// 	else if (this._playerId === 2)
	// 		this.r_paddle.move(this.canvas_.height, keyState["ArrowUp"], keyState["ArrowDown"]);

	// 	if (this._socket && this._socket.readyState === WebSocket.OPEN) {
	// 		const paddleY = this._playerId === 1 ? this.l_paddle.getY() : this.r_paddle.getY();
	// 		this._socket.send(JSON.stringify({
	// 			type: "paddle_move",
	// 			game_id: this.gameId,
	// 			player_id: this._playerId,
	// 			y: paddleY,
	// 		}))
	// 	}
	// }

	check_and_notify_keymove(): void {
		let direction: string = "void";
		if (this.keyState_['ArrowUp']) {
			direction = "ArrowUp";
		} else if (this.keyState_['ArrowDown']) {
			direction = "ArrowDown";
		} else if (this.keyState_['w']) {
			direction = 'w';
		} else if (this.keyState_['s']) {
			direction = 's';
		}
		if (direction != "void" && this.socket_) {
			console.log(direction, "direction sent");
			this.socket_.send(JSON.stringify({
				type: 'paddle_movement',
				direction: direction,
			}))
		}
	}

	clear_screen(): void {
		this.ctx_.clearRect(0, 0, this.canvas_.width, this.canvas_.height);
		this.ctx_.fillStyle = "black";
		this.ctx_.fillRect(0, 0, this.canvas_.width, this.canvas_.height);
	}


	draw(): void {
		this.clear_screen();
		if (this.state_) {
			this.check_and_notify_keymove();
			this.state_.draw(this.ctx_);
		}
		// if (this.gameState === GameState.WAITING) {
		// 	this.showWaitingScreen();
		// 	return ;
		// }

		// if (this.gameState !== GameState.PLAYING) {
		// 	return ;
		// }

		// // this.ball.checkCollision(this._height, this._width, this.l_paddle, this.r_paddle);

		// if (!this.ball.checkGameContinue())
		// 	this.stop();

		// this.moveElems();
		// this.ctx_.clearRect(0, 0, this.width_, this.height_);
		// this.ctx_.fillStyle = "black";
		// this.ctx_.fillRect(0, 0, this.width_, this.height_);
		// this.ball.draw(this.ctx_);
		// this.r_paddle.draw(this.ctx_, "green");
		// this.l_paddle.draw(this.ctx_, "blue");

		// // 追加: スコア表示
		// this.ctx_.fillStyle = "white";
		// this.ctx_.font = "24px Arial";
		// this.ctx_.textAlign = "center";
		// this.ctx_.fillText(`${this._score['1']}`, this.width_ / 4, 30);
		// this.ctx_.fillText(`${this._score['2']}`, (this.width_ / 4) * 3, 30);
	}

	// start(): void {
	// 	if (this.intervalID_ == 0)
	// 		this.intervalID_ = setInterval(() => this.draw(), 20);
	// }

	// stop(): void
	// {
	// 	this.stop_.attach();
	// }
}
