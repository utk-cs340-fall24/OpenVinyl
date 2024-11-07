<script>
  import Matter from 'matter-js';
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient'; // Ensure this path is correct in your project
  import { vinylBalance, fetchVinylBalance, addVinyls } from '$lib/vinylsStore.js';

  let engine, world, render, runner;
  let dropBall;
  let multiplierSlots = [];
  let user = null;
  let balance = 0;
  let message = '';
  const ballCost = 10;
  let graph = Array(15).fill(0);

  const Engine = Matter.Engine;
  const Render = Matter.Render;
  const Runner = Matter.Runner;
  const Composite = Matter.Composite;
  const Bodies = Matter.Bodies;
  const Events = Matter.Events;

  const defaultCategory = 0x0001;
  const ballCategory = 0x0002;

  let scoreSound;

  onMount(async () => {
    // Fetch user session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    user = sessionData?.session?.user;
    if (user) {
      await fetchVinylBalance(user.id)

      // Fetch user's vinyl balance
      vinylBalance.subscribe(value => {
                balance = value;
            });
      
    } else {
      message = 'Please log in to play the game.';
    }

    createScene();
    // Initialize score sound if you have one
    // scoreSound = new Audio('path_to_your_score_sound.mp3'); // Uncomment and set the correct path
  });

  // Update balance in the database whenever it changes
  // $: if (user && balance !== undefined) {
  //   updateBalanceInDatabase();
  // }

  // async function updateBalanceInDatabase() {
  //   const { error } = await supabase
  //     .from('profiles')
  //     .update({ vinyls: balance })
  //     .eq('id', user.id);

  //   if (error) {
  //     console.error('Error updating vinyl balance:', error);
  //     message = 'Error updating balance. Please try again.';
  //   }
  // }

  function createScene() {
    engine = Engine.create();
    world = engine.world;

    engine.positionIterations = 10;
    engine.velocityIterations = 10;
    engine.constraintIterations = 4;

    render = Render.create({
      element: document.getElementById('matter-js'),
      engine: engine,
      options: {
        width: 600,
        height: 600,
        background: '#333333',
        wireframes: false,
      },
    });

    Render.run(render);

    runner = Runner.create();
    Runner.run(runner, engine);

    // Create boundaries
    Composite.add(world, [
      // Top boundary
      Bodies.rectangle(300, -5, 600, 10, {
        isStatic: true,
        collisionFilter: {
          category: defaultCategory,
          mask: ballCategory | defaultCategory,
        },
      }),
      // Bottom boundary
      Bodies.rectangle(300, 605, 600, 10, {
        isStatic: true,
        label: 'BottomBoundary',
        collisionFilter: {
          category: defaultCategory,
          mask: ballCategory | defaultCategory,
        },
      }),
      // Right boundary
      Bodies.rectangle(605, 300, 10, 600, {
        isStatic: true,
        collisionFilter: {
          category: defaultCategory,
          mask: ballCategory | defaultCategory,
        },
      }),
      // Left boundary
      Bodies.rectangle(-5, 300, 10, 600, {
        isStatic: true,
        collisionFilter: {
          category: defaultCategory,
          mask: ballCategory | defaultCategory,
        },
      }),
    ]);

    createPegs();
    createMultiplierSlots();

    dropBall = () => {
      if (!user) {
        message = 'Please log in to play the game.';
        return;
      }

      if (balance < ballCost) {
        message = "You don't have enough vinyls!";
        return;
      }

      balance -= ballCost;
      addVinyls(user.id, -ballCost)
      message = ''; // Clear any previous messages

      const randomOffset = (Math.random() + Math.random() + Math.random() - 1.5) * 20;
      const xPosition = 300 + randomOffset;

      const ball = Bodies.circle(xPosition, 50, 14, {
        collisionFilter: {
          group: -1,
          category: ballCategory,
          mask: defaultCategory,
        },
        restitution: 0.5,
        label: 'Ball',
        render: {
          strokeStyle: '#ffffff',
          lineWidth: 3,
          fillStyle: 'transparent',
          sprite: {
            texture: 'logo.svg', // Update this path if needed
            xScale: 0.08,
            yScale: 0.08,
          },
        },
      });

      Composite.add(world, ball);
    };

    Events.on(engine, 'collisionStart', function (event) {
      var pairs = event.pairs;

      pairs.forEach(function (pair) {
        var labels = [pair.bodyA.label, pair.bodyB.label];

        if (
          (labels.includes('Ball') || labels.includes('BallPart')) &&
          labels.includes('BottomBoundary')
        ) {
          var ball =
            pair.bodyA.label === 'Ball' || pair.bodyA.label === 'BallPart'
              ? pair.bodyA
              : pair.bodyB;

          if (ball.label === 'BallPart') {
            ball = ball.parent;
          }

          var ballX = ball.position.x;
          const slotWidth = 600 / multiplierSlots.length;
          var slotIndex = Math.floor(ballX / slotWidth);

          if (slotIndex >= 0 && slotIndex < multiplierSlots.length) {
            var multiplier = multiplierSlots[slotIndex];
            graph[slotIndex]++;
            printOdds();
            var winnings = ballCost * multiplier;
            // balance += winnings;

            // balance = parseFloat(balance.toFixed(2));
            addVinyls(user.id, winnings)
            message = `You won ${winnings.toFixed(2)} Vinyls!`;

            // Play sound on scoring if you have one
            // scoreSound.play();
          } else {
            message = `No winnings. Try again!`;
          }

          Composite.remove(world, ball);
        }
      });
    });
  }

  function printOdds(){
    let s = "";
    console.log("printing odds");
    for(let i = 0; i < graph.length; i++){
      for(let j = 0; j < graph[i]; j++){
        s += "=";
      } 
      console.log(s);
      s = "";
    }
  }

  function createPegs() {
    const rows = 12;
    const pegSpacingX = 45;
    const pegSpacingY = 40;
    const startX = 300;

    for (let row = 0; row < rows; row++) {
      const cols = row + 3;
      const rowWidth = (cols - 1) * pegSpacingX;
      const xOffset = startX - rowWidth / 2;

      for (let col = 0; col < cols; col++) {
        const x = xOffset + col * pegSpacingX;
        const y = 80 + row * pegSpacingY;
        const peg = Bodies.circle(x, y, 4, {
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

  function createMultiplierSlots() {
    const slotCount = 15;
    const slotWidth = 600 / slotCount;

    const slotYPosition = 80 + 12 * 40 + 80;

    for (let i = 0; i <= slotCount; i++) {
      const x = i * slotWidth;
      const y = slotYPosition - 30;
      const peg = Bodies.circle(x, y, 4, {
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

    for (let i = 0; i < slotCount; i++) {
      const x = i * slotWidth + slotWidth / 2;
      const floor = Bodies.rectangle(x, slotYPosition + 30, slotWidth, 30, {
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

      const text = document.createElement('div');
      text.style.position = 'absolute';
      text.style.left = `${i * slotWidth}px`;
      text.style.top = `${render.options.height - 50}px`;
      text.style.width = `${slotWidth}px`;
      text.style.textAlign = 'center';
      text.style.color = '#fff';
      text.style.fontWeight = 'bold';
      text.style.fontSize = '12px';
      text.innerText = `${multiplier}x`;
      text.classList.add('multiplier-label');
      document.getElementById('matter-js').appendChild(text);
    }
  }

  function getMultiplier(index, totalSlots) {
    const middle = Math.floor(totalSlots / 2);

    const multipliers = [0.5, 1.0, 1.1, 1.3, 1.4, 1.9, 4.0, 7.1];

    const fullMultipliers = [...multipliers.slice(), ...multipliers];

    const distanceFromMiddle = Math.abs(index - middle);

    return fullMultipliers[distanceFromMiddle];
  }
</script>

<div class="plinko-game">
  <div class="balance-display">
    {#if user}
      <span class="font-bold">Balance:</span> <span>{balance} Vinyls</span>
    {:else}
      <span>Please log in to see your balance.</span>
    {/if}
  </div>
  <div id="matter-js" class="game-area"></div>
  <button
    on:click={dropBall}
    class="drop-button"
    disabled={!user || balance < ballCost}
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
    width: 600px;
    height: 600px;
    background-color: #333333;
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

  .multiplier-label {
    position: absolute;
    font-size: 12px;
  }
</style>