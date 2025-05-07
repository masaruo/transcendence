import AbstractView from "./AbstractView"
import Fetch from "../classes/JsonFetch"
import { navigateTo } from "../services/router";
import { PATH } from "../services/constants"

export default class TournamentView extends AbstractView {
	constructor (params: string) {
		super(params);
		this.setTitle("Tournaments");
	}
	async getBody(): Promise<string> {
		return `
		<button id="create-tournament">Create New Tournament</button>
		<h1>List of current tournaments</h1>
		<div id="tournaments-list"></div>
		`
	}
	async loadScripts(): Promise<void> {
		const tournamentCreateBtn = document.getElementById('create-tournament');
		const tournamentsList = document.getElementById('tournaments-list');
		const fetcher = new Fetch("http://localhost:8000/api/tournament");
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
			  <img src="${player.avatar}" alt="${player.nickname}" width="40" height="40">
			  <span>${player.nickname}</span>
			 </div>`
		  ).join('');

		  // 日付をフォーマット
		  const createdDate = new Date(tournament.created_at).toLocaleDateString('ja-JP');

		  tournamentItem.innerHTML = `
		  	<hr>
			<h3>トーナメント #${tournament.id}</h3>
			<p>作成日: ${createdDate}</p>
			<p>マッチタイプ: ${tournament.match_type === 1 ? 'シングル' : 'ダブル'}</p>
			<div class="players-container">
			  <h4>参加プレイヤー:</h4>
			  ${playersHTML}
			</div>
			<button class="join-tournament-btn" data-tournament-id="${tournament.id}">Join this tournament</button>
		  `;
		  tournamentsList?.appendChild(tournamentItem);
		});

		document.querySelectorAll(".join-tournament-btn").forEach(button => {
			button.addEventListener('click', async (event) => {
				const tournament_id = (event.target as HTMLElement).getAttribute('data-tournament-id');
				try {
					const fetcher = new Fetch(`${PATH}/api/tournament/${tournament_id}/add_player/`, "POST");
					const response = await fetcher.fetch_with_auth()
					console.log(response)
					window.location.reload();
				} catch (error) {
					console.error("failed to join a tournament", error);
				}
			})
		})
	  }
}
