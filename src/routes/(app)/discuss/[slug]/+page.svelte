<script>
    import { onMount } from 'svelte';
    import {spotify} from '$lib/spotifyClient';
    import {authenticateClientCredentials} from "$lib/utils";
    import { goto } from '$app/navigation';
  
    export let data;
    let { reviews, song_id } = data;
  
  
    // State variables
    let songDetails = {
      title: 'Loading...',
      artist: '',
      image_url: 'https://placehold.co/300',
    };
    let loading = true;
    let error = null;
    
    // Spotify Authentication
  

    onMount(async () => {
      try {
        await authenticateClientCredentials();
        // Fetch song details from Spotify
        const data = await spotify.getTrack(song_id);
  
        if (data) {
          songDetails = {
            title: data.name,
            artist: data.artists.map((artist) => artist.name).join(', '),
            image_url: data.album.images[0]?.url || 'https://placehold.co/300',
          };
          console.log(data)
        } else {
          console.log('No track found for the given ID.');
          songDetails = {
            title: 'Unknown Title',
            artist: 'Unknown Artist',
            image_url: 'https://placehold.co/300',
          };
        }
      } catch (err) {
        console.error('Error fetching song details:', err);
        error = err.message;
      } finally {
        loading = false;
        

      }
    });
  </script>

{#if loading}
  <p>Loading song details...</p>
{:else if error}
  <p>Error: {error}</p>
{:else}
  <div class="song-details">
    <img src={songDetails.image_url} alt="{songDetails.title} album cover" />
    <div class="song-info">
      <h1>{songDetails.title}</h1>
      <p>by {songDetails.artist}</p>
    </div>
  </div>

  <h2>Reviews</h2>

  {#if reviews.length > 0}
    <div class="reviews-list">
      {#each reviews as review}
        <div class="review-item">
          <div class="user-info">
            <img src={review.profiles.avatar_url || 'https://placehold.co/50'} alt="User avatar" />
            <span>{review.profiles.username}</span>
          </div>
          <div class="review-content">
            <p>{review.content}</p>
            {#if review.rating}
              <p class="rating">Rating: {review.rating}/10</p>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <p>No reviews yet. Be the first to review!</p>
  {/if}
{/if}

<style>
  /* Add your styles here */
  .song-details {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }

  .song-details img {
    width: 200px;
    height: 200px;
    object-fit: cover;
    border-radius: 8px;
    margin-right: 20px;
  }

  .song-info h1 {
    margin: 0;
    font-size: 2rem;
  }

  .song-info p {
    margin: 5px 0;
    font-size: 1.2rem;
    color: #888;
  }

  .reviews-list {
    margin-top: 20px;
  }

  .review-item {
    background-color: #1d1f25;
    color: #f3f1f1;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 15px;
  }

  .user-info {
    display: flex;
    align-items: center;
  }

  .user-info img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 10px;
  }

  .review-content {
    margin-top: 10px;
  }

  .rating {
    margin-top: 10px;
    font-weight: bold;
  }
</style>