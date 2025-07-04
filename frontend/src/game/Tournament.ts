import { navigateTo } from "@/services/router";
import { WS_PATH } from "@/services/constants";

export default class Tournament {
	private tournamentId: string;
	private socket: WebSocket | null = null;

	constructor(tournamentId:string) {
		this.tournamentId = tournamentId;
	}

	connect(): void {
		const token = sessionStorage.getItem('access');
		this.socket = new WebSocket(`${WS_PATH}/ws/tournament/${this.tournamentId}/?token=${token}`);

		this.socket.onopen = () => {}

		this.socket.onmessage = (e) => {
			const data = JSON.parse(e.data);
			if (data.type === 'match_start') {
				const match = data.match;
				const ids = match.playerIds;
				const currentUserId = parseInt(sessionStorage.getItem('user_id'));
				if (ids.includes(currentUserId)) {
					sessionStorage.setItem('navigatingToNextMatch', 'true');
					navigateTo(`/tournament/${this.tournamentId}/pong/${match.id}`)
				}
			}
			// TODO: Handle 'tournament_update' event. Uncomment and implement this branch when tournament updates need to be processed.
			// else if (data.type === 'tournament_update') {
			// 	// console.log("[DEBUG] Tournament update received:", data);
			// }
		}

		this.socket.onerror = (error) => {
			console.error("[DEBUG] WebSocket error:", error);
		}
	}
}
