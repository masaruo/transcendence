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
		// this.socket = new WebSocket(`${protocol}//${WS_PATH}/tournament/${this.tournamentId}/`);
		this.socket = new WebSocket(`${protocol}://localhost:8000/ws/tournament/${this.tournamentId}/?token=${token}`);

		this.socket.onopen = () => {
			console.log("Connected to a tournament");
		}

		this.socket.onmessage = (e) => {
			const data = JSON.parse(e.data);
			if (data.type === 'match_start') {
				const match = data.match;
				const ids = match.playerIds;
				const currentUserId = parseInt(sessionStorage.getItem('user_id'));
				if (ids.includes(currentUserId)) {
					navigateTo(`/pong/${match.id}`)
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
