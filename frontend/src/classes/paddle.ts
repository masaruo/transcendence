import { Coord } from "./coord";

export class Paddle {
	readonly position: Coord;
	readonly width: number;
	readonly height: number;

	constructor(x: number, y:number, width: number, height: number) {
		this.position = new Coord(x, y);
		this.width = width;
		this.height = height;
	}

	draw(ctx: CanvasRenderingContext2D, color: string): void {
		ctx.beginPath();
		ctx.fillStyle = color;
		ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
		ctx.closePath();
	}

	// move(span: number, canvas_height: number): void {
	// 	if (span < 0 && this.position.y + span >= 0)
	// 	{
	// 		this.position.y += span;
	// 	}
	// 	else if (span > 0 && this.position.y + this.height + span <= canvas_height)
	// 	{
	// 		this.position.y += span;
	// 	}
	// }
	move(span: number, canvas_height: number): Paddle {
		if (span < 0 && this.position.y + span >= 0)
		{
			// this.position.y += span;
			return new Paddle(this.position.x, this.position.y + span, this.width, this.height);
		}
		else if(span > 0 && this.position.y + this.height + span <= canvas_height)
		{
			return new Paddle(this.position.x, this.position.y + span, this.width, this.height);
			// this.position.y += span;
		}
		else
			return this;

	}
}
