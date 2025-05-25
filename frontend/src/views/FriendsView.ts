import AbstractView from "./AbstractView"
import { PATH } from "@/services/constants";
import Fetch from "../classes/JsonFetch";

export default class FriendsView extends AbstractView {
	constructor (params: Record<string, string>){
		super(params);
		this.setTitle("Friends");
	}

	async getBody(): Promise<string> {
		return `
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
			const fetcher = new Fetch(`${PATH}/api/user/friends/`);
			const friends = await fetcher.fetch_with_auth()
			friends.forEach(friend => {
				const friendItem = document.createElement('div');
				friendItem.setAttribute("class", "card");
				console.log('friends', friend.is_online);
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
