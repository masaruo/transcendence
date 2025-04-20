import AbstructView from "./AbstractView"
import Fetch from "../classes/JsonFetch";

export default class UserView extends AbstructView {
    me: any;
    constructor (params: string) {
        super(params);
        this.setTitle("User");
    }

    async getBody(): Promise<string> {
        try {
            const fetcher = new Fetch("http://localhost:8000/api/user/me/");
            this.me = await fetcher.fetch_with_auth();
            return `
            <div>MyID: ${this.me.id}</div>
            <div>My nickname: ${this.me.nickname}</div>
                <input type="text" id="nicknameInput" placeholder="new nickname">

                <div>My email: ${this.me.email}</div>
                <input type="text" id="emailInput" placeholder="new nickname">

                <br>
                <img src="${this.me.avatar}" alt="user-image">
                <br>
                <input type="file" id="fileInput">
                <br>
                <a href="/user/me/">Back to Profile</a>
                <br>

                <button id="updateButton">Submit</button>
            `
        } catch (error) {
            throw error;
        }
    }

    async loadScripts(): Promise<void> {
        try {
          const new_nickname = document.getElementById('nicknameInput') as HTMLInputElement;
          const new_email = document.getElementById('emailInput') as HTMLInputElement;
          const file_input = document.getElementById('fileInput') as HTMLInputElement;
          const update_submit = document.getElementById('updateButton');

          if (!update_submit){ throw Error("update submit not found");}
          update_submit.addEventListener('click', async (event) => {
            const payload = {};
            if (new_nickname && new_nickname.value) {
              payload.nickname = new_nickname.value;
            }
            if (new_email && new_email.value) {
              payload.email = new_email.value;
            }
            // if (file_input && file_input.files && file_input.files.length > 0) {
            //   payload.avatar = file_input.files[0];
            // }

            const fetcher = new Fetch(
              "http://localhost:8000/api/user/me/",
              "PATCH",
              undefined,
              payload,
            );
            const res = await fetcher.fetch_with_auth();
            if (res.ok) {
              window.location.reload();
            } else {
            //   const errorData = await res.json();
            console.error("error updating nickname");
            //   alert(`error: ${errorData.detail || 'some error'}`);
            }
          });
        } catch (error) {
          console.log("error:", error);
        }
      }
}
