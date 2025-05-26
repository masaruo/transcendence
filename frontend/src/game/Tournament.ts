import { WS_PATH } from "@/services/constants";
// import Pong from "@/game/Pong";
import { navigateTo } from "@/services/router";

export default class Tournament {
	private tournamentId: string;
	private socket: WebSocket | null = null;

	constructor(tournamentId:string) {
		this.tournamentId = tournamentId;
	}

	connect(): void {
		const token = sessionStorage.getItem('access');
		// this.socket = new WebSocket(`${protocol}://localhost:8000/ws/tournament/${this.tournamentId}/?token=${token}`);
		this.socket = new WebSocket(`wss://localhost/ws/tournament/${this.tournamentId}/?token=${token}`);

		this.socket.onopen = () => {
			console.log("[DEBUG] Connected to tournament WebSocket");
		}

		this.socket.onmessage = (e) => {
			const data = JSON.parse(e.data);
			if (data.type === 'match_start') {
				const match = data.match;
				const ids = match.playerIds;
				const currentUserId = parseInt(sessionStorage.getItem('user_id'));
				if (ids.includes(currentUserId)) {
					// console.log("[DEBUG] User is in this match");
					sessionStorage.setItem('navigatingToNextMatch', 'true');
					navigateTo(`/tournament/${this.tournamentId}/pong/${match.id}`)
				}
			} else if (data.type === 'tournament_update') {
				console.log("[DEBUG] Tournament update received:", data);
			}
		}

		this.socket.onerror = (error) => {
			console.error("[DEBUG] WebSocket error:", error);
		}

		this.socket.onclose = (event) => {
			console.log("[DEBUG] WebSocket closed:", event.code, event.reason);
		}
	}
	disconnect(): void {
		//todo
		return;
	}
}
