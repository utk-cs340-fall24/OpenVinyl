<!-- src/components/SnakeGame.svelte -->
<script>
    import { onMount, onDestroy } from 'svelte';
    import { supabase } from '$lib/supabaseClient.js';
    import { addVinyls } from '$lib/vinylsStore.js'; // Ensure this path is correct
    import { fly, fade } from 'svelte/transition';

    let user = null;
    let message = '';
    let gameOver = false;
    let score = 0;

    // Game settings
    const gridSize = 20; // Size of each grid cell in pixels
    const initialSnake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    let snake = [...initialSnake];
    let direction = { x: 1, y: 0 }; // Initial direction: right
    let apple = getRandomApple();

    let gameInterval;

    // Function to get a random apple position
    function getRandomApple() {
        const max = 29; // Assuming a 30x30 grid
        let newApple;
        do {
            newApple = {
                x: Math.floor(Math.random() * max),
                y: Math.floor(Math.random() * max)
            };
        } while (snake.some(segment => segment.x === newApple.x && segment.y === newApple.y));
        return newApple;
    }

    // Handle key presses for direction changes
    function handleKeyDown(event) {
        console.log(event.key)
        switch (event.key) {
            case 'ArrowUp':
                if (direction.y !== 1) direction = { x: 0, y: -1 };
                break;
            case 'ArrowDown':
                if (direction.y !== -1) direction = { x: 0, y: 1 };
                break;
            case 'ArrowLeft':
                if (direction.x !== 1) direction = { x: -1, y: 0 };
                break;
            case 'ArrowRight':
                if (direction.x !== -1) direction = { x: 1, y: 0 };
                break;
        }
    }

    // Game loop
    async function moveSnake() {
        const newHead = {
            x: snake[0].x + direction.x,
            y: snake[0].y + direction.y
        };

        // Debug: Log new head position
        // console.log('New Head:', newHead);

        // Check for wall collisions
        if (newHead.x < 0 || newHead.x >= 30 || newHead.y < 0 || newHead.y >= 30) {
            endGame();
            return;
        }

        // Check for self-collision
        if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
            endGame();
            return;
        }

        // Add new head to the snake
        snake = [newHead, ...snake];

        // Check if apple is eaten
        if (newHead.x === apple.x && newHead.y === apple.y) {
            score += 1;
            const success = await addVinyls(user.id, 1);
            if (success) {
                message = `You earned 1 Vinyl!`;
            } else {
                message = `Failed to add Vinyl.`;
            }
            apple = getRandomApple();
        } else {
            // Remove the tail
            snake = snake.slice(0, -1);
        }
    }

    // Start the game
    function startGame() {
        gameOver = false;
        score = 0;
        snake = [...initialSnake];
        direction = { x: 1, y: 0 };
        apple = getRandomApple();
        message = '';
        clearInterval(gameInterval);
        gameInterval = setInterval(moveSnake, 200);
        console.log("test")
    }

    // End the game
    function endGame() {
        clearInterval(gameInterval);
        gameOver = true;
        message = `Game Over! Your score: ${score}`;
    }

    // Helper function to determine if a cell is part of the snake
    function isSnake(col, row) {
        return snake.some(segment => segment.x === col && segment.y === row);
    }

    // Initialize the game
    onMount(async () => {
        const { data: session } = await supabase.auth.getSession();
        user = session?.session?.user;

        if (!user) {
            message = 'Please log in to play the game.';
            return;
        }

        window.addEventListener('keydown', handleKeyDown);
        startGame();
    });

    // Cleanup on destroy
  
</script>

<!-- Game UI -->
<div class="snake-game">
    <h2>Snake Game</h2>
    {#if message}
        <div class="message" transition:fade>
            {message}
        </div>
    {/if}
    <div class="game-board">
        {#each Array(30) as _, row}
            <div class="row">
                {#each Array(30) as _, col}
                    <div
                        class="cell"
                        class:snake={isSnake(col, row)}
                        class:apple={apple.x === col && apple.y === row}
                    >
                        {#if apple.x === col && apple.y === row}
                            <div class="apple-content"></div>
                        {/if}
                    </div>
                {/each}
            </div>
        {/each}
    </div>
    <div class="score">Score: {score}</div>
    {#if gameOver && user}
        <button on:click={startGame} class="restart-button" transition:fly>
            Restart Game
        </button>
    {/if}
</div>

<style>
    .snake-game {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 20px 0;
        background-color: #2c2c2c; /* Dark background */
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
        color: #ffffff; /* Light text for contrast */
        position: relative; /* For message positioning */
    }

    .snake-game h2 {
        margin-bottom: 10px;
        color: #ffffff;
    }

    .game-board {
        display: grid;
        grid-template-rows: repeat(30, 20px);
        grid-template-columns: repeat(30, 20px);
        gap: 1px;
        background-color: #1e1e1e; /* Dark grid background */
        margin: 10px 0;
        border: 2px solid #ffffff;
    }

    .row {
        display: contents;
    }

    .cell {
        width: 20px;
        height: 20px;
        background-color: #333333; /* Dark cells */
        position: relative;
    }

    .snake {
        background-color: #28a745; /* Green snake */
    }

    .apple {
        background-color: transparent;
    }

    /* Apple representation */
    .apple-content {
        width: 100%;
        height: 100%;
        background-color: #dc3545; /* Red apple */
        border-radius: 50%;
    }

    .score {
        font-size: 1.2em;
        margin-bottom: 10px;
        color: #ffffff;
    }

    .message {
        position: absolute;
        top: 10px;
        background: rgba(220, 53, 69, 0.9); /* Semi-transparent red background */
        padding: 10px 20px;
        border-radius: 5px;
        color: #fff;
        font-weight: bold;
        animation: fadeInOut 2s forwards;
    }

    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(-20px); }
        10% { opacity: 1; transform: translateY(0); }
        90% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-20px); }
    }

    .restart-button {
        padding: 10px 20px;
        background-color: #007bff; /* Blue button */
        color: #fff;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    .restart-button:hover {
        background-color: #0056b3; /* Darker blue on hover */
    }
</style>