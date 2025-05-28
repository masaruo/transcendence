import AbstractView from '@views/AbstractView';
import Tournament from '@/game/Tournament';
import Fetch from '@/classes/JsonFetch';
import { PATH } from "@/services/constants"

export default class TournamentDetailView extends AbstractView {
	constructor (params: Record<string, string>) {
		super(params);
		this.setTitle("Tournament Details");
	}
	async getBody(): Promise<string> {
		//   console.log("Params:", this.params); // パラメータ確認
		return `
		<style>
			.team-info.winner {
			border: 2px solid #28a745;
			background-color: #f8fff9;
		}

		.team-info.loser {
			border: 2px solid #dc3545;
			background-color: #fff8f8;
		}

		.score-display {
			font-weight: bold;
			font-size: 1.2em;
			margin-bottom: 10px;
		}

		.player-item {
			display: flex;
			align-items: center;
			margin-bottom: 5px;
		}
		</style>

		<h1>Tounament: ${this.params.tournament_id}</h1>
		<div id='match-div'></div>
		`
	}
	async loadScripts(): Promise<void> {
		const tournament = new Tournament(this.params.tournament_id);
		const matches_div = document.getElementById('match-div');
		//todo tournamentがすでに存在するかどうかを確認して、存在する場合は弾く処理
		tournament.connect();

		const fetcher = new Fetch(`${PATH}/api/tournament/${this.params.tournament_id}/status/`)
		const matches_in_json = await fetcher.fetch_with_auth();
		if (!matches_in_json) {
			console.error("no matches found in the tournament");
		} else {
			const tournament_elem = `
			<div>
			<p>Tournament Status:${this.getMatchStatusText(matches_in_json.status)}</p>
			</div>
			`
			matches_div.innerHTML = tournament_elem;
			matches_in_json.matches.forEach(match => {
				const match_elem = this.createMatchElement(match);
				matches_div!.appendChild(match_elem);
			});
		}
	}

	private createMatchElement(match: any): HTMLElement {
		const elem = document.createElement('div');
		elem.className = 'card mb-3';

		// 勝者チームの判定
		const isTeam1Winner = match.winner?.team_id === match.team1.id;
		const isTeam2Winner = match.winner?.team_id === match.team2.id;

		elem.innerHTML = `
			<div class="card-body">
				<h6 class="card-title">Round ${match.match_round} - Match ${match.id}</h6>
				<div class="row">
					<!-- Team 1 -->
					<div class="col-md-5">
						<div class="team-info ${isTeam1Winner ? 'winner' : 'loser'}">
							<p class="team-status">${isTeam1Winner ? 'WIN' : 'LOSE'}</p>
							<div class="score-display">Score: ${match.team1.score}</div>
							<div class="player-item">
								<img src="/images/friends.jpg" alt="${match.team1.players?.[0]?.nickname || 'Player 1'}"
									width="50" height="50" class="rounded-circle"
									style="object-fit: cover; margin: 10px;">
								<span>Player ${match.team1.player1} ${match.team1.players?.[0]?.nickname ? `(${match.team1.players[0].nickname})` : ''}</span>
							</div>
							${match.team1.player2 ? `
							<div class="player-item">
								<img src="/images/friends.jpg" alt="${match.team1.players?.[1]?.nickname || 'Player 2'}"
									width="50" height="50" class="rounded-circle"
									style="object-fit: cover; margin: 10px;">
								<span>Player ${match.team1.player2} ${match.team1.players?.[1]?.nickname ? `(${match.team1.players[1].nickname})` : ''}</span>
							</div>
							` : ''}
						</div>
					</div>

					<!-- VS -->
					<div class="col-md-2 d-flex align-items-center justify-content-center">
						<h4>VS</h4>
					</div>

					<!-- Team 2 -->
					<div class="col-md-5">
						<div class="team-info ${isTeam2Winner ? 'winner' : 'loser'}">
							<p class="team-status">${isTeam2Winner ? 'WIN' : 'LOSE'}</p>
							<div class="score-display">Score: ${match.team2.score}</div>
							<div class="player-item">
								<img src="/images/friends.jpg" alt="${match.team2.players?.[0]?.nickname || 'Player 1'}"
									width="50" height="50" class="rounded-circle"
									style="object-fit: cover; margin: 10px;">
								<span>Player ${match.team2.player1} ${match.team2.players?.[0]?.nickname ? `(${match.team2.players[0].nickname})` : ''}</span>
							</div>
							${match.team2.player2 ? `
							<div class="player-item">
								<img src="/images/friends.jpg" alt="${match.team2.players?.[1]?.nickname || 'Player 2'}"
									width="50" height="50" class="rounded-circle"
									style="object-fit: cover; margin: 10px;">
								<span>Player ${match.team2.player2} ${match.team2.players?.[1]?.nickname ? `(${match.team2.players[1].nickname})` : ''}</span>
							</div>
							` : ''}
						</div>
					</div>
				</div>

				<!-- Match Status -->
				<div class="mt-2 text-center">
					<small class="text-muted">Status: ${this.getMatchStatusText(match.status)}</small>
				</div>
			</div>
		`;

		return elem;
	}

	private getMatchStatusText(status: number): string {
		switch(status) {
			case 1: return 'Waiting';
			case 2: return 'In Progress';
			case 3: return 'Completed';
			default: return 'Unknown';
		}
	}
}
