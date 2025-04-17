import AbstructView from "./AbstractView"
import Fetch from "../classes/JsonFetch";

export default class UserView extends AbstructView {
	constructor (params: string) {
		super(params);
		this.setTitle("User");
	}

	async getBody(): Promise<string> {
		return `
			<div id="me"></div>
		`
	}

	async loadScripts(): Promise<void> {
		try {
			const mydata = document.getElementById('me');
			if (!mydata) {
				throw Error("mydata tag not found");
			}
			const fetcher = new Fetch("http://localhost:8000/api/user/me/");
			const res = await fetcher.fetch_with_auth();
			const me = await res.json();
			mydata.innerHTML = `
				<div>MyID: ${me.id}</div>
				<div>My nickname: ${me.nickname}</div>
				<div>My email: ${me.email}</div>
				<img src="${me.avatar}" alt="user-image">
			`;
		} catch (error) {
			throw error;

		}
	}
}
