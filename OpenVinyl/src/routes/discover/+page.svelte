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
  let trackRecommendations;
  let error;

  let isFetching = false;
  function debounce(func, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  }
  async function fetchCenterSong() {
    try {
      const trackData = await spotify.getTrack(centerSongId);
      const centerImageUrl = trackData.album.images[0].url;

      boxes[4] = {
        ...boxes[4],
        imageUrl: centerImageUrl, // Set the center box with the fetched image
      };

      console.log("Center song initialized:", boxes[4]);
    } catch (err) {
      console.error("Error fetching center song:", err);
      error = "Failed to fetch center song.";
    }
  }
  async function fetchRecommendations() {
    if (isFetching) return; // Prevent overlapping fetches
    isFetching = true;
    try {
      const recommendationData = await spotify.getRecommendations({
        seed_tracks: [centerSongId],
        limit: 8,
      });

      trackRecommendations = recommendationData.tracks;

      boxes = boxes.map((box, index) => {
        if (index === 4) {
          return box;
        }

        const recommendation =
          trackRecommendations[index - (index > 4 ? 1 : 0)];
        return {
          ...box,
          songId: recommendation.id,
          imageUrl: recommendation.album.images[0].url,
        };
      });

      console.log("Updated boxes:", boxes);
    } catch (err) {
      console.error("Error fetching track data:", err);
      error = "Failed to fetch track data.";
    } finally {
      isFetching = false;
    }
  }

  onMount(async () => {
    await authenticateClientCredentials();
    fetchCenterSong();
    fetchRecommendations();
  });
  const debouncedMoveGrid = debounce(moveGrid, 500);

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
  function moveGrid(direction) {
    let newBoxes = [...boxes];
    let newSongIds = [];

    switch (direction) {
      case "up":
        newBoxes = newBoxes.slice(0, 6);
        for (let i = 0; i < 3; i++) {
          const newBox = generateNewBox();
          newSongIds.push(newBox.songId);
          newBoxes.unshift(newBox);
        }
        break;
      case "down":
        newBoxes = newBoxes.slice(3);
        for (let i = 0; i < 3; i++) {
          const newBox = generateNewBox();
          newSongIds.push(newBox.songId);
          newBoxes.push(newBox);
        }
        break;
      case "left":
        for (let i = 0; i < 9; i += 3) {
          const newBox = generateNewBox();
          newSongIds.push(newBox.songId);
          newBoxes.splice(i, 1);
          newBoxes.splice(i + 2, 0, newBox);
        }
        break;
      case "right":
        for (let i = 0; i < 9; i += 3) {
          const newBox = generateNewBox();
          newSongIds.push(newBox.songId);
          newBoxes.splice(i + 2, 1);
          newBoxes.splice(i, 0, newBox);
        }
        break;
    }

    centerSongId = newBoxes[4].songId;
    boxes = newBoxes;

    fetchRecommendationsForNewBoxes(newSongIds);
  }
  async function fetchRecommendationsForNewBoxes(newSongIds) {
    if (isFetching) return;
    isFetching = true;
    try {
      const recommendationData = await spotify.getRecommendations({
        seed_tracks: [centerSongId],
        limit: newSongIds.length,
      });

      trackRecommendations = recommendationData.tracks;

      let recommendationIndex = 0;
      boxes = boxes.map((box) => {
        if (newSongIds.includes(box.songId)) {
          const recommendation = trackRecommendations[recommendationIndex++];
          return {
            ...box,
            songId: recommendation.id,
            imageUrl: recommendation.album.images[0].url,
          };
        }
        return box;
      });

      console.log("Updated new boxes:", boxes);
    } catch (err) {
      console.error("Error fetching track data:", err);
      error = "Failed to fetch track data.";
    } finally {
      isFetching = false;
    }
  }

  function generateNewBox(songId) {
    return {
      id: Math.random(), // Use a random id for demo
      imageUrl: "https://via.placeholder.com/200", // Placeholder for now
      songId: songId || "randomSongId", // Random songId for now
    };
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
