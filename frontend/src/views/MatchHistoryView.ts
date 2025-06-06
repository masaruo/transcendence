import Fetch from "@/classes/JsonFetch";
import AbstractView from "./AbstractView";
import { PATH } from "@/services/constants";

interface Player {
  id: number;
  nickname: string;
  avatar: string;
}

interface Team {
  id: number;
  player1: Player;
  player2: Player | null;
}

interface Match {
  id: number;
  tournament: any;
  team1: Team;
  team2: Team;
  created_at: string;
  match_status: number;
  round: number;
  match_size: number;
  team1_score: number;
  team2_score: number;
  winner: Team | null;
}

export default class MatchHistoryView extends AbstractView {
	private matches: Match[];
	private userId: number = 0;

	constructor(params: Record<string, string> = {}) {
		super(params);
		this.userId = params.user_id ? parseInt(params.user_id) : 0;
	}

	async getBody(): Promise<string> {
		return `
		<div id='stats-placeholder'></div>
		<div id='matches-placeholder'></div>
		`
	}

	async loadScripts(): Promise<void> {
		const stats_div = document.getElementById('stats-placeholder');
		const matches_div = document.getElementById('matches-placeholder');
		const user_id = this.userId || sessionStorage.getItem('user_id');
		const fetcher = new Fetch(`${PATH}/api/user/${user_id}/matches/`);
		const res_in_json = await fetcher.fetch_with_auth();
		this.matches = res_in_json;

		    // 統計情報要素を作成して追加
    	if (stats_div) {
        	const statsElem = this.createStatsElem(this.matches, parseInt(String(user_id)));
        	stats_div.appendChild(statsElem);
    	}

		this.matches.forEach(match => {
			const match_elem = this.createMatchElement(match, parseInt(String(user_id)));
			matches_div?.appendChild(match_elem);
		});
	}

	/**
	 * マッチデータからカード要素を作成する
	 * @param match マッチデータ
	 * @param currentUserId 現在のユーザーID
	 * @returns HTMLElement カード要素
	 */
	private createMatchElement(match: Match, currentUserId: number): HTMLElement {
		// カード要素を作成
		const match_elem = document.createElement('div');
		match_elem.className = 'card mb-3';

		// マッチの日時をフォーマット
		const matchDate = new Date(match.created_at).toLocaleString('ja-JP');

		// 現在のユーザーがマッチに参加しているチームを特定
		const isUserInTeam1 = match.team1.player1.id === currentUserId ||
							(match.team1.player2 && match.team1.player2.id === currentUserId);

		// 現在のユーザーが勝者かどうかを判定
		const isUserWinner = match.winner &&
							(match.winner.player1.id === currentUserId ||
							(match.winner.player2 && match.winner.player2.id === currentUserId));

		// 結果のバッジカラーとテキスト
		const resultBadgeClass = isUserWinner ? 'bg-success' : 'bg-danger';
		const resultText = isUserWinner ? '勝利' : '敗北';

		// カードのHTMLを設定
		match_elem.innerHTML = `
			<div class="card-header d-flex justify-content-between align-items-center">
				<span>マッチID: ${match.id}</span>
				<span>${matchDate}</span>
			</div>
			<div class="card-body">
				<div class="row">
					<div class="col-5 text-center">
						<div class="d-flex flex-column align-items-center mb-2">
							<img src="${match.team1.player1.avatar}" alt="${match.team1.player1.nickname}"
								class="rounded-circle" width="50" height="50">
							<strong>${match.team1.player1.nickname}</strong>
						</div>
						${match.team1.player2 ? `
							<div class="d-flex flex-column align-items-center">
								<img src="${match.team1.player2.avatar}" alt="${match.team1.player2.nickname}"
									class="rounded-circle" width="50" height="50">
								<strong>${match.team1.player2.nickname}</strong>
							</div>
						` : ''}
					</div>
					<div class="col-2 text-center">
						<h3>${match.team1_score} - ${match.team2_score}</h3>
						${match.match_status === 3 ? `
							<span class="badge ${resultBadgeClass}">${resultText}</span>
						` : `
							<span class="badge bg-warning">進行中</span>
						`}
					</div>
					<div class="col-5 text-center">
						<div class="d-flex flex-column align-items-center mb-2">
							<img src="${match.team2.player1.avatar}" alt="${match.team2.player1.nickname}"
								class="rounded-circle" width="50" height="50">
							<strong>${match.team2.player1.nickname}</strong>
						</div>
						${match.team2.player2 ? `
							<div class="d-flex flex-column align-items-center">
								<img src="${match.team2.player2.avatar}" alt="${match.team2.player2.nickname}"
									class="rounded-circle" width="50" height="50">
								<strong>${match.team2.player2.nickname}</strong>
							</div>
						` : ''}
					</div>
				</div>
				<div class="mt-3 text-center">
					<span class="badge bg-info">ラウンド ${match.round}</span>
					<span class="badge bg-secondary">${match.match_size}人マッチ</span>
					${match.tournament ? `
						<span class="badge bg-primary">トーナメントID: ${match.tournament.id}</span>
					` : ''}
				</div>
			</div>
		`;

		return match_elem;
	}

