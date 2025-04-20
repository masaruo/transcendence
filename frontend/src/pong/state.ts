import { Ball } from "./ball";
import { Paddle } from "./paddle";

export interface IPongObj {
	set(): void;
	draw(): void;
}

export type GameData = {
	data: {
		ball: {
			x: number;
			y: number;
			radius: number;
			color: string;
		},
		left_paddle: {
			x: number;
			y: number;
			width: number;
			height: number;
			color: string;
		},
		right_paddle: {
			x: number;
			y: number;
			width: number;
			height: number;
			color: string;
		},
	}
}

export class State {
	private	ball_: Ball;
	private left_paddle_: Paddle;
	private right_padle_: Paddle;
	// private	paddles_: Paddle[];
	// private	score_: Score

	constructor(state: GameData){
		const parsedBall = state.data.ball;
		this.ball_ = new Ball(parsedBall.x, parsedBall.y, parsedBall.radius ?? 10, parsedBall.color ?? 'white');
		const parsedLPaddle = state.data.left_paddle;
		this.left_paddle_ = new Paddle(parsedLPaddle.x ?? 0, parsedLPaddle.y, parsedLPaddle.width ?? 10, parsedLPaddle.height ?? 40, parsedLPaddle.color ?? 'green');
		const parsedRPaddle = state.data.right_paddle;
		this.right_padle_ = new Paddle(parsedRPaddle.x ?? 0, parsedRPaddle.y, parsedRPaddle.width ?? 10, parsedRPaddle.height ?? 40, parsedRPaddle.color ?? 'blue');
	}

	update(state: GameData | undefined): void {
		if (!state)
			return;
		this.ball_.set(state.data.ball.x, state.data.ball.y);
		this.left_paddle_.setY(state.data.left_paddle.y);
		this.right_padle_.setY(state.data.right_paddle.y);
	}

	draw(ctx: CanvasRenderingContext2D): void {
		this.ball_.draw(ctx);
		this.left_paddle_.draw(ctx);
		this.right_padle_.draw(ctx);
	}
}

// 受信：ボールデータ、パドルデータ、スコアデータ
// 送信：キーアクション
