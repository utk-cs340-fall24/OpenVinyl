<script>
  import { onMount, onDestroy } from "svelte";
  import { selectedSong } from "$lib/stores";
  import { getValidSpotifyAccessToken } from "$lib/utils";
  import { user } from "$lib/stores";
  import { derived } from 'svelte/store';
  import "@fortawesome/fontawesome-free/css/all.css";
  import "@fortawesome/fontawesome-free/js/all.js";

  export let sidebarHidden;

  let player;
  let currentSong = null;
  let recentSongs = [];
  let showPremiumMessage = true;
  let showPlayer = false;
  let isPlaying = false;
  let pinnedSidebar = false;

  const userReady = derived(user, $user => $user); // Wait for user to be set

  onMount(async () => {
    let unsubscribeUser;
    let currentUser;

    try {
      unsubscribeUser = userReady.subscribe(async (value) => {
        if (value && value.role === 'authenticated') {
          currentUser = value;

          // User is ready, continue to set up the player
          const accessToken = await getValidSpotifyAccessToken(currentUser.id);
          if (!accessToken) {
            showPlayer = false;
            showPremiumMessage = true;
            return;
          }

          const profileResponse = await fetch("https://api.spotify.com/v1/me", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (!profileResponse.ok) {
            const errorData = await profileResponse.json();
            console.error("Error fetching Spotify profile:", errorData);
            showPlayer = false;
            showPremiumMessage = true;
            return;
          }

          const profileData = await profileResponse.json();
          console.log("Spotify profile:", profileData);
          
          if (profileData.product !== "premium") {
            showPlayer = false;
            showPremiumMessage = true;
            return;
          }
console.log('logged in')
          const script = document.createElement("script");
          script.src = "https://sdk.scdn.co/spotify-player.js";
          script.async = true;
          document.body.appendChild(script);

          window.onSpotifyWebPlaybackSDKReady = () => {
            player = new window.Spotify.Player({
              name: "OpenVinyl Web Playback SDK Player",
              getOAuthToken: async (cb) => {
                const accessToken = await getValidSpotifyAccessToken(currentUser.id);
                cb(accessToken);
              },
              volume: 0.5,
            });

            player.addListener("initialization_error", ({ message }) => {
              console.error("Initialization Error:", message);
            });

            player.addListener("authentication_error", ({ message }) => {
              console.error("Authentication Error:", message);
              if (message.includes("Premium")) {
                showPlayer = false;
                showPremiumMessage = true;
              }
            });

            player.addListener("account_error", ({ message }) => {
              console.error("Account Error:", message);
              if (message.includes("premium")) {
                showPlayer = false;
                showPremiumMessage = true;
              }
            });

            player.addListener("playback_error", ({ message }) => {
              console.error("Playback Error:", message);
            });

            player.addListener("player_state_changed", (state) => {
              if (!state) return;

              const track = state.track_window.current_track;
              updateCurrentSong(track);
              updateRecentSongs(track);
              isPlaying = state.paused ? false : true;
            });

            player.addListener("ready", ({ device_id }) => {
              console.log("Ready with Device ID", device_id);
              showPlayer = true;
              showPremiumMessage =false;
              transferPlaybackHere(device_id, accessToken);
            });

            player.addListener("not_ready", ({ device_id }) => {
              console.log("Device ID has gone offline", device_id);
            });

            player.connect();
          };
        } else {
          showPlayer = false; // User is a guest, hide player
          showPremiumMessage = true;
        }
      });
    } catch (error) {
      console.error("Error during sidebar mount:", error);
      showPlayer = false;
      showPremiumMessage = true;
    }

    return () => {
      unsubscribeUser && unsubscribeUser();
      if (player) {
        player.disconnect();
        console.log("Player disconnected.");
      }
    };
  });

  function updateCurrentSong(track) {
  if (!track) {
    // Handle the case when track is null or undefined
    currentSong = {
      title: "No song playing",
      artist: "Unknown artist",
      cover: "https://placehold.co/300", // Use a placeholder image
    };
    return;
  }

  currentSong = {
    title: track.name || "Unknown title",
    artist: track.artists?.map((artist) => artist.name).join(", ") || "Unknown artist",
    cover: track.album?.images[0]?.url || "https://placehold.co/300", 
  };
}

function updateRecentSongs(track) {
  if (!track || !track.id) {
    return;
  }

  const song = {
    id: track.id,
    title: track.name || "Unknown title",
    artist: track.artists?.map((artist) => artist.name).join(", ") || "Unknown artist",
    cover: track.album?.images[0]?.url || "https://placehold.co/300", 
  };

  const exists = recentSongs.some(existingSong => existingSong.id === song.id);

  if (!exists) {
    recentSongs = [song, ...recentSongs]; 

    if (recentSongs.length > 3) {
      recentSongs = recentSongs.slice(0, 3); // Limit to 6 recent songs
    }
  }
}

  async function transferPlaybackHere(device_id, accessToken) {
    try {
      await fetch("https://api.spotify.com/v1/me/player", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device_ids: [device_id],
        }),
      });

      console.log("Playback transferred to the Web Playback SDK player.");
    } catch (error) {
      console.error("Error transferring playback:", error);
    }
  }

  const playPrev = () => {
    if (player) {
      player
        .previousTrack()
        .then(() => {
          console.log("Skipped to previous track");
        })
        .catch((error) => console.error(error));
    }
  };

  const play = () => {
    if (player) {
      player
        .resume()
        .then(() => {
          console.log("Playback resumed");
          isPlaying = true;
        })
        .catch((error) => console.error(error));
    }
  };

  const pause = () => {
    if (player) {
      player
        .pause()
        .then(() => {
          console.log("Playback paused");
          isPlaying = false;
        })
        .catch((error) => console.error(error));
    }
  };

  const playNext = () => {
    if (player) {
      player
        .nextTrack()
        .then(() => {
          console.log("Skipped to next track");
        })
        .catch((error) => console.error(error));
    }
  };

  function handleDragStart(event, song) {
    console.log(song);
    event.dataTransfer.setData("application/json", JSON.stringify(song));
    event.dataTransfer.effectAllowed = "copy";
  }

  function handleDrop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("application/json");
    if (data) {
      const song = JSON.parse(data);
      updateRecentSongs(song);
      selectedSong.set(song); 
    }
  }

  function hidePremiumMessage() {
    showPremiumMessage = false;
  }

