import IGameObj from "./IGameObj";
import * as THREE from 'three';

export default class Ball implements IGameObj {
	readonly x: number;
	readonly y: number;
	readonly z: number;
	readonly radius: number;
	readonly color: string;
	mesh: THREE.Mesh;

	constructor(x: number, y:number, radius: number, color:string) {
		this.x = x;
		this.y = y;
		this.z = 3;
		this.radius = radius;
		this.color = color;
		const segment = 32;
		const geometry = new THREE.SphereGeometry(radius, segment, segment);
		const material = new THREE.MeshPhongMaterial({ color: color });
		this.mesh = new THREE.Mesh(geometry, material);
		this.mesh.position.set(this.x, this.y, this.z);
		this.mesh.castShadow = true;
	}
}
