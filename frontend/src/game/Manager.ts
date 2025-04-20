import IGameObj from "./IGameObj";
import Ball from "./Ball";
import Paddle from "./Paddle";

type GameData = {
	data: {
		ball: BallData;
		paddle: PaddleData;
	}
}

type BallData = {
	x: number;
	y: number;
	radius: number;
	color: string;
}

type PaddleData = {
	x: number;
	y: number;
	width: number;
	height: number;
	color: string;
}

export default class Manager {
	readonly ctx: CanvasRenderingContext2D;

	constructor(ctx: CanvasRenderingContext2D) {
		this.ctx = ctx;
	}

	update(partialGameData: Partial<GameData>): void {
		if (!partialGameData || !partialGameData.data) {
			console.error("Unexpected data type from backend.");
			return;
		}
		const data = partialGameData.data;
		// const balls: Ball[] = [];
		// const paddles: Paddle[] = [];
		if (data.ball) {
			const {x, y, radius, color} = partialGameData.data.ball;
			const new_ball = new Ball(x, y, radius, color);
			new_ball.draw(this.ctx);
			// balls.push(new_ball);
		}
		if (data.paddle) {
			const {x, y, width, height, color} = partialGameData.data.paddle;
			const new_paddle = new Paddle(x, y, width, height, color);
			new_paddle.draw(this.ctx);
			// paddles.push(new_paddle);
		}
		// for (const ball of balls) {
		// 	ball.draw(this.ctx);
		// }
		// for (const paddle of paddles) {
		// 	paddle.draw(this.ctx);
		// }
	}
}
