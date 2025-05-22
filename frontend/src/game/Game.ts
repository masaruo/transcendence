import { Manager, WebSocketEvent } from "./Manager";
import * as THREE from 'three';

export class Game {
	readonly matchId: number = 0;
	readonly width: number;
	readonly height: number;
	readonly renderer: THREE.WebGLRenderer;
	scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;

	private socket_: WebSocket | null = null;
	private keyMovements: {[key: string]: boolean} = {};
	private manager: Manager | null = null;

	constructor(canvas: HTMLCanvasElement, matchId: number) {
		if (!canvas) {
			throw Error('failed to get canvas element.');
		}
		console.log("Game constructor is called");
		this.width = canvas.width;
		this.height = canvas.height;

		this.renderer = new THREE.WebGLRenderer({ canvas });
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.width, this.height);

		this.scene = new THREE.Scene();
		
		this.camera = new THREE.PerspectiveCamera(75, this.width / this.height);
    this.camera.position.set(this.width / 2, this.height / 2, +300);
		this.camera.lookAt(this.width / 2, this.height / 2, 0);

		this.matchId = matchId;
		document.addEventListener('keydown', (e) => {
			this.keyMovements[e.key] = true;
		})

		document.addEventListener('keyup', (e) => {
			this.keyMovements[e.key] = false;
		})

		const join = document.getElementById('join');
		//todo end && start??
		if (!join) {
			throw Error("Keys are not found.");
		}
		join.addEventListener('click', async() => {
			this.connectWebSocket();
			this.draw();
		})
	}

	connectWebSocket(): void {
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

		const token = sessionStorage.getItem('access');
		// console.log("token ", token)
		this.socket_ = new WebSocket(`${protocol}//localhost:8000/ws/game/${this.matchId}/?token=${token}`);

		this.socket_.onopen = () => {
			console.log("WebSocket接続成功", new Date().toISOString());
		  }

		this.socket_.onmessage = (event) => {
			console.log("received data: ", event.data);
			const parsedData = JSON.parse(event.data);
			this.handleEvent(parsedData)
		}

		this.socket_.onclose = () => {
			// setTimeout(() => this.connectWebSocket(), 3000);
		}

		this.socket_.onerror = (error) => {
			console.error("Websocket Error", error);
		}
	}

	handleEvent(event: WebSocketEvent): void {
		console.log("Gamets.Received Event= ", event)
		switch (event.type) {
			case 'game_initialization':
				if (event.data) {
					//console.log("this.scene in Game manager init:", this.scene);
					console.log("Game constructor is called");
					this.manager = new Manager(this.renderer, this.scene);
					this.manager.update(event);
					// this.state_ = new State(parsedData.data);
				} else {
					console.error("Event data is undefined.");
				}
				break;
			case 'game_update':
					console.log("this.scene in Game manager.update:", this.scene);
				if (this.manager)
					this.manager.update(event);
				else
					console.error("State is not initialized");
				break;
		}
	}

	check_and_notify_keymove(): void {
		let direction: string | null = null;
		if (this.keyMovements['ArrowUp']) {
			direction = 'ArrowUp';
		} else if (this.keyMovements['ArrowDown']) {
			direction = 'ArrowDown';
		} else if (this.keyMovements['w']) {
			direction = 'w';
		} else if (this.keyMovements['s']) {
			direction = 's';
		}

		if (direction != null && this.socket_) {
			this.socket_.send(JSON.stringify(
				{
					type: 'paddle_movement',
					direction: direction
				}
			))
		}
	}

	draw(): void {
		requestAnimationFrame(() => this.draw());
		this.check_and_notify_keymove();
		this.renderer.render(this.scene, this.camera);
		return;
	}
}

