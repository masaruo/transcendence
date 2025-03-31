export class Coord {
	x: number;
	y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	set(x: number, y: number): void {
		this.x = x;
		this.y = y;
	}

	move(dx: number, dy: number): void {
		this.x += dx;
		this.y += dy;
	}
}
