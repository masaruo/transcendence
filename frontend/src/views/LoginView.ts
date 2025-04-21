import AbstractView from "./AbstractView";
import { handleLoginFormSubmission } from "../services/login";
import { navigateTo } from "../services/router";

export default class LoginView extends AbstractView {
	constructor (params: string) {
		super(params);
		this.setTitle("Login");
	}

	async getBody(): Promise<string> {
		return `
			<form id="loginForm">
				<div class="mb-3">
					<label for="exampleInputEmail1" class="form-label">Email address</label>
					<input type="email" class="form-control" id="login-email" aria-describedby="emailHelp">
				</div>
				<div class="mb-3">
					<label for="exampleInputPassword1" class="form-label">Password</label>
					<input type="password" class="form-control" id="login-password">
				</div>
					<button type="submit" class="btn btn-primary">Submit</button>
			</form>
		`
	}

    async loadScripts(): Promise<void> {
		const isAuth: boolean = window.sessionStorage.getItem("is_authenticated") === 'true';
		if (isAuth) {
			navigateTo('/');
		}

        const form = document.getElementById("loginForm") as HTMLFormElement;
        if (form) {
            await handleLoginFormSubmission(form);
        } else {
            console.error("Login form not found in DOM");
        }
    }
}
