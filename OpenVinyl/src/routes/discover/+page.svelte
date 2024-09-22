<script>
  import { spotify } from "$lib/spotifyClient";
  import { onMount } from "svelte";
  import { authenticateClientCredentials } from "$lib/utils";

  let boxes = [
    {
      id: 1,
      imageUrl: "https://via.placeholder.com/200",
      songId: "11dFghVXANMlKmJXsNCbNl",
    },
    {
      id: 2,
      imageUrl: "https://via.placeholder.com/200",
      songId: "11dFghVXANMlKmJXsNCbNl",
    },
    {
      id: 3,
      imageUrl: "https://via.placeholder.com/200",
      songId: "11dFghVXANMlKmJXsNCbNl",
    },
    {
      id: 4,
      imageUrl: "https://via.placeholder.com/200",
      songId: "11dFghVXANMlKmJXsNCbNl",
    },
    {
      id: 5,
      imageUrl: "https://via.placeholder.com/200",
      songId: "11dFghVXANMlKmJXsNCbNl",
    },
    {
      id: 6,
      imageUrl: "https://via.placeholder.com/200",
      songId: "11dFghVXANMlKmJXsNCbNl",
    },
    {
      id: 7,
      imageUrl: "https://via.placeholder.com/200",
      songId: "11dFghVXANMlKmJXsNCbNl",
    },
    {
      id: 8,
      imageUrl: "https://via.placeholder.com/200",
      songId: "11dFghVXANMlKmJXsNCbNl",
    },
    {
      id: 9,
      imageUrl: "https://via.placeholder.com/200",
      songId: "11dFghVXANMlKmJXsNCbNl",
    },
  ];

  let centerSongId = boxes[4].songId;
  let error;
  let cache = []; 
  let cacheIndex = 0; 

  function debounce(func, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  }

  async function cacheRecommendations() {
    try {
      const recommendationData = await spotify.getRecommendations({
        seed_tracks: [centerSongId],
        limit: 100,
      });

      cache = recommendationData.tracks.map(track => ({
        songId: track.id,
        imageUrl: track.album.images[0].url,
      }));

      console.log("Cached 100 recommendations:", cache);
    } catch (err) {
      console.error("Error caching recommendations:", err);
    }
  }

  async function fetchCenterSong() {
    try {
      const trackData = await spotify.getTrack(centerSongId);
      const centerImageUrl = trackData.album.images[0].url;

      boxes[4] = {
        ...boxes[4],
        imageUrl: centerImageUrl, 
      };

      console.log("Center song initialized:", boxes[4]);
    } catch (err) {
      console.error("Error fetching center song:", err);
      error = "Failed to fetch center song.";
    }
  }
  function initializeGridWithCache() {
    boxes = boxes.map((box, index) => {
      if (index === 4) {
        return box; // Keep the center song unchanged
      }
      return fetchFromCache(); // Populate surrounding boxes with cached recommendations
    });

    console.log("Grid initialized with cache:", boxes);
  }
  function fetchFromCache() {
    if (cacheIndex >= cache.length) {
      //this resets the cache index to 0 which effectively doesnt generate more than 100 songs
      //possibly look into adding another api call here to generate 100 more recommendations
      cacheIndex = 0; 
    }

    const cachedSong = cache[cacheIndex++];
    return {
      id: Math.random(), 
      imageUrl: cachedSong.imageUrl,
      songId: cachedSong.songId,
    };
  }

  function moveGrid(direction) {
    let newBoxes = [...boxes];

    switch (direction) {
      case "up":
        newBoxes = newBoxes.slice(0, 6);
        for (let i = 0; i < 3; i++) {
          const newBox = fetchFromCache();
          newBoxes.unshift(newBox); // Add 3 new boxes at the top
        }
        break;
      case "down":
        newBoxes = newBoxes.slice(3);
        for (let i = 0; i < 3; i++) {
          const newBox = fetchFromCache();
          newBoxes.push(newBox); // Add 3 new boxes at the bottom
        }
        break;
      case "left":
        for (let i = 0; i < 9; i += 3) {
          const newBox = fetchFromCache();
          newBoxes.splice(i, 1); // Remove one box from each row
          newBoxes.splice(i + 2, 0, newBox); // Add a new box at the end of each row
        }
        break;
      case "right":
        for (let i = 0; i < 9; i += 3) {
          const newBox = fetchFromCache();
          newBoxes.splice(i + 2, 1); // Remove one box from each row
          newBoxes.splice(i, 0, newBox); // Add a new box at the start of each row
        }
        break;
    }

    centerSongId = newBoxes[4].songId;
    boxes = newBoxes;
  }

  onMount(async () => {
    await authenticateClientCredentials();
    fetchCenterSong();
    await cacheRecommendations();
    initializeGridWithCache();
  });

  // note: I set the duration to 0ms because we are now caching songs, may increase later
  const debouncedMoveGrid = debounce(moveGrid, 0);

  function onKeyDown(e) {
    switch (e.keyCode) {
      case 87:
      case 38: 
        debouncedMoveGrid("up");
        break;
      case 83:
      case 40:
        debouncedMoveGrid("down");
        break;
      case 65: 
      case 37: 
        debouncedMoveGrid("right");
        break;
      case 68: 
      case 39: 
        debouncedMoveGrid("left");
        break;
    }
  }
</script>

<h3 class="info">Use arrow keys or WASD to navigate the discover grid</h3>
<div class="game-board">
  {#each boxes as box, index (box.id)}
    <div class="box" class:highlight={index === 4}>
      {#if index === 4}
        <div class="rainbow">
          <img src={box.imageUrl} alt="Image {box.id}" />
        </div>
      {:else}
        <img src={box.imageUrl} alt="Image {box.id}" />
      {/if}
    </div>
  {/each}
</div>

<svelte:window on:keydown|preventDefault={onKeyDown} />

<style>
  .info {
    padding-top: 80px;
    display: flex;
    justify-content: center;
  }

  .rainbow {
    border: 4px solid green;
  }

  .game-board {
    display: grid;
    grid-template-rows: 200px 200px 200px;
    grid-template-columns: 200px 200px 200px;
    gap: 10px;
    width: fit-content;
    margin-left: auto;
    margin-right: auto;
    padding-bottom: 100px;
    transition: transform 0.5s ease-in-out;
  }
  .box {
    background: #444;
    border: 1px solid #555;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #aaa;
    opacity: 1;
    transition:
      transform 1.5s ease-in-out,
      opacity 1.5s ease-in-out;
    box-sizing: border-box;
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
