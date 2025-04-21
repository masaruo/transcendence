import Ball from "./Ball";
import Paddle from "./Paddle";

export type WebSocketEvent = {
	type: string;
	data: GameData;
}

type GameData = {
	balls: Ball[],
	paddles: Paddle[],
}

// type BallData = {
// 	x: number;
// 	y: number;
// 	radius: number;
// 	color: string;
// }

// type PaddleData = {
// 	x: number;
// 	y: number;
// 	width: number;
// 	height: number;
// 	color: string;
// }

export class Manager {
	readonly ctx: CanvasRenderingContext2D;

	constructor(ctx: CanvasRenderingContext2D) {
		this.ctx = ctx;
	}

	update(event: WebSocketEvent): void {
		console.log("Recieved Event", event);
		if (!event || !event.data) {
			console.error("Unexpected data type from backend.");
			return;
		}

		this.ctx.clearRect(0, 0, 900, 600);

		const data = event.data;
		// console.log("thisis data: ",data);

		if (data.balls) {
			for (const ball of data.balls) {
				const { x, y, radius, color } = ball;
				const new_ball = new Ball(x, y, radius, color);
				new_ball.draw(this.ctx);
			}
		}
		if (data.paddles) {
			for (const paddle of data.paddles) {
				const { x, y, width, height, color } = paddle;
				const new_paddle = new Paddle(x, y, width, height, color);
				new_paddle.draw(this.ctx);
			}
		}
		// const balls: Ball[] = [];
		// const paddles: Paddle[] = [];
		// if (partialGameData.balls) {
		// 	const {x, y, radius, color} = partialGameData.data.ball;
		// 	const new_ball = new Ball(x, y, radius, color);
		// 	new_ball.draw(this.ctx);
		// 	// balls.push(new_ball);
		// }
		// if (data.paddle) {
		// 	const {x, y, width, height, color} = partialGameData.data.paddle;
		// 	const new_paddle = new Paddle(x, y, width, height, color);
		// 	new_paddle.draw(this.ctx);
		// 	// paddles.push(new_paddle);
		// }
		// for (const ball of balls) {
		// 	ball.draw(this.ctx);
		// }
		// for (const paddle of paddles) {
		// 	paddle.draw(this.ctx);
		// }
	}
}
