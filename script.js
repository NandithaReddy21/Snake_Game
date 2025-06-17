window.addEventListener("DOMContentLoaded", () => {

    // Game constants & variables
    const GRID_SIZE = 18;
    let inputDir = { x: 0, y: 0 };
    let frameId;
    const foodSound = new Audio('music/food.mp3');
    const gameOverSound = new Audio('music/gameover.mp3');
    const moveSound = new Audio('music/move.mp3');
    const board = document.getElementById("board");
    const scoreBox = document.getElementById("score");
    const highScoreBox = document.getElementById("high-score");
    const startScreen = document.getElementById("start-screen");
    const gameContainer = document.getElementById("game-container");
    const startBtn = document.getElementById("start-btn");
    const pauseBtn = document.getElementById("pause-btn");
    const resumeBtn = document.getElementById("resume-btn");
    const restartBtn = document.getElementById("restart-btn");
    const winScreen = document.getElementById("win-screen");
    const winRestartBtn = document.getElementById("win-restart-btn");
    const gameOverScreen = document.getElementById("game-over-screen");
    const gameOverRestartBtn = document.getElementById("gameover-restart-btn");
    const finalScoreSpan = document.getElementById("final-score");
    const difficultySelect = document.getElementById("difficulty");
    difficultySelect.disabled = false;

    let speed = parseInt(difficultySelect.value);
    let score = 0;
    let lastPaintTime = 0;
    let snakeArr = [{ x: 13, y: 15 }];
    let food = { x: 6, y: 7 }; // object
    let isPaused = false;
    let gameRunning = false;
    let gameStarted = false;

    let highScore = localStorage.getItem("high-score");
    let highScoreVal = highScore ? JSON.parse(highScore) : 0;
    highScoreBox.innerHTML = "High Score :" + highScoreVal;

    const initGame = () => {
        cancelAnimationFrame(frameId);
        inputDir = {x : 0, y : 0 };
        snakeArr = [{x : 13, y : 15}];
        score = 0;
        gameStarted = false;
        isPaused = false;
        gameRunning = true;
        difficultySelect.disabled = false;
        scoreBox.innerHTML = "Score : 0";
        board.innerHTML = "";
        frameId = requestAnimationFrame(main);
    };

    // Button events
    startBtn.addEventListener("click", () => {
        startScreen.classList.add("hidden");
        gameContainer.classList.remove("hidden");
        difficultySelect.disabled = false;
        initGame();
    });

    pauseBtn.addEventListener("click", () => {
        isPaused = true;
        alert("Game is paused");
        pauseBtn.classList.add("hidden");
        resumeBtn.classList.remove("hidden");
        resumeBtn.classList.add("color1");

    });

    resumeBtn.addEventListener("click", () => {
        isPaused = false;
        resumeBtn.classList.add("hidden");
        pauseBtn.classList.remove("hidden");
        difficultySelect.disabled = true;
        pauseBtn.classList.remove("color1");
        frameId = requestAnimationFrame(main);
    });

    restartBtn.addEventListener("click", () => {
        initGame();
        resumeBtn.classList.add("hidden");
        pauseBtn.classList.remove("hidden");
    });

     winRestartBtn.addEventListener("click", () => {
        winScreen.classList.add("hidden");
        gameContainer.classList.remove("hidden");
        initGame();
    });

    gameOverRestartBtn.addEventListener("click", () => {
        gameOverScreen.classList.add("hidden");
        gameContainer.classList.remove("hidden");
        initGame();
    });


    // Game functions
    const main = (currTime) => {
        if(!gameRunning) return;
        frameId = requestAnimationFrame(main);
        if(isPaused || (currTime-lastPaintTime) / 1000 < 1/speed) return;
        lastPaintTime = currTime;
        gameEngine();
    };

    const isCollide = (snake) => {
        // Self-collision
        for (let i = 1; i < snakeArr.length; i++) {
            if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
                return true;
            }
        }

        // Wall collision
        if (snake[0].x <= 0 || snake[0].x >= 18 || snake[0].y <= 0 || snake[0].y >= 18) {
            return true;
        };
        return false;
    }

    const generateFood = () => {
        const totalCells = GRID_SIZE * GRID_SIZE;
        const occupied = new Set(snakeArr.map(cell => `${cell.x}-${cell.y}`));
        if(occupied.size === totalCells) {
            // Player wins!
            gameRunning = false;
            setTimeout(() => {
                winScreen.classList.remove("hidden");
                gameContainer.classList.add("hidden");
            }, 100);
            return;
        }

        let newFood;
        do {
            newFood = {
                x : Math.floor(Math.random() * 17) + 1,
                y : Math.floor(Math.random() * 17) + 1
            };
        } while (occupied.has(`${newFood.x}-${newFood.y}`));

        food = newFood;
    }

    const gameEngine = () => {
        // Game over
        if (isCollide(snakeArr)) {
            gameOverSound.play();
            gameRunning = false;
            finalScoreSpan.textContent = score;
            gameOverScreen.classList.remove("hidden");
            gameContainer.classList.add("hidden");
            difficultySelect.disabled = false;
            return;
        }

        // If snake eats the food, increment the score and regenerate the food
        if (snakeArr[0].x === food.x && snakeArr[0].y === food.y) {
            foodSound.play();
            score++;
            scoreBox.innerHTML = "Score: " + score;
            if (score > highScoreVal) {
                highScoreVal = score;
                localStorage.setItem("high-score", JSON.stringify(highScoreVal));
                highScoreBox.innerHTML = "High Score :" + highScoreVal;
            }
            snakeArr.unshift({
                x: snakeArr[0].x + inputDir.x,
                y: snakeArr[0].y + inputDir.y,
            });
            generateFood();
        }

        // Moving the snake
        for (let i = snakeArr.length - 2; i >= 0; i--) {
            snakeArr[i + 1] = { ...snakeArr[i] };
        }

        snakeArr[0].x += inputDir.x;
        snakeArr[0].y += inputDir.y;

        // Part 2: Display the snake and food

        // Display the snake
        board.innerHTML = "";
        snakeArr.forEach((e, index) => {
            const snakeElement = document.createElement("div");
            snakeElement.style.gridRowStart = e.y;
            snakeElement.style.gridColumnStart = e.x;
            snakeElement.classList.add(index === 0 ? "head" : "snake");
            board.appendChild(snakeElement);
        });

        // Display the food
        const foodElement = document.createElement("div");
        foodElement.style.gridRowStart = food.y;
        foodElement.style.gridColumnStart = food.x;
        foodElement.classList.add("food");
        board.appendChild(foodElement);
    }



    // Controls
    window.addEventListener("keydown", (e) => {
        if (!gameRunning || isPaused && e.key !== " ") return;

        if(!gameStarted) {
            speed = parseInt(difficultySelect.value);
            difficultySelect.disabled = true;
            gameStarted = true;
        }

        if(e.key !== " ") {
            moveSound.play();
        }
        switch (e.key) {
            case "ArrowUp":
                case "w":
                if (inputDir.y !== 1) inputDir = { x: 0, y: -1 };
                break;
            case "ArrowDown":
                case "s":
                if (inputDir.y !== -1) inputDir = { x: 0, y: 1 };
                break;
            case "ArrowLeft":
                case "a":
                if (inputDir.x !== 1) inputDir = { x: -1, y: 0 };
                break;
            case "ArrowRight":
                case "d":
                if (inputDir.x !== -1) inputDir = { x: 1, y: 0 };
                break;
            case " " :
                e.preventDefault();
                if(isPaused) {
                    resumeBtn.click();
                } else {
                    pauseBtn.click();
                }
                break;
            default:
                break;
        }
    });

});
