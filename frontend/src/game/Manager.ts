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
		
		const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		directionalLight.position.set(0, 0, 1);
		this.scene.add(directionalLight);

		const geometry = new THREE.PlaneGeometry(900, 600);
		const material = new THREE.MeshPhongMaterial({ color: 0x264f46, side: THREE.DoubleSide });
		const plane = new THREE.Mesh(geometry, material);
		plane.position.set(900 / 2, 600 / 2, -10);
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
