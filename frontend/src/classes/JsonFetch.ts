export default class Fetch {
	private url: string;
	private method: string;
	private headers: { [key: string]: string };
	private body?: string;

	constructor(url: string, method: string = "GET", header?: {[key: string]: string}, body?: object) {
		this.url = url;
		this.method = method;
		this.headers = header || {};
		if (!this.headers["Content-Type"])
			this.headers["Content-Type"] = "application/json";
		if (!this.headers["Accept"])
			this.headers["Accept"] = "application/json";
		this.body = body ? JSON.stringify(body) : undefined;
	}

	async fetch_without_auth(): Promise<any> {
		try {
			const requestOptions: RequestInit = {
				method: this.method,
				headers: this.headers,
			}

			if (this.body) {
				requestOptions.body = this.body;
			}

			const res = await fetch(this.url, requestOptions);
			const res_in_json = await res.json();
			return res_in_json;
		} catch (error) {
			throw error;
		}
	}

	async fetch_with_auth(): Promise<any> {
		try {
			const token = sessionStorage.getItem('access');
			if (!token) {
				throw new Error("No auth token found.");
			}
			this.headers["Authorization"] = "Bearer " + token;
			return this.fetch_without_auth();
		} catch (error) {
			throw error;
		}
	}
}
