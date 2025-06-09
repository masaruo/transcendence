import Fetch from "@/classes/JsonFetch";
import AbstractView from "./AbstractView";
import Pong from "@/game/Pong";
import { PATH } from "@/services/constants";

export default class PongView extends AbstractView {
	constructor (params: Record<string, string>){
		super(params);
		this.setTitle("Pong");
	}
	async getBody(): Promise<string> {
		const parent_path = location.pathname.replace(/\/pong\/.*$/, '');
		return `
			<style>
  			body {
    			background-color: #ecedd6;
  			}
				.custom-btn {
			    background-color: #0b1a5b;
			    color: white;
			    border: 2px solid #ecedd6;
			  }
				.teams-info{
					display: flex;
					justify-content: space-between;
					gap: 6rem;
					margin-top: 1rem;
				}
				.team-info{
					flex: 1;
					padding: 1rem;
					border-radius: 10px;
					background-color: #f9f9f9;
					width: 400px;
				}
				.team1{
					border: 1px solid #2d80f3;
				}
				.team2{
					border: 1px solid #ef3d2d;
				}
				.color-box {
					display: inline-block;
					width: 16px;
					height: 16px;
					border-radius: 3px;
					margin-right: 8px;
					vertical-align: middle;
				}
				.match-state-container {
					font-weight: bold;
				}
				.match-header {
					display: flex;
					justify-content: center;
					gap: 2rem;
				}
				.score-display {
					display: flex;
					justify-content: center;
					align-items: center;
					gap: 1rem;
				}
			</style>
			<div id='match-starting' class="alert alert-success" role="alert">
			  <h4>Your match is starting in 5 secs...</h4>
			</div>
			<div class="d-flex justify-content-center">
				<div id='match-data'></div>
			</div>
			<br>
			<div class="d-flex justify-content-center mb-3">
				<div class="alert alert-info" role="alert">
					<h5>Controls: Use '↑' and '↓' keys to move your paddle up and down</h5>
				</div>
			</div>
			<div class="container d-flex justify-content-center" height="95vh">
				<canvas id="canvas" width="900" height="600"></canvas>
			</div>
			<div class="d-flex justify-content-center">
					<div id='team-data'></div>
				</div>
			</div>
			<br>
			<div class="btn btn-link d-flex justify-content-center">
			<a href=${parent_path}>
					Back to the tournament page
			</a>
			<div>
		`
	}
	async loadScripts(): Promise<void> {
		const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
		if (!canvas)
			throw Error("Failed to find canvas element.")
		// canvas.tabIndex = 0;
		// canvas.focus();

		// const keyState: {[key: string]: boolean} = {};
		// const keyup = (e: KeyboardEvent) => {keyState[e.key] = false;};
		// const keydown = (e: KeyboardEvent) => {keyState[e.key] = true;};

		// canvas.addEventListener("keydown", keydown);
		// canvas.addEventListener("keyup", keyup);
		// canvas.addEventListener("blur", ()=> {
		// 	canvas.focus();
		// })

		const pong = new Pong(canvas, Number(this.params.pong_id));

		const starting_notice = document.getElementById('match-starting');
		if (!starting_notice) {
			throw Error("Failed to find 'match-starting' element.");
		}

		let timeoutID = setTimeout(() => {
			starting_notice.classList.add('d-none');
			pong.start();
			timeoutID = null;
		}, 5 * 1000);
	}
}
