import AbstractView from "./AbstractView";

export default class IndexView extends AbstractView {
	constructor (params: Record<string, string>) {
		super(params);
		this.setTitle("Index");
	}

	async getBody(): Promise<string> {
		return `
			<style>
				.my-container{
					height: 95vh;
					width: 100%;
					background-image: url('/images/index.jpg');
					background-size: cover;
					background-position: center;
					font-family: "Bodoni Moda", serif;
     			font-optical-sizing: auto;
     			font-weight: 900;
     			font-style: normal;
					color: #19254f;
				}
				.welcome-msg{
					font-size: 6rem;
				}
			</style>

			<div class="container-fluid my-container">
					<h1 class="welcome-msg">Ready to Pong?</h1>
					<h3>Click the "Login" and let the battle begin.</h3>
			</div>
		`;
	}

	async loadScripts(): Promise<void> {


	}
}
