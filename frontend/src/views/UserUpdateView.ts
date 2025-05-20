import AbstructView from "./AbstractView";

export default class UserUpdateView extends AbstructView {
	constructor (params: Record<string, string>) {
		super(params);
		this.setTitle("User Update");
	}

	async getBody(): Promise<string> {
		return `

		`
	}

	async loadScripts(): Promise<void> {

	}
}
