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

	add_header(key:string, value:string): void {
		this.headers[key] = value;
	}

	async fetch_without_auth(data?: any): Promise<any> {
		try {
			const requestOptions: RequestInit = {
				method: this.method,
				headers: this.headers,
			}

			if (this.body) {
				requestOptions.body = this.body;
			}

			if (data) {
				requestOptions.body = JSON.stringify(data);
				this.headers['Content-Type'] = 'application/json';
			}

			const res = await fetch(this.url, requestOptions);
			if (!res.ok) {
				throw new Error(`HttpError ${res.status}`);
			}
			return await res.json();
		} catch (error) {
			throw error;
		}
	}

	async fetch_with_auth(data?: any): Promise<any> {
		try {
			const token = sessionStorage.getItem('access');
			if (!token) {
				throw new Error("No auth token found.");
			}
			this.headers["Authorization"] = "Bearer " + token;
			return this.fetch_without_auth(data);
		} catch (error) {
			throw error;
		}
	}
}
