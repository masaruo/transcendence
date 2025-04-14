export class Coord {
	private	x_: number;
	private	y_: number;

	constructor(x: number, y: number){
		this.x_ = x;
		this.y_ = y;
	}

	setX(new_x:number): void  {
		this.x_ = new_x;
	}

	setY(new_y: number): void {
		this.y_ = new_y;
	}

	set(new_x: number, new_y: number): void {
		this.setX(new_x);
		this.setY(new_y);
	}

	getX(): number {
		return (this.x_);
	}

	getY(): number {
		return (this.y_);
	}
}
