import AbstractView from "./AbstractView";
import { Pong } from "../pong/pong";

export default class PongView extends AbstractView {
	constructor (params: string){
		super(params);
		this.setTitle("Pong");
	}
	async getHtml(): Promise<string> {
		return `
			<canvas id="canvas" width="600" height="600"></canvas>
			<br>
			<button id="join">Join</button>
			<button id="start">Start</button>
			<button id="end">End</button>
		`
	}
	async loadScripts(): Promise<void> {
		console.log("pongview activated")
		const keyState: {[key: string]: boolean} = {};

		document.addEventListener("keydown", (e) => {keyState[e.key] = true;})
		document.addEventListener("keyup", (e) => {keyState[e.key] = false})

		const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
		if (!canvas)
			throw Error("Failed to find canvas element.")
		const pong = new Pong(canvas);
		// pong.start();
	}
}
