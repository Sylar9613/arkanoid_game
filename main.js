const canvas = document.getElementById('gameCanvas');
const canvasSetup = document.getElementById('setupCanvas');
const ctx = canvas.getContext('2d');
const ctxSetup = canvasSetup.getContext('2d');

// GAME SETUP
const $sprite = document.querySelector('#sprite');
const $bricks = document.querySelector('#bricks');
const $hearts = document.querySelector('#heart');

canvas.width = 448;
canvas.height = 400;
canvasSetup.width = 448;
canvasSetup.height = 100;

// GAME VARIABLES

// Lives function
let lives = 3;

function decreaseLives() {
    lives--;
    if (lives < 1) {
        alert("Game over");
        drawGameOver();
        gameOver = true;
    } else {
        ballX = canvas.width / 2;
        ballY = canvas.height - 30;
        ballSpeedX = -3;
        ballSpeedY = -3;
        paddlePositionX = (canvas.width - paddleWidth) / 2;
    }
}

// Ball variables
const ballRadius = 4;
// Ball position
let ballX = canvas.width / 2;
let ballY = canvas.height - 30;
// Ball speed
let ballSpeedX = -3;
let ballSpeedY = -3;

// Paddle variables
const PADDLE_SENSITIVITY = 8;

const paddleHeight = 10;
const paddleWidth = 50;
// Paddle position
let paddlePositionX = (canvas.width - paddleWidth) / 2;
let paddlePositionY = canvas.height - paddleHeight - 10;
// Keyboard variables
let rightPressed = false;
let leftPressed = false;

// Bricks variables
const brickRowCount = 6;
const brickColumnCount = 13;
const brickWidth = 32;
const brickHeight = 16;
const brickPadding = 0;
const brickOffsetTop = 50; // 80
const brickOffsetLeft = 16;

const bricks = [];

// Const brick variables
const BRICK_STATUS = {
    ACTIVE: 1,
    DESTROYED: 0
}

// Score Variables

let score = 0;
const scoreVariables = [10, 20, 30, 40, 50, 60, 70, 80];

for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = []; // Initialize the bricks empty array
    for (let r = 0; r < brickRowCount; r++) {
        // Calculate the position of the brick on screen
        const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
        const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
        // Asignar un color aleatorio a cada brick
        const random = Math.floor(Math.random() * 8);
        // Este truco es importante para asignar numeros aleatorios, en este caso va del 0 al 7.

        // Save the position of the brick
        bricks[c][r] = {
            x: brickX,
            y: brickY,
            status: BRICK_STATUS.ACTIVE,
            color: random,
            score: scoreVariables[random]
        };
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.closePath();
 }

function drawPaddle() { 
    /* ctx.fillStyle = '#0095DD';
    ctx.fillRect(
        paddlePositionX,
        paddlePositionY,
        paddleWidth,
        paddleHeight
    ); */
    ctx.drawImage(
        $sprite,
        29,
        174,
        paddleWidth,
        paddleHeight,
        paddlePositionX,
        paddlePositionY,
        paddleWidth,
        paddleHeight
    );
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const currentBrick = bricks[c][r];
            if (currentBrick.status === BRICK_STATUS.DESTROYED) {
                continue;
            }
            /* ctx.beginPath();
            ctx.fillStyle = 'yellow';
            ctx.rect(
                currentBrick.x,
                currentBrick.y,
                brickWidth,
                brickHeight
            );
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fill();
            ctx.closePath(); */

            // Lo multiplico por 32 xq es el tamaño en px de cada brick en la imagen, para q me de el px donde empieza el brick siguiente
            const clipX = currentBrick.color * 32;

            ctx.drawImage(
                $bricks,
                clipX,
                0,
                brickWidth, // 31
                brickHeight, // 14
                currentBrick.x,
                currentBrick.y,
                brickWidth,
                brickHeight
            );
        }
    }
}
 
function drawUI() {
    ctx.fillText(`FPS: ${framesPerSec}`, 5, 10)
}

function drawScore() {
    ctx.fillText(`Score: ${score}`, 380, 10)
}

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const currentBrick = bricks[c][r];
            if (currentBrick.status === BRICK_STATUS.DESTROYED) {
                continue;
            }
            // Calculate the position of the ball on screen
            const isBallSameXAsBrick =
                ballX > currentBrick.x &&
                ballX < currentBrick.x + brickWidth;

            const isBallSameYAsBrick =
                ballY > currentBrick.y &&
                ballY < currentBrick.y + brickHeight;

            if (isBallSameXAsBrick && isBallSameYAsBrick) {
                ballSpeedY = -ballSpeedY;
                currentBrick.status = BRICK_STATUS.DESTROYED;
    
                // Increase the score
                score += currentBrick.score;
            }
        }
    }
}

function ballMovement() {
    // Left and right boundaries
    if (ballX + ballSpeedX < ballRadius || // left
        ballX + ballSpeedX > canvas.width - ballRadius) // right
    {
        ballSpeedX = -ballSpeedX;
    }
    // Top boundaries
    if (ballY + ballSpeedY < ballRadius) // top        
    {
        ballSpeedY = -ballSpeedY;
    }
    // Game over
    else {
        if (ballY + ballSpeedY > canvas.height - ballRadius) {
            if (ballX > paddlePositionX && ballX < paddlePositionX + paddleWidth) {
                ballSpeedY = -ballSpeedY;
            }
            else {
                decreaseLives();
            }
        }
    }
    // Paddle collision
    if (
        ballX > paddlePositionX && // paddle and ball same X
        ballX < paddlePositionX + paddleWidth && // paddle and ball same X
        ballY + ballSpeedY > paddlePositionY &&// paddle and ball same Y touching
        ballY < paddlePositionY + paddleHeight
    ) {
        ballSpeedY = -ballSpeedY;
    }
    
    ballX += ballSpeedX;
    ballY += ballSpeedY;
 }

