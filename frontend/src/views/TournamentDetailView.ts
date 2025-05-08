import AbstractView from '@views/AbstractView';
import Fetch from '@/classes/JsonFetch';
import PATH from '@services/constants';

export default class TournamentDetailView extends AbstractView {
	constructor (params: string) {
		super(params);
		this.setTitle("Tournament Details");
	}
	async getBody(): Promise<string> {

	}
	async loadScripts(): Promise<void> {

	}
}
