import { WS_PATH } from "@/services/constants";
import { Pong } from "./Game";

export default class Tournament {
	private socket: WebSocket | null = null;
	private canvas: HTMLCanvasElement;

	constructor (canvas: HTMLCanvasElement) {
		if (!canvas) {
			throw Error('failed to get canvas element.');
		}
		this.canvas = canvas;
	}

	connect(tournamentId: string): void {
		const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
		this.socket = new WebSocket(`${protocol}${WS_PATH}/ws/tournament/${tournamentId}/`);

		this.socket.onopen = () => {
			console.log("Connected to a tournament");
		}

		this.socket.onmessage = (e) => {
			const data = JSON.parse(e.data);
			if (data.type === 'match_start') {
				const isMyMatch = data.players.some(player => player.id === currentUserId);

				if (isMyMatch) {
					const pong = new Pong(this.canvas, isMyMatch.id);
					// this.startPongGame(data.match_id);
				}
			} else if (data.type === 'tournament_update') {
				console.log(data, "tournament update received");
			}
		}
	}
	disconnect(): void {
		//todo
		return;
	}
}