function paddleMovement() {
    if (rightPressed && paddlePositionX < canvas.width - paddleWidth) {
        paddlePositionX += PADDLE_SENSITIVITY;
    } else if (leftPressed && paddlePositionX > 0) {
        paddlePositionX -= PADDLE_SENSITIVITY;
    }
 }

function cleanCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctxSetup.clearRect(0, 0, canvasSetup.width, canvasSetup.height);
}

function initEvents() {
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);
    document.addEventListener('keydown', pauseHandler);

    function keyDownHandler(event) {
        const { key } = event;
        if (key === 'Right' || key === 'ArrowRight' || key.toLowerCase() === 'd') {
            rightPressed = true;
        } else if (key === 'Left' || key === 'ArrowLeft' || key.toLowerCase() === 'a') {
            leftPressed = true;
        }
    }
    function keyUpHandler(event) {
        const { key } = event;
        if (key === 'Right' || key === 'ArrowRight' || key.toLowerCase() === 'd') {
            rightPressed = false;
        } else if (key === 'Left' || key === 'ArrowLeft' || key.toLowerCase() === 'a') {
            leftPressed = false;
        }
    }
    function pauseHandler(event) {
        if (event.code === 'Space') {
            pauseGame();
        }
        if (event.code === 'Escape') {
            resetGame();
        }
        if (event.code === 'Space' && gameOver) {
            resetGame();
        }
    }
}
   
// a que velocidad de fps queremos que renderice nuestro juego
const fps = 60
  
let msPrev = window.performance.now()
let msFPSPrev = window.performance.now() + 1000;
const msPerFrame = 1000 / fps
let frames = 0
let framesPerSec = fps;

let gameOver = false;

// Pause function
let paused = false;

function pauseGame() {
    paused =!paused;
    if (paused) {
        cancelAnimationFrame(draw);
    } else {
        draw();
    }
}

// Reset function

function resetGame() {
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = []; // Initialize the bricks empty array
        for (let r = 0; r < brickRowCount; r++) {
            // Calculate the position of the brick on screen
            const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
            const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
            // Asignar un color aleatorio a cada brick
            const random = Math.floor(Math.random() * 8);
            // Este truco es importante para asignar numeros aleatorios, en este caso va del 0 al 7.

            // Save the position of the brick
            bricks[c][r] = {
                x: brickX,
                y: brickY,
                status: BRICK_STATUS.ACTIVE,
                color: random,
                score: scoreVariables[random]
            };
        }
    }
    ballX = canvas.width / 2;
    ballY = canvas.height - 30;
    ballSpeedX = -3;
    ballSpeedY = -3;
    paddlePositionX = (canvas.width - paddleWidth) / 2;
    score = 0;
    lives = 3;
    gameOver = false;
    paused = false;
    draw();
}

function drawGameOver() {
    eraseLives();
    ctxSetup.fillStyle = '#fff';
    ctxSetup.font = '24px Arial';
    ctxSetup.textAlign = 'center';
    ctxSetup.fillText('Game Over!', canvasSetup.width / 2, canvasSetup.height / 2);
    ctxSetup.fillText('Press Space to play again!', canvasSetup.width / 2, canvasSetup.height / 2 + 30);
}

function drawOneLive(posX) {
    /* ctxSetup.font = '20px Arial';
    ctxSetup.fillStyle = '#fff';
    ctxSetup.fillText('Lives: '+ lives, canvasSetup.width / 10, 90); */
    ctxSetup.drawImage(
        $hearts,
        25,
        10,
        351,
        284,
        posX,
        50,
        30,
        30
    );
}
function drawLives() {
    for (var i = 0; i < lives; i++) {
        drawOneLive(i*30);
    }
}

function eraseLives() {
    ctxSetup.clearRect(0, 0, canvasSetup.width, canvasSetup.height);
}

function draw() {
    if (gameOver) return;

    // Pause the game
    if (paused) return;

    // Update the game state
    window.requestAnimationFrame(draw);

    // Calculate the elapsed time since the last frame
    const msNow = window.performance.now()
    const msPassed = msNow - msPrev

    if (msPassed < msPerFrame) return

    const excessTime = msPassed % msPerFrame
    msPrev = msNow - excessTime

    frames++

    if (msFPSPrev < msNow)
    {
      msFPSPrev = window.performance.now() + 1000
      framesPerSec = frames;
      frames = 0;
    }

    // Clear the canvas
    cleanCanvas();
    // Draw the elements
    drawBall();
    drawPaddle();
    drawBricks();
    drawUI();
    drawScore();
    drawLives();
    /* 
    drawGameOver();
    drawLevelClear();
    drawLevelComplete();
    drawLevelFailed();
    drawStartScreen();
    drawInstructions();
    drawTitleScreen();
    drawWinScreen(); */

    // Check for collisions and movements
    collisionDetection();
    ballMovement();
    paddleMovement();
}

draw();

initEvents();