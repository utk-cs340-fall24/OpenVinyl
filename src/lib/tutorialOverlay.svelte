<script>
    import { createEventDispatcher } from "svelte";
  
    const dispatch = createEventDispatcher();
  
    function closeTutorial() {
      dispatch("close");
    }
</script>

<div class="overlay">
  <div class="modal">
    <h2>Welcome to Discover!</h2>
    <p>
      Use the arrow keys/WASD (desktop) or swipe gestures (mobile) to navigate through the song grid.
    </p>
    <p>
      Press <span class="key">Spacebar</span> to play/pause previews.
    </p>
    <p>
      <span class="key">Enter</span> to add a song to your OpenVinyl Discover playlist.
    </p>
    <button on:click={closeTutorial}>Got it!</button>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal {
    background: #e5e6e2;
    padding: 20px;
    border-radius: 8px;
    max-width: 400px;
    width: 90%;
    text-align: center;
    color: #1d1f25;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    position: relative;
  }

  .key {
    display: inline-block;
    background-color: #f0f0f0;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 5px 10px;
    margin: 0 2px;
    font-family: monospace;
    box-shadow: 0 2px #999;
    cursor: default;
    user-select: none;
    transition: transform 0.1s, box-shadow 0.1s;
  }

  .key:active {
    box-shadow: 0 1px #666;
    transform: translateY(1px);
  }

  button {
    margin-top: 20px;
    padding: 10px 20px;
    background-color: #1db954;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
  }

  button:hover {
    background-color: #1ed760;
  }

  @media (max-width: 480px) {
    .modal {
      padding: 15px;
    }

    .key {
      padding: 4px 8px;
      font-size: 14px;
    }

    button {
      padding: 8px 16px;
      font-size: 14px;
    }
  }
</style>
