import Fetch from "@/classes/JsonFetch";
import { PATH, REFRESH_INTERVAL_MINS } from "@/services/constants";
import { navigateTo } from "./router";

export default class Auth {
	private static instance: Auth | null;
	private access_token: string | null = null;
	private refresh_token: string | null = null;
	private refreshTimerId: NodeJS.Timeout | null = null;

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
			// sessionStorage.setItem('access', res.access);
			this.refresh_token = res.refresh;
			// sessionStorage.setItem('refresh', res.refresh);
			await this.updateSessionStorage();
			this.startAutoRefresh(REFRESH_INTERVAL_MINS);
		} catch {
			this.failedLogin();
		}
	}

	async startAutoRefresh(interval_in_min: number): Promise<void> {
		if (this.refreshTimerId !== null) {
			clearTimeout(this.refreshTimerId);
		}
		this.refreshTimerId = setTimeout(async () => {
			try {
				await this.refreshAccessToken();
				this.startAutoRefresh(interval_in_min);
			} catch(e) {
				console.error("Token refresh failed:", e);
				this.failedLogin();
			}
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
		try {
			const res = await fetcher.fetch_without_auth();
			this.access_token = res.access;
			await this.updateSessionStorage();
			this.startAutoRefresh(REFRESH_INTERVAL_MINS);
		} catch {
			this.failedLogin();
		}
	}

	private async updateSessionStorage(): Promise<void> {
		sessionStorage.clear();
		if (!this.access_token || !this.refresh_token) {
			this.failedLogin();
		}
		sessionStorage.setItem('access', this.access_token);
		sessionStorage.setItem('refresh', this.refresh_token);
		sessionStorage.setItem('is_authenticated', 'true');
		const fetcher = new Fetch(`${PATH}/api/user/me/`);
		try {
			const res_in_json = await fetcher.fetch_with_auth();
			sessionStorage.setItem('user_id', res_in_json.id);
		} catch {
			this.failedLogin();
		}
	}

	private failedLogin(): void {
		sessionStorage.clear();
		window.alert('Login Failed.');
		navigateTo('/login');
	}

}
