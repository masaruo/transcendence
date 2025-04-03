import { Paddle } from "./paddle";

export class Ball {
	private x: number;
	private y: number;
	readonly radious: number;
	private dx: number;
	private dy: number;
	private is_gameContinue: boolean;

	constructor(x: number, y: number, radious: number) {
		this.x = x;
		this.y = y;
		this.radious = radious;
		this.dx = 3;
		this.dy = 3;
		this.is_gameContinue = true;
	}

	// move(dx: number, dy:number): Ball {
	// 	return new Ball(this.x + dx, this.y + dy, this.radious);
	// }
	move(): void
	{
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

	checkCollision(canvasHeight: number, canvaWidth: number, leftPaddle: Paddle, rightPaddle: Paddle): void {
		// 上下との接触確認
		if (this.y - this.radious < 0 || this.y + this.radious > canvasHeight){
			this.dy *= -1;
		}
		// 左右からボールが出たか確認
		else if (this.x + this.radious < 0 || this.x - this.radious > canvaWidth){
			this.is_gameContinue = false;
		}
		// left paddle
		else if (this.x - this.radious <= leftPaddle.x_ + leftPaddle.width_ && this.y - this.radious > leftPaddle.getY() && this.y + this.radious < leftPaddle.getY() + leftPaddle.height_)
		{
			this.dx = Math.abs(this.dx);
		}
		// right paddle
		else if (this.x + this.radious >= rightPaddle.x_  && this.y - this.radious > rightPaddle.getY()  && this.y + this.radious < rightPaddle.getY() + rightPaddle.height_)
		{
			this.dx = -Math.abs(this.dx);
		}
	}

	checkGameContinue(): boolean {
		return (this.is_gameContinue);
	}
}
