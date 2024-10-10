<script>
  import { onMount, onDestroy } from "svelte";
  import { selectedSong } from "$lib/stores";
  import { getValidSpotifyAccessToken } from "$lib/utils";
  import { user } from "$lib/stores";
  import { derived } from 'svelte/store';

  let player;
  let currentSong = null;
  let recentSongs = [];
  let showPremiumMessage = true;
  let showPlayer = false;
  let isPlaying = false;

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
              getOAuthToken: (cb) => {
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
      recentSongs = recentSongs.slice(0, 3); // Limit to 3 recent songs
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

<!-- svelte-ignore missing-declaration -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="sidebar" on:drop={handleDrop} on:dragover|preventDefault>
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
            aria-label="Previous Track">⏮️</button>

          {#if isPlaying}
            <button on:click={pause} class="control-button" aria-label="Pause"
              >⏸️</button>
          {:else}
            <button on:click={play} class="control-button" aria-label="Play"
              >▶️</button>
          {/if}

          <button
            on:click={playNext}
            class="control-button"
            aria-label="Next Track">⏭️</button>
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
    font-family: "Concert One", sans-serif;
    background-color: #16181c;
    color: #f3f1f1;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  .sidebar {
    display: flex;
    flex-direction: column;
    background-color: #1d1f25;
    width: 100%;
    max-width: 300px;
    padding: 20px;
    color: #f3f1f1;
    border-right: 1px solid #26282c;
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

  .recent-songs {
    flex: 1;
    margin-top: 20px;
    overflow-y: auto;
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
