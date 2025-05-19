import TournamentDetailView from "@/views/TournamentDetailView";
import FriendsView from "../views/FriendsView";
import IndexView from "../views/IndexView";
import LoginView from "../views/LoginView";
import PongView from "../views/PongView";
import TournamentCreateView from "../views/TournamentCreateView";
import TournamentListView from "../views/TournamentListView";
import UserUpdataView from "../views/UserUpdateView";
import UserView from "../views/UserView";

const pathToRegex = (path: string) => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

const getParams = (match) => {
    const values = match.result.slice(1);
    const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(result => result[1]);

    return Object.fromEntries(keys.map((key, i) => {
        return [key, values[i]];
    }));
};

export const navigateTo = (url: string) => {
	history.pushState(null, "", url);
	router();
};

export const router = async() => {
	const routes = [
		{path: "/", view: IndexView},
		{path: "/user/me", view: UserView},
		{path: "/user/me/update", view: UserUpdataView},
		{path: "/login", view: LoginView },
		{path: "/friends", view: FriendsView},
		{path: "/pong/:id", view: PongView},
		{path: "/tournament", view: TournamentListView},
		{path: "/tournament/create", view: TournamentCreateView},
		{path: "/tournament/:id", view: TournamentDetailView},
		// {path: "/posts", view: Posts },
		// {path: "/posts/:id", view: PostView },
		// {path: "/settings", view: Settings }
	];

	const potentialMatches = routes.map(route => {
		return {
			route: route,
			result: location.pathname.match(pathToRegex(route.path))
		}
	})

	let match = potentialMatches.find(potentialMatch => potentialMatch.result != null);

	if (!match) {
		match = {
			route: routes[0],
			result: [location.pathname]
		};
	}

	const view = new match.route.view(getParams(match));

	const body = document.getElementById("body");
	const header = document.getElementById('header');
	if (!body || !header) throw new Error("element app not found");
	header.innerHTML = await view.getHeader();
	body.innerHTML = await view.getBody();

	await view.loadScripts();
};
