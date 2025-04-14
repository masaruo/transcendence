import { Coord } from "./coord";

export class Paddle {
	private		coord_: Coord;
	readonly	width_: number;
	readonly	height_: number;
	readonly	color_: string;

	constructor(x: number, y:number, width: number, height: number, color: string) {
		this.coord_ = new Coord(x, y);
		this.width_ = width;
		this.height_ = height;
		this.color_ = color;
	}

	draw(ctx: CanvasRenderingContext2D): void {
		ctx.beginPath();
		ctx.fillStyle = this.color_;
		ctx.fillRect(this.coord_.getX(), this.coord_.getY(), this.width_, this.height_);
		ctx.closePath();
	}

	setX(new_x: number): void {
		this.coord_.setX(new_x);
	}

	setY(new_y: number): void {
		this.coord_.setY(new_y);
	}

	set(new_x: number, new_y: number): void {
		this.setX(new_x);
		this.setY(new_y);
	}
}
