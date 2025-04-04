import AbstractView from "./AbstractView";


export default class extends AbstractView {
	constructor (params: string) {
		super(params);
		this.setTitle("setting");
	}

	async getHtml(): Promise<string> {
		return `
		<h1>Welcome back, setting</h1>
		<p>
		configs
		</p>
		`;
	}
}
