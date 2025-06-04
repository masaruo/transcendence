import AbstractView from "./AbstractView";
import Fetch from "../classes/JsonFetch";
import { navigateTo } from "../services/router";
import { PATH } from "../services/constants";
import { finished } from "stream";

export default class TournamentListView extends AbstractView {
	constructor (params: Record<string, string>) {
		super(params);
		this.setTitle("Tournaments List");
	}
	async getBody(): Promise<string> {
		return `
		<style>
			.title {
				font-family: "Bodoni Moda", serif;
	      font-optical-sizing: auto;
	      font-weight: 700;
	      font-style: normal;
				color: #20245b;
				display: flex;
				justify-content: center;
			}
			.card {
				width: 20rem;
				background-color: #ffffff;
				color: #4f4b46;
				margin: 30px;
			}
			.tournament-grid{
				display: flex;
				flex-wrap: wrap;
				justify-content: center;
			}
			.my-container {
				background-color:#8fb1ec;
			}
			.my-label {
				font-weight: bold;
				color: #20245b;
			}
			.card-row {
				margin-bottom: 10px;
			}
		</style>

		<div class="container-fluid my-container p-lg-5">
			<button id="create-tournament" class="btn btn-primary btn-lg">Create New Tournament</button>
			<hr>
			<h1 class="title">List of current tournaments</h1>
			<div id="tournaments-list" class="tournament-grid">
			</div>
		</div>
		`
	}
	async loadScripts(): Promise<void> {
		const tournamentCreateBtn = document.getElementById('create-tournament');
		const tournamentsList = document.getElementById('tournaments-list');
		const fetcher = new Fetch(`${PATH}/api/tournament`);
		const tournaments = await fetcher.fetch_with_auth();

		tournamentCreateBtn?.addEventListener('click', async (e) => {
			navigateTo('/tournament/create');
		})

		tournaments.forEach(tournament => {
		  const tournamentItem = document.createElement('div');
		  tournamentItem.classList.add('tournament-card');

		  // プレイヤーリストを生成
		  const playersHTML = tournament.players.map(player =>
			`<div class="player-item">
			  <img src="${player.avatar}" alt="${player.nickname}" width="50" height="50" class="rounded-circle" style="object-fit: cover; margin: 10px;">
			  <span>${player.nickname}</span>
			 </div>`
		  ).join('');

		  // 日付をフォーマット
		  const createdDate = new Date(tournament.created_at).toLocaleDateString('ja-JP');

		  tournamentItem.innerHTML = `
			<div class="card">
			  <div class="card-header">
					<h5>Tournament #${tournament.id}</h5>
			  </div>
			  <div class="card-body">
					<div class="card-row">
						<span class="my-label"> ◉ create date: </span>
						<span>${createdDate}</span>
					</div>
					<div class="card-row">
						<span class="my-label"> ◉ match type: </span>
						<span>${tournament.match_type === 1 ? 'Single' : 'Double'}</span>
					</div>
					<div class="card-row">
						<span class="my-label"> ◉ player size: </span>
						<span>${tournament.match_size}</span>
					</div>
					<div class="players-container">
					<span class="my-label"> ◉ players :</span>
					  ${playersHTML}
					</div>
					<div class="d-grid gap-2">
						${tournament.status == 1 ?
							`<button class="join-tournament-btn btn btn-primary" data-tournament-id="${tournament.id}" style="margin: 6px;">JOIN</button>` :
							`<button class="join-tournament-btn btn btn-outline-primary" data-tournament-id="${tournament.id}" style="margin: 5px;">Show Results</button>`}
					</div>
			  </div>
			</div>
		  `;
		  tournamentsList?.appendChild(tournamentItem);
		});

		document.querySelectorAll(".join-tournament-btn").forEach(button => {
			button.addEventListener('click', async (event) => {
				const tournament_id = (event.target as HTMLElement).getAttribute('data-tournament-id');
				try {
					const fetcher = new Fetch(`${PATH}/api/tournament/${tournament_id}/add_player/`, "POST");
					const response = await fetcher.fetch_with_auth()
					// console.log(response)
					// window.location.reload();
					navigateTo(`/tournament/${tournament_id}`)
				} catch (error) {
					console.error("failed to join a tournament", error);
				}
			})
		})
	  }
}
