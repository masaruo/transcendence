import AbstractView from '@views/AbstractView';
import Tournament from '@/game/Tournament';

export default class TournamentDetailView extends AbstractView {
	constructor (params: string) {
		super(params);
		this.setTitle("Tournament Details");
	}
	async getBody(): Promise<string> {
		return `
		<h1>Tournament Details at ${this.params.id}</h1>
		`
	}
	async loadScripts(): Promise<void> {
		const tournament = new Tournament(this.params.id);
		tournament.connect();
	}
}
