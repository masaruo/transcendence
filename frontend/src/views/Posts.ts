import AbstractView from "./AbstractView";


export default class extends AbstractView {
	constructor (params: string) {
		super(params);
		this.setTitle("Posts");
	}

	async getHtml(): Promise<string> {
		return `
		<h1>Welcome back, post</h1>
		<p>
		you are viewing posts
		</p>
		`;
	}
}
