import AbstractView from '@views/AbstractView';
import Tournament from '@/game/Tournament';

export default class TournamentDetailView extends AbstractView {
	constructor (params: Record<string, string>) {
		super(params);
		this.setTitle("Tournament Details");
	}
	async getBody(): Promise<string> {
		  console.log("Params:", this.params); // パラメータ確認
		return `
		<h1>Tournament Details at ${this.params.tournament_id}</h1>
		`
	}
	async loadScripts(): Promise<void> {
		const tournament = new Tournament(this.params.tournament_id);
		tournament.connect();
	}
}
