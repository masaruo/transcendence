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
              .my-page-container {
                height: 85vh;
                display: flex;
                justify-content: center;
                align-items: center;
                background-color: #b7bff2;
              }
              .my-page-container h2{
               font-family: "Bodoni Moda", serif;
               font-optical-sizing: auto;
               font-weight: 700;
               font-style: normal;
               color: #110167;
              }
            </style>

            <div class="my-page-container d-flex justify-content-center flex-column align-items-center">
              <div class="text-center mt-5 mb-3">
                <h2>Your Profile</h2>
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
                          <div>e-mail: </div>
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
                        <h6 class="text-right">Edit your profile</h6>
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
                      </div>
                      <div class="row g-5 align-items-center mb-3">
                        <div class="col-4">
                          <label for="emailInput" class="form-label">e-mail</label>
                        </div>
                        <div class="col-8">
                          <input type="text" id="emailInput" placeholder="new e-mail" class="form-control">
                        </div>
                      </div>
                    </div>
                    <button id="updateButton" class="btn btn-outline-secondary">Submit</button>
                  </div>
                  <a href="/" class="link-dark link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover">
                    Back to Home
                  </a>
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
          const file_input = document.getElementById('avatarInput') as HTMLInputElement;
          const update_submit = document.getElementById('updateButton');

          if (!update_submit){ throw Error("update submit not found");}
          update_submit.addEventListener('click', async (event) => {
            event.preventDefault();

            const payload:Payload = {};

            if (new_nickname && new_nickname.value) {
              payload.nickname = new_nickname.value;
            }
            if (new_email && new_email.value) {
              payload.email = new_email.value;
            }
            // if (file_input && file_input.files && file_input.files.length > 0) {
            //   payload.avatar = file_input.files[0];
            // }

            const fetcher = new Fetch(`${PATH}/api/user/me/`, "PATCH");
            fetcher.add_body(payload);
            const res = await fetcher.fetch_with_auth();
            if (res) {
              window.location.reload();
            } else {
              console.error("error updating nickname");
            }
          });
        } catch (error) {
          console.log("error:", error);
        }
      }
}
