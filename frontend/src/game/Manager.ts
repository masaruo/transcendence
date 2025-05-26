import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import Ball from "./Ball";
import Paddle from "./Paddle";
import * as THREE from 'three';
// import { mx_bilerp_0 } from "three/src/nodes/materialx/lib/mx_noise.js";

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
	floor_material: THREE.MeshStandardMaterial;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
		this.renderer = renderer;
		this.scene = scene;
		const textureLoader = new THREE.TextureLoader();
		const floor_color = textureLoader.load('/src/texture/Wood/WoodFloor046_1K-JPG_Color.jpg');
		const floor_normal = textureLoader.load('/src/texture/Wood/WoodFloor046_1K-JPG_NormalGL.jpg');
		const floor_roughness = textureLoader.load('/src/texture/Wood/WoodFloor046_1K-JPG_Roughness.jpg');
		this.floor_material = new THREE.MeshStandardMaterial({
			map: floor_color,
			normalMap: floor_normal,
			roughnessMap: floor_roughness,
		});
	}

	add_table(table_width: number, table_height: number) {
		const table_geometry = new THREE.PlaneGeometry(table_width, table_height);
		const table_material = new THREE.MeshPhongMaterial({ color: 0x264f46, side: THREE.DoubleSide });
		const table = new THREE.Mesh(table_geometry, table_material);
		table.position.set(table_width / 2, table_height / 2, 0);
		table.receiveShadow = true;
		table.castShadow = true;
		this.scene.add(table);

		const line_width = 10;
		const vertical_line_geometry = new THREE.PlaneGeometry(line_width, table_height);
		const vertical_line_material = new THREE.MeshPhongMaterial({color: 0xffffff});

		const line1 = new THREE.Mesh(vertical_line_geometry, vertical_line_material);
		line1.position.set(table_width / 2, table_height / 2, 1);
		line1.receiveShadow = true;
		this.scene.add(line1);

		const line2 = clone(line1);
		line2.position.set(line_width / 2, table_height / 2, 1);
		line2.receiveShadow = true;
		this.scene.add(line2);

		const line3 = clone(line1);
		line3.position.set(table_width - line_width / 2, table_height / 2, 1);
		line3.receiveShadow = true;
		this.scene.add(line3);

		const horizontal_line_geometry = new THREE.PlaneGeometry(table_width, line_width);
		const horizontal_line_material = new THREE.MeshPhongMaterial({color: 0xffffff});

		const line4 = new THREE.Mesh(horizontal_line_geometry, horizontal_line_material);
		line4.position.set(table_width / 2, table_height, 1);
		line4.receiveShadow = true;
		this.scene.add(line4);

		const line5 = clone(line4);
		line5.position.set(table_width / 2, 0, 1);
		line5.receiveShadow = true;
		this.scene.add(line5);
	}

	add_floor(table_width: number, table_height: number){
		const floor_width = table_width + 200;
		const floor_height = table_height + 200;
		const floor_geometry = new THREE.PlaneGeometry(floor_width, floor_height);

		const floor = new THREE.Mesh(floor_geometry, this.floor_material);
		floor.position.set(table_width / 2,  table_height/ 2, -10);
		this.scene.add(floor);
	}

	add_corner_spot_light(x: number, y: number, color: number){
		const spot = new THREE.SpotLight(color, 30, 0, Math.PI, 1.0, 0.5);
		spot.position.set(x, y, 100);
		spot.target.position.set(x, y, 0);
		this.scene.add(spot);
		this.scene.add(spot.target);
	}

	add_lights(table_width: number, table_height: number){
		const ambient = new THREE.AmbientLight(0x404040, 0.3);
		this.scene.add(ambient);

		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
		directionalLight.position.set(0, 0, 10);
		directionalLight.castShadow = true;
		this.scene.add(directionalLight);

		const while_light_color = 0xffffff;
		const center_light = new THREE.SpotLight(while_light_color, 15, 0, Math.PI / 2, 1.0, 0.5);
		center_light.position.set(table_width / 2, table_height / 2, 100);
		center_light.target.position.set(table_width / 2, table_height / 2, 0);
		this.scene.add(center_light);
		this.scene.add(center_light.target);
		center_light.castShadow = true;

		const left_light_color = 0x4169E1;
		const right_light_color = 0xFF5F00;
		this.add_corner_spot_light(0, 0, left_light_color);
		this.add_corner_spot_light(0, table_height, left_light_color);
		this.add_corner_spot_light(0, table_height / 2, while_light_color);
		this.add_corner_spot_light(table_width, 0, right_light_color);
		this.add_corner_spot_light(table_width, table_height, right_light_color);
		this.add_corner_spot_light(table_width, table_height / 2, while_light_color);
	}

	update(event: WebSocketEvent): void {
		console.log("Received Event", event);
		if (!event || !event.data) {
			console.error("Unexpected data type from backend.");
			return;
		}
		this.scene.clear();
		const data = event.data;
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

		const table_width = 900;
		const table_height = 600;
		this.add_table(table_width, table_height);
		this.add_floor(table_width, table_height);
		this.add_lights(table_width, table_height);

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
