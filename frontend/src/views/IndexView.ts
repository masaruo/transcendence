import AbstractView from "./AbstractView";


export default class Dashboard extends AbstractView {
	constructor (params: string) {
		super(params);
		this.setTitle("Index");
	}

	async getHtml(): Promise<string> {
		return `
	<nav class="navbar navbar-expand-lg bg-body-tertiary">
		<div class="container-fluid">
		  <div class="collapse navbar-collapse" id="navbarNav">
			<ul class="navbar-nav">
			  <li class="nav-item">
				<a class="nav-link active nav__link" aria-current="page" href="/login" data-link>Login</a>
			  </li>
			  <li class="nav-item">
				<a class="nav-link active nav__link" aria-current="page" href="/friends" data-link>Friends</a>
			  </li>
			  <!-- <li class="nav-item">
				<a class="nav-link" href="#">Features</a>
			  </li>
			  <li class="nav-item">
				<a class="nav-link" href="#">Pricing</a>
			  </li>
			  <li class="nav-item">
				<a class="nav-link disabled">Disabled</a>
			  </li> -->
			</ul>
		  </div>
	</nav>
		`;
	}
}
