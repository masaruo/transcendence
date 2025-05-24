import IGameObj from "./IGameObj";
import * as THREE from 'three';

export default class Paddle implements IGameObj {
	readonly x: number;
	readonly y: number;
	readonly width: number;
	readonly height: number;
	readonly color: string;
	mesh: THREE.Mesh;

	constructor(x: number, y: number, width: number, height: number, color: string) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.color = color;
		const geometry = new THREE.BoxGeometry(width, height, 1);
		const material = new THREE.MeshPhongMaterial({ color: color });
		this.mesh = new THREE.Mesh(geometry, material);
		this.mesh.position.set(x, y, 0);
	}

	// update(new_x: number, new_y: number): IGameObj {
	// 	return new Paddle(new_x, new_y, this.width, this.height, this.color);
	// }

	update() {

	}
}
