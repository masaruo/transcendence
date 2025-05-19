import { Manager, WebSocketEvent } from "./Manager";
import { navigateTo } from "@/services/router";

export default class Pong {
	readonly ctx: CanvasRenderingContext2D;
	readonly matchId: number = 0;
	readonly width: number;
	readonly height: number;

	readonly state_elem: HTMLElement | null;
	readonly score_elem: HTMLElement | null;

	private intervalID: NodeJS.Timeout | null = null;
	private socket_: WebSocket | null = null;
	private keyMovements: {[key: string]: boolean} = {};
	private manager: Manager | null = null;

	constructor(canvas: HTMLCanvasElement, matchId: number) {
		if (!canvas) {
			throw Error('failed to get canvas element.');
		}
		const ctx = canvas.getContext('2d');
		if (!ctx)
			throw Error('failed to get context.');
		this.ctx = ctx;
		this.width = canvas.width;
		this.height = canvas.height;

		this.matchId = matchId;
		document.addEventListener('keydown', (e) => {
			this.keyMovements[e.key] = true;
		})

		document.addEventListener('keyup', (e) => {
			this.keyMovements[e.key] = false;
		})

		this.state_elem = document.getElementById('match-data');
		this.score_elem = document.getElementById('score-data');

		// const join = document.getElementById('join');
		// //todo end && start??
		// if (!join) {
		// 	throw Error("Keys are not found.");
		// }
		// join.addEventListener('click', async() => {
		// 	this.connectWebSocket();
		// 	if (this.intervalID == null)
		// 		this.intervalID = setInterval(() => {
		// 			this.draw();
		// 		}, 16);
		// })
	}

	start(): void {
		this.connectWebSocket();
		if (this.intervalID == null)
			this.intervalID = setInterval(() => {
				this.draw();
			}, 16);
	}

	connectWebSocket(): void {
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

		const token = sessionStorage.getItem('access');
		// console.log("token ", token)
		this.socket_ = new WebSocket(`${protocol}//localhost:8000/ws/match/${this.matchId}/?token=${token}`);

		this.socket_.onopen = () => {
			console.log("WebSocket接続成功", new Date().toISOString());
			//todo 試合スコアやプレイヤー名の表示
		  }

		this.socket_.onmessage = (event) => {
			console.log("received data: ", event.data);
			const parsedData = JSON.parse(event.data);
			this.handleEvent(parsedData)
			//todo 試合状況の表示
		}

		this.socket_.onclose = () => {
			//todo 試合終了のお知らせ
			// setTimeout(() => this.connectWebSocket(), 3000);
			console.log("websocket on close");
			clearInterval(this.intervalID);
			this.intervalID = null;
			const parent_path = location.pathname.replace(/\pong\/.*$/, '');
			navigateTo(parent_path);
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
		this.check_and_notify_keymove();
		return;
	}

	show_state(event: WebSocketEvent): void {
		const match_info = event.data.match;
		const score_info = event.data.score;

		// 既存の状態表示をクリア
		if (this.state_elem) {
			this.state_elem.innerHTML = '';
		}

		// 状態表示用のコンテナを作成
		const matchContainer = document.createElement('div');
		matchContainer.className = 'match-state-container';

		// マッチ情報セクション
		const matchHeader = document.createElement('div');
		matchHeader.className = 'match-header';
		matchHeader.innerHTML = `
			<h3>マッチ #${match_info.id}</h3>
			<p>ラウンド: ${match_info.round}</p>
		`;

		// スコアボード
		const scoreBoard = document.createElement('div');
		scoreBoard.className = 'score-board';
		scoreBoard.innerHTML = `
			<div class="score-display">
			<span class="score team1-score">${score_info.team1_score}</span>
			<span class="score-separator">-</span>
			<span class="score team2-score">${score_info.team2_score}</span>
			</div>
		`;

		// チーム情報
		const teamsInfo = document.createElement('div');
		teamsInfo.className = 'teams-info';

		// チーム1情報
		const team1Info = document.createElement('div');
		team1Info.className = 'team-info team1';
		team1Info.innerHTML = `
			<h4>チーム1 (ID: ${match_info.team1.id})</h4>
			<p>プレイヤー1: ${match_info.team1.player1_nickname || 'なし'}</p>
			${match_info.team1.player2_nickname ? `<p>プレイヤー2: ${match_info.team1.player2_nickname}</p>` : ''}
		`;

		// チーム2情報
		const team2Info = document.createElement('div');
		team2Info.className = 'team-info team2';
		team2Info.innerHTML = `
			<h4>チーム2 (ID: ${match_info.team2.id})</h4>
			<p>プレイヤー1: ${match_info.team2.player1_nickname || 'なし'}</p>
			${match_info.team2.player2_nickname ? `<p>プレイヤー2: ${match_info.team2.player2_nickname}</p>` : ''}
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
		matchContainer.appendChild(teamsInfo);
		matchContainer.appendChild(statusInfo);

		// コンテナをDOMに追加
		this.state_elem?.appendChild(matchContainer);
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

