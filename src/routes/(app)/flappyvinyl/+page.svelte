<script>
    import { onMount, onDestroy } from 'svelte';
    import { supabase } from '$lib/supabaseClient.js'; // Ensure this path is correct
    import { vinylBalance, fetchVinylBalance, addVinyls } from '$lib/vinylsStore.js';

    let user = null;
    let balance = 0;
    let message = '';
    let isGameOver = false;
    let gameStarted = false; // State to track if the game has started

    // Game Elements
    let bird;
    let gameContainer;
    let ground;
    let runVinylCount = 0;

    // Game State Variables
    let birdLeft = 220; // Defined at top level
    let birdBottom = 400; // Updated from 100 to 400 to position bird within the gap

    // Timers
    let gameTimerId;
    let obstacleTimers = []; // Array to track multiple obstacle timers
    let obstacleGeneratorTimerId; // Timer for generating obstacles

    // Constants
    const gravity = 2; // Reduced gravity for smoother gameplay
    const jumpHeight = 50;
    const birdWidth = 60; // Width of the bird in pixels
    const birdHeight = 45; // Height of the bird in pixels
    const pipeWidth = 60; // Width of the pipes in pixels
    const pipeHeight = 300; // Height of the pipes in pixels
    const gap = 150; // Gap between top and bottom pipes in pixels

    // Sound Effect (Optional)
    let scoreSound;

    // Function to fetch user session and balance
    async function fetchUser() {
        console.log('Fetching user session...');
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
            console.error('Session Error:', sessionError);
            message = 'Error fetching session. Please try again.';
            return;
        }

        user = sessionData?.session?.user;
        console.log('User fetched:', user);

        if (user) {
            vinylBalance.subscribe(value => {
                balance = value;
            });
        } else {
            message = 'Please log in to play the game.';
            console.log('No user logged in.');
        }
    }

    // Function to update vinyl balance in the database
    async function updateBalance(newBalance) {
        if (!user) return;

        console.log(`Updating vinyl balance to ${newBalance} for user ID: ${user.id}`);
        const { error } = await supabase
            .from('profiles')
            .update({ vinyls: newBalance })
            .eq('id', user.id);

        if (error) {
            console.error('Error updating vinyl balance:', error);
            message = 'Error updating balance. Please try again.';
        } else {
            console.log('Vinyl balance updated successfully.');
        }
    }

    // Function to award a vinyl
    async function awardVinyl(amount = 1) {
        if (!user) return;

        const success = await addVinyls(user.id, amount);
        if (success) {
            message = `You earned ${amount} Vinyl${amount > 1 ? 's' : ''}!`;
            // Optionally, show a toast or animation
        } else {
            message = 'Failed to award Vinyls.';
        }
    }

    // Function to start the game loop
    function startGameLoop() {
        if (isGameOver) return;
        birdBottom -= gravity;
        bird.style.bottom = birdBottom + 'px';
        bird.style.left = birdLeft + 'px';
        // console.log(`Bird position - Left: ${birdLeft}, Bottom: ${birdBottom}`);

        if (birdBottom <= 0) {
            console.log('Bird has hit the ground.');
            gameOver();
        }
    }

    // Jump control
    function control(e) {
        if (e.key === ' ' || e.code === 'Space') {
            e.preventDefault(); // Prevent page from scrolling
            jump();
        }
    }

    function jump() {
        if (isGameOver) return;
        if (birdBottom < (gameContainer.clientHeight - ground.clientHeight) - birdHeight) {
            birdBottom += jumpHeight;
            bird.style.bottom = birdBottom + 'px';
            console.log(`Bird jumped to position - Bottom: ${birdBottom}`);

            // Optionally play sound on jump
            if (scoreSound) {
                scoreSound.currentTime = 0;
                scoreSound.play();
                console.log('Jump sound played.');
            }
        } else {
            console.log('Jump ignored: Bird is at maximum height.');
        }
    }

    // Function to generate obstacles
    function generateObstacle() {
        if (isGameOver) return;

        let obstacleLeft = gameContainer.clientWidth;
        const pipeWidthLocal = pipeWidth; // Use global constant
        const pipeHeightLocal = pipeHeight; // Use global constant

        // Ensure obstacleBottom is set to prevent immediate collision
        const minObstacleBottom = 200; // Minimum height to ensure space for the bird
        const maxObstacleBottom = gameContainer.clientHeight - ground.clientHeight - pipeHeightLocal - gap - minObstacleBottom;
        const obstacleBottom = minObstacleBottom + Math.random() * maxObstacleBottom;
        const obstacleTop = obstacleBottom + pipeHeightLocal + gap;

        console.log(`Generating new obstacles at left: ${obstacleLeft}, bottom: ${obstacleBottom}`);

        const obstacle = document.createElement('div');
        const topObstacle = document.createElement('div');

        obstacle.classList.add('obstacle');
        topObstacle.classList.add('topObstacle');

        // Initialize obstacle as not passed
        obstacle.dataset.passed = 'false';
        topObstacle.dataset.passed = 'false';

        gameContainer.appendChild(obstacle);
        gameContainer.appendChild(topObstacle);

        obstacle.style.left = obstacleLeft + 'px';
        topObstacle.style.left = obstacleLeft + 'px';
        obstacle.style.bottom = obstacleBottom + 'px';
        topObstacle.style.bottom = obstacleBottom + pipeHeightLocal + gap + 'px'; // Position top obstacle from bottom

        console.log(`Obstacle positioned at Left: ${obstacleLeft}, Bottom: ${obstacleBottom}`);
        console.log(`Top Obstacle positioned at Left: ${obstacleLeft}, Bottom: ${obstacleBottom + pipeHeightLocal + gap}`);

        // Move obstacles
        function moveObstacle() {
            if (isGameOver) {
                console.log('Game is over. Stopping obstacle movement.');
                clearInterval(timerId);
                return;
            }

            obstacleLeft -= 2;
            obstacle.style.left = obstacleLeft + 'px';
            topObstacle.style.left = obstacleLeft + 'px';

            // Award vinyl if obstacle passes the bird
            if (
                obstacleLeft + pipeWidthLocal < birdLeft &&
                obstacle.dataset.passed === 'false'
            ) {
                obstacle.dataset.passed = 'true';
                topObstacle.dataset.passed = 'true';
                console.log('Obstacle passed the bird. Awarding vinyl.');
                awardVinyl();
            }

            // Collision detection
            // Calculate relative positions
            const birdRight = birdLeft + birdWidth;
            const birdTop = birdBottom + birdHeight;

            // Check if obstacle is overlapping horizontally with the bird
            if (obstacleLeft < birdRight && obstacleLeft + pipeWidthLocal > birdLeft) {
                console.log('Obstacle is horizontally overlapping with the bird.');

                // Check collision with bottom obstacle
                if (birdBottom+150 < obstacleBottom + pipeHeightLocal) {
                    // console.log('Bird has collided with the bottom obstacle.');
                    // console.log("bottom obstacle tallest point: ", obstacleBottom + pipeHeightLocal)
                    gameOver();
                    clearInterval(timerId);
                }
                // console.log("top opstacle lowest point: ", obstacleBottom + pipeHeightLocal + gap+300)
                // Check collision with top obstacle
                if (birdTop > obstacleBottom + pipeHeightLocal + gap-170) {
                    // console.log('Bird has collided with the top obstacle.');
                    gameOver();
                    clearInterval(timerId);
                }
            }

            // Remove obstacles that have moved off screen
            if (obstacleLeft < -pipeWidthLocal) {
                console.log('Obstacle has moved off screen. Removing obstacles.');
                clearInterval(timerId);
                gameContainer.removeChild(obstacle);
                gameContainer.removeChild(topObstacle);
            }
        }

        let timerId = setInterval(moveObstacle, 20);
        obstacleTimers.push(timerId);
    }

    // Function to start generating obstacles at intervals
    function startObstacleGenerator() {
        console.log('Starting obstacle generator.');
        obstacleGeneratorTimerId = setInterval(() => {
            if (!isGameOver) {
                generateObstacle();
            }
        }, 3000);
    }

    // Function to stop generating obstacles
    function stopObstacleGenerator() {
        if (obstacleGeneratorTimerId) {
            console.log('Stopping obstacle generator.');
            clearInterval(obstacleGeneratorTimerId);
        }
    }

    // Function to start the game
    function startGame() {
        if (gameStarted) {
            console.log('Game already started.');
            return;
        }

        // Reset game state if game was over
        if (isGameOver) {
            console.log('Restarting game.');
            isGameOver = false;
            message = '';
            // Reset bird position to within the gap
            birdLeft = 220;
            birdBottom = 400; // Updated from 100 to 400
            bird.style.left = birdLeft + 'px';
            bird.style.bottom = birdBottom + 'px';
            console.log(`Bird position reset to Left: ${birdLeft}, Bottom: ${birdBottom}`);

            // Remove existing obstacles
            const obstacles = gameContainer.querySelectorAll('.obstacle, .topObstacle');
            obstacles.forEach(obstacle => {
                console.log('Removing existing obstacle:', obstacle);
                gameContainer.removeChild(obstacle);
            });

            // Clear obstacle timers
            obstacleTimers.forEach(timer => {
                console.log('Clearing obstacle timer:', timer);
                clearInterval(timer);
            });
            obstacleTimers = [];

            // Reset ground animation
            ground.classList.add('ground-moving');
            ground.classList.remove('ground');
            console.log('Ground animation reset.');
            runVinylCount = 0;

        }

        gameStarted = true;
        console.log('Starting game loop.');
        gameTimerId = setInterval(startGameLoop, 20);
        generateObstacle();
        startObstacleGenerator();

        // Add keyup listener when game starts
        window.addEventListener('keyup', control);
        console.log('Keyup event listener added.');

        // Focus the window to ensure it receives key events
        window.focus();
        console.log('Window focused for keyboard events.');
    }

    // Game Over Function
    function gameOver() {
        console.log('Game Over triggered.');
        clearInterval(gameTimerId);
        gameStarted = false;
        isGameOver = true;
        message = 'Game Over!';
        window.removeEventListener('keyup', control);
        console.log('Keyup event listener removed.');
        stopObstacleGenerator();

        // Reset ground animation
        ground.classList.add('ground');
        ground.classList.remove('ground-moving');
        console.log('Ground animation stopped.');
    }

    // Cleanup on component destroy
    // onDestroy(() => {
    //     console.log('Component is being destroyed. Cleaning up.');
    //     clearInterval(gameTimerId);
    //     obstacleTimers.forEach(timer => {
    //         console.log('Clearing obstacle timer during cleanup:', timer);
    //         clearInterval(timer);
    //     });
    //     obstacleTimers = [];
    //     stopObstacleGenerator();
    //     window.removeEventListener('keyup', control);
    //     console.log('Keyup event listener removed during cleanup.');
    // });

    onMount(async () => {
        console.log('Component mounted. Fetching user.');
        await fetchUser();

        await fetchVinylBalance(user.id);

        // Initialize sound
        // Uncomment and replace with your sound file path if you have one
        // scoreSound = new Audio('/path_to_your_score_sound.mp3'); // Replace with your sound file path
        // console.log('Score sound initialized.');

        // Initialize game elements
        bird = document.querySelector('.bird');
        gameContainer = document.querySelector('.game-container');
        ground = document.querySelector('.ground-moving');

        // Initially position the bird
        bird.style.left = birdLeft + 'px';
        bird.style.bottom = birdBottom + 'px';
        console.log(`Bird initially positioned at Left: ${birdLeft}, Bottom: ${birdBottom}`);
    });
</script>

<!-- Flappy Bird Game Section -->
<div class="flappy-vinyl-game">
    <div class="balance-display">
        {#if user}
            <span class="font-bold">Balance:</span> <span>{balance} Vinyls</span>
        {:else}
            <span>Please log in to see your balance.</span>
        {/if}
    </div>
    
    <div class="instruction-display">
        Press <strong>Spacebar</strong> to flap
    </div>
    <button
        on:click={startGame}
        class="start-button"
        disabled={gameStarted || !user}
    >
        {isGameOver ? 'Restart Game' : 'Start Game'}
    </button>
    <div class="game-container">
        <div class="border-left"></div>
        <div class="border-top"></div>
        <div class="sky">
            <div class="bird"></div>
        </div>
        <div class="ground-container">
            <div class="ground-moving"></div>
        </div>
        <div class="border-right"></div>
    </div>
    <!-- <div class="message-display">{message}</div> -->
    {#if user}
    <div class="message-display">
        <span class="font-bold">Vinyls This Run:</span> <span>{runVinylCount}</span>
    </div>
{/if}
</div>

<style>
    /* Flappy Bird Game Styles */
    .flappy-vinyl-game {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #fff;
        margin: 20px;
    }

    .balance-display {
        margin-bottom: 10px;
        font-size: 1.2em;
    }

    .instruction-display {
        margin-bottom: 10px;
        font-size: 1.2em;
    }

    .start-button {
        padding: 10px 20px;
        background-color: #1db954;
        color: #fff;
        font-size: 1.2em;
        font-weight: bold;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s;
        margin-bottom: 20px;
    }

    .start-button:hover:not(:disabled) {
        background-color: #17a44d;
    }

    .start-button:disabled {
        background-color: #999;
        cursor: not-allowed;
    }

    .game-container {
        width: 500px;
        height: 730px;
        position: relative;
        background-image: url('/fb-game-background.png'); /* Ensure this path is correct */
        background-size: cover;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 0 10px #000;
    }

    /* Make obstacle styles global */
    :global(.obstacle) {
        background-image: url('/flappybird-pipe.png'); /* Ensure this path is correct */
        width: 60px;
        height: 300px;
        position: absolute;
        background-size: cover;
    }

    :global(.topObstacle) {
        background-image: url('/flappybird-pipe.png'); /* Ensure this path is correct */
        transform: rotate(180deg);
        width: 60px;
        height: 300px;
        position: absolute;
        background-size: cover;
    }

    .border-left {
        width: 80px;
        height: 790px;
        position: absolute;
        background-color: white;
        z-index: 2;
        left: -80px;
        top: 0;
    }

    .border-right {
        width: 80px;
        height: 790px;
        position: absolute;
        background-color: white;
        z-index: 2;
        right: -80px;
        top: 0;
    }

    .border-top {
        width: 660px;
        height: 50px;
        position: absolute;
        background-color: white;
        z-index: 2;
        top: -50px;
        left: -80px;
    }

    .sky {
        width: 500px;
        height: 580px;
        position: absolute;
        top: 0;
        left: 0;
    }

    .bird {
        background-image: url('/flappy-bird.png'); /* Ensure this path is correct */
        position: absolute;
        width: 65px;
        height: 55px;
        left: 220px;
        bottom: 400px; /* Updated from 100px to 400px */
        background-size: cover;
    }

    @keyframes slideright {
        from {
            background-position: 100%;
        }
        to {
            background-position: 0%;
        }
    }

    @-webkit-keyframes slideright {
        from {
            background-position: 100%;
        }
        to {
            background-position: 0%;
        }
    }

    .ground-container {
        height: 150px;
        width: 100%;
        position: absolute;
        bottom: 0;
        left: 0;
    }

    .ground-moving {
        position: absolute;
        top: 0;
        height: 150px;
        background-image: url('/bottom-background.png'); /* Ensure this path is correct */
        background-repeat: repeat-x;
        animation: slideright 10s infinite linear; /* Adjust animation speed as needed */
        -webkit-animation: slideright 10s infinite linear;
        width: 200%; /* Increased to allow seamless looping */
        z-index: 1;
    }

    .ground {
        /* Styles for static ground after game over */
        background-image: none;
        background-color: #654321; /* Example color */
    }

    .message-display {
        margin-top: 10px;
        color: #ffcc00;
        font-weight: bold;
        font-size: 1.1em;
    }

    .multiplier-label {
        position: absolute;
        font-size: 12px;
    }
</style>