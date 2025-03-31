
export class Ball {
	readonly x: number;
	readonly y: number;
	readonly radious: number;
	// readonly dx: number;
	// readonly dy: number;

	constructor(x: number, y: number, radious: number) {
		this.x = x;
		this.y = y;
		this.radious = radious;
	}

	move(dx: number, dy:number): Ball {
		// this.x += this.dx;
		// this.y += this.dy;
		return new Ball(this.x + dx, this.y + dy, this.radious);
	}

	draw(ctx: CanvasRenderingContext2D): void {
		ctx.fillStyle = "white";
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radious, 0, Math.PI * 2);
		ctx.fill();
		ctx.closePath();
	}
}
