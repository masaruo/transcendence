import IGameObj from "./IGameObj";
import * as THREE from 'three';

export default class Paddle implements IGameObj {
	readonly x: number;
	readonly y: number;
	readonly z: number;
	readonly width: number;
	readonly height: number;
	readonly depth: number;
	readonly color: string;
	mesh: THREE.Mesh;

	constructor(x: number, y: number, width: number, height: number, color: string) {
		this.x = x + width / 2;
		this.y = y + height / 2;
		this.z = 3;
		this.width = width;
		this.height = height;
		this.depth = 3;
		this.color = color;
		const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
		const material = new THREE.MeshPhongMaterial({ color: color });
		this.mesh = new THREE.Mesh(geometry, material);
		this.mesh.position.set(this.x, this.y, this.z);
		this.mesh.castShadow = true;
	}
}
