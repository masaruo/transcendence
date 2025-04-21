import AbstructView from "./AbstractView"

export default class UserUpdataView extends AbstructView {
	constructor (params: string) {
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
