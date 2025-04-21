import AbstractView from "./AbstractView";

export default class IndexView extends AbstractView {
	constructor (params: string) {
		super(params);
		this.setTitle("Index");
	}

	async getBody(): Promise<string> {
		return `
			<h1>PONG. PONG. Pong</h1>
		`;
	}

	async loadScripts(): Promise<void> {


	}
}
