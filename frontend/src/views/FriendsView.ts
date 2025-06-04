import AbstractView from "./AbstractView"
import { PATH } from "@/services/constants";
import Fetch from "../classes/JsonFetch";
import { navigateTo } from "@/services/router";

export default class FriendsView extends AbstractView {
	constructor (params: Record<string, string>){
		super(params);
		this.setTitle("Friends");
	}

	async getBody(): Promise<string> {
		return `
		<style>
		.my-container {
			background-image: url('/images/friends.jpg');
			background-size: cover;
			background-position: center;
		}
		.my-container h1 {
			font-family: "Bodoni Moda", serif;
      font-optical-sizing: auto;
      font-weight: bold;
      font-style: normal;
			color:	#a52f56;
		}
		.card {
			width: 18rem;
			background-color: #ffffff;
			margin: 5px;
		}
		.friends-grid{
			display: flex;
      flex-wrap: wrap;
      justify-content: center;
		}
		.friend-header {
			display: flex;
			align-items: center;
		}
		</style>

		<div class="container-fluid my-container p-lg-5">

			<form class="row g-3 add-friend-form d-flex">
			  <div class="col-auto">
			    <input type="text"
						id="friend-email"
						name="friend email"
						placeholder="Add friend by email!"
						required
						maxlength="20"
						class="form-control"
					>
			  </div>
			  <div class="col-auto">
			    <button type="button" id='addFriend' class="btn btn-primary mb-3">Add</button>
			  </div>
			</form>

      <div class="text-center mt-5 mb-3">
        <h1>Your Friends</h1>
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
					<div class="friend-header">
						<img src="${friend.avatar}"
							alt="${friend.nickname}"
							width="50" height="50"
							class="rounded-circle"
							style="object-fit: cover; margin: 15px;">
						<h5 class="card-title">${friend.nickname}</h5>
					</div>
					<p class="card-text"
						style="color: ${friend.is_online ? "#6fcf97" : "#6c757d" }">
						${friend.is_online ? '🟢 ONLINE' : '⚫️ OFFLINE'}
					</p>
          <button id="historyButton_${friend.id}" class="btn btn-outline-secondary">See History</button>
				</div>
				`; // Display id, nickname, and is_online
				friendsList.appendChild(friendItem);
				const historyButton = friendItem.querySelector('button');
				if (!historyButton) throw Error("History button not found");
				historyButton.addEventListener('click', () => {
				  navigateTo(`/user/${friend.id}/matches`);
				});
			});
		} catch (error) {
			friendsList.textContent = 'Failed to load friends.';
			console.error('Error fetching friends:', error);
		}

		//add friend
		const add_friend_button = document.getElementById('addFriend') as HTMLInputElement;
		const email = document.getElementById('friend-email') as HTMLInputElement;
		if (!add_friend_button) { throw Error("add friend not found");}
		add_friend_button.addEventListener('click', async (event) => {
			event.preventDefault();
			if (add_friend_button.disabled) return;
			add_friend_button.disabled = true;
			try {
				const formData = new FormData();
				if (email) {
					formData.append('email', email.value);
				}
				const fetcher = new Fetch(`${PATH}/api/user/friends/create/`, "POST");
				fetcher.add_form_data(formData);
				const res_in_json = await fetcher.fetch_with_auth();
				if (res_in_json) {
					window.location.reload()
				} else {
					console.error("error adding a friend");
				}
			} catch (error) {
				console.error("Request failed.", error);
			} finally {
				add_friend_button.disabled = false;
			}
		})
	}
}
