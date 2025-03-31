import { Ball } from "./ball";
import { Paddle } from "./paddle";

export class Pong {
	// readonly balls: Ball[] = []
	// constructor () {
	// 	this.balls.push(new Ball(10, 10, 10));
	// }
	readonly _canvas: HTMLCanvasElement;
	readonly _ctx: CanvasRenderingContext2D;
	readonly _width: number;
	readonly _height: number;
	readonly _x_center: number;
	readonly _y_center: number;
	ball: Ball;
	r_paddle: Paddle;
	l_paddle:Paddle;

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
		this.r_paddle = new Paddle(0,this._y_center, 20, 80);
		this.l_paddle = new Paddle(this._width - 20, this._y_center, 20, 80);
	}
	draw(): void {
		this._ctx.clearRect(0, 0, this._width, this._height);
		this._ctx.fillStyle = "black";
		this._ctx.fillRect(0, 0, this._width, this._height);
	}
}
