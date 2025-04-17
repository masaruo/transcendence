export default class HeaderView {
	static getHeader(): string {
		const isAuth: boolean = sessionStorage.getItem("is_authenticated") === "true";

		return `
			<nav class="navbar navbar-expand-sm bg-body-tertiary">
				<div class="container-fluid">
					<div class="collapse navbar-collapse" id="navbarNav">
						<ul class="navbar-nav">
							${this.getNavItems(isAuth)}
						</ul>
					</div>
				</div>
			</nav>
		`;
	}

	private static getNavItems(isAuth: boolean): string {
		if (isAuth) {
			return `
				<li class="nav-item">
					<a class="nav-link active nav__link" aria-current="page" href="/user" data-link>User</a>
				</li>
				<li class="nav-item">
					<a class="nav-link active nav__link" aria-current="page" href="/friends" data-link>Friends</a>
				</li>
				<li class="nav-item">
					<a class="nav-link active nav__link" aria-current="page" href="/game" data-link>One Time Local Play</a>
				</li>
				<li class="nav-item">
					<a class="nav-link active nav__link" aria-current="page" href="/tournament" data-link>Tournament</a>
				</li>
			`
		} else {
			return `
				<li class="nav-item">
					<a class="nav-link active nav__link" aria-current="page" href="/login" data-link>Login</a>
				</li>
				<li class="nav-item">
					<a class="nav-link active nav__link" aria-current="page" href="/user" data-link>Sign Up</a>
				</li>
			`
		}
	}
}
