import { Ball } from "./ball";
import { Paddle } from "./paddle";

export type GameData = {

	ball: {
		x: number;
		y: number;
		radius?: number;
		color?: string;
	},
	left_paddle: {
		x?: number;
		y: number;
		width?: number;
		height?: number;
		color?: string;
	},
}

export class State {
	private	ball_: Ball;
	private left_paddle_: Paddle;
	// private	paddles_: Paddle[];
	// private	score_: Score

	// static jsonToGameData(jsonString: string): GameData {
	// 	try {
	// 		const parsedData: GameData = JSON.parse(jsonString);
	// 		// validate
	// 		return parsedData;
	// 	} catch (error) {
	// 		throw new Error("Invalid JSON data: " + error.message);
	// 	}
	// }
	constructor(data: GameData){
		const parsedBall = data.ball;
		this.ball_ = new Ball(parsedBall.x, parsedBall.y, parsedBall.radius ?? 10, parsedBall.color ?? 'white');
		const parsedLPaddle = data.left_paddle;
		this.left_paddle_ = new Paddle(parsedLPaddle.x ?? 0, parsedLPaddle.y, parsedLPaddle.width ?? 10, parsedLPaddle.height ?? 40, parsedLPaddle.color ?? 'green');
	}

	update(data: GameData | undefined): void {
		if (!data)
			return;
		// console.log(data, "received data from channles")
		this.ball_.set(data.ball.x, data.ball.y);
		console.log(data.left_paddle.y, "new Y data");
		this.left_paddle_.setY(data.left_paddle.y);
	}

	draw(ctx: CanvasRenderingContext2D): void {
		this.ball_.draw(ctx);
		this.left_paddle_.draw(ctx);
	}
}

// 受信：ボールデータ、パドルデータ、スコアデータ
// 送信：キーアクション
