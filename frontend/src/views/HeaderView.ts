export default class HeaderView {
	static getHeader(): string {
		const isAuth: boolean = sessionStorage.getItem("is_authenticated") === "true";

		return `
			<style>
				.custom-navbar {
					background-color: #3f392b !important;
				}
			</style>

			<nav class="navbar navbar-expand-sm navbar-expand-lg bg-dark custom-navbar" data-bs-theme="dark">
				<div class="container-fluid">
					<div class="collapse navbar-collapse" id="navbarNav">
						<ul class="navbar-nav nav-item-color">
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
				<a class="nav-link active nav__link" aria-current="page" href="/tournament" data-link>Tournaments</a>
				</li>
				<li class="nav-item">
					<a class="nav-link active nav__link" aria-current="page" href="/logout" data-link>Logout</a>
				</li>
			`
		} else {
			return `
				<li class="nav-item">
					<a class="nav-link active nav__link" aria-current="page" href="/login" data-link>Login</a>
				</li>
				<li class="nav-item">
					<a class="nav-link active nav__link" aria-current="page" href="/user/register" data-link>Sign Up</a>
				</li>
			`
		}
	}
}
