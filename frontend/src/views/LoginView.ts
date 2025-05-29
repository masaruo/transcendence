import AbstractView from "./AbstractView";
import { navigateTo } from "../services/router";
import Auth from "@/services/Auth";

export default class LoginView extends AbstractView {
	constructor (params: Record<string, string>) {
		super(params);
		this.setTitle("Login");
	}

	async getBody(): Promise<string> {
		return `
		<style>
			.left-side {
				background-image: url('/images/login-pingpong.jpg');
				background-size: cover;
				background-position: center;
				position: relative;
				height: 85vh;
  			}
			.right-side {
				display: flex;
				justify-content: center;
				align-items: center;
				height: 85vh;
				background-color: #d4e0d5;
			}
		</style>

		<div class="container-fluid">
			<div class="row">
				<div class="col-md-6 left-side">
				</div>
				<div class="col-md-6 right-side ">
					<form id="loginForm">
						<div class="row g-5 align-items-center mb-3">
  						<div class="col-4">
								<label for="exampleInputEmail1" class="form-label">Email</label>
							</div>
							<div class="col-8">
								<input type="email" class="form-control" id="login-email" aria-describedby="emailHelp">
							</div>
						</div>
						<div class="row g-5 align-items-center mb-3">
  						<div class="col-4">
								<label for="exampleInputPassword1" class="form-label">Password</label>
							</div>
							<div class="col-8">
								<input type="password" class="form-control" id="login-password">
							</div>
							<button type="submit" class="btn btn-success">Submit</button>
					</form>
				</div>
			</div>
		</div>
		`
	}

    async loadScripts(): Promise<void> {
		const isAuth: boolean = window.sessionStorage.getItem("is_authenticated") === 'true';
		if (isAuth) {
			navigateTo('/');
		}

        const form = document.getElementById("loginForm") as HTMLFormElement;
        if (form) {
			form.addEventListener('submit', async (e) => {
				const email = (document.getElementById('login-email') as HTMLInputElement).value;
				const password = (document.getElementById('login-password') as HTMLInputElement).value;
				e.preventDefault();

				const auth = Auth.getInstance();
				await auth.login(email, password);
				navigateTo('/');
			})
        } else {
            console.error("Login form not found in DOM");
        }
    }
}
