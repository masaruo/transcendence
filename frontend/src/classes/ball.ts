
export class Ball {
	x: number;
	y: number;
	radious: number;
	dx: number;
	dy: number;

	constructor(x: number, y: number, radious: number, dx: number, dy: number) {
		this.x = x;
		this.y = y;
		this.radious = radious;
		this.dx = dx;
		this.dy = dy;
	}

	move(): void {
		this.x += this.dx;
		this.y += this.dy;
	}

	draw(ctx: CanvasRenderingContext2D): void {
		ctx.fillStyle = "white";
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radious, 0, Math.PI * 2);
		ctx.fill();
		ctx.closePath();
	}
}
