import AbstractView from "./AbstractView"
import Fetch from "../classes/JsonFetch";
import { navigateTo } from "@/services/router";
import { PATH } from "@/services/constants";

export default class RegisterView extends AbstractView {
    constructor (params: Record<string, string>) {
        super(params);
        this.setTitle("Register");
    }

    async getBody(): Promise<string> {
        return `
        <style>
          .register-page-container {
            height: 100dvh;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #b7bff2;
          }
          .register-page-container h2{
           font-family: "Bodoni Moda", serif;
           font-optical-sizing: auto;
           font-weight: 700;
           font-style: normal;
           color: #110167;
          }
        </style>

        <div class="register-page-container d-flex justify-content-center flex-column align-items-center">
          <div class="text-center mt-5 mb-3">
            <h2>Create Account</h2>
          </div>
          <div class="container rounded bg-white mt-5 mb-5">
            <div class="row justify-content-center">
              <div class="col-md-8">
                <div class="p-3 py-5">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6 class="text-right">Register new user</h6>
                  </div>
                  <div class="row g-5 align-items-center mb-3">
                    <div class="col-4">
                      <label for="avatarInput" class="form-label">Profile Image</label>
                    </div>
                    <div class="col-8">
                      <input type="file" class="form-control" id="avatarInput" accept="image/*">
                    </div>
                    <div class="col-4">
                      <label for="nicknameInput" class="form-label">Nickname</label>
                    </div>
                    <div class="col-8">
                      <input type="text" id="nicknameInput" placeholder="Enter your nickname" class="form-control" required>
                    </div>
                  </div>
                  <div class="row g-5 align-items-center mb-3">
                    <div class="col-4">
                      <label for="emailInput" class="form-label">Email</label>
                    </div>
                    <div class="col-8">
                      <input type="email" id="emailInput" placeholder="Enter your email" class="form-control" required>
                    </div>
                  <div class="row g-5 align-items-center mb-3">
                    <div class="col-4">
                      <label for="passwordInput" class="form-label">Password</label>
                    </div>
                    <div class="col-8">
                      <input type="password" id="passwordInput" placeholder="Create a password" class="form-control" required>
                    </div>
                  </div>
                </div>
                <button id="registerButton" class="btn btn-primary">Create Account</button>
                <div class="text-center mt-3">
                  <a href="/login" class="link-dark link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover">
                    Already have an account? Login
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        `
    }

    async loadScripts(): Promise<void> {
        try {
          const nickname_input = document.getElementById('nicknameInput') as HTMLInputElement;
          const email_input = document.getElementById('emailInput') as HTMLInputElement;
          const password_input = document.getElementById('passwordInput') as HTMLInputElement;
          const file_input = document.getElementById('avatarInput') as HTMLInputElement;
          const register_submit = document.getElementById('registerButton');

          if (!register_submit){ throw Error("register submit not found");}

          register_submit.addEventListener('click', async (event) => {
            event.preventDefault();

            // 必須フィールドの検証
            if (!nickname_input.value || !email_input.value || !password_input.value) {
              alert("Please fill in all required fields");
              return;
            }

            const formData = new FormData();

            // 必須フィールド
            formData.append('nickname', nickname_input.value);
            formData.append('email', email_input.value);
            formData.append('password', password_input.value);

            // オプショナルなアバター
            if (file_input && file_input.files && file_input.files.length > 0) {
              formData.append('avatar', file_input.files[0]);
            }

            try {
              const fetcher = new Fetch(`${PATH}/api/user/create/`, "POST");
              fetcher.add_form_data(formData);
              const res = await fetcher.fetch_without_auth();

              if (res) {
                alert("Registration successful!");
                navigateTo("/login"); // ログインページにリダイレクト
              } else {
                alert("Registration failed. Please try again.");
              }
            } catch (error) {
              console.error("Registration error:", error);
              alert("Registration failed. Please try again.");
            }
          });
        } catch (error) {
          console.error("error:", error);
        }
      }
}
