import AbstractView from "./AbstractView";
import { PATH, WS_PATH } from "@/services/constants";

interface Ball {
    x: number;
    y: number;
    dx: number;
    dy: number;
    radius: number;
}

interface Paddle {
    x: number;
    y: number;
    width: number;
    height: number;
    dy: number;
}

interface Score {
    user: number;
    ai: number;
}

export default class AIBattleView extends AbstractView {
    private ws: WebSocket | null = null;
    private gameContainer: HTMLElement | null = null;
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private ball: Ball = {
        x: 0,
        y: 0,
        dx: 5,
        dy: 5,
        radius: 10
    };
    private userPaddle: Paddle = {
        x: 0,
        y: 0,
        width: 10,
        height: 100,
        dy: 0
    };
    private aiPaddle: Paddle = {
        x: 0,
        y: 0,
        width: 10,
        height: 100,
        dy: 0
    };
    private score: Score = {
        user: 0,
        ai: 0
    };
    private animationFrameId: number | null = null;
    private isGameRunning: boolean = false;
    private keys: { [key: string]: boolean } = {};
    private gameOver: boolean = false;
    private restartTimer: number | null = null;
    private readonly WINNING_SCORE = 10;
    private readonly RESTART_DELAY = 10000; // 10 seconds
    private readonly AI_PADDLE_SPEED = 5;

    constructor(params: Record<string, string>) {
        super(params);
        this.setTitle("AI Battle");
    }

    async getBody(): Promise<string> {
        return `
        <style>
            .ai-battle-container {
                height: 85vh;
                width: 100%;
                background-image: url('src/image/ai-battle.jpg');
                background-size: cover;
                background-position: center;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            .ai-battle-container h2 {
                font-family: "Bodoni Moda", serif;
                font-optical-sizing: auto;
                font-weight: 700;
                font-style: normal;
                color: #19254f;
                margin-bottom: 2rem;
            }
            .start-button {
                background-color: #4CAF50;
                color: white;
                padding: 1rem 3rem;
                font-size: 1.5rem;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .start-button:hover {
                transform: scale(1.05);
                background-color: #45a049;
            }
            .game-container {
                display: none;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.8);
                position: relative;
            }
            #gameCanvas {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: #000;
                border: 2px solid #fff;
            }
            .error-message {
                color: #ff0000;
                margin-top: 1rem;
                padding: 1rem;
                background-color: rgba(255, 0, 0, 0.1);
                border-radius: 5px;
                display: none;
            }
        </style>

        <div class="ai-battle-container">
            <h2>Battle Against AI</h2>
            <button class="start-button" id="start-battle-btn">Start Battle</button>
            <div class="error-message" id="error-message"></div>
            <div class="game-container" id="game-container">
                <canvas id="gameCanvas" width="800" height="600"></canvas>
            </div>
        </div>
        `;
    }

    private resetBall(): void {
        if (!this.canvas) return;
        
        // ボールを中央に配置
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        
        // ランダムな方向にボールを発射
        const angle = (Math.random() * Math.PI / 2) - Math.PI / 4; // -45度から45度の範囲
        const speed = 5;
        this.ball.dx = speed * Math.cos(angle) * (Math.random() > 0.5 ? 1 : -1);
        this.ball.dy = speed * Math.sin(angle);
    }

