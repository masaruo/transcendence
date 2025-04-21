import './style.css'
import './scss/styles.scss'
import * as bootstrap from 'bootstrap'

import { navigateTo, router } from './services/router'

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
	document.body.addEventListener("click", e => {
		const target = e.target as HTMLAnchorElement;
		if (target.matches("[data-link]") && target.href) {
			e.preventDefault();
			navigateTo(target.href);
		}
	})
	router();
})
