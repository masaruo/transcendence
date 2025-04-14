export default abstract class View {
	protected params: string;
	constructor(params: string) {
		this.params = params;
	}

	setTitle(title: string): void {
		document.title = title;
	}

	async getHtml(): Promise<string> {
		return "";
	}

	async loadScripts(): Promise<void> {

	}
}
