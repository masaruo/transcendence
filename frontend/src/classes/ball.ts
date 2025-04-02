
export class Ball {
	private x: number;
	private y: number;
	readonly radious: number;

	constructor(x: number, y: number, radious: number) {
		this.x = x;
		this.y = y;
		this.radious = radious;
	}

	// move(dx: number, dy:number): Ball {
	// 	return new Ball(this.x + dx, this.y + dy, this.radious);
	// }
	move(dx: number, dy:number): void
	{
		this.x += dx;
		this.y += dy;
	}

	draw(ctx: CanvasRenderingContext2D): void {
		ctx.fillStyle = "white";
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radious, 0, Math.PI * 2);
		ctx.fill();
		ctx.closePath();
	}
}
