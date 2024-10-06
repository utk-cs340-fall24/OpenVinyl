<script>
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import { selectedSong } from '$lib/stores'; 

  let player;
  let currentSong = null;
  let recentSongs = [];
  let showPremiumMessage = false;
  let showPlayer = true;
  let isPlaying = false; 

  onMount(async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error fetching session:", error);
      return;
    }

    const userId = session?.user?.id;
    if (!userId) {
      showPlayer = false;
      showPremiumMessage = true; 
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("spotify_access_token, spotify_refresh_token, spotify_token_expires")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching Spotify tokens:", profileError);
      return;
    }

    let { spotify_access_token, spotify_refresh_token, spotify_token_expires } = profile;

    // If the token has expired, refresh it (this / 4 is temporary i think theres a bug with not refreshing)
    if (new Date() > new Date(spotify_token_expires / 4)) {
      const refreshResponse = await fetch("/refresh-spotify-token", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const refreshData = await refreshResponse.json();

      if (refreshData.success) {
        spotify_access_token = refreshData.access_token;
        // Update Supabase with the new access token and expiration
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            spotify_access_token: spotify_access_token,
            spotify_token_expires: new Date(Date.now() + refreshData.expires_in * 1000),
          })
          .eq("id", userId);

        if (updateError) {
          console.error("Error updating access token:", updateError.message);
          return;
        }
      } else {
        console.error("Error refreshing access token:", refreshData.message);
        return;
      }
    }

    // Check if the user is a Spotify premium user
    const profileResponse = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${spotify_access_token}`,
      },
    });

    const profileData = await profileResponse.json();
    console.log("Spotify profile:", profileData);

    if (profileData.product !== "premium") {
      showPlayer = false;
      showPremiumMessage = true;
      return;
    }

    // Load the Spotify Web Playback SDK
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      player = new window.Spotify.Player({
        name: "Web Playback SDK Quick Start Player",
        getOAuthToken: (cb) => {
          cb(spotify_access_token);
        },
        volume: 0.5,
      });

      // Error handling
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
        transferPlaybackHere(device_id);
      });

      player.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
      });

      player.connect();
    };
  });

  function updateCurrentSong(track) {
    currentSong = {
      title: track.name,
      artist: track.artists.map((artist) => artist.name).join(", "),
      cover: track.album.images[0]?.url,
    };
  }

  function updateRecentSongs(track) {
    const song = {
      title: track.name,
      artist: track.artists.map((artist) => artist.name).join(", "),
      cover: track.album.images[0]?.url,
    };

    if (recentSongs.length === 0 || recentSongs[0].title !== song.title) {
      recentSongs = [song, ...recentSongs.slice(0, 4)]; // keep 5 recent songs only
    }
  }

  async function transferPlaybackHere(device_id) {
    const session = await supabase.auth.getSession();
    const userId = session.data.session?.user?.id;

    if (!userId) return;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("spotify_access_token")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching access token:", error);
      return;
    }

    const { spotify_access_token } = profile;

    await fetch("https://api.spotify.com/v1/me/player", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${spotify_access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        device_ids: [device_id],
      }),
    });
  }

  const playPrev = () => {
    player.previousTrack()
      .then(() => {
        console.log("Skipped to previous track");
      })
      .catch(error => console.error(error));
  };

  const play = () => {
    player.resume()
      .then(() => {
        console.log("Playback resumed");
        isPlaying = true;
      })
      .catch(error => console.error(error));
  };

  const pause = () => {
    player.pause()
      .then(() => {
        console.log("Playback paused");
        isPlaying = false;
      })
      .catch(error => console.error(error));
  };

  const playNext = () => {
    player.nextTrack()
      .then(() => {
        console.log("Skipped to next track");
      })
      .catch(error => console.error(error));
  };

  function handleDragStart(event, song) {
    console.log(song)
    event.dataTransfer.setData('application/json', JSON.stringify(song));
    event.dataTransfer.effectAllowed = 'copy';
  }

  function hidePremiumMessage() {
    showPremiumMessage = false;
  }
</script>

<div class="sidebar">
  {#if showPremiumMessage}
    <div class="premium-message">
      <p class="small-text">You need a Spotify Premium account to use the player.</p>
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
          <button on:click={playPrev} class="control-button" aria-label="Previous Track">⏮️</button>

          {#if isPlaying}
            <button on:click={pause} class="control-button" aria-label="Pause">⏸️</button>
          {:else}
            <button on:click={play} class="control-button" aria-label="Play">▶️</button>
          {/if}

          <button on:click={playNext} class="control-button" aria-label="Next Track">⏭️</button>
        </div>
      </div>

      <div class="recent-songs">
        <p class="section-header">Recent Songs</p>
        {#each recentSongs as song (song.title)}
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
