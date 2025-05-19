import TournamentDetailView from "@/views/TournamentDetailView";
import FriendsView from "../views/FriendsView";
import IndexView from "../views/IndexView";
import LoginView from "../views/LoginView";
import PongView from "../views/PongView";
import TournamentCreateView from "../views/TournamentCreateView";
import TournamentListView from "../views/TournamentListView";
import UserUpdataView from "../views/UserUpdateView";
import UserView from "../views/UserView";
import UrlPattern from "url-pattern";

// const pathToRegex = (path: string) => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

// const getParams = (match) => {
//     const values = match.result.slice(1);
//     const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(result => result[1]);

//     return Object.fromEntries(keys.map((key, i) => {
//         return [key, values[i]];
//     }));
// };

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
		{path: "/pong/:pong_id", view: PongView},
		{path: "/tournament", view: TournamentListView},
		{path: "/tournament/create", view: TournamentCreateView},
		{path: "/tournament/:tournament_id", view: TournamentDetailView},
		// {path: "/posts", view: Posts },
		// {path: "/posts/:id", view: PostView },
		// {path: "/settings", view: Settings }
	];

	 // マッチング処理を明示的に行う
  const currentPath = location.pathname;
  console.log("Current path:", currentPath);

  let match = null;
  let params = {};

  // 各ルートを確認
  for (const route of routes) {
    const pattern = new UrlPattern(route.path, { segmentNameCharset: 'a-zA-Z0-9_' });
    const result = pattern.match(currentPath);

    console.log(`Testing ${route.path} against ${currentPath}:`, result);

    if (result) {
      match = { route, result };
      params = result;
      break;
    }
  }

  // マッチしなければデフォルトルート
  if (!match) {
    match = { route: routes[0], result: {} };
  }

  console.log("Final params:", params);

  // パラメータをビューに渡す
  const view = new match.route.view(params);
//   return view;

	// const potentialMatches = routes.map(route => {
	// 	return {
	// 		route: route,
	// 		pattern: new UrlPattern(route.path)
	// 	};
	// });

	// let match = potentialMatches.find(p => p.pattern.match(location.pathname));
	// let params: Record<string, string> = {}

	// if (match) {
	// 	const matchResult = match.pattern.match(location.pathname);
	// 	if (matchResult) {
	// 		params = matchResult as Record<string, string>
	// 	}
	// } else {
	// 	match = {
	// 		route: routes[0],
	// 		pattern: new UrlPattern(routes[0].path)
	// 	};
	// }

	// const view = new match.route.view(params);

	// const potentialMatches = routes.map(route => {
	// 	return {
	// 		route: route,
	// 		result: location.pathname.match(pathToRegex(route.path))
	// 	}
	// })

	// let match = potentialMatches.find(potentialMatch => potentialMatch.result != null);

	// if (!match) {
	// 	match = {
	// 		route: routes[0],
	// 		result: [location.pathname]
	// 	};
	// }

	// const view = new match.route.view(getParams(match));
	// const view = new match.route.view()

	const body = document.getElementById("body");
	const header = document.getElementById('header');
	if (!body || !header) throw new Error("element app not found");
	header.innerHTML = await view.getHeader();
	body.innerHTML = await view.getBody();

	await view.loadScripts();
};
