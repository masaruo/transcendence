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
	<form id="tournament-settings-form" class="settings-form">
  <div class="form-group">
    <h3>トーナメント設定</h3>

    <div class="setting-section">
      <h4>Tournament Size</h4>
      <div class="radio-options">
        <label>
          <input type="radio" name="tournament-size" value="2" checked>
          TWO
        </label>
        <label>
          <input type="radio" name="tournament-size" value="4">
          FOUR
        </label>
      </div>
    </div>
    <div class="setting-section">

    <div class="setting-section">
      <h4>Play Type</h4>
      <div class="radio-options">
        <label>
          <input type="radio" name="play-type" value="1" checked>
          SINGLES
        </label>
        <label>
          <input type="radio" name="play-type" value="2">
          DOUBLES
        </label>
      </div>
    </div>
    <div class="setting-section">


    <div class="setting-section">
      <h4>ボールの数</h4>
      <div class="radio-options">
        <label>
          <input type="radio" name="ball-count" value="1" checked>
          1個
        </label>
        <label>
          <input type="radio" name="ball-count" value="2">
          2個
        </label>
      </div>
    </div>

    <div class="setting-section">
      <h4>ボールの速度</h4>
      <div class="radio-options">
        <label>
          <input type="radio" name="ball-speed" value="slow">
          遅い
        </label>
        <label>
          <input type="radio" name="ball-speed" value="normal" checked>
          普通
        </label>
        <label>
          <input type="radio" name="ball-speed" value="fast">
          速い
        </label>
      </div>
    </div>

    <button type="submit" class="submit-btn">トーナメント作成</button>
  </div>
</form>
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
		  const response = await fetcher.fetch_with_auth(tournamentData);
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
