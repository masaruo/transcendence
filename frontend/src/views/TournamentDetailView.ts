import AbstractView from '@views/AbstractView';
import Tournament from '@/game/Tournament';

export default class TournamentDetailView extends AbstractView {
	constructor (params: Record<string, string>) {
		super(params);
		this.setTitle("Tournament Details");
	}
	async getBody(): Promise<string> {
		  console.log("Params:", this.params); // パラメータ確認
		return `
		<style>
		  .match-result {
		    display: flex;
		    justify-content: space-between; /* スペースを均等に */
		    align-items: center; /* 縦方向の中央揃え */
		    gap: 2rem; /* 各ブロックの間隔を調整（任意） */
		  }

		  .team-info {
		    flex: 1; /* 各ブロックが同じ幅を持つように */
		  }

		  .score {
		    flex: 0 0 auto; /* 固定サイズにしたい場合 */
		    text-align: center;
		    font-size: 1.5rem;
		    font-weight: bold;
		  }
		</style>
		<div class="container-fluid p-lg-5">
			<h1>Tournament #${this.params.tournament_id}</h1>
			<hr>
			<h3>match #10</h3>
			<div class="match-result">
			  <div class="team-info">
			    <p>WON</p>
					<div class="player-item">
			 	  	<img src="/images/friends.jpg" alt="your name" width="50" height="50" class="rounded-circle" style="object-fit: cover; margin: 10px;">
						<span>your name</span>
					</div>
					<div class="player-item">
			    	<img src="/images/friends.jpg" alt="member name" width="50" height="50" class="rounded-circle" style="object-fit: cover; margin: 10px;">
						<span>member name</span>
					</div>
			  </div>

			  <div class="score">
			    <h3>1 - 0</h3>
			  </div>

			  <div class="team-info">
			    <p>LOSE</p>
					<div class="player-item">
			 	  	<img src="/images/friends.jpg" alt="your name" width="50" height="50" class="rounded-circle" style="object-fit: cover; margin: 10px;">
						<span>member name</span>
					</div>
					<div class="player-item">
			    	<img src="/images/friends.jpg" alt="member name" width="50" height="50" class="rounded-circle" style="object-fit: cover; margin: 10px;">
						<span>member name</span>
					</div>
			  </div>
			</div>

			<h3>match #11</h3>
			<div class="match-result">
			  <div class="team-info">
			    <p>WON</p>
					<div class="player-item">
			 	  	<img src="/images/friends.jpg" alt="your name" width="50" height="50" class="rounded-circle" style="object-fit: cover; margin: 10px;">
						<span>your name</span>
					</div>
					<div class="player-item">
			    	<img src="/images/friends.jpg" alt="member name" width="50" height="50" class="rounded-circle" style="object-fit: cover; margin: 10px;">
						<span>member name</span>
					</div>
			  </div>

			  <div class="score">
			    <h3>1 - 0</h3>
			  </div>

			  <div class="team-info">
			    <p>LOSE</p>
					<div class="player-item">
			 	  	<img src="/images/friends.jpg" alt="your name" width="50" height="50" class="rounded-circle" style="object-fit: cover; margin: 10px;">
						<span>member name</span>
					</div>
					<div class="player-item">
			    	<img src="/images/friends.jpg" alt="member name" width="50" height="50" class="rounded-circle" style="object-fit: cover; margin: 10px;">
						<span>member name</span>
					</div>
			  </div>
			</div>
		</div>
		`
	}
	async loadScripts(): Promise<void> {
		const tournament = new Tournament(this.params.tournament_id);
		tournament.connect();
	}
}
