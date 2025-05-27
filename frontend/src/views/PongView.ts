import AbstractView from "./AbstractView";
// import { Pong } from "../pong/pong";
// import Pong from "../game/Pong";
import Pong from "@/game/Pong";
// import Tournament from "@/game/Tournament";

export default class PongView extends AbstractView {
	constructor (params: Record<string, string>){
		super(params);
		this.setTitle("Pong");
	}
	async getBody(): Promise<string> {
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
			</style>

			<br>
			<div class="container d-flex justify-content-center" height="85vh">
				<canvas id="canvas" width="900" height="600"></canvas>
			</div>
				<div class="d-flex justify-content-center">
					<br>
					<div id='match-data'></div>
					<div id='score-data'></div>
				</div>
			</div>
			<br>
		`
	}
	async loadScripts(): Promise<void> {
		const keyState: {[key: string]: boolean} = {};

		document.addEventListener("keydown", (e) => {keyState[e.key] = true;})
		document.addEventListener("keyup", (e) => {keyState[e.key] = false})

		const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
		if (!canvas)
			throw Error("Failed to find canvas element.")
		const pong = new Pong(canvas, Number(this.params.pong_id));
		pong.start();
	}
}
