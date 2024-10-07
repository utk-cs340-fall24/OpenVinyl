<script>
  import { spotify } from "$lib/spotifyClient";
  import { onMount, onDestroy } from "svelte";
  import { authenticateClientCredentials } from "$lib/utils";
  import { page } from "$app/stores";
  import {supabase} from "$lib/supabaseClient";
  import { selectedSong } from "$lib/stores";

  import { goto } from '$app/navigation';
  let boxes = [
    {
      id: 1,
      imageUrl: "https://via.placeholder.com/200",
      songId: "6ebkx7Q5tTxrCxKq4GYj0Y",
      songName: "",
      artistName: "",
      previewUrl: "",
    },
    {
      id: 2,
      imageUrl: "https://via.placeholder.com/200",
      songId: "6ebkx7Q5tTxrCxKq4GYj0Y",
      songName: "",
      artistName: "",
      previewUrl: "",
    },
    {
      id: 3,
      imageUrl: "https://via.placeholder.com/200",
      songId: "6ebkx7Q5tTxrCxKq4GYj0Y",
      songName: "",
      artistName: "",
      previewUrl: "",
    },
    {
      id: 4,
      imageUrl: "https://via.placeholder.com/200",
      songId: "6ebkx7Q5tTxrCxKq4GYj0Y",
      songName: "",
      artistName: "",
      previewUrl: "",
    },
    {
      id: 5,
      imageUrl: "https://via.placeholder.com/200",
      songId: "6ebkx7Q5tTxrCxKq4GYj0Y",
      songName: "",
      artistName: "",
      previewUrl: "",
    },
    {
      id: 6,
      imageUrl: "https://via.placeholder.com/200",
      songId: "6ebkx7Q5tTxrCxKq4GYj0Y",
      songName: "",
      artistName: "",
      previewUrl: "",
    },
    {
      id: 7,
      imageUrl: "https://via.placeholder.com/200",
      songId: "6ebkx7Q5tTxrCxKq4GYj0Y",
      songName: "",
      artistName: "",
      previewUrl: "",
    },
    {
      id: 8,
      imageUrl: "https://via.placeholder.com/200",
      songId: "6ebkx7Q5tTxrCxKq4GYj0Y",
      songName: "",
      artistName: "",
      previewUrl: "",
    },
    {
      id: 9,
      imageUrl: "https://via.placeholder.com/200",
      songId: "6ebkx7Q5tTxrCxKq4GYj0Y",
      songName: "",
      artistName: "",
      previewUrl: "",
    },
  ];
  let centerSongId;

  if ($page.params.slug) {
    centerSongId = $page.params.slug;
  } else {
    centerSongId = "6ebkx7Q5tTxrCxKq4GYj0Y";
  }
  onMount(() => {
    console.log($page.params.slug);
  });
  let error;
  let cache = [];
  let cacheIndex = 0;
  let audio = null;
  let spotifyAccessToken = null;
  const CACHE_THRESHOLD_PERCENTAGE = 0.8; // 80% threshold for refreshing cache (meaning if theres 100 songs if u click 80 times it will refresh then)
  let isRefreshingCache = false;
  let showCreatePlaylistButton = false;
  let isLoggedIn = false;
  let playlistId = null;
  let showCheckmark = false;
  let checkmarkTimeout; 

  function debounce(func, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  }
  async function checkAndRefreshCache() {
    if (shouldRefreshCache() && !isRefreshingCache) {
      isRefreshingCache = true;
      console.log("Threshold reached. Refreshing cache...");
      await cacheRecommendations();
      cacheIndex = 0;
    }
  }
  function shouldRefreshCache() {
    return cacheIndex / cache.length >= CACHE_THRESHOLD_PERCENTAGE;
  }
  function onKeyDown2(event) {
    if (event.key === "r") {
      startReview();
    }
  }
  onDestroy(() => {
  if (audio) {
    audio.pause();
    audio.currentTime = 0; // Optionally, reset the audio time to the start
    console.log("Audio playback stopped on destroy.");
  }
});
  function startReview() {
    const middleSong = {
    id: boxes[4].songId,  
    title: boxes[4].songName, 
    artist: boxes[4].artistName,  
    cover: boxes[4].imageUrl  
  };


  selectedSong.set(middleSong);

  goto('/');
  }
  async function cacheRecommendations() {
    try {
      const recommendationData = await spotify.getRecommendations({
        seed_tracks: [centerSongId],
        limit: 100,
      });

      cache = recommendationData.tracks
        .filter((track) => track.preview_url) // Only keep tracks with a preview URL (gonna be around 50-60 songs out of the 100)
        .map((track) => ({
          songId: track.id,
          imageUrl: track.album.images[0].url,
          songName: track.name,
          artistName: track.artists[0].name,
          previewUrl: track.preview_url,
        }));

      console.log(`Cached ${cache.length} recommendations:`, cache);
      isRefreshingCache = false;
    } catch (err) {
      console.error("Error caching recommendations:", err);
      isRefreshingCache = false;
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
        previewUrl: trackData.preview_url,
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
    checkAndRefreshCache();
    return {
      id: Math.random(),
      imageUrl: cachedSong.imageUrl,
      songId: cachedSong.songId,
      songName: cachedSong.songName,
      artistName: cachedSong.artistName,
      previewUrl: cachedSong.previewUrl,
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

  async function checkIfPlaylistExists() {
    try {
      const userPlaylistsResponse = await fetch('https://api.spotify.com/v1/me/playlists', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${spotifyAccessToken}`
        }
      });

      const userPlaylists = await userPlaylistsResponse.json();
      const discoverPlaylist = userPlaylists.items.find(playlist => playlist.name === "OpenVinyl Discover");

      if (discoverPlaylist) {
        playlistId = discoverPlaylist.id;
        console.log("Found existing 'OpenVinyl Discover' playlist:", playlistId);
      } else {
        showCreatePlaylistButton = true;
      }
    } catch (err) {
      console.error("Error checking playlists:", err);
    }
  }

  async function createDiscoverPlaylist() {
    try {
      const newPlaylistResponse = await fetch('https://api.spotify.com/v1/me/playlists', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${spotifyAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: "OpenVinyl Discover",
          description: "A playlist for songs discovered on OpenVinyl",
          public: true
        })
      });

      const newPlaylist = await newPlaylistResponse.json();
      playlistId = newPlaylist.id;
      showCreatePlaylistButton = false;
      console.log("Created new 'OpenVinyl Discover' playlist:", playlistId);
    } catch (err) {
      console.error("Error creating playlist:", err);
    }
  }


  function moveGrid(direction) {
    if (isRefreshingCache) {
      console.log("Cache is refreshing, please wait...");
      return;
    }
    let newBoxes = [...boxes];
    showCheckmark = false;
    clearTimeout(checkmarkTimeout);
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

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Error fetching session:", error);
      return;
    }

    if (session) {
      isLoggedIn = true;
      const user = session.user;
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("spotify_access_token")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        return;
      }

      spotifyAccessToken = profile.spotify_access_token;
      if (spotifyAccessToken) {
        await checkIfPlaylistExists(); // Check if the playlist exists if they have an access token
      } else {
        console.log("No Spotify access token found.");
      }
    } else {
      console.log("User not logged in.");
    }

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
      case 32: // Spacebar to toggle play/pause
        togglePlayPause();
        break;
      case 68:
      case 39:
        debouncedMoveGrid("left");
        break;
      case 13: // Enter key to add song to playlist
        if (isLoggedIn && spotifyAccessToken) {
          addCenterSongToPlaylist();
        } else {
          console.log("User must be logged in with Spotify access.");
        }
        break;
      
    }
  }
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  function handleTouchStart(event) {
    touchStartX = event.changedTouches[0].screenX;
    touchStartY = event.changedTouches[0].screenY;
  }

  function handleTouchEnd(event) {
    touchEndX = event.changedTouches[0].screenX;
    touchEndY = event.changedTouches[0].screenY;
    handleGesture();
  }

  function handleGesture() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 50) {
        // Swipe Right
        debouncedMoveGrid("right");
      } else if (deltaX < -50) {
        // Swipe Left
        debouncedMoveGrid("left");
      }
    } else {
      if (deltaY > 50) {
        // Swipe Down
        debouncedMoveGrid("down");
      } else if (deltaY < -50) {
        // Swipe Up
        debouncedMoveGrid("up");
      }
    }
  }
  async function addCenterSongToPlaylist() {
  if (playlistId && boxes[4].songId) {
    try {
      const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${spotifyAccessToken}`,  
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uris: [`spotify:track:${boxes[4].songId}`]  // Add the current song to the playlist
        })
      });

      if (response.ok) {
        console.log(`Added ${boxes[4].songName} by ${boxes[4].artistName} to playlist.`);
        showCheckmark = true;

        // Hide checkmark after 1.5 seconds and store the timeout
        checkmarkTimeout = setTimeout(() => {
          showCheckmark = false;
        }, 1500);
      } else {
        const errorData = await response.json();
        console.error("Error adding song to playlist:", errorData);
      }
    } catch (err) {
      console.error("Unexpected error adding song to playlist:", err);
    }
  } else {
    console.log("Playlist ID or song ID is missing.");
  }
}

  function togglePlayPause() {
    if (audio) {
      if (audio.paused) {
        audio.play().catch((err) => {
          console.error("Error playing preview:", err);
        });
      } else {
        audio.pause();
      }
    }
  }
