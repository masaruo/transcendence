import AbstractView from "./AbstractView";


export default class extends AbstractView {
	constructor (params: string) {
		super(params);
		this.setTitle("Posts Views");
	}

	async getHtml(): Promise<string> {
		console.log(this.params.id);
		return `
		<h1>Welcome back, post</h1>
		<p>
		you are viewing posts
		</p>
		`;
	}
}
