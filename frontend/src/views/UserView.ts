import AbstructView from "./AbstractView"

export default class UserView extends AbstructView {
	constructor (params: string) {
		super(params);
		this.setTitle("User");
	}

	async getBody(): Promise<string> {

	}

	async loadScripts(): Promise<void> {

	}
}
