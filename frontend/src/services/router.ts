import TournamentDetailView from "@/views/TournamentDetailView";
import FriendsView from "../views/FriendsView";
import IndexView from "../views/IndexView";
import LoginView from "../views/LoginView";
import PongView from "../views/PongView";
import TournamentCreateView from "../views/TournamentCreateView";
import TournamentListView from "../views/TournamentListView";
import UserView from "../views/UserView";
import MatchHistoryView from "@/views/MatchHistoryView";
import UserRegisterView from "@/views/UserRegisterView";
import AIBattleView from "@/views/AIBattleView";
import UrlPattern from "url-pattern";
import LogoutView from "@/views/LogoutView";

export const navigateTo = (url: string) => {
	history.pushState(null, "", url);
	router();
};

export const router = async() => {
	const routes = [
		{path: "/", view: IndexView},
		{path: "/user", view: UserView},
		{path: "/user/register", view: UserRegisterView},
		{path: "/user/:user_id/matches", view: MatchHistoryView},
		{path: "/login", view: LoginView },
    {path: "/logout", view: LogoutView},
		{path: "/friends", view: FriendsView},
		{path: "/tournament", view: TournamentListView},
		{path: "/tournament/create", view: TournamentCreateView},
		{path: "/tournament/:tournament_id", view: TournamentDetailView},
		{path: "/tournament/:tournament_id/pong/:pong_id", view: PongView},
		{path: "/ai-battle", view: AIBattleView},
	];

  const currentPath = location.pathname.replace(/\/$/, '');

  let match = null;
  let params = {};

  // 各ルートを確認
  for (const route of routes) {
    const pattern = new UrlPattern(route.path, { segmentNameCharset: 'a-zA-Z0-9_' });
    const result = pattern.match(currentPath);

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

  // パラメータをビューに渡す
  const view = new match.route.view(params);

	const body = document.getElementById("body");
	const header = document.getElementById('header');
	if (!body || !header) throw new Error("element app not found");
	header.innerHTML = await view.getHeader();
	body.innerHTML = await view.getBody();

	await view.loadScripts();
};
