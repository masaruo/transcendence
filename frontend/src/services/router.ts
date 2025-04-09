import FriendsView from "../views/FriendsView";
import IndexView from "../views/IndexView";
import LoginView from "../views/LoginView";
import PongView from "../views/PongView";

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
		{path: "/login", view: LoginView },
		{path: "/friends", view: FriendsView},
		{path: "/pong", view: PongView},
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

	const app = document.getElementById("app");
	if (!app) throw new Error("element app not found");
	app.innerHTML = await view.getHtml();

	await view.loadScripts();
};
