import AbstractView from "./AbstractView"
import Fetch from "../classes/JsonFetch";
import { navigateTo } from "@/services/router";
import { PATH } from "@/services/constants";

interface Payload {
  nickname?: string,
  email?: string,
  password?: string,
  avatar?: string,
}

export default class UserView extends AbstractView {
    me: any;
    constructor (params: Record<string, string>) {
        super(params);
        this.setTitle("User");
    }

    async getBody(): Promise<string> {
        try {
            const fetcher = new Fetch(`${PATH}/api/user/me/`);
            this.me = await fetcher.fetch_with_auth();
            return `
            <style>
              .my-container {
                display: flex;
                justify-content: center;
                align-items: center;
                background-color: #b7bff2;
              }
              .my-container h1{
               font-family: "Bodoni Moda", serif;
               font-optical-sizing: auto;
               font-weight: 700;
               font-style: normal;
               color: #110167;
              }
              .my-btn {
                margin: 5px;
              }
            </style>

            <div class="my-container d-flex justify-content-center flex-column align-items-center">
              <div class="text-center mt-5 mb-3">
                <h1>Your Profile</h1>
              </div>
              <div class="container rounded bg-white mt-5 mb-5">
                <div class="row">
                  <div class="col-md-4 border-end">
                    <div class="d-flex flex-column align-items-center text-center p-3 py-5">
                      <img src="${this.me.avatar}" alt="user-image" class="rounded-circle" style="object-fit: cover; width: 150px; height: 150px;">
                      <br>
                      <div class="row w-100">
                        <div class="col-5 text-start">
                          <span>id: </span>
                        </div>
                        <div class="col-7 text-start">
                          <span class="font-weight-bold">${this.me.id}</span>
                        </div>
                      </div>
                      <div class="row w-100">
                        <div class="col-5 text-start">
                          <span>nick name: </span>
                          </div>
                        <div class="col-7 text-start">
                          <span class="font-weight-bold">${this.me.nickname}</span>
                        </div>
                      </div>
                      <div class="row w-100">
                        <div class="col-5 text-start">
                          <span>e-mail: </span>
                        </div>
                        <div class="col-7 text-start">
                          <span class="font-weight-bold">${this.me.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="p-3 py-5">
                      <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="text-right">Edit your profile</h5>
                      </div>
                      <div class="row g-5 align-items-center mb-3">
                        <div class="col-4">
                          <label for="fileInput" class="form-label">image</label>
                        </div>
                        <div class="col-8">
                          <input type="file" class="form-control" id="avatarInput">
                        </div>
                        <div class="col-4">
                          <label for="nicknameInput" class="form-label">nick name</label>
                        </div>
                        <div class="col-8">
                          <input type="text" id="nicknameInput" placeholder="new nickname" class="form-control">
                        </div>
                        <div class="col-4">
                          <label for="emailInput" class="form-label">e-mail</label>
                        </div>
                        <div class="col-8">
                          <input type="email" id="emailInput" placeholder="new e-mail" class="form-control">
                        </div>
                        <div class="col-4">
                          <label for="passwordInput" class="form-label">password</label>
                        </div>
                        <div class="col-8">
                          <input type="password" id="passwordInput" placeholder="new password" class="form-control">
                        </div>
                      </div>
                      <button id="updateButton" class="btn btn-outline-secondary my-btn">Submit</button>
                      <button id="homeButton" class="btn btn-outline-secondary my-btn">Back to Home</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            `
        } catch (error) {
            throw error;
        }
    }

    async loadScripts(): Promise<void> {
        try {
          const new_nickname = document.getElementById('nicknameInput') as HTMLInputElement;
          const new_email = document.getElementById('emailInput') as HTMLInputElement;
          const new_password = document.getElementById('passwordInput') as HTMLInputElement;
          const file_input = document.getElementById('avatarInput') as HTMLInputElement;
          const is_online_input = document.getElementById('isOnlineInput') as HTMLInputElement;
          const update_submit = document.getElementById('updateButton');

          if (!update_submit){ throw Error("update submit not found");}
          update_submit.addEventListener('click', async (event) => {
            event.preventDefault();

            const formData = new FormData();

            if (new_nickname && new_nickname.value) {
              formData.append('nickname', new_nickname.value);
            }
            if (new_email && new_email.value) {
              formData.append('email', new_email.value);
            }
            if (new_password && new_password.value) {
              formData.append('password', new_password.value);
            }
            if (file_input && file_input.files && file_input.files.length > 0) {
              formData.append('avatar', file_input.files[0]);
            }
            const fetcher = new Fetch(`${PATH}/api/user/me/`, "PATCH");
            fetcher.add_form_data(formData);
            const res = await fetcher.fetch_with_auth();
            if (res) {
              window.location.reload();
            } else {
              console.error("error updating profile");
            }
          });
          
          const back_to_home = document.getElementById('homeButton');

          if (!back_to_home){ throw Error("back_to_home not found");}
          back_to_home.addEventListener('click', async (event) => {
            navigateTo('/');
          });

        } catch (error) {
          console.error("error:", error);
        }
      }
}
