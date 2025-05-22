import Ball from "./Ball";
import Paddle from "./Paddle";
import * as THREE from 'three';

export type WebSocketEvent = {
	type: string;
	data: GameData;
}

type GameData = {
	balls?: Ball[],
	paddles?: Paddle[],
	match?: any,
	score?: any,
}

export class Manager {
	readonly renderer: THREE.WebGLRenderer;
	scene: THREE.Scene;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
    this.renderer = renderer;
		this.scene = scene;
  }

	update(event: WebSocketEvent): void {
		// console.log("Recieved Event", event);
		if (!event || !event.data) {
			console.error("Unexpected data type from backend.");
			return;
		}

		this.scene.clear();

		const data = event.data;
		// console.log("thisis data: ",data);

		const ambient = new THREE.AmbientLight(0x404040); 
		this.scene.add(ambient);
		const geometry = new THREE.PlaneGeometry(1000, 1000);
		const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
		const plane = new THREE.Mesh(geometry, material);
		plane.position.set(0, 0, -10);
		this.scene.add(plane);

		if (data.balls) {
			for (const ball of data.balls) {
				const { x, y, radius, color } = ball;
				const new_ball = new Ball(x, y, radius, color);
				this.scene.add(new_ball.mesh);
			}
		}
		if (data.paddles) {
			for (const paddle of data.paddles) {
				const { x, y, width, height, color } = paddle;
				const new_paddle = new Paddle(x, y, width, height, color);
				this.scene.add(new_paddle.mesh);
			}
		}
	}
}