    private initializeGame(): void {
        if (!this.gameContainer || !this.canvas || !this.ctx) return;

        // キャンバスの初期化
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 中央線を描画
        this.ctx.strokeStyle = '#fff';
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();

        // スコア表示
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${this.score.user} - ${this.score.ai}`, this.canvas.width / 2, 50);

        // パドルを初期位置に配置
        this.userPaddle.x = 50;
        this.userPaddle.y = (this.canvas.height - this.userPaddle.height) / 2;
        
        this.aiPaddle.x = this.canvas.width - 60; // 右端から少し離れた位置
        this.aiPaddle.y = (this.canvas.height - this.aiPaddle.height) / 2;

        // ボールをリセット
        this.resetBall();

        // キーボードイベントリスナーを設定
        this.setupKeyboardControls();

        // ゲームループを開始
        this.isGameRunning = true;
        this.gameLoop();
    }

    private setupKeyboardControls(): void {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }

    private updatePaddlePosition(): void {
        if (!this.canvas) return;

        // パドルの移動速度を設定
        const paddleSpeed = 8;
        if (this.keys['ArrowUp']) {
            this.userPaddle.dy = -paddleSpeed;
        } else if (this.keys['ArrowDown']) {
            this.userPaddle.dy = paddleSpeed;
        } else {
            this.userPaddle.dy = 0;
        }

        // パドルの位置を更新
        this.userPaddle.y += this.userPaddle.dy;

        // パドルが画面外に出ないように制限
        if (this.userPaddle.y < 0) {
            this.userPaddle.y = 0;
        } else if (this.userPaddle.y + this.userPaddle.height > this.canvas.height) {
            this.userPaddle.y = this.canvas.height - this.userPaddle.height;
        }
    }

    private updateAIPaddle(): void {
        if (!this.canvas) return;

        // ボールが右側に来ている場合のみ追従
        if (this.ball.dx > 0) {
            // ボールの予測位置を計算
            const timeToReachPaddle = (this.aiPaddle.x - this.ball.x) / this.ball.dx;
            const predictedY = this.ball.y + (this.ball.dy * timeToReachPaddle);
            
            // パドルの目標位置を設定（パドルの中心がボールの予測位置に来るように）
            const targetY = predictedY - (this.aiPaddle.height / 2);
            
            // パドルの移動速度を計算
            const diff = targetY - this.aiPaddle.y;
            this.aiPaddle.dy = Math.min(Math.max(diff, -this.AI_PADDLE_SPEED), this.AI_PADDLE_SPEED);
            
            // パドルの位置を更新
            this.aiPaddle.y += this.aiPaddle.dy;
        } else {
            // ボールが左側にある場合は中央に戻る
            const centerY = (this.canvas.height - this.aiPaddle.height) / 2;
            const diff = centerY - this.aiPaddle.y;
            this.aiPaddle.dy = Math.min(Math.max(diff, -this.AI_PADDLE_SPEED), this.AI_PADDLE_SPEED);
            this.aiPaddle.y += this.aiPaddle.dy;
        }

        // パドルが画面外に出ないように制限
        if (this.aiPaddle.y < 0) {
            this.aiPaddle.y = 0;
        } else if (this.aiPaddle.y + this.aiPaddle.height > this.canvas.height) {
            this.aiPaddle.y = this.canvas.height - this.aiPaddle.height;
        }
    }

    private checkPaddleCollision(): void {
        // ユーザーのパドルとの衝突判定
        if (
            this.ball.x - this.ball.radius < this.userPaddle.x + this.userPaddle.width &&
            this.ball.y + this.ball.radius > this.userPaddle.y &&
            this.ball.y - this.ball.radius < this.userPaddle.y + this.userPaddle.height &&
            this.ball.dx < 0
        ) {
            // ボールがパドルに当たった位置を計算（0.0 から 1.0 の範囲）
            const hitPosition = (this.ball.y - this.userPaddle.y) / this.userPaddle.height;
            
            // ボールの速度を計算
            const speed = Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy);
            
            // パドルの当たった位置に応じて角度を計算（-45度から45度の範囲）
            const angle = (hitPosition - 0.5) * Math.PI / 2;
            
            // 新しい速度を設定
            this.ball.dx = speed * Math.cos(angle);
            this.ball.dy = speed * Math.sin(angle);
            
            // ボールがパドルにめり込まないように位置を調整
            this.ball.x = this.userPaddle.x + this.userPaddle.width + this.ball.radius;
        }

        // AIのパドルとの衝突判定
        if (
            this.ball.x + this.ball.radius > this.aiPaddle.x &&
            this.ball.y + this.ball.radius > this.aiPaddle.y &&
            this.ball.y - this.ball.radius < this.aiPaddle.y + this.aiPaddle.height &&
            this.ball.dx > 0
        ) {
            // ボールがパドルに当たった位置を計算（0.0 から 1.0 の範囲）
            const hitPosition = (this.ball.y - this.aiPaddle.y) / this.aiPaddle.height;
            
            // ボールの速度を計算
            const speed = Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy);
            
            // パドルの当たった位置に応じて角度を計算（-45度から45度の範囲）
            const angle = (hitPosition - 0.5) * Math.PI / 2;
            
            // 新しい速度を設定（左方向に反転）
            this.ball.dx = -speed * Math.cos(angle);
            this.ball.dy = speed * Math.sin(angle);
            
            // ボールがパドルにめり込まないように位置を調整
            this.ball.x = this.aiPaddle.x - this.ball.radius;
        }
    }

    private showGameOverMessage(winner: 'user' | 'ai'): void {
        if (!this.ctx || !this.canvas) return;

        // 半透明の黒い背景
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // メッセージを表示
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        const message = winner === 'user' ? 'You Win!' : 'AI Wins!';
        this.ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2 - 50);

        // 再開までのカウントダウン
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Next game starts in 10 seconds...', this.canvas.width / 2, this.canvas.height / 2 + 50);
    }

    private checkGameOver(): boolean {
        if (this.score.user >= this.WINNING_SCORE || this.score.ai >= this.WINNING_SCORE) {
            this.gameOver = true;
            this.isGameRunning = false;
            if (this.animationFrameId !== null) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
            return true;
        }
        return false;
    }

    private scheduleRestart(): void {
        if (this.restartTimer !== null) {
            clearTimeout(this.restartTimer);
        }

        this.restartTimer = window.setTimeout(() => {
            this.resetGame();
        }, this.RESTART_DELAY);
    }

    private resetGame(): void {
        // スコアをリセット
        this.score.user = 0;
        this.score.ai = 0;
        
        // ゲーム状態をリセット
        this.gameOver = false;
        this.isGameRunning = true;
        
        // ボールをリセット
        this.resetBall();
        
        // ゲームループを再開
        this.gameLoop();
    }

    private handleScoring(): void {
        if (!this.canvas) return;

        // 左端に当たった場合（AIの得点）
        if (this.ball.x - this.ball.radius < 0) {
            this.score.ai++;
            this.resetBall();
        }
        // 右端に当たった場合（ユーザーの得点）
        else if (this.ball.x + this.ball.radius > this.canvas.width) {
            this.score.user++;
            this.resetBall();
        }

        // ゲーム終了判定
        if (this.checkGameOver()) {
            const winner = this.score.user >= this.WINNING_SCORE ? 'user' : 'ai';
            this.showGameOverMessage(winner);
            this.scheduleRestart();
        }
    }

    private gameLoop(): void {
        if (!this.isGameRunning || !this.canvas || !this.ctx) return;

        // 画面をクリア
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 中央線を描画
        this.ctx.strokeStyle = '#fff';
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();

        // スコア表示
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${this.score.user} - ${this.score.ai}`, this.canvas.width / 2, 50);

