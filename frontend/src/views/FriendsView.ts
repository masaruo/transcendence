import AbstractView from "./AbstractView"

export default class FriendsView extends AbstractView {
	constructor (params: string){
		super(params);
		this.setTitle("Friends");
	}

	async getBody(): Promise<string> {
		return `
		<head>
			<link rel="preconnect" href="https://fonts.googleapis.com">
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
			<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Italiana&display=swap" rel="stylesheet">
		</head>
		<style>
		.my-container {
			height: 85vh;
			width: 100%;
			background-image: url('src/image/friends.jpg');
			background-size: cover;
			background-position: center;
		}
		.my-container h2 {
			font-family: "Bodoni Moda", serif;
      font-optical-sizing: auto;
      font-weight: 700;
      font-style: normal; 
		}
		.card {
			width: 18rem;
			background-color: #dae2dc;
			border: 2px solid #2a4d52;
			color: #2a4d52;
		}
		.friends-grid{
			display: flex;
      flex-wrap: wrap;
      justify-content: center;	
		}
		</style>

		<div class="container-fluid my-container p-lg-5">
      <div class="text-center mt-5 mb-3">
        <h2>Your Friends</h2>
      </div>
			<div id="friends-list" class="friends-grid"></div>
		</div>
		`
	}

	async loadScripts(): Promise<void> {
		const friendsList = document.getElementById('friends-list');
		try {
			const token = sessionStorage.getItem('access'); // Retrieve token from localStorage
			// console.log('Retrieved token:', token); // Debugging log
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
				    <h5 class="card-title">${friend.nickname}</h5>
				    <p class="card-text">ID: ${friend.id}</p>
				    <p class="card-text">online: ${friend.is_online ? 'Yes' : 'No'}</p>
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
