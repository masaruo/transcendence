import IGameObj from "./IGameObj";
import * as THREE from 'three';

export default class Ball implements IGameObj {
	// readonly pos: {x: number, y: number};
	readonly x: number;
	readonly y: number;
	readonly radius: number;
	readonly color: string;
	mesh: THREE.Mesh;

	constructor(x: number, y:number, radius: number, color:string) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		const geometry = new THREE.SphereGeometry(radius, 32, 32);
		const material = new THREE.MeshBasicMaterial({ color: color });
		this.mesh = new THREE.Mesh(geometry, material);
		this.mesh.position.set(x, y, 0);
	}

	// update(new_x: number, new_y: number): IGameObj {
	// 	return new Ball(new_x, new_y, this.radius, this.color);
	// }

	update() {

	}
}
