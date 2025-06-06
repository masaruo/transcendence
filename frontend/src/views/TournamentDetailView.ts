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
  		.my-container {
  			background-image: url('/images/pongview.jpg');
  			background-size: cover;
  			background-position: center;
        display: flex;
				justify-content: flex-start
        align-items: center;
				text-align: center;
        flex-direction: column;
  		}
			.status-container {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
			}
  		.my-container h1 {
  			font-family: "Bodoni Moda", serif;
        font-optical-sizing: auto;
        font-weight: 700;
        font-style: normal;
        color: #ffffff;
  		}
  		.my-container h4 {
        color: #ffffff;
  		}
			.team-info {
				padding: 1rem;
			}
			.team-info.winner {
				border: 5px solid #f45d3b;
				border-radius: 10px;
				background-image: url('/images/winner.jpg');
				background-size: cover;
				background-position: center;
			}
			.team-info.winner h3 {
				color: #f45d3b;
				font-weight: bold;
			}
			.team-info.loser {
				border: 5px solid #0d436a;
				border-radius: 10px;
				background-image: url('/images/loser.jpg');
				background-size: cover;
				background-position: center;
			}
			.team-info.loser h3{
				color:  #0d436a;
				font-weight: bold;
			}
			.team-info.incomplete {
				border: 5px solid #cf2701;
				color: #cf2701;
				border-radius: 10px;
				background-size: cover;
				background-position: center;
			}
			.score-display {
				font-weight: bold;
				font-size: 1.2em;
				margin-bottom: 10px;
			}
			.player-item {
				display: flex;
				align-items: center;
				justify-content: center;
				margin-bottom: 5px;
			}
			.match-list	{
				width: 100%;
				display: flex;
				justify-content: center;
				flex-direction: column;
				align-items: center;
			}
			.card {
				width: 900px;
			}
		</style>

		<div class="container-fluid my-container p-lg-5">
			<h1>Tounament: ${this.params.tournament_id}</h1>
			<div id='match-div' class="match-list"></div>
		</div>
		`
	}
	async loadScripts(): Promise<void> {
		const fetcher = new Fetch(`${PATH}/api/tournament/${this.params.tournament_id}/status/`)
		const matches_div = document.getElementById('match-div');

		const matches_in_json = await fetcher.fetch_with_auth();
		if (!matches_in_json) {
			console.error("no matches found in the tournament");
		} else {
			if (matches_in_json.status === 1) {
				const tournament = new Tournament(this.params.tournament_id);
				tournament.connect();
			}
			const tournament_elem = `
				<div class="status-container">
					<h4>Status :${this.getMatchStatusText(matches_in_json.status)}</h4>
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
				<h3 class="card-title">${match.match_round == 3 ? "Final Match" : "Semi-Final Match"} #${match.id}</h3>
				<!-- Match Status -->
				<div class="mt-2 text-center">
					<small class="text-muted">Status: ${this.getMatchStatusText(match.status)}</small>
				</div>
				<div class="row">
					<!-- Team 1 -->
					<div class="col-md-5">
						<div class="team-info ${match.status == 3 ? (isTeam1Winner ? 'winner' : 'loser') : 'incomplete'}">
							<h3 class="team-status">${match.status == 3 ? (isTeam1Winner ? 'WIN' : 'LOSE') : 'INCOMPLETED'}</h3>
							<div class="score-display">Score: ${match.team1.score}</div>
							<div class="player-item">
								<span>Player: ${match.team1.player1}</span>
							</div>
							${match.team1.player2 ? `
							<div class="player-item">
								<span>Player: ${match.team1.player2}</span>
							</div>
							` : ''}
						</div>
					</div>

					<!-- VS -->
					<div class="col-md-2 d-flex align-items-center justify-content-center">
						<h2>VS</h2>
					</div>

					<!-- Team 2 -->
					<div class="col-md-5">
						<div class="team-info ${match.status == 3 ?
							(isTeam2Winner ? 'winner' : 'loser') : 'incomplete'}">
							<h3 class="team-status">${match.status == 3 ?
								(isTeam2Winner ? 'WIN' : 'LOSE') : 'INCOMPLETED'}</h3>
							<div class="score-display">Score: ${match.team2.score}</div>
							<div class="player-item">
								<span>Player: ${match.team2.player1}</span>
							</div>
							${match.team2.player2 ? `
							<div class="player-item">
								<span>Player: ${match.team2.player2}</span>
							</div>
							` : ''}
						</div>
					</div>
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
