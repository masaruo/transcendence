import IGameObj from "./IGameObj";

export default class Paddle implements IGameObj {
	readonly x: number;
	readonly y: number;
	readonly width: number;
	readonly height: number;
	readonly color: string;

	constructor(x: number, y: number, width: number, height: number, color: string) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.color = color;
	}

	// update(new_x: number, new_y: number): IGameObj {
	// 	return new Paddle(new_x, new_y, this.width, this.height, this.color);
	// }

	draw(ctx: CanvasRenderingContext2D): void {
		ctx.beginPath();
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.closePath();
	}
}
