import { Manager, WebSocketEvent } from "./Manager";
import { navigateTo } from "@/services/router";
import * as THREE from 'three';
import { WS_PATH } from "@/services/constants";

export default class Pong {
	readonly renderer: THREE.WebGLRenderer;
	readonly matchId: number = 0;
	readonly width: number;
	readonly height: number;

	readonly state_elem: HTMLElement | null;
	readonly teams_elem: HTMLElement | null;

	private socket_: WebSocket | null = null;
	private keyMovements: {[key: string]: boolean} = {};
	private manager: Manager | null = null;

	public scene: THREE.Scene;
	public camera: THREE.OrthographicCamera;

	constructor(canvas: HTMLCanvasElement, matchId: number) {
		if (!canvas) {
			throw Error('failed to get canvas element.');
		}
		this.width = canvas.width;
		this.height = canvas.height;

		this.renderer = new THREE.WebGLRenderer({ canvas });
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.width, this.height);

		this.scene = new THREE.Scene();

		const display_width = this.width / 2 + 100;
		const display_height = this.height / 2 + 100;
		const near = -1000;
		const far = 1000;

		this.camera = new THREE.OrthographicCamera(display_width * -1, display_width, display_height, display_height * -1, near, far);
		this.camera.position.set(this.width / 2, this.height / 2, 200);
		this.camera.lookAt(this.width / 2, this.height / 2, 0);

		this.matchId = matchId;
		document.addEventListener('keydown', (e) => {
			this.keyMovements[e.key] = true;
		})

		document.addEventListener('keyup', (e) => {
			this.keyMovements[e.key] = false;
		})

		this.state_elem = document.getElementById('match-data');
		this.teams_elem = document.getElementById('team-data');
	}

	start(): void {
		this.connectWebSocket();
		this.draw();
	}

	connectWebSocket(): void {
		const token = sessionStorage.getItem('access');
		this.socket_ = new WebSocket(`${WS_PATH}/ws/match/${this.matchId}/?token=${token}`);

		this.socket_.onopen = () => {}

		this.socket_.onmessage = (event) => {
			const parsedData = JSON.parse(event.data);
			this.handleEvent(parsedData)
		}

		this.socket_.onclose = () => {
			sessionStorage.removeItem('navigatingToNextMatch');
		}

		this.socket_.onerror = (error) => {
			console.error("Websocket Error", error);
		}
	}

	handleEvent(event: WebSocketEvent): void {
		switch (event.type) {
			case 'game_initialization':
				if (event.data) {
					this.manager = new Manager(this.renderer, this.scene);
					this.manager.update(event);
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
			case 'update_status':
				this.show_state(event);
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

	show_state(event: WebSocketEvent): void {
		const match_info = event.data.match;
		const score_info = event.data.score;

		// 既存の状態表示をクリア
		if (this.state_elem) {
			this.state_elem.innerHTML = '';
		}
		if (this.teams_elem) {
			this.teams_elem.innerHTML = '';
		}

		// 状態表示用のコンテナを作成
		const matchContainer = document.createElement('div');
		matchContainer.className = 'match-state-container';

		// マッチ情報セクション
		const matchHeader = document.createElement('div');
		matchHeader.className = 'match-header';
		matchHeader.innerHTML = `
			<h2>Match #${match_info.id}  </h2>
			<h2>Round ${match_info.round}</h2>
		`;

		// スコアボード
		const scoreBoard = document.createElement('div');
		scoreBoard.className = 'score-board';
		scoreBoard.innerHTML = `
			<div class="score-display">
			<h1 class="score team1-score">${score_info.team1_score}</h1>
			<h1 class="score-separator">-</h1>
			<h1 class="score team2-score">${score_info.team2_score}</h1>
			</div>
			${match_info.status == 3 ?
				`<h1 style="color: #cf2701;text-align: center;">FINISHED!</h1>` : ""}
		`;

		// チーム情報
		const teamsInfo = document.createElement('div');
		teamsInfo.className = 'teams-info';

		// チーム1情報
		const team1Info = document.createElement('div');
		team1Info.className = 'team-info team1';
		team1Info.innerHTML = `
			<h5>Team1 (ID: ${match_info.team1.id})</h5>
			<p>
				<span class="color-box" style="background-color: #2d80f3"></span>
				Player1: ${match_info.team1.player1_nickname || 'なし'}
			</p>
			${match_info.team1.player2_nickname ?
				`<p>
					<span class="color-box" style="background-color: #ccc8fd"></span>
					Player2: ${match_info.team1.player2_nickname}
				</p>` : ''}
		`;

		// チーム2情報
		const team2Info = document.createElement('div');
		team2Info.className = 'team-info team2';
		team2Info.innerHTML = `
			<h5>Team2 (ID: ${match_info.team2.id})</h5>
			<p>
				<span class="color-box" style="background-color: #ef3d2d"></span>
				Player1: ${match_info.team2.player1_nickname || 'なし'}
			</p>
			${match_info.team2.player2_nickname ?
				`<p>
					<span class="color-box" style="background-color: #f6a498"></span>
					Player2: ${match_info.team2.player2_nickname}
				</p>` : ''}
		`;

		// チーム情報をコンテナに追加
		teamsInfo.appendChild(team1Info);
		teamsInfo.appendChild(team2Info);

		// ステータス情報
		const statusInfo = document.createElement('div');
		statusInfo.className = 'status-info';
		statusInfo.innerHTML = `
			<p>ステータス: ${this.getStatusText(match_info.status)}</p>
		`;

		// すべての要素をコンテナに追加
		matchContainer.appendChild(matchHeader);
		matchContainer.appendChild(scoreBoard);

		// コンテナをDOMに追加
		this.state_elem?.appendChild(matchContainer);
		this.teams_elem?.appendChild(teamsInfo);
		}

		// ステータスコードをテキストに変換するヘルパー関数
		private getStatusText(status: number): string {
		switch (status) {
			case 0: return '待機中';
			case 1: return '進行中';
			case 2: return '完了';
			default: return '不明';
		}
	}
}

