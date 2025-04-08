import AbstractView from "./AbstractView"

export default class FriendsView extends AbstractView {
	constructor (params: string){
		super(params);
		this.setTitle("Friends");
	}

	async getHtml(): Promise<string> {
		return `
		<div id="friends-list"></div>
		`
	}

	async loadScripts(): Promise<void> {
		const friendsList = document.getElementById('friends-list');
		try {
			const token = localStorage.getItem('access'); // Retrieve token from localStorage
			console.log('Retrieved token:', token); // Debugging log
			if (!token) {
				throw new Error('No authentication token found.');
			}
			const response = await fetch("http://localhost:8000/api/user/friends/", {
				headers: {
					"Content-Type": "application/json",
					"accept": "application/json", // Fixed: Removed trailing colon
					"Authorization": "Bearer " + token // Use the dynamically retrieved token
				}
			});
			const friends = await response.json();
			friends.forEach(friend => {
				const friendItem = document.createElement('div');
				friendItem.setAttribute("class", "card");
				friendItem.innerHTML = `
					<div class="card-body">
						<p class="card-title">Nickname: ${friend.nickname}</p>
						<p class="card-text">ID: ${friend.id}</p>
						<p class="card-text">Online: ${friend.is_online ? 'Yes' : 'No'}</p>
					</div>
				`; // Display id, nickname, and is_online
				friendsList.appendChild(friendItem);
			});
		} catch (error) {
			friendsList.textContent = 'Failed to load friends.';
			console.error('Error fetching friends:', error);
		}
	}
}
