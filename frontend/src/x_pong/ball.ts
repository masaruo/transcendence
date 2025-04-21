import { Coord } from "./coord";

export class Ball {
	private		coord_: Coord;
	readonly	radious_: number;
	readonly	color_: string;

	constructor(x: number, y: number, radious: number, color: string) {
		this.coord_ = new Coord(x, y);
		this.radious_ = radious;
		this.color_ = color;
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

	draw(ctx: CanvasRenderingContext2D): void {
		ctx.fillStyle = this.color_;
		ctx.beginPath();
		ctx.arc(this.coord_.getX(), this.coord_.getY(), this.radious_, 0, Math.PI * 2);
		ctx.fill();
		ctx.closePath();
	}
}
