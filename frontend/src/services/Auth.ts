import Fetch from "@/classes/JsonFetch";
import { PATH, REFRESH_INTERVAL_MINS } from "@/services/constants";
import { navigateTo } from "./router";
import { StatusManager } from "./StatusManager";

export default class Auth {
	private static instance: Auth;
	private static status_manager: StatusManager = new StatusManager();
	private access_token: string;
	private refresh_token: string;

	static getInstance(): Auth {
		if (!Auth.instance) {
			Auth.instance = new Auth();
		}
		return Auth.instance;
	}

	static removeInstance(): void {
		if (!Auth.instance) {
			return ;
		}
		Auth.status_manager.disconnect();
		Auth.instance = null;
	}

	async login(email:string, password:string): Promise<void> {
		try {
			const fetcher = new Fetch(`${PATH}/api/token/`, 'POST');
			fetcher.add_body({'email': email, 'password': password});
			const res = await fetcher.fetch_without_auth();
			if (!res) {
				this.failedLogin();
				return;
			}
			this.access_token = res.access;
			this.refresh_token = res.refresh;
			await this.updateSessionStorage();
			Auth.status_manager.connect();
			this.startAutoRefresh(REFRESH_INTERVAL_MINS);
		} catch {
			this.failedLogin();
		}
	}

	async startAutoRefresh(interval_in_min: number): Promise<void> {
		setTimeout(() => {
			this.refreshAccessToken();
		}, interval_in_min * 60 * 1000);
	}

	async refreshAccessToken(): Promise<void> {
		const refresh_token = sessionStorage.getItem('refresh');
		if (!refresh_token) {
			this.failedLogin();
			return;
		}

		const fetcher = new Fetch(`${PATH}/api/token/refresh/`, 'POST');
		fetcher.add_body({'refresh': refresh_token});
		const res = await fetcher.fetch_without_auth();
		if (!res) {
			this.failedLogin();
			return;
		}
		this.access_token = res.access;
		await this.updateSessionStorage();
		this.startAutoRefresh(REFRESH_INTERVAL_MINS);
	}

	private async updateSessionStorage(): Promise<void> {
		sessionStorage.clear();
		sessionStorage.setItem('access', this.access_token);
		sessionStorage.setItem('refresh', this.refresh_token);
		sessionStorage.setItem('is_authenticated', 'true');
		const fetcher = new Fetch(`${PATH}/api/user/me/`);
		const res_in_json = await fetcher.fetch_with_auth();
		if (!res_in_json) {
			throw new Error("User ID failed to fetch.");
		}
		sessionStorage.setItem('user_id', res_in_json.id);
	}

	private failedLogin(): void {
		sessionStorage.clear();
		Auth.status_manager.disconnect();
		window.alert('Login Failed.');
		navigateTo('/login');
	}

}