</script>

<!-- Svelte HTML Template -->
<div class="info">
  <p>Use arrow keys or WASD to navigate the discover grid</p>
  <p>
    Press Space to pause/unpause the preview, and Enter to add the song to your
    playlist.
  </p>
  <p>Center song is {boxes[4].songName} by {boxes[4].artistName}</p>

  {#if isLoggedIn && spotifyAccessToken && showCreatePlaylistButton}
    <button on:click={createDiscoverPlaylist}
      >Create 'OpenVinyl Discover' Playlist</button
    >
  {/if}
</div>
<div class="game-board">
  {#each boxes as box, index (box.id)}
    <div class="box" class:highlight={index === 4}>
      <img src={box.imageUrl} alt="{box.songName} by {box.artistName}" />
      {#if index === 4 && showCheckmark}
        <div class="overlay">
          <div class="checkmark"></div>
        </div>
      {/if}
    </div>
  {/each}
</div>

<svelte:window
  on:keydown|preventDefault={onKeyDown}
  on:keydown|preventDefault={onKeyDown2}
  on:touchstart={handleTouchStart}
  on:touchend={handleTouchEnd}
/>

<style>
  .info {
    display: flex;
    justify-content: center;
    text-align: center;
    flex-direction: column;
    color: white;
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    box-sizing: border-box;
    padding-left: 10px;
    padding-right: 10px;
  }

  .game-board {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, auto);
    gap: 10px;
    justify-content: center; 
    width: 100%;
    max-width: 620px;
    margin: 0 auto;
    padding-bottom: 50px;
    box-sizing: border-box;
  }
  

  .box {
    position: relative;
    overflow: hidden;
    background: #444;
    border: 1px solid #555;
    width: 100%;
    max-width: 200px;
    height: auto;
    aspect-ratio: 1 / 1; 
    margin: 0 auto;
  }

  .box img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .highlight {
    border: 4px solid #1db954;
  }
  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(144, 238, 144, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    animation: fadeInOut 1.5s forwards;
    z-index: 1;
  }
  .checkmark {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 5px solid white;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    transform: scale(0);
    animation: popIn 0.5s forwards 0.2s;
  }
  .checkmark::before {
    content: "";
    position: absolute;
    width: 15px;
    height: 30px;
    border: solid white;
    border-width: 0 5px 5px 0;
    transform: rotate(45deg);
    animation: drawCheck 0.4s forwards;
  }
  @keyframes fadeInOut {
    0% { opacity: 0; }
    15% { opacity: 1; }
    85% { opacity: 1; }
    100% { opacity: 0; }
  }

  @keyframes popIn {
    0% { transform: scale(0); }
    80% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
  @keyframes drawCheck {
    0% { width: 0; height: 0; }
    100% { width: 15px; height: 30px; }
  }
</style>
