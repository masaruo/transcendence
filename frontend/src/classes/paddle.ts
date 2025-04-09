import { Ball } from "./ball";

export class Paddle {
	readonly x_: number;
	private y_: number;
	readonly width_: number;
	readonly height_: number;
	readonly distance_: number;

	constructor(x: number, y:number, width: number, height: number, distance: number = 10) {
		this.x_ = x;
		this.y_ = y;
		this.width_ = width;
		this.height_ = height;
		this.distance_ = distance;
	}

	draw(ctx: CanvasRenderingContext2D, color: string): void {
		ctx.beginPath();
		ctx.fillStyle = color;
		ctx.fillRect(this.x_, this.y_, this.width_, this.height_);
		ctx.closePath();
	}
    move(canvas_height: number, upKey: boolean, downKey: boolean): void {
        if (downKey && this.y_ + this.height_ + this.distance_ <= canvas_height) {
            this.y_ += this.distance_;
        } else if (upKey && this.y_ - this.distance_ >= 0) {
            this.y_ -= this.distance_;
        }
    }

	setY(new_y: number): void {
		this.y_ = new_y;
	}

	getY(): number {
		return (this.y_);
	}
}
