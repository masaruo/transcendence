import HeaderView from "./HeaderView";

export default abstract class View {
	protected params: string;
	constructor(params: string) {
		this.params = params;
	}

	setTitle(title: string): void {
		document.title = title;
	}

	async getHeader(): Promise<string> {
		return HeaderView.getHeader();
	}

	async getBody(): Promise<string> {
		return "";
	}

	async loadScripts(): Promise<void> {

	}
}
