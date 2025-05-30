import AbstractView from "./AbstractView"
import { navigateTo } from "../services/router";
import Auth from "@/services/Auth";

export default class LogoutView extends AbstractView {
	constructor (params: Record<string, string>) {
		super(params);
		this.setTitle("Logout");
	}
	async getBody(): Promise<string> {
		return `
		<h1>Logout</h1>
		`
	}
	async loadScripts(): Promise<void> {
		Auth.removeInstance();
		sessionStorage.clear()
		navigateTo('/');
	}
}
