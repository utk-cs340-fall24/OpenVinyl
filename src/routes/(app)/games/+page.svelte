<script>
  import { onMount, onDestroy } from 'svelte';
  import { supabase } from '$lib/supabaseClient.js'; // Ensure this path is correct
  import { fly, fade } from 'svelte/transition'; // Importing Svelte transitions for animations

  let user = null;
  let balance = 0;
  let runVinylCount = 0; // Counter for vinyls earned in the current run
  let message = '';
  let isGameOver = false;
  let gameStarted = false; // State to track if the game has started
  let showBonusAnimation = false; // State to control the display of the bonus animation

  // Game Elements
  let bird;
  let gameContainer;
  let ground;

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
  const birdWidth = 65; // Updated width to match CSS
  const birdHeight = 55; // Updated height to match CSS
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
          console.log(`Fetching vinyl balance for user ID: ${user.id}`);
          // Fetch user's vinyl balance
          const { data, error } = await supabase
              .from('profiles')
              .select('vinyls')
              .eq('id', user.id)
              .single();

          if (error) {
              console.error('Error fetching vinyl balance:', error);
              message = 'Error fetching your balance.';
          } else {
              balance = data.vinyls ?? 0;
              console.log(`User balance fetched: ${balance} Vinyls`);
          }

          // Attempt to give daily bonus
          await giveDailyBonus();
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
  async function awardVinyl() {
      if (!user) return;
      balance += 1;
      runVinylCount += 1; // Increment the running vinyl counter
      console.log(`Awarding 1 Vinyl. New balance: ${balance}. Vinyls earned this run: ${runVinylCount}`);
      await updateBalance(balance);
      message = 'You earned 1 Vinyl!';
  }

  // Function to give daily bonus
  async function giveDailyBonus() {
      console.log('Attempting to give daily bonus...');
      const { data, error } = await supabase
          .rpc('give_daily_bonus', { user_id: user.id });

      if (error) {
          console.error('Error giving daily bonus:', error);
          return;
      }

      if (data) {
          console.log('Daily bonus awarded!');
          // Show bonus animation
          showBonusAnimation = true;

          // Optionally, you can update the balance directly if needed
          // balance += 100;
          // runVinylCount += 100;
          // message = 'You earned 100 Vinyls!';
      } else {
          console.log('Daily bonus already claimed today.');
      }

      // Refresh the balance display after attempting to give the bonus
      await fetchBalance();
  }

  // Function to fetch the latest balance
  async function fetchBalance() {
      if (!user) return;

      console.log(`Fetching updated vinyl balance for user ID: ${user.id}`);
      const { data, error } = await supabase
          .from('profiles')
          .select('vinyls')
          .eq('id', user.id)
          .single();

      if (error) {
          console.error('Error fetching updated vinyl balance:', error);
          message = 'Error fetching your balance.';
      } else {
          balance = data.vinyls ?? 0;
          console.log(`Updated balance fetched: ${balance} Vinyls`);
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
      topObstacle.style.bottom = (obstacleBottom + pipeHeightLocal + gap) + 'px'; // Position top obstacle from bottom

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
              if (birdBottom < obstacleBottom + pipeHeightLocal) {
                  console.log('Bird has collided with the bottom obstacle.');
                  gameOver();
                  clearInterval(timerId);
              }

              // Check collision with top obstacle
              if (birdTop > obstacleBottom + pipeHeightLocal + gap) {
                  console.log('Bird has collided with the top obstacle.');
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

          // Reset the running vinyl counter
          runVinylCount = 0;
          console.log('Run vinyl counter reset to 0.');
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
<div class="games-page">
  <h1 class="title">Games</h1>
  <div class="games-container">
      <div class="game-card">
          <a href="/plinko">
              <img src="/plinko.png" alt="Plinko Game" class="game-image" />
              <div class="game-title">Plinko</div>
          </a>
      </div>
      <div class="game-card">
          <a href="/flappyvinyl">
              <img src="/flappyvinyl.png" alt="Flappy Vinyl Game" class="game-image" />
              <div class="game-title">Flappy Vinyl</div>
          </a>
      </div>
      <div class="game-card">
        <a href="/vinylsweeper">
            <img src="/vinylsweeper.png" alt="Vinyl Sweeper Game" class="game-image" />
            <div class="game-title">Vinylsweeper</div>
        </a>
    </div>
      <!-- Add more game cards here when you have more games -->
  </div>
</div>

<!-- Bonus Animation Overlay -->
{#if showBonusAnimation}
  <div class="bonus-overlay">
      <div class="bonus-content" transition:fly|local={{ y: -200, duration: 500 }} >
          <h2>🎉 Daily Bonus!</h2>
          <p>You've received 100 Vinyls!</p>
          <!-- <img src="/bonus.gif" class="bonus-animation" /> -->
          <button on:click={() => showBonusAnimation = false} class="close-button">Collect</button>
      </div>
  </div>
{/if}

<style>
  /* Main Page Styling */
  .games-page {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 20px;
      background: #121212;
      min-height: 100vh;
      color: #ffffff;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  /* Title Styling */
  .title {
      font-size: 3em;
      margin-bottom: 50px;
      text-shadow: 0 0 15px rgba(0, 0, 0, 0.7);
  }

  /* Games Container */
  .games-container {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 40px;
  }

  /* Game Card Styling */
  .game-card {
      background-color: #222;
      border-radius: 15px;
      overflow: hidden;
      width: 300px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
      transition: transform 0.3s, box-shadow 0.3s;
  }

  .game-card:hover {
      transform: translateY(-15px);
      box-shadow: 0 20px 35px rgba(0, 0, 0, 0.7);
  }

  /* Game Image Styling */
  .game-image {
      width: 100%;
      height: 300px;
      object-fit: cover;
  }

  /* Game Title Styling */
  .game-title {
      padding: 20px;
      text-align: center;
      font-size: 1.8em;
      font-weight: bold;
      background-color: #ff6347;
      color: #fff;
      transition: background-color 0.3s;
  }

  .game-card:hover .game-title {
      background-color: #e5533d;
  }

  /* Link Styling */
  a {
      text-decoration: none;
      color: inherit;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
      .game-card {
          width: 80%;
      }
  }

  @media (max-width: 480px) {
      .title {
          font-size: 2.5em;
      }

      .game-title {
          font-size: 1.5em;
      }
  }

  /* Bonus Animation Overlay Styling */
  .bonus-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
  }

  .bonus-content {
      background: #3a3a3a;
      color: white;
      padding: 40px;
      border-radius: 15px;
      text-align: center;
      position: relative;
      width: 80%;
      max-width: 500px;
  }

  .bonus-content h2 {
      font-size: 2em;
      margin-bottom: 20px;
  }

  .bonus-content p {
      font-size: 1.2em;
      margin-bottom: 30px;
  }

  .bonus-animation {
      width: 100px;
      height: 100px;
      object-fit: cover;
      margin-bottom: 30px;
  }

  .close-button {
      padding: 10px 20px;
      background: linear-gradient(to right, #fe67c4, #5371fe);
      color: #fff;
      font-size: 1em;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s;
  }

  .close-button:hover {
      background: linear-gradient(to right, #fe67c4, #5371fe);
  }
</style>