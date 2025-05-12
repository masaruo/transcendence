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
		const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
		const token = sessionStorage.getItem('access');
		console.log("[DEBUG] Connecting to tournament WebSocket");
		this.socket = new WebSocket(`${protocol}://localhost:8000/ws/tournament/${this.tournamentId}/?token=${token}`);

		this.socket.onopen = () => {
			console.log("[DEBUG] Connected to tournament WebSocket");
		}

		this.socket.onmessage = (e) => {
			console.log("[DEBUG] Received WebSocket message:", e.data);
			const data = JSON.parse(e.data);
			if (data.type === 'match_start') {
				console.log("[DEBUG] Match start notification received:", data.match);
				const match = data.match;
				const ids = match.playerIds;
				const currentUserId = parseInt(sessionStorage.getItem('user_id'));
				console.log("[DEBUG] Current user ID:", currentUserId, "Match player IDs:", ids);
				if (ids.includes(currentUserId)) {
					console.log("[DEBUG] User is in match, navigating to game");
					navigateTo(`/pong/${match.id}`)
				} else {
					console.log("[DEBUG] User is not in this match");
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
