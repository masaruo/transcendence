import HeaderView from "./HeaderView";
import { Collapse } from 'bootstrap';

export default abstract class AbstractView {
	protected params: Record<string, string>;
	constructor(params: Record<string, string> = {}) {
		this.params = params;
	}

	setTitle(title: string): void {
		document.title = title;
	}

	async getHeader(): Promise<string> {
		return HeaderView.getHeader();
	}

	async getBody(): Promise<string> {
		return "";
	}

	async loadScripts(): Promise<void> {
		document.querySelectorAll('[data-bs-toggle="collapse"]').forEach((toggleEl) => {
	    const targetSelector = toggleEl.getAttribute('data-bs-target');
	    if (targetSelector) {
	      const collapseTarget = document.querySelector(targetSelector);
	    }
		});
	}
}
