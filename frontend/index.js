const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const x_center = canvas.width / 2;
const y_center = canvas.height / 2;
const x = canvas.width;
const y = canvas.height;

let ball = { x: x_center, y: y_center, dx: 5, dy: -5, radius: 10};
// let left_paddle = { x: 0, y: y_center, width: 10, height: 80};
let right_paddle = { x: x - 10, y: y_center - 40, width: 10, height: 80};

let r_up_pressed = false;
let r_down_pressed = false;

let intervalId = null;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

document.getElementById("start").addEventListener('click', function(){
	startGame();
});

document.getElementById("end").addEventListener('click', function(){
	stopGame();
});

function startGame(){
	if (!intervalId){
		intervalId = setInterval(draw, 10);
	}
}

function stopGame(){
	clearInterval(intervalId);
	intervalId = null;
}

function keyDownHandler(e){
	if (e.key == "ArrowUp")
		r_up_pressed = true;
	else if (e.key == "ArrowDown")
		r_down_pressed = true;
}

function keyUpHandler(e){
	if (e.key == "ArrowUp")
		r_up_pressed = false;
	else if (e.key == "ArrowDown")
		r_down_pressed = false;
}

function drawBackGround(){
	ctx.fillStyle = '#000000';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawBall(){
	ctx.fillStyle = "white";
	ctx.beginPath();
	ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
	ctx.fill();
	ctx.closePath();
}

function drawPaddle(){
	ctx.beginPath();
	ctx.fillStyle = "green";
	ctx.fillRect(right_paddle.x, right_paddle.y, right_paddle.width, right_paddle.height);
	ctx.closePath();
}

function draw(){
	ball.x += ball.dx;
	ball.y += ball.dy;

	if (r_up_pressed && right_paddle.y > 0){
		right_paddle.y -= 10;
	}
	else if (r_down_pressed && right_paddle.y + right_paddle.height < canvas.height){
		right_paddle.y += 10;
	}

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawBackGround();
	drawBall();
	drawPaddle();
}

// const right_paddle = canvas.getContext("2d");
// const left_paddle = canvas.getContext("2d");
// const ball = canvas.getContext("2d");

// let right_paddle_y = 100;
// let left_paddle_y = 200;

// let ball_x = 100;
// let ball_y = 299;

// const right_paddle_up = document.getElementById("right-paddle-up");
// const right_paddle_down = document.getElementById("right-paddle-down");

// right_paddle.fillStyle = "blue";
// right_paddle.fillRect(canvas.width - 10, right_paddle_y, 10, 100);

// left_paddle.fillStyle = "green";
// left_paddle.fillRect(0, left_paddle_y, 10, 100);

// ball.fillStyle = "white";
// ball.fillRect(ball_x, ball_y, 10, 10);

// right_paddle_up.addEventListener("click", (e) => {
// 	e.preventDefault();
// 	right_paddle.fillStyle = "black";
// 	right_paddle.fillRect(canvas.width - 10, right_paddle_y, 10, 100);
// 	right_paddle_y -= 10;
// 	if (right_paddle_y < 0)
// 		right_paddle_y = 0;
// 	right_paddle.fillStyle = "blue";
// 	right_paddle.fillRect(canvas.width - 10, right_paddle_y, 10, 100);
// })

// right_paddle_down.addEventListener("click", (e) => {
// 	e.preventDefault();
// 	right_paddle.fillStyle = "black";
// 	right_paddle.fillRect(canvas.width - 10, right_paddle_y, 10, 100);
// 	right_paddle_y += 10;
// 	if (right_paddle_y > canvas.height - 100)
// 		right_paddle_y = canvas.height - 100;
// 	console.log(right_paddle_y);
// 	right_paddle.fillStyle = "blue";
// 	right_paddle.fillRect(canvas.width - 10, right_paddle_y, 10, 100);
// })



// make shape AClass -> paddle, ball
// should have boundary check
// should have contact check
// draw paddle
