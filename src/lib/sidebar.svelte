<script>
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";

  let player;
  let recentSongs = [];
  let showPremiumMessage = false;
  let showPlayer = true;
  let sidebarVisible = true;

  onMount(async () => {
    const session = await supabase.auth.getSession();
    const userId = session.data.session?.user?.id;
    if (!userId) return;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select(
        "spotify_access_token, spotify_refresh_token, spotify_token_expires"
      )
      .eq("id", userId)
      .single();
  
    if (error) {
      console.error("Error fetching Spotify tokens:", error);
      return;
    }

    let { spotify_access_token, spotify_refresh_token, spotify_token_expires } =
      profile;

  console.log(profile)
    if (new Date() > new Date(spotify_token_expires)) {
      const refreshResponse = await fetch("/refresh-spotify-token", {
        method: "GET",
        headers: {
          //note this is the supabase access token
          Authorization: `Bearer ${session.data.session.access_token}`,
        },
      });
      const refreshData = await refreshResponse.json();

      if (refreshData.success) {
        spotify_access_token = refreshData.access_token;
      } else {
        console.error("Error refreshing access token:", refreshData.message);
        return;
      }
    }

    const profileResponse = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${spotify_access_token}`,
      },
    });
    console.log(spotify_access_token)
    const profileData = await profileResponse.json();
    console.log("spotify profile: ", profileData)
    if (profileData.product !== "premium") {
      showPlayer = false;
      showPremiumMessage = true;
      return;
    }

    // Load the Spotify SDK
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
        console.error("Authentication Error:", message);

        if (message.includes("premium")) {
          showPlayer = false;
          showPremiumMessage = true;
        }
      });
      player.addListener("playback_error", ({ message }) => {
        console.error("Playback Error:", message);
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
        play: true,
      }),
    });
  }

  const playPrev = () => {
    player
      .previousTrack()
      .then(() => {
        console.log("Skipped to previous track");
      })
      .catch((error) => console.error(error));
  };

  const pause = () => {
    player
      .togglePlay()
      .then(() => {
        console.log("Toggled playback");
      })
      .catch((error) => console.error(error));
  };

  const playNext = () => {
    player
      .nextTrack()
      .then(() => {
        console.log("Skipped to next track");
      })
      .catch((error) => console.error(error));
  };

  function hidePremiumMessage() {
    showPremiumMessage = false;
  }
</script>

<div class="sidebar">
  {#if showPremiumMessage}
    <div class="premium-message">
      <p class="small-text">
        You need a Spotify Premium account to use the player.
      </p>
      <button on:click={hidePremiumMessage} class="small-button">Dismiss</button
      >
    </div>
  {/if}

  {#if showPlayer}
    <div class="playback-section">
      <div class="playback-img">
        <img
          src="https://via.placeholder.com/200?text=Album+Cover"
          alt="Album Cover"
        />
      </div>
      <div class="playback-controls">
        <button on:click={playPrev} class="control-button">⏮️</button>
        <button on:click={pause} class="control-button">⏯️</button>
        <button on:click={playNext} class="control-button">⏭️</button>
      </div>
      <div class="song-info">
        <p class="song-title">Track Title</p>
        <p class="song-artist">Artist Name</p>
      </div>
    </div>
    <div class="recent-songs">
      <p class="section-header">Recent Songs</p>
      {#each recentSongs.slice(0, 3) as song}
        <div class="recent-song">
          <img src={song.cover} alt="Album Cover" class="recent-song-image" />
          <div class="recent-song-info">
            <p class="recent-song-title">{song.title}</p>
            <p class="recent-song-artist">{song.artist}</p>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .premium-message {
    padding: 10px;
    text-align: center;
    color: #b9b9b9;
    border-radius: 5px;
    margin-bottom: 20px;
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

  .playback-controls {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-bottom: 15px;
  }

  .control-button {
    width: 50px;
    height: 50px;
    background-color: #26282c;
    border: none;
    border-radius: 50%;
    color: #f3f1f1;
    font-size: 30px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .control-button:hover {
    background-color: #007bff;
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

  .recent-songs {
    flex: 1;
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
    cursor: pointer;
    transition: background-color 0.2s;
    padding: 5px;
    border-radius: 5px;
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
    }

    .playback-img img {
      max-width: 150px;
    }
  }
</style>
