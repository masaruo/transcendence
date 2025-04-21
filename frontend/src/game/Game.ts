import { Manager, WebSocketEvent } from "./Manager";

export class Game {
	readonly ctx: CanvasRenderingContext2D;
	readonly width: number;
	readonly height: number;

	private interavlID: NodeJS.Timeout | null = null;
	private socket_: WebSocket | null = null;
	private keyMovements: {[key: string]: boolean} = {};
	private manager: Manager | null = null;

	constructor(canvas: HTMLCanvasElement) {
		if (!canvas) {
			throw Error('failed to get canvas element.');
		}
		const ctx = canvas.getContext('2d');
		if (!ctx)
			throw Error('failed to get context.');
		this.ctx = ctx;
		this.width = canvas.width;
		this.height = canvas.height;

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
			if (this.interavlID == null)
				this.interavlID = setInterval(() => {
					this.draw();
				}, 16);
		})
	}

	connectWebSocket(): void {
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

		const token = sessionStorage.getItem('access');
		console.log("token ", token)
		this.socket_ = new WebSocket(`${protocol}//localhost:8000/ws/game/?token=${token}`);

		this.socket_.onopen = () => {
			console.log("WebSocket接続成功", new Date().toISOString());
			// console.log("readyState:", this._socket.readyState);
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
					this.manager = new Manager(this.ctx);
					this.manager.update(event);
					// this.state_ = new State(parsedData.data);
				} else {
					console.error("Event data is undefined.");
				}
				break;
			case 'game_update':
				if (this.manager)
					this.manager.update(event);
				else
					console.error("State is not initialized");
				break;

		}
	}

	draw(): void {
		return;
	}
}