        if (!this.gameOver) {
            // パドルの位置を更新
            this.updatePaddlePosition();
            this.updateAIPaddle();

            // パドルを描画
            this.ctx.fillStyle = '#fff';
            // ユーザーのパドル
            this.ctx.fillRect(
                this.userPaddle.x,
                this.userPaddle.y,
                this.userPaddle.width,
                this.userPaddle.height
            );
            // AIのパドル
            this.ctx.fillRect(
                this.aiPaddle.x,
                this.aiPaddle.y,
                this.aiPaddle.width,
                this.aiPaddle.height
            );

            // ボールを描画
            this.ctx.beginPath();
            this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = '#fff';
            this.ctx.fill();
            this.ctx.closePath();

            // ボールの移動
            this.ball.x += this.ball.dx;
            this.ball.y += this.ball.dy;

            // パドルとの衝突判定
            this.checkPaddleCollision();

            // 上下の壁との衝突判定
            if (this.ball.y + this.ball.radius > this.canvas.height || this.ball.y - this.ball.radius < 0) {
                this.ball.dy = -this.ball.dy;
            }

            // 得点判定
            this.handleScoring();
        }

        // 次のフレームを要求
        this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
    }

    private stopGame(): void {
        this.isGameRunning = false;
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        if (this.restartTimer !== null) {
            clearTimeout(this.restartTimer);
            this.restartTimer = null;
        }
        // キーボードイベントリスナーを削除
        window.removeEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });
        window.removeEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }

    private showError(message: string): void {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        }
    }

    async loadScripts(): Promise<void> {
        const startButton = document.getElementById('start-battle-btn');
        this.gameContainer = document.getElementById('game-container');
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas?.getContext('2d');
        
        if (startButton && this.gameContainer) {
            startButton.addEventListener('click', async () => {
                try {
                    // アクセストークンを取得
                    const token = sessionStorage.getItem('access');
                    if (!token) {
                        throw new Error('Not authenticated. Please log in first.');
                    }

                    console.log('Attempting to start battle...');
                    
                    // バックエンドにバトル開始をリクエスト
                    const response = await fetch(`${PATH}/api/ai_battle/battles/start_battle/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                    });

                    console.log('Response status:', response.status);
                    
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(`Failed to start battle: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
                    }

                    const battleData = await response.json();
                    console.log('Battle started successfully:', battleData);

                    // WebSocket接続を確立
                    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                    const wsUrl = `${wsProtocol}//${WS_PATH}/ws/ai_battle/`;
                    console.log('Connecting to WebSocket:', wsUrl);
                    
                    this.ws = new WebSocket(wsUrl);
                    
                    this.ws.onopen = () => {
                        console.log('WebSocket connection established');
                        this.ws?.send(JSON.stringify({
                            type: 'start_battle',
                            battle_id: battleData.id
                        }));
                    };

                    this.ws.onmessage = (event) => {
                        const data = JSON.parse(event.data);
                        console.log('WebSocket message received:', data);
                        if (data.type === 'battle_started') {
                            // ゲーム画面を表示
                            startButton.style.display = 'none';
                            this.gameContainer!.style.display = 'block';
                            // ゲームの初期化
                            this.initializeGame();
                        } else if (data.type === 'error') {
                            this.showError(data.message);
                        }
                    };

                    this.ws.onerror = (error) => {
                        console.error('WebSocket error:', error);
                        this.showError('WebSocket connection error. Please try again.');
                    };

                    this.ws.onclose = (event) => {
                        console.log('WebSocket connection closed:', event.code, event.reason);
                        if (event.code !== 1000) {
                            this.showError('WebSocket connection closed unexpectedly. Please try again.');
                        }
                    };

                } catch (error) {
                    console.error('Error starting battle:', error);
                    this.showError(error instanceof Error ? error.message : 'Failed to start battle. Please try again.');
                }
            });
        }
    }
} 