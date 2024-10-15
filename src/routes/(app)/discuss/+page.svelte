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

      // Fetch song details from Spotify
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

<h1>Discuss - Popular Songs</h1>


{#if loading}
  <p>Loading song details...</p>
{:else if error}
  <p>Error: {error}</p>
{:else}
  <div class="songs-list">
    {#each popularSongs as song}
      <div class="song-item">
        <img src={songsDetailsMap[song.song_id]?.image_url || 'https://placehold.co/300'} alt="{songsDetailsMap[song.song_id]?.title || 'Unknown Title'} album cover" />
        <div class="song-info">
          <h2>{songsDetailsMap[song.song_id]?.title || 'Unknown Title'}</h2>
          <p>{songsDetailsMap[song.song_id]?.artist || 'Unknown Artist'}</p>
          <p>{song.review_count} reviews</p>
          <a href="/discuss/{song.song_id}">View Discussions</a>
        </div>
      </div>
    {/each}
  </div>
{/if}

<style>
    /* Your styles here */
    .songs-list {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
    }
  
    .song-item {
      width: 200px;
      background-color: #1d1f25;
      color: #f3f1f1;
      padding: 10px;
      border-radius: 8px;
      text-align: center;
    }
  
    .song-item img {
      width: 100%;
      border-radius: 8px;
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
      display: inline-block;
      margin-top: 10px;
      padding: 5px 10px;
      background-color: #007bff;
      color: #ffffff;
      border-radius: 4px;
      text-decoration: none;
    }
  
    .song-info a:hover {
      background-color: #0056b3;
    }
  </style>