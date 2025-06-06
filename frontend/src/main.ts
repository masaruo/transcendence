import './style.css';
import './scss/styles.scss';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { navigateTo, router } from '@services/router';
import StatusManager from '@services/StatusManager';
import Auth from '@services/Auth';

const statusManager = new StatusManager();
const auth = Auth.getInstance();

window.addEventListener("popstate", router);
document.addEventListener("DOMContentLoaded", () => {
	document.body.addEventListener("click", e => {
		const target = e.target as HTMLAnchorElement;
		if (target.matches("[data-link]") && target.href) {
			e.preventDefault();
			statusManager.startWatching();
			navigateTo(target.href);
		}
	})
	router();
})

window.addEventListener('beforeunload', () => {
	statusManager.stopWatching();
})