	/**
	 * 統計情報を表示するHTML要素を作成する
	 * @param matches マッチデータの配列
	 * @param userId 現在のユーザーID
	 * @returns HTMLElement 統計情報の要素
	 */
	private createStatsElem(matches: Match[], userId: number): HTMLElement {
		// 統計情報を計算
		const completedMatches = matches.filter(match => match.match_status === 3);
		const total = completedMatches.length;

		// 勝利数を計算
		const wins = completedMatches.filter(match =>
			match.winner &&
			(match.winner.player1.id === userId ||
			(match.winner.player2 && match.winner.player2.id === userId))
		).length;

		// 敗北数を計算
		const losses = total - wins;

		// 勝率を計算（0で割ることを防ぐ）
		const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

		// 統計要素を作成
		const statsElem = document.createElement('div');
		statsElem.className = 'card mb-4';

		// カードのヘッダーとボディを作成
		const cardHeader = document.createElement('div');
		cardHeader.className = 'card-header';
		cardHeader.innerHTML = '<h4>戦績</h4>';

		const cardBody = document.createElement('div');
		cardBody.className = 'card-body';

		// 統計情報の行を作成
		const statsRow = document.createElement('div');
		statsRow.className = 'row text-center';

		// 総試合数の列
		const totalCol = document.createElement('div');
		totalCol.className = 'col-4';
		totalCol.innerHTML = `<h5>${total}</h5><p>総試合数</p>`;

		// 勝利数の列
		const winsCol = document.createElement('div');
		winsCol.className = 'col-4';
		winsCol.innerHTML = `<h5 class="text-success">${wins}</h5><p>勝利数</p>`;

		// 敗北数の列
		const lossesCol = document.createElement('div');
		lossesCol.className = 'col-4';
		lossesCol.innerHTML = `<h5 class="text-danger">${losses}</h5><p>敗北数</p>`;

		// 列を行に追加
		statsRow.appendChild(totalCol);
		statsRow.appendChild(winsCol);
		statsRow.appendChild(lossesCol);

		// プログレスバーコンテナ
		const progressContainer = document.createElement('div');
		progressContainer.className = 'mt-3';

		// プログレスバーのラベル
		const progressLabel = document.createElement('div');
		progressLabel.className = 'mb-1 d-flex justify-content-between';
		progressLabel.innerHTML = `
			<span>勝率</span>
			<span>${winRate}%</span>
		`;

		// プログレスバー要素
		const progressBar = document.createElement('div');
		progressBar.className = 'progress';
		progressBar.innerHTML = `
			<div class="progress-bar bg-success" role="progressbar"
				style="width: ${winRate}%"
				aria-valuenow="${winRate}"
				aria-valuemin="0"
				aria-valuemax="100"></div>
		`;

		// プログレスバーコンテナに追加
		progressContainer.appendChild(progressLabel);
		progressContainer.appendChild(progressBar);

		// 要素を組み立て
		cardBody.appendChild(statsRow);
		cardBody.appendChild(progressContainer);

		statsElem.appendChild(cardHeader);
		statsElem.appendChild(cardBody);

		return statsElem;
	}
}
