<script>
  import { spotify } from "$lib/spotifyClient";
  import { onMount } from "svelte";
  import { authenticateClientCredentials } from "$lib/utils";
  import { page } from '$app/stores';
  let boxes = [
    { id: 1, imageUrl: "https://via.placeholder.com/200", songId: "6ebkx7Q5tTxrCxKq4GYj0Y", songName: "", artistName: "", previewUrl:"" },
    { id: 2, imageUrl: "https://via.placeholder.com/200", songId: "6ebkx7Q5tTxrCxKq4GYj0Y", songName: "", artistName: "", previewUrl:"" },
    { id: 3, imageUrl: "https://via.placeholder.com/200", songId: "6ebkx7Q5tTxrCxKq4GYj0Y", songName: "", artistName: "", previewUrl:"" },
    { id: 4, imageUrl: "https://via.placeholder.com/200", songId: "6ebkx7Q5tTxrCxKq4GYj0Y", songName: "", artistName: "", previewUrl:"" },
    { id: 5, imageUrl: "https://via.placeholder.com/200", songId: "6ebkx7Q5tTxrCxKq4GYj0Y", songName: "", artistName: "", previewUrl:"" },
    { id: 6, imageUrl: "https://via.placeholder.com/200", songId: "6ebkx7Q5tTxrCxKq4GYj0Y", songName: "", artistName: "", previewUrl:"" },
    { id: 7, imageUrl: "https://via.placeholder.com/200", songId: "6ebkx7Q5tTxrCxKq4GYj0Y", songName: "", artistName: "", previewUrl:"" },
    { id: 8, imageUrl: "https://via.placeholder.com/200", songId: "6ebkx7Q5tTxrCxKq4GYj0Y", songName: "", artistName: "", previewUrl:"" },
    { id: 9, imageUrl: "https://via.placeholder.com/200", songId: "6ebkx7Q5tTxrCxKq4GYj0Y", songName: "", artistName: "", previewUrl:"" },
  ];
  let centerSongId;

  if ($page.params.slug) {
    centerSongId = $page.params.slug;
  }
  else {
    centerSongId = "6ebkx7Q5tTxrCxKq4GYj0Y";
  }
  onMount(()=> {
    console.log($page.params.slug)
  })
  let error;
  let cache = []; 
  let cacheIndex = 0;
  let audio = null;

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

      cache = recommendationData.tracks
      .filter(track => track.preview_url) // Only keep tracks with a preview URL (gonna be around 50-60 songs out of the 100)
      .map(track => ({
        songId: track.id,
        imageUrl: track.album.images[0].url,
        songName: track.name,
        artistName: track.artists[0].name,
        previewUrl: track.preview_url
      }));

      console.log(`Cached ${cache.length} recommendations:`, cache);
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
        songName: trackData.name,
        artistName: trackData.artists[0].name,
        previewUrl: trackData.preview_url 
      };

      playPreview(trackData.preview_url); 

      console.log("Center song initialized:", boxes[4]);
    } catch (err) {
      console.error("Error fetching center song:", err);
      error = "Failed to fetch center song.";
    }
  }

  function initializeGridWithCache() {
    boxes = boxes.map((box, index) => {
      if (index === 4) {
        return box; 
      }
      return fetchFromCache(); 
    });

    console.log("Grid initialized with cache:", boxes);
  }

  function fetchFromCache() {
    if (cacheIndex >= cache.length) {
      cacheIndex = 0; 
    }

    const cachedSong = cache[cacheIndex++];
    return {
      id: Math.random(),
      imageUrl: cachedSong.imageUrl,
      songId: cachedSong.songId,
      songName: cachedSong.songName,
      artistName: cachedSong.artistName,
      previewUrl: cachedSong.previewUrl 
    };
  }

  function playPreview(previewUrl) {
    if (audio) {
      audio.pause();
    }
    if (previewUrl) {
      audio = new Audio(previewUrl);
      audio.play().catch((err) => {
        console.error("Error playing preview:", err);
      });
    }
  }

  function moveGrid(direction) {
    let newBoxes = [...boxes];

    switch (direction) {
      case "up":
        newBoxes = newBoxes.slice(0, 6);
        for (let i = 0; i < 3; i++) {
          const newBox = fetchFromCache();
          newBoxes.unshift(newBox); 
        }
        break;
      case "down":
        newBoxes = newBoxes.slice(3);
        for (let i = 0; i < 3; i++) {
          const newBox = fetchFromCache();
          newBoxes.push(newBox); 
        }
        break;
      case "left":
        for (let i = 0; i < 9; i += 3) {
          const newBox = fetchFromCache();
          newBoxes.splice(i, 1);
          newBoxes.splice(i + 2, 0, newBox);
        }
        break;
      case "right":
        for (let i = 0; i < 9; i += 3) {
          const newBox = fetchFromCache();
          newBoxes.splice(i + 2, 1); 
          newBoxes.splice(i, 0, newBox);
        }
        break;
    }

    centerSongId = newBoxes[4].songId;
    playPreview(newBoxes[4].previewUrl);
    boxes = newBoxes;
  }

  onMount(async () => {
    await authenticateClientCredentials();
    fetchCenterSong();
    await cacheRecommendations();
    initializeGridWithCache();
  });

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

<div class="info">
  <p>Use arrow keys or WASD to navigate the discover grid</p>
  <h3>Center song is {boxes[4].songName} by {boxes[4].artistName}</h3>
  </div>
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
    text-align: center;
    flex-direction: column;
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
