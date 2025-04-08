export default class JsonFetch {
	private url: string;
	private method: string;
	private body: object | null;

	constructor(url: string, method: string, body: object | null) {
		this.url = url;
		this.method = method;
		this.body = body;
	}

	async jsonFetch(): Promise<any> {
		try {
			const response = await fetch(this.url, {
				method: this.method,
				body: this.body ? JSON.stringify(this.body) : null,
				headers: { 'Content-Type': 'application/json' },
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			console.error('Fetch error:', error);
			throw error;
		}
	}
}
