export default class HeaderView {
	static getHeader(): string {
		const isAuth: boolean = sessionStorage.getItem("is_authenticated") === "true";
		return `
			<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
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
				const user_id = sessionStorage.getItem("user_id");
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
				<a class="nav-link active nav__link" aria-current="page" href="/user/${user_id}/matches" data-link>My Matches</a>
				</li>
				<li class="nav-item">
				<a class="nav-link active nav__link" aria-current="page" href="/ai-battle" data-link>AI-Battle</a>
				</li>
				<li class="nav-item ml-auto">
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
