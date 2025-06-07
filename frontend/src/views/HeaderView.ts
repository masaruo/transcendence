export default class HeaderView {
	static getHeader(): string {
		const isAuth: boolean = sessionStorage.getItem("is_authenticated") === "true";
		return `
			<style>
				.navbar {
         font-family: "Onest", sans-serif;
         font-optical-sizing: auto;
         font-style: normal;
				}
				.custom-link.link-light:hover,
				.custom-link.link-light:focus {
					color: #000000;
				}
			</style>
			<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
				<div class="container-fluid">
					<button class="navbar-toggler" type="button" data-bs-toggle="collapse"
						data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false"
					>
      			<span class="navbar-toggler-icon"></span>
    			</button>
					<div class="collapse navbar-collapse" id="navbarNav">
						<ul class="navbar-nav me-auto mb-2 mb-lg-0">
							${this.getNavItems(isAuth)}
						</ul>
						${isAuth ?
							`
								<div class="btn btn-outline-light">
		              <a href="/logout" 
										class="link-light link-offset-2 link-underline-opacity-25
										custom-link">
									Log out
		              </a>
		            </div>
							` : ""}
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
