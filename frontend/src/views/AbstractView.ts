export default class {
	protected params: string;
	constructor(params: string) {
		this.params = params;
	}

	setTitle(title: string): void {
		document.title = title;
	}

	async getHtml() {
		return "";
	}
}
