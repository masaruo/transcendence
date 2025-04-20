import IGameObj from "./IGameObj";

export default class Ball implements IGameObj {
	// readonly pos: {x: number, y: number};
	readonly x: number;
	readonly y: number;
	readonly radius: number;
	readonly color: string;

	constructor(x: number, y:number, radius: number, color:string) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
	}

	// update(new_x: number, new_y: number): IGameObj {
	// 	return new Ball(new_x, new_y, this.radius, this.color);
	// }

	draw(ctx: CanvasRenderingContext2D): void {
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		ctx.fill();
		ctx.closePath();
	}
}