</script>

<head>
  <link href="./../node_modules/@fortawesome/fontawesome-free/css/all.min.css" rel="stylesheet">
</head>
<!-- svelte-ignore missing-declaration -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="sidebar {pinnedSidebar ? 'pinned' : ''} {sidebarHidden ? '' : 'hidden'}" on:drop={handleDrop} on:dragover|preventDefault>
  <div class="button-wrapper">
    <button class="pin-button" on:click={() => pinnedSidebar = !pinnedSidebar}><i class="fa fa-thumb-tack" aria-hidden="true"></i></button>
    <button class="close-button {sidebarHidden ? '' : 'rotated'}" on:click={() => sidebarHidden = !sidebarHidden}><i class="fa-solid fa-chevron-left"></i></button>
  </div>
  {#if showPremiumMessage}
    <div class="premium-message">
      <p class="small-text">
        You need a Spotify Premium account to use the player.
      </p>
      <button on:click={hidePremiumMessage} class="small-button">Dismiss</button>
    </div>
  {/if}

  {#if !showPremiumMessage}
    {#if showPlayer}
      <div class="playback-section">
        {#if currentSong}
          <div class="playback-img">
            <img src={currentSong.cover} alt="Album Cover" />
          </div>
          <div class="song-info">
            <p class="song-title">{currentSong.title}</p>
            <p class="song-artist">{currentSong.artist}</p>
          </div>
        {/if}

        <div class="playback-controls">
          <button
            on:click={playPrev}
            class="control-button"
            aria-label="Previous Track">
            
            <i class="fa-solid fa-backward"></i>
          </button>

          {#if isPlaying}
            <button on:click={pause} class="control-button" aria-label="Pause">
              <i class="fa-solid fa-pause"></i>
            </button>
          {:else}
            <button on:click={play} class="control-button" aria-label="Play">
              <i class="fa-solid fa-play"></i>
            </button>
          {/if}

          <button
            on:click={playNext}
            class="control-button"
            aria-label="Next Track">
            <i class="fa-solid fa-forward"></i>
          </button>
        </div>
      </div>

      <div class="recent-songs">
        <p class="section-header">Recent Songs</p>
        {#each recentSongs as song (song.id + '-' + song.title)}
          <div
            class="recent-song"
            draggable="true"
            on:dragstart={(e) => handleDragStart(e, song)}
          >
            <img src={song.cover} alt="Album Cover" class="recent-song-image" />
            <div class="recent-song-info">
              <p class="recent-song-title">{song.title}</p>
              <p class="recent-song-artist">{song.artist}</p>
            </div>
          </div>
        {/each}
      </div>
      
    {/if}
  {/if}
</div>

<style>
  .premium-message {
    padding: 10px;
    text-align: center;
    color: #b9b9b9;
    border-radius: 5px;
    margin-bottom: 20px;
    background-color: #2c2f34;
  }

  .small-text {
    font-size: 0.9rem;
    margin: 0 0 10px 0;
  }

  .small-button {
    padding: 5px 10px;
    background-color: #007bff;
    border: none;
    color: white;
    border-radius: 3px;
    cursor: pointer;
    font-size: 0.8rem;
    transition: background-color 0.3s;
  }

  .small-button:hover {
    background-color: #0056b3;
  }

  :global(body) {
    margin: 0;
    
    background-color: #16181c;
    color: #f3f1f1;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  .sidebar {
    top: 13%;
    left: 0%;
    z-index: 1000; /* Ensure it floats on top of other elements */
    display: flex;
    flex-direction: column;
    background-color: #1d1f25;
    width: 300px;
    padding: 20px;
    color: #f3f1f1;
    border-right: 1px solid #26282c;
    border-radius:0px 25px 25px 0px;
    position:absolute;
    
    transition: transform 0.5s ease-in-out;
  }

  .hidden {
    transform: translateX(-250px);
    transition: transform 0.5s ease-in-out;
  }

  .pinned{
    position: fixed !important;
  }

  .playback-section {
    text-align: center;
    margin-bottom: 30px;
  }

  .playback-img img {
    width: 100%;
    max-width: 200px;
    border-radius: 10px;
    margin-bottom: 15px;
  }

  .song-info {
    text-align: center;
  }

  .song-title {
    font-size: 1.2rem;
    margin: 5px 0;
  }

  .song-artist {
    font-size: 1rem;
    color: #b9b9b9;
  }

  .playback-controls {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 10px;
  }

  .control-button {
    width: 50px;
    height: 50px;
    background-color: #26282c;
    border: none;
    border-radius: 50%;
    color: #f3f1f1;
    font-size: 20px;
    cursor: pointer;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .control-button:hover {
    background-color: #007bff;
  }

  .pin-button{
    width: 30px;
    height: 30px;
    background-color: #26282c00;
    border: none;
    border-radius: 50%;
    color: #f3f1f1;
    font-size: 20px;
    cursor: pointer;
    transition: background-color 0.2s;
    display: inline-block;
    align-items: center;
    justify-content: center;
    margin-bottom:10px;
  }

  .pin-button:hover{
    background-color: #434343;
  }

  .rotated{
    transform: translateX(20px) rotateY(180deg) !important;
    transition: transform 0.5s ease-in-out;
  }

  .close-button{
    width: 30px;
    height: 30px;
    background-color: #26282c00;
    border: none;
    border-radius: 50%;
    color: #f3f1f1;
    font-size: 20px;
    cursor: pointer;
    transition: background-color 0.2s;
    display: inline-block;
    align-items: center;
    justify-content: center;
    margin-bottom:10px;
    margin-left: 180px;
    transform: translateX(20px);
    transition: transform 0.5s ease-in-out;
  }

  .close-button:hover{
    background-color: #434343;
  }

  .recent-songs {
    flex: 1;
    overflow-y: auto;
  }

  .recent-songs p{
    margin: 0;
  }

  .section-header {
    font-size: 1.1rem;
    margin-bottom: 15px;
    border-bottom: 1px solid #26282c;
    padding-bottom: 10px;
  }

  .recent-song {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    padding: 5px;
    border-radius: 5px;
    transition: background-color 0.2s;
    cursor: grab;
  }

  .recent-song:active {
    cursor: grabbing;
  }

  .recent-song:hover {
    background-color: #26282c;
  }

  .recent-song-image {
    width: 60px;
    height: 60px;
    border-radius: 5px;
    margin-right: 15px;
  }

  .recent-song-info {
    flex: 1;
  }

  .recent-song-title {
    font-size: 1rem;
    margin: 0;
  }

  .recent-song-artist {
    font-size: 0.9rem;
    color: #b9b9b9;
    margin: 0;
  }

  @media (max-width: 768px) {
    .sidebar {
      display: none;
      border-right: none;
      border-bottom: 1px solid #26282c;
    }

    .playback-controls {
      gap: 10px;
    }

    .control-button {
      width: 40px;
      height: 40px;
      font-size: 18px;
    }

    .playback-img img {
      max-width: 150px;
    }
  }
</style>
