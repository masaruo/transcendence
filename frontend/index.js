const canvas = document.getElementById("canvas");
const right_paddle = canvas.getContext("2d");
const left_paddle = canvas.getContext("2d");
const ball = canvas.getContext("2d");

let right_paddle_y = 100;
let left_paddle_y = 200;

let ball_x = 100;
let ball_y = 299;

const right_paddle_up = document.getElementById("right-paddle-up");
const right_paddle_down = document.getElementById("right-paddle-down");

right_paddle.fillStyle = "blue";
right_paddle.fillRect(canvas.width - 10, right_paddle_y, 10, 100);

left_paddle.fillStyle = "green";
left_paddle.fillRect(0, left_paddle_y, 10, 100);

ball.fillStyle = "white";
ball.fillRect(ball_x, ball_y, 10, 10);

right_paddle_up.addEventListener("click", (e) => {
	e.preventDefault();
	right_paddle.fillStyle = "black";
	right_paddle.fillRect(canvas.width - 10, right_paddle_y, 10, 100);
	right_paddle_y -= 10;
	if (right_paddle_y < 0)
		right_paddle_y = 0;
	right_paddle.fillStyle = "blue";
	right_paddle.fillRect(canvas.width - 10, right_paddle_y, 10, 100);
})

right_paddle_down.addEventListener("click", (e) => {
	e.preventDefault();
	right_paddle.fillStyle = "black";
	right_paddle.fillRect(canvas.width - 10, right_paddle_y, 10, 100);
	right_paddle_y += 10;
	if (right_paddle_y > canvas.height - 100)
		right_paddle_y = canvas.height - 100;
	console.log(right_paddle_y);
	right_paddle.fillStyle = "blue";
	right_paddle.fillRect(canvas.width - 10, right_paddle_y, 10, 100);
})



// make shape AClass -> paddle, ball
// should have boundary check
// should have contact check
// draw paddle
