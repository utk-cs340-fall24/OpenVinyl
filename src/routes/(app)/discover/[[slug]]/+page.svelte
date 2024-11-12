<script>
  import { spotify } from "$lib/spotifyClient";
  import { onMount, onDestroy } from "svelte";
  import { authenticateClientCredentials } from "$lib/utils";
  import { page } from "$app/stores";
  import { supabase } from "$lib/supabaseClient";
  // import { selectedSong } from "$lib/stores";
  import TutorialOverlay from "$lib/tutorialOverlay.svelte";
  import { writable } from "svelte/store";
  import { getValidSpotifyAccessToken, getPlaylist } from "$lib/utils";
  import { user } from "$lib/stores";
  import { derived } from 'svelte/store';
  import { sidebarHidden } from "$lib/stores";

 
  import { goto } from "$app/navigation";
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
    boxes[4].songId = $page.params.slug;
  } else {
    centerSongId = "";
    //random song from top 50
  }
  
  const showTutorial = writable(false);
  const userReady = derived(user, $user => $user); 
  
  let error;
  let accessToken = null;
  let cache = [];
  let cacheIndex = 0;
  let audio = null;
  const CACHE_THRESHOLD_PERCENTAGE = 0.8; // 80% threshold for refreshing cache (meaning if theres 100 songs if u click 80 times it will refresh then)
  let isRefreshingCache = false;
  let showCreatePlaylistButton = false;
  let isLoggedIn = false;
  let playlistId = null;
  let showCheckmark = false;
  let checkmarkTimeout;


  onMount(async () => {
    await authenticateClientCredentials();
    
    let unsubscribeUser;
    let currentUser;
    if ($page.params.slug) {
      centerSongId = $page.params.slug;
      boxes[4].songId = $page.params.slug;
    } else {
      let topSongs = await getPlaylist("37i9dQZEVXbMDoHDwVN2tF");
      let tracklist = topSongs.data.tracks.items;
      const random = Math.floor(Math.random() * 50);
      centerSongId = tracklist[random].track.id;
      boxes[4].songId = tracklist[random].track.id
    }

  
  
  try {
    unsubscribeUser = userReady.subscribe(async (value) => {
      if (value && value.role === 'authenticated') {
        currentUser = value;

        const token = await getValidSpotifyAccessToken(currentUser.id);
        if (!token) {
          console.error("No access token available, cannot proceed.");
          showPlayer = false;
          showPremiumMessage = true;
          return;
        }

        accessToken = token;
        console.log("Valid Spotify access token received:", accessToken);

        await checkIfPlaylistExists();
      }
    });
  } catch (err) {
    console.log("Error in onMount:", err);
  }
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
        .select("spotify_access_token, has_seen_discover_tutorial")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        return;
      }
      if (!profile.has_seen_discover_tutorial) {
        showTutorial.set(true);
      }
      console.log(accessToken)
      if (accessToken) {
        await checkIfPlaylistExists();
      } else {
        console.log("No Spotify access token found.");
      }
    } else {
      console.log("User not logged in.");
    }
    fetchCenterSong();
    await cacheRecommendations();
    initializeGridWithCache();

});

  function handleMouseMove(e) {
    const box = e.target;
    const rect = box.getBoundingClientRect();
    const x = e.clientX - rect.left; 
    const y = e.clientY - rect.top;  
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 5;
    const rotateY = (centerX - x) / 5;
  
    box.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    box.addEventListener('mouseleave', resetBoxTransform);
  }

  function resetBoxTransform(e) {
    e.target.style.transform = "rotateX(0deg) rotateY(0deg)";
  }


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

  function openReview(event) {
    if (event.key === "p") {
      startReview();
      event.preventDefault();
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
      cover: boxes[4].imageUrl,
    };

    // selectedSong.set(middleSong);

    goto("/");
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
  if (!accessToken) {
    console.error("No access token, unable to fetch playlist.");
    return;
  }

  try {
    const userPlaylistsResponse = await fetch(
      "https://api.spotify.com/v1/me/playlists",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`, // Use the valid access token
        },
      }
    );

    if (!userPlaylistsResponse.ok) {
      const errorData = await userPlaylistsResponse.json();
      console.error("Error fetching playlists:", errorData);
      return;
    }

    const userPlaylists = await userPlaylistsResponse.json();
    const discoverPlaylist = userPlaylists.items.find(
      (playlist) => playlist.name === "OpenVinyl Discover"
    );

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
      const newPlaylistResponse = await fetch(
        "https://api.spotify.com/v1/me/playlists",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "OpenVinyl Discover",
            description: "A playlist for songs discovered on OpenVinyl",
            public: true,
          }),
        }
      );

      const newPlaylist = await newPlaylistResponse.json();
      playlistId = newPlaylist.id;
      showCreatePlaylistButton = false;
      console.log("Created new 'OpenVinyl Discover' playlist:", playlistId);
    } catch (err) {
      console.error("Error creating playlist:", err);
    }
  }
  function moveGrid(deltaRow, deltaCol) {
  if (isRefreshingCache) {
    console.log("Cache is refreshing, please wait...");
    return;
  }

  let newBoxes = [...boxes];

  // Shift rows
  if (deltaRow !== 0) {
    const rows = [];
    while (newBoxes.length) rows.push(newBoxes.splice(0, 3));

    if (deltaRow > 0) {
      for (let i = 0; i < deltaRow; i++) {
        rows.unshift(rows.pop()); // Move last row to the front
        for (let j = 0; j < 3; j++) {
          rows[0][j] = fetchFromCache();
        }
      }
    } else {
      for (let i = 0; i < -deltaRow; i++) {
        rows.push(rows.shift()); // Move first row to the end
        for (let j = 0; j < 3; j++) {
          rows[rows.length - 1][j] = fetchFromCache();
        }
      }
    }

    newBoxes = rows.flat();
  }

  // Shift columns
  if (deltaCol !== 0) {
    const rows = [];
    while (newBoxes.length) rows.push(newBoxes.splice(0, 3));

    if (deltaCol > 0) {
      for (let i = 0; i < deltaCol; i++) {
        for (let row of rows) {
          row.unshift(row.pop()); // Move last column to the front
          row[0] = fetchFromCache();
        }
      }
    } else {
      for (let i = 0; i < -deltaCol; i++) {
        for (let row of rows) {
          row.push(row.shift()); // Move first column to the end
          row[row.length - 1] = fetchFromCache();
        }
      }
    }

    newBoxes = rows.flat();
  }

  // Update the center song ID and play the preview
  centerSongId = newBoxes[4].songId;
  playPreview(newBoxes[4].previewUrl);
  boxes = newBoxes;
}

  const debouncedMoveGrid = debounce(moveGrid, 0);
  async function dismissTutorial(event) {
    const { dontShowAgain } = event.detail;
    showTutorial.set(false);

    if (dontShowAgain) {
      const { data, error } = await supabase.auth.getUser();
      const user = data.user;

      if (user) {
        await supabase
          .from("profiles")
          .update({ has_seen_discover_tutorial: true })
          .eq("id", user.id);
      }
    }
  }

  function handleKeyDown(event) {
    openReview(event);
    onKeyDown(event);
  }

  function onKeyDown(e) {
  switch (e.keyCode) {
    case 87:
    case 38:
      moveGridDirection("up");
      event.preventDefault();
      break;
    case 83:
    case 40:
      moveGridDirection("down");
      event.preventDefault();
      break;
    case 65:
    case 37: 
      moveGridDirection("right");
      event.preventDefault();
      break;
    case 68:
    case 39: 
      moveGridDirection("left");
      event.preventDefault();
      break;
    case 32:
      togglePlayPause();
      event.preventDefault();
      break;
    case 13: 
      console.log("is logged in: ", isLoggedIn);
      if (isLoggedIn && accessToken) {
        addCenterSongToPlaylist();
        event.preventDefault();
      } else {
        console.log("User must be logged in with Spotify access.");
        event.preventDefault();
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
  function moveGridToIndex(clickedIndex) {
  const centerIndex = 4; // Index of the center box in the 3x3 grid
  const gridSize = 3;    // Since it's a 3x3 grid

  const clickedRow = Math.floor(clickedIndex / gridSize);
  const clickedCol = clickedIndex % gridSize;

  const centerRow = Math.floor(centerIndex / gridSize);
  const centerCol = centerIndex % gridSize;

  const deltaRow = centerRow - clickedRow;
  const deltaCol = centerCol - clickedCol;

  moveGrid(deltaRow, deltaCol);
}

  async function addCenterSongToPlaylist() {
    console.log("playlistid: ", playlistId)
      console.log("songid: ", boxes[4].songId)
    if (playlistId && boxes[4].songId) {
      console.log("playlistid: ", playlistId)
      console.log("songid: ", boxes[4].songId)
      try {

        const response = await fetch(
          `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              uris: [`spotify:track:${boxes[4].songId}`], 
            }),
          }
        );

        if (response.ok) {
          console.log(
            `Added ${boxes[4].songName} by ${boxes[4].artistName} to playlist.`
          );
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
      console.log(accessToken)

      console.log("Playlist ID or song ID is missing.");
    }
  }
  function moveGridDirection(direction) {
  let deltaRow = 0;
  let deltaCol = 0;

  switch (direction) {
    case "up":
      deltaRow = 1;
      break;
    case "down":
      deltaRow = -1;
      break;
    case "left":
      deltaCol = -1;
      break;
    case "right":
      deltaCol = 1;
      break;
    default:
      console.error("Invalid direction:", direction);
      return;
  }

  moveGrid(deltaRow, deltaCol);
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
  function openTutorial() {
    showTutorial.set(true);
  }
</script>

<div class="wrapper">
  <button class="info-button" on:click={openTutorial} aria-label="Open Tutorial">
    ℹ️
  </button>
  {#if $showTutorial}
    <TutorialOverlay on:close={dismissTutorial} />
  {/if}
  <!-- Svelte HTML Template -->
  <div class="info">
    <!-- <p>Use arrow keys or WASD to navigate the discover grid</p>
  <p>
    Press Space to pause/unpause the preview, and Enter to add the song to your
    playlist.
  </p> -->
    <p>Center song is {boxes[4].songName} by {boxes[4].artistName}</p>

    {#if isLoggedIn && accessToken && showCreatePlaylistButton}
      <button class="create-playlist-btn" on:click={createDiscoverPlaylist}>
        Create 'OpenVinyl Discover' Playlist</button>
    {/if}
  </div>
  <div class="game-board { $sidebarHidden ? 'sidebarHidden' : '' }">
    {#each boxes as box, index (box.id)}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="box"
        on:click={() => moveGridToIndex(index)}
      >
        <img class="box-img" src={box.imageUrl} alt="{box.songName} by {box.artistName}" on:mousemove={handleMouseMove} class:highlight={index === 4}/>
        {#if index === 4 && showCheckmark}
          <div class="overlay">
            <div class="checkmark"></div>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
<svelte:window
  on:keydown={handleKeyDown}
  on:touchstart={handleTouchStart}
  on:touchend={handleTouchEnd}
/>

<style>
  .wrapper {
    height: 87.5vh;
  }
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
  .info-button {
   
    /* stylig is absolutely cooked */
    background: transparent;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: white;
    display: flex;
    flex-direction: column;
    text-align: end;
    align-items: end;
    width: 95vw;
    margin-right: 40px;
    margin-top: 20px;
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
    box-sizing: border-box;
  }

  .game-board.sidebarHidden {
    /* Add your styles for when the sidebar is hidden */
  }

  .box {
    position: relative;
    overflow: hidden;
    background: #44444400;
    border: none;
    width: 100%;
    max-width: 200px;
    height: auto;
    aspect-ratio: 1 / 1;
    margin: 0 auto;
    transition-duration: 0.2s;
    transform: scale(1);
  }

  .box:hover {
    transform: scale(1.1);
    transition-duration: 0.2s;
  }

  .box img {
    position: absolute;
    top: 0;
    left: 0;
    width: 90%;
    height: 90%;
    object-fit: cover;
    border: 3px solid #444;
    transition-duration: 0.2s;
  }

  .highlight {
    border: 4px solid #1db954 !important;
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
  .create-playlist-btn {
  background-color: #1db954; 
  color: white;
  font-weight: 600;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease, transform 0.2s ease;
  margin-bottom: 10px;
}

.create-playlist-btn:hover {
  background-color: #1aa34a;
  transform: scale(1.05); 
}

.create-playlist-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(29, 185, 84, 0.4);
}

.create-playlist-btn:active {
  background-color: #188a3e;
  transform: scale(1);
}
  @keyframes fadeInOut {
    0% {
      opacity: 0;
    }
    15% {
      opacity: 1;
    }
    85% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  @keyframes popIn {
    0% {
      transform: scale(0);
    }
    80% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
  }
  @keyframes drawCheck {
    0% {
      width: 0;
      height: 0;
    }
    100% {
      width: 15px;
      height: 30px;
    }
  }
  @media (max-width: 767px) {
    .wrapper {
      height: 89vh;
    }
  }
</style>
