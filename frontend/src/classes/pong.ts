import { Ball } from "./ball";
import { Paddle } from "./paddle";
import { IdEvent } from "./IdEvent";

const keyState: {[key: string]: boolean} = {};

document.addEventListener("keydown", (e) => {
	keyState[e.key] = true;
})

document.addEventListener("keyup", (e) => {
	keyState[e.key] = false;
})

export class Pong {
	readonly _canvas: HTMLCanvasElement;
	readonly _ctx: CanvasRenderingContext2D;
	readonly _width: number;
	readonly _height: number;
	readonly _x_center: number;
	readonly _y_center: number;
	readonly ball: Ball;
	readonly r_paddle: Paddle;
	readonly l_paddle:Paddle;
	private intervalID: number = 0;
	private start_: IdEvent;
	private stop_: IdEvent;

	constructor (canvas: HTMLCanvasElement | null) {
		if (!canvas)
			throw Error("Canvas not propertly allocated.");
		this._canvas = canvas;
		const ctx = canvas.getContext("2d");
		if (!ctx)
			throw Error("Failed to get 2D context.");
		this._ctx = ctx;
		this._width = this._canvas.width;
		this._height = this._canvas.height;
		this._x_center = this._width / 2;
		this._y_center = this._height / 2;
		this.ball = new Ball(this._x_center, this._y_center, 10);
		this.l_paddle = new Paddle(0,this._y_center, 20, 80);
		this.r_paddle = new Paddle(this._width - 20, this._y_center, 20, 80);
		this.start_ = new IdEvent("start", "click", () => {
			if (this.intervalID == 0)
				this.intervalID = setInterval(() => this.draw(), 20); // アロー関数で修正
		})
		this.stop_ = new IdEvent("end", "click", ()=> {
			clearInterval(this.intervalID);
			this.intervalID = 0;
		})
	}

	moveElems(): void {
    // 必要なデバッグ情報だけを残す
    // if (keyState["w"] || keyState["s"] || keyState["ArrowUp"] || keyState["ArrowDown"]) {
    //     console.log("KeyState:", keyState);
    //     console.log("Left Paddle Position:", this.l_paddle);
    //     console.log("Right Paddle Position:", this.r_paddle);
    // }

		this.ball.move();
		this.l_paddle.move(this._canvas.height, keyState["w"], keyState["s"]);
		this.r_paddle.move(this._canvas.height, keyState["ArrowUp"], keyState["ArrowDown"]);
	}

	draw(): void {
		this.ball.checkCollision(this._height, this._width, this.l_paddle, this.r_paddle);

		if (!this.ball.checkGameContinue())
			this.stop();

		this.moveElems();
		this._ctx.clearRect(0, 0, this._width, this._height);
		this._ctx.fillStyle = "black";
		this._ctx.fillRect(0, 0, this._width, this._height);
		this.ball.draw(this._ctx);
		this.r_paddle.draw(this._ctx, "green");
		this.l_paddle.draw(this._ctx, "blue");
	}

	start(): void
	{
		this.start_.attach();
	}

	stop(): void
	{
		this.stop_.attach();
	}
}
