const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
if (!canvas)
{
	throw new Error("Canvas element not found");
}
const ctx = canvas.getContext("2d");
const x_center = canvas.width / 2;
const y_center = canvas.height / 2;
const x = canvas.width;
const y = canvas.height;

let ball = { x: x_center, y: y_center, dx: 5, dy: -5, radius: 10};
let left_paddle = { x: 0, y: y_center, width: 20, height: 80};
let right_paddle = { x: x - 20, y: y_center - 40, width: 20, height: 80};

let r_up_pressed = false;
let r_down_pressed = false;
let l_up_pressed = false;
let l_down_pressed = false;

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
		intervalId = setInterval(draw, 20);
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
	else if (e.key == "a")
		l_up_pressed = true;
	else if (e.key == "z")
		l_down_pressed = true;
}

function keyUpHandler(e){
	if (e.key == "ArrowUp")
		r_up_pressed = false;
	else if (e.key == "ArrowDown")
		r_down_pressed = false;
	else if (e.key == "a")
		l_up_pressed = false;
	else if (e.key == "z")
		l_down_pressed = false;
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
	ctx.fillStyle = "blue";
	ctx.fillRect(left_paddle.x, left_paddle.y, left_paddle.width, left_paddle.height);
	ctx.closePath();
}

function draw(){
	ball.x += ball.dx;
	ball.y += ball.dy;

	// ボールが壁に当たった時
	if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height){
		ball.dy = ball.dy * -1;
	}else if (ball.x - ball.radius < 0 || ball.x - ball.radius > canvas.width){
		alert("GameOver");
		document.location.reload();
	}


	// パドルとの接触
	// right paddle
	if (ball.x - ball.radius > canvas.width - 40 && ball.y - ball.radius > right_paddle.y && ball.y - ball.radius < right_paddle.y + right_paddle.height)
	{
		ball.dx = -Math.abs(ball.dx);
	}
	else if (ball.x - ball.radius < 20 && ball.y - ball.radius > left_paddle.y && ball.y - ball.radius < left_paddle.y + left_paddle.height)
	{
		ball.dx = Math.abs(ball.dx);
	}

	//右のパドルの上下
	if (r_up_pressed && right_paddle.y > 0){
		right_paddle.y -= 10;
	}
	else if (r_down_pressed && right_paddle.y + right_paddle.height < canvas.height){
		right_paddle.y += 10;
	}

	//左のパドルの上下
	if (l_up_pressed && left_paddle.y > 0){
		left_paddle.y -= 10;
	}
	else if (l_down_pressed && left_paddle.y + left_paddle.height < canvas.height){
		left_paddle.y += 10;
	}

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawBackGround();
	drawBall();
	drawPaddle();
}


// make shape AClass -> paddle, ball
// should have boundary check
// should have contact check
// draw paddle
