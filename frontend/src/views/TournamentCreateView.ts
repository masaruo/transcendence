import AbstractView from "./AbstractView"
import Fetch from "../classes/JsonFetch"
import { PATH } from "../services/constants"
import { navigateTo } from "@/services/router";

export default class TournamentCreateView extends AbstractView {
	constructor (params: Record<string, string>) {
		super(params);
		this.setTitle("Tournament Create");
	}
	async getBody(): Promise<string> {
      console.log("Params:", this.params); // パラメータ確認
		return `
    <style>
  		.my-container {
  			height: 95vh;
  			width: 100%;
  			background-image: url('/images/pongview.jpg');
  			background-size: cover;
  			background-position: center;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
  		}
  		.my-container h2 {
  			font-family: "Bodoni Moda", serif;
        font-optical-sizing: auto;
        font-weight: 700;
        font-style: normal;
        color: #ffffff;
  		}
      .settings-card {
        background-color: white;
        padding: 2rem;
        border-radius: 15px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        max-width: 900px;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 1rem;
      }
      .setting-section h4 {
        text-align: center;
        margin-bottom: 1rem;
      }
      .radio-options {
        display: flex;
        gap: 3rem;
        justify-content: center;
        margin-bottom: 1rem;
      }
      .submit-btn {
        margin 2px;
      }
    </style>
		<div class="container-fluid my-container p-lg-5">
    	<form id="tournament-settings-form" class="settings-form">
        <div class="form-group">
          <h2>Create Tournament</h2>
          <div class="settings-card">
            <div class="setting-section">
              <h4>Tournament Size</h4>
              <div class="radio-options">
                <label>
                  <input type="radio" name="tournament-size" value="2" checked>
                  Two
                </label>
                <label>
                  <input type="radio" name="tournament-size" value="4">
                  Four
                </label>
              </div>
            </div>
            <div class="setting-section">
              <h4>Play Type</h4>
              <div class="radio-options">
                <label>
                  <input type="radio" name="play-type" value="1" checked>
                  Singles
                </label>
                <label>
                  <input type="radio" name="play-type" value="2">
                  Doubles
                </label>
              </div>
            </div>
            <div class="setting-section">
              <h4>Balls</h4>
              <div class="radio-options">
                <label>
                  <input type="radio" name="ball-count" value="1" checked>
                  One
                </label>
                <label>
                  <input type="radio" name="ball-count" value="2">
                  Two
                </label>
              </div>
            </div>
            <button type="submit" class="submit-btn btn btn-primary btn-lg">Start the Tournament!!</button>
          </div>
        </div>
      </form>
    </div>
	  `
	}

	async loadScripts(): Promise<void> {
		const form = document.getElementById("tournament-settings-form");
		if (form) {
			handleFormSubmission();
		}
	}
}

/**
 * トーナメント設定フォームの送信を処理する関数
 */
function handleFormSubmission() {
	const form = document.getElementById('tournament-settings-form');

	if (form) {
	  form.addEventListener('submit', async (event) => {
		event.preventDefault();

		// フォームの値を取得
		const formData = new FormData(form as HTMLFormElement);
		const tournamentSize = formData.get('tournament-size');
		const playType = formData.get('play-type');
		const ballCount = formData.get('ball-count');
		// const ballSpeed = formData.get('ball-speed');

		const tournamentData = {
      match_size: parseInt(tournamentSize as string),
		  match_type: parseInt(playType as string),
		  ball_number: parseInt(ballCount as string),
		  // ball_speed: parseInt(ballSpeed as string),
		};

		try {
		  const fetcher = new Fetch(`${PATH}/api/tournament/`, 'POST');
      fetcher.add_body(tournamentData);
		  const response = await fetcher.fetch_with_auth();
      const tournament_id = response.id;

		  alert('トーナメントが作成されました！');
      navigateTo(`/tournament/${tournament_id}`);
		} catch (error) {
		  console.error('トーナメント作成エラー:', error);
		  alert('トーナメント作成に失敗しました。もう一度お試しください。');
		}
	  });
	}
  }

  // DOMが読み込まれた後に関数を実行
  document.addEventListener('DOMContentLoaded', handleFormSubmission);
