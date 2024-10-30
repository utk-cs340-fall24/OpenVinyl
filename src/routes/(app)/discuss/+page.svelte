<script>
    import { onMount } from "svelte";
    import { spotify } from "$lib/spotifyClient";
    import { authenticateClientCredentials } from "$lib/utils";
    export let data;
    let { popularSongs } = data;
  
    let songsDetailsMap = {};
    let loading = true;
    let error = null;
  
    onMount(async () => {
      try {
        await authenticateClientCredentials();
        const songIds = popularSongs.map((song) => song.song_id);
  
        const data = await spotify.getTracks(songIds);
  
        if (data && data.tracks) {
          data.tracks.forEach((track) => {
            if (track) {
              songsDetailsMap[track.id] = {
                title: track.name,
                artist: track.artists.map((artist) => artist.name).join(", "),
                image_url:
                  track.album.images[0]?.url || "https://placehold.co/300",
              };
            }
          });
        } else {
          console.log("No tracks found for the given IDs.");
        }
      } catch (err) {
        console.error("Error fetching song details:", err);
        error = err.message;
      } finally {
        loading = false;
      }
    });
  </script>
  
  <div class="wrapper">
    <h1 class="header">Discuss - Popular Songs</h1>
  
    <div class="post-wrapper">
      {#if loading}
        <p>Loading song details...</p>
      {:else if error}
        <p>Error: {error}</p>
      {:else}
        <div class="songs-list">
          {#each popularSongs as song}
            <div class="song-item">
              <img
                src={songsDetailsMap[song.song_id]?.image_url ||
                  "https://placehold.co/300"}
                alt="{songsDetailsMap[song.song_id]?.title ||
                  'Unknown Title'} album cover"
              />
              <div class="song-info">
                <h2>{songsDetailsMap[song.song_id]?.title || "Unknown Title"}</h2>
                <p>{songsDetailsMap[song.song_id]?.artist || "Unknown Artist"}</p>
                <p>{song.review_count} reviews</p>
                <a href="/discuss/{song.song_id}">View Discussions</a>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
  
<style>
    .header {
      text-align: center;
    }
  
    .wrapper {
      display: flex;
      flex-direction: column;
      padding: 20px;
      min-height: 100vh;
    }

    .post-wrapper {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  
    .songs-list {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      justify-content: center;
    }
  
    .song-item {
      display: flex;
      flex-direction: column;
      flex: 1 1 calc(25% - 40px);
      max-width: 200px;
      background-color: #1d1f25;
      color: #f3f1f1;
      padding: 10px;
      border-radius: 8px;
      text-align: center;
      box-sizing: border-box;
      border: 1px solid #26282c;
    }
  
    .song-item img {
      width: 100%;
      height: auto;
      border-radius: 8px;
    }
  
    .song-info {
      display: flex;
      flex-direction: column;
      flex: 1;
    }
  
    .song-info h2 {
      margin: 10px 0 5px;
      font-size: 1.2rem;
    }
  
    .song-info p {
      margin: 5px 0;
      font-size: 1rem;
    }
  
    .song-info a {
      margin-top: auto;
      display: inline-block;
      padding: 5px 10px;
      background-color: #007bff;
      color: #ffffff;
      border-radius: 4px;
      text-decoration: none;
    }
  
    .song-info a:hover {
      background-color: #0056b3;
    }
  
    @media (max-width: 1024px) {
      .song-item {
        flex: 1 1 calc(33.333% - 40px);
      }
    }
  
    @media (max-width: 768px) {
      .song-item {
        flex: 1 1 calc(50% - 40px); 
      }
    }
  
    @media (max-width: 480px) {
      .song-item {
        flex: 1 1 calc(100% - 40px);
      }
    }
  </style>
  