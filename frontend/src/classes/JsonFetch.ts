export default class Fetch {
	private url: string;
	private method: string;
	private headers: { [key: string]: string } = {};
	private body?: string;

	constructor(url: string, method: string = "GET") {
		this.url = url;
		this.method = method;
		this.headers["Content-Type"] = "application/json";
		this.headers["Accept"] = "application/json";
	}

	add_method(method: string): void {
		this.method = method;
	}

	add_header(key:string, value:string): void {
		this.headers[key] = value;
	}

	delete_header(key:string): void {
		delete this.headers[key];
	}

	replace_header(key: string, value: string): void {
		this.delete_header(key);
		this.add_header(key, value);
	}

	add_body(body: object): void {
		this.body = JSON.stringify(body);
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
			if (!res.ok) {
				throw new Error(`HttpError ${res.status}`);
			}
			return await res.json();
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
