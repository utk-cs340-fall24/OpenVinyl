<script>
    import { createPost } from "$lib/utils";
    import { supabase } from '$lib/supabaseClient.js';
    import { onMount, onDestroy } from "svelte";
    import { createEventDispatcher } from 'svelte';
    import { selectedSong } from '$lib/stores'; 
    import { spotify } from "$lib/spotifyClient.js";

    const dispatch = createEventDispatcher();
    
    let user = null;
    let username = 'Guest';
    let content = '';
    let rating = '';
    let search = '';
    let searchResults = [];
    let errorMessage = '';
    let successMessage = '';
    
    let showAddPost = false; 
    let localSelectedTrack = null;
    
    const unsubscribe = selectedSong.subscribe(song => {
      if (song) {
        localSelectedTrack = {
          id: song.id,
          title: song.title, 
          artist: song.artist, 
          cover: song.cover, 
        };
      }
    });
    
    onDestroy(() => {
      unsubscribe();
    });
        
    onMount(async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error);
      }
      if (session) {
        user = session.user;
        showAddPost = true;
    
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
    
        if (profileError) {
          console.error('Error fetching profile:', profileError);
        } else {
          username = profile?.username || 'Guest';
        }
      } else {
        showAddPost = false;
      }
    });
    
    let debounceTimeout;
    
    async function getSearch() {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(async () => {
        try {
          if (search.trim() !== "") {
            const trackData = await spotify.searchTracks(search, { limit: 5 });
            displayResults(trackData);
          } else {
            searchResults = [];
          }
        } catch (err) {
          console.error('Error fetching track data:', err);
        }
      }, 300);
    }
    
    function displayResults(data) {
      if (data.tracks) {
        searchResults = data.tracks.items.map(track => ({
          id: track.id,
          name: track.name,
          artists: track.artists.map(artist => artist.name),
          album: track.album,
          cover: track.album.images[0]?.url,
        }));
      } else {
        searchResults = [];
      }
    }
    
    function selectSong(track) {
      // Create a new track object for the selected song from search results
      localSelectedTrack = {
        id: track.id,
        title: track.name,
        artist: track.artists.join(", "),
        cover: track.cover || track.album.images[0]?.url,
      };
      
      searchResults = []; // Clear search results
      search = ''; // Clear the search input
    }
    
    async function makePost() {
  errorMessage = '';
  successMessage = '';

  if (!localSelectedTrack) {
    errorMessage = 'Please select a song.';
    return;
  }
  if (!rating || isNaN(rating) || rating < 1 || rating > 10) {
    errorMessage = 'Please enter a rating between 1 and 10.';
    return;
  }

  try {
    const { error } = await createPost(
      user.id,
      content,
      localSelectedTrack.id,
      parseInt(rating)
    );

    if (error) {
      console.error('Error submitting review:', error);
      errorMessage = 'Error submitting review.';
    } else {
      successMessage = 'Review submitted successfully!';

      const newPost = {
        id: Date.now(), // tmp value
        content,
        rating: parseInt(rating),
        song_id: localSelectedTrack.id,
      };


      localSelectedTrack = null;
      rating = '';
      content = '';
      searchResults = [];
      dispatch('reviewSubmitted');
    }
  } catch (err) {
    console.error('Error creating post:', err);
    errorMessage = 'An error occurred while submitting your review.';
  }
}
  </script>
  
  {#if showAddPost}
    <div class="add-review-wrapper">
      <div class="add-review">
        <div class="top-bar">
          <div class="user-info">
            <img class="profile-pic" src={user?.user_metadata?.avatar_url || 'https://placehold.co/30'} alt="profile" />
            <span class="username">{username}</span>
          </div>
          <div class="top-bar-text">
            Create Review
          </div>
        </div>
  
        <div class="content-wrapper">
          {#if !localSelectedTrack}
            <div class="song-search">
              <input type="text" bind:value={search} on:input={getSearch} placeholder="Search for a song..." />
              {#if searchResults.length > 0}
                <ul class="search-results">
                  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                  {#each searchResults as track}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <li on:click={() => selectSong(track)}>
                      <img src={track.cover} alt="album cover" />
                      <div class="song-info">
                        <p class="song-name">{track.name}</p>
                        <p class="artist-name">{track.artists.join(", ")}</p>
                      </div>
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>
          {:else}
            <div class="selected-song">
              <img class="album-cover" src={localSelectedTrack.cover} alt="album cover" />
              <div class="song-info-wrapper">
                <p class="song-name">{localSelectedTrack.title}</p>
                <p class="artist-name">{localSelectedTrack.artist}</p>
                <button on:click={() => { localSelectedTrack = null; }} class="change-song-button">Change song</button>
              </div>
            </div>
  
            <div class="rating-wrapper">
              <label for="rating">Rating (1-10):</label>
              <input type="number" id="rating" min="1" max="10" bind:value={rating} />
            </div>
  
            <div class="description-wrapper">
              <label for="content">Description (optional):</label>
              <textarea id="content" bind:value={content} placeholder="Write your review..."></textarea>
            </div>
  
            {#if errorMessage}
              <p class="error-message">{errorMessage}</p>
            {/if}
            {#if successMessage}
              <p class="success-message">{successMessage}</p>
            {/if}
  
            <button class="submit-button" on:click={makePost}>Submit Review</button>
          {/if}
        </div>
      </div>
    </div>
  {:else}
    <p class="must-be-logged-in">You must be logged in to create a post.</p>
  {/if}
  <style>
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }
    
    .must-be-logged-in {
      font-size: 0.8rem;
      color: #b9b9b9;
      text-align: center;
      margin: 20px;
    }
  
    .add-review-wrapper {
      display: flex;
      justify-content: center;
      width: 100%;
    }
  
    .add-review {
      display: flex;
      flex-direction: column;
      background-color: #1d1f25;
      width: 70%;          
      margin: 20px auto;    
      padding: 10px;
      color: #f3f1f1;
      border: 1px solid #26282c;
      font-family: "Concert One", sans-serif;
      border-radius: 8px;
    }
  
    .top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background-color: #26282c;
      padding: 5px 10px;
      border-radius: 5px;
    }
  
    .user-info {
      display: flex;
      align-items: center;
    }
  
    .profile-pic {
      width: 25px;
      height: 25px;
      border-radius: 50%;
      margin-right: 8px;
    }
  
    .username {
      font-size: 0.8rem;
      color: #b9b9b9;
    }
  
    .top-bar-text {
      font-size: 1rem;
      color: #b9b9b9;
    }
  
    .content-wrapper {
      margin-top: 10px;
    }
  
    .song-search input {
      width: 100%;
      padding: 8px;
      margin: 0;
      background-color: #2e2e2e;
      border: 1px solid #444;
      color: #fff;
      font-size: 1rem;
      border-radius: 5px;
    }
  
    .search-results {
      list-style: none;
      padding: 0;
      margin: 0;
      max-height: 200px;
      overflow-y: auto;
      background-color: #2e2e2e;
      border: 1px solid #444;
      border-radius: 5px;
      margin-top: 5px;
    }
  
    .search-results li {
      display: flex;
      align-items: center;
      padding: 5px;
      cursor: pointer;
    }
  
    .search-results li:hover {
      background-color: #333;
    }
  
    .search-results img {
      width: 50px;
      height: 50px;
      margin-right: 10px;
      border-radius: 5px;
    }
  
    .selected-song {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }
  
    .album-cover {
      width: 100px;
      height: 100px;
      object-fit: cover;
      margin-right: 15px;
      border-radius: 10px;
    }
  
    .song-info-wrapper {
      flex: 1;
    }
  
    .song-name {
      font-size: 1.2rem;
      color: #e4e4e4;
      margin: 0;
    }
  
    .artist-name {
      font-size: 0.9rem;
      color: #b9b9b9;
    }
  
    .change-song-button {
      margin-top: 5px;
      padding: 5px 10px;
      background-color: #444;
      border: none;
      color: #fff;
      cursor: pointer;
      border-radius: 5px;
      font-size: 0.9rem;
    }
  
    .change-song-button:hover {
      background-color: #666;
    }
  
    .rating-wrapper,
    .description-wrapper {
      margin-top: 10px;
    }
  
    .rating-wrapper label,
    .description-wrapper label {
      display: block;
      margin-bottom: 5px;
      font-size: 0.9rem;
      color: #b9b9b9;
    }
  
    .rating-wrapper input,
    .description-wrapper textarea {
      width: 100%;
      padding: 8px;
      background-color: #2e2e2e;
      border: 1px solid #444;
      color: #fff;
      font-size: 1rem;
      border-radius: 5px;
    }
  
    .description-wrapper textarea {
      height: 100px;
      resize: vertical;
    }
  
    .submit-button {
      margin-top: 10px;
      padding: 10px;
      background-color: #007BFF;
      border: none;
      color: #fff;
      font-size: 1rem;
      cursor: pointer;
      width: 100%;
      border-radius: 5px;
      transition: background-color 0.2s;
    }
  
    .submit-button:hover {
      background-color: #0056b3;
    }
  
    .error-message {
      color: red;
      margin-top: 10px;
      font-size: 0.9rem;
    }
  
    .success-message {
      color: green;
      margin-top: 10px;
      font-size: 0.9rem;
    }
  </style>
  