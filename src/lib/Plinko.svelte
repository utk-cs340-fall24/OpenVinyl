<script>
  import Matter from 'matter-js';
  import { onMount } from 'svelte';

  let engine, world, render, runner;
  let dropBall;
  let multiplierSlots = [];
  let balance = 50; // Starting balance in vinyls
  let message = ''; // Message to display last win
  const ballCost = 1; // Cost per ball in vinyls

  // Matter.js modules
  const Engine = Matter.Engine;
  const Render = Matter.Render;
  const Runner = Matter.Runner;
  const Composite = Matter.Composite;
  const Bodies = Matter.Bodies;
  const Events = Matter.Events;
  const Body = Matter.Body;

  // Define collision categories and groups
  const defaultCategory = 0x0001;
  const ballCategory = 0x0002;

  onMount(() => {
    createScene();
  });

  function createScene() {
    // Create engine and world
    engine = Engine.create();
    world = engine.world;

    // Adjust physics settings
    engine.positionIterations = 10;
    engine.velocityIterations = 10;
    engine.constraintIterations = 4;

    // Create renderer
    render = Render.create({
      element: document.getElementById('matter-js'),
      engine: engine,
      options: {
        width: 800,
        height: 800,
        background: '#333333', // Changed background color for better contrast
        wireframes: false,
      },
    });

    Render.run(render);

    // Create runner
    runner = Runner.create();
    Runner.run(runner, engine);

    // Add boundaries
    Composite.add(world, [
      Bodies.rectangle(400, -25, 800, 50, {
        isStatic: true,
        collisionFilter: {
          category: defaultCategory,
          mask: ballCategory | defaultCategory,
        },
      }),
      Bodies.rectangle(400, 825, 800, 50, {
        isStatic: true,
        label: 'BottomBoundary',
        collisionFilter: {
          category: defaultCategory,
          mask: ballCategory | defaultCategory,
        },
      }),
      Bodies.rectangle(825, 400, 50, 800, {
        isStatic: true,
        collisionFilter: {
          category: defaultCategory,
          mask: ballCategory | defaultCategory,
        },
      }),
      Bodies.rectangle(-25, 400, 50, 800, {
        isStatic: true,
        collisionFilter: {
          category: defaultCategory,
          mask: ballCategory | defaultCategory,
        },
      }),
    ]);

    // Add pegs
    createPegs();

    // Add multiplier slots
    createMultiplierSlots();

    // Drop ball function
    dropBall = () => {
      if (balance < ballCost) {
        message = "You don't have enough vinyls!";
        return;
      }
      balance -= ballCost; // Deduct cost per ball

      // Reduce variation of the dropping point to make it more likely to drop in the middle
      const randomOffset =
        (Math.random() + Math.random() + Math.random() - 1.5) * 30; // Range approx -75 to +75, centered at 0
      const xPosition = 400 + randomOffset; // Centered at 400

      // Create a single circle with both stroke and sprite
      const ball = Bodies.circle(xPosition, 50, 18, { // Increased radius from 18 to 22
        collisionFilter: {
          group: -1, // Balls will not collide with each other
          category: ballCategory,
          mask: defaultCategory, // Collide with defaultCategory (pegs, boundaries)
        },
        restitution: 0.5,
        label: 'Ball',
        render: {
          strokeStyle: '#ffffff',
          lineWidth: 4,
          fillStyle: 'transparent',
          sprite: {
            texture: 'logo.svg',
            xScale: 0.1, // Adjusted scale for larger ball
            yScale: 0.1,
          },
        },
      });

      Composite.add(world, ball);
    };

    // Event for collision detection
    Events.on(engine, 'collisionStart', function (event) {
      var pairs = event.pairs;

      pairs.forEach(function (pair) {
        var labels = [pair.bodyA.label, pair.bodyB.label];

        // When the ball reaches the bottom boundary
        if (
          (labels.includes('Ball') || labels.includes('BallPart')) &&
          labels.includes('BottomBoundary')
        ) {
          // Determine which body is the ball
          var ball =
            pair.bodyA.label === 'Ball' || pair.bodyA.label === 'BallPart'
              ? pair.bodyA
              : pair.bodyB;

          // If it's a part, get the parent
          if (ball.label === 'BallPart') {
            ball = ball.parent;
          }

          // Before removing the ball, find out which box the ball is in
          var ballX = ball.position.x;
          // Calculate slot index based on ballX
          const slotWidth = 800 / multiplierSlots.length;
          var slotIndex = Math.floor(ballX / slotWidth);

          if (slotIndex >= 0 && slotIndex < multiplierSlots.length) {
            var multiplier = multiplierSlots[slotIndex];

            // Calculate winnings
            var winnings = ballCost * multiplier;
            balance += winnings;

            // Ensure balance is rounded to two decimals
            balance = parseFloat(balance.toFixed(2));

            // Update message
            message = `You won ${winnings.toFixed(2)} Vinyls!`;
          } else {
            // Ball is out of bounds; no winnings
            message = `No winnings. Try again!`;
          }

          // Remove the ball
          Composite.remove(world, ball);
        }
      });
    });
  }

  // Function to create pegs in a wider pattern
  function createPegs() {
    const rows = 12;
    const pegSpacingX = 60;
    const pegSpacingY = 50;
    const startX = 400; // Center x position

    for (let row = 0; row < rows; row++) {
      const cols = row + 3; // Start with 3 pegs at the top
      const rowWidth = (cols - 1) * pegSpacingX;
      const xOffset = startX - rowWidth / 2;

      for (let col = 0; col < cols; col++) {
        const x = xOffset + col * pegSpacingX;
        const y = 100 + row * pegSpacingY;
        const peg = Bodies.circle(x, y, 5, {
          isStatic: true,
          collisionFilter: {
            category: defaultCategory,
            mask: ballCategory | defaultCategory,
          },
          render: {
            fillStyle: '#fff',
            strokeStyle: '#555',
            lineWidth: 1,
          },
        });
        Composite.add(world, peg);
      }
    }
  }

  // Function to create multiplier slots at the bottom
  function createMultiplierSlots() {
    const slotCount = 15; // Number of slots
    const slotWidth = 800 / slotCount;

    // Adjusted slot positions to be further down
    const slotYPosition = 100 + 12 * 50 + 150; // Moved slots further down

    // Create walls between slots
    for (let i = 0; i <= slotCount; i++) {
      const x = i * slotWidth;
      const wall = Bodies.rectangle(x, slotYPosition - 50, 10, 200, {
        isStatic: true,
        collisionFilter: {
          category: defaultCategory,
          mask: ballCategory | defaultCategory,
        },
        render: { fillStyle: '#444' },
      });
      Composite.add(world, wall);
    }

    // Create floors for slots and label them
    for (let i = 0; i < slotCount; i++) {
      const x = i * slotWidth + slotWidth / 2;
      const floor = Bodies.rectangle(x, slotYPosition + 50, slotWidth, 40, {
        isStatic: true,
        collisionFilter: {
          category: defaultCategory,
          mask: ballCategory | defaultCategory,
        },
        render: {
          fillStyle: '#00aaff',
          strokeStyle: '#fff',
          lineWidth: 2,
        },
        label: `SlotFloor-${i}`,
      });
      Composite.add(world, floor);

      const multiplier = getMultiplier(i, slotCount);
      multiplierSlots[i] = multiplier;

      // Add text labels for multipliers using HTML elements
      const text = document.createElement('div');
      text.style.position = 'absolute';
      text.style.left = `${i * slotWidth}px`;
      text.style.top = `${render.options.height - 100}px`; // Adjusted label position
      text.style.width = `${slotWidth}px`;
      text.style.textAlign = 'center';
      text.style.color = '#fff';
      text.style.fontWeight = 'bold';
      text.style.fontSize = '14px';
      text.innerText = `${multiplier}x`;
      text.classList.add('multiplier-label');
      document.getElementById('matter-js').appendChild(text);
    }
  }

  // Function to assign multipliers, higher on the edges
  function getMultiplier(index, totalSlots) {
    const middle = (totalSlots - 1) / 2;
    const distanceFromCenter = Math.abs(index - middle);

    // Calculate multiplier based on distance from center
    const maxMultiplier = 10;
    const minMultiplier = 0.2;
    const multiplier =
      minMultiplier +
      ((maxMultiplier - minMultiplier) * distanceFromCenter) / middle;

    return parseFloat(multiplier.toFixed(1));
  }
</script>

<div class="plinko-game">
  <div class="balance-display">
    <span class="font-bold">Balance:</span> <span>{balance.toFixed(2)} Vinyls</span>
  </div>
  <div id="matter-js" class="game-area"></div>
  <button
    on:click={dropBall}
    class="drop-button"
    disabled={balance < ballCost}
  >
    Drop Vinyl ({ballCost} Vinyls)
  </button>
  <div class="message-display">{message}</div>
</div>

<style>
  .plinko-game {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #fff;
  }

  .balance-display {
    margin-bottom: 10px;
    font-size: 1.2em;
  }

  .game-area {
    position: relative;
    width: 800px;
    height: 800px;
    background-color: #333333; /* Changed background color for better contrast */
    overflow: hidden;
    border-radius: 10px;
    box-shadow: 0 0 10px #000;
    border: 2px solid #444;
  }

  .drop-button {
    margin-top: 10px;
    padding: 10px 20px;
    background-color: #ff6347;
    color: #fff;
    font-size: 1em;
    font-weight: bold;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .drop-button:hover {
    background-color: #e5533d;
  }

  .drop-button:disabled {
    background-color: #999;
    cursor: not-allowed;
  }

  .message-display {
    margin-top: 10px;
    color: #ffcc00;
    font-weight: bold;
    font-size: 1.1em;
  }

  /* Multiplier Labels */
  .multiplier-label {
    position: absolute;
    font-size: 14px;
  }
</style>