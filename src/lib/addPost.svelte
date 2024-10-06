<script>
    import { createPost } from "$lib/utils";
    import { authenticateClientCredentials } from "$lib/utils";
    import { supabase } from '$lib/supabaseClient.js';
    import { spotify } from "$lib/spotifyClient";
    import { onMount } from "svelte";
    import "@fortawesome/fontawesome-free/css/all.css";
    import "@fortawesome/fontawesome-free/js/all.js";
    import { createEventDispatcher } from 'svelte';
  
    let user;
    let username;
    let trackData;
    let selectedTrack;
  
    let content = '';
    let rating = '';
    let search = '';
    let searchResults = [];
    let errorMessage = '';
    let successMessage = '';
  
    const dispatch = createEventDispatcher();
  
    onMount(async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error);
        window.location.href = '/auth/signin';
      }
      if (session) {
        user = session.user;
  
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
  
        if (profileError) {
          console.error('Error fetching profile:', profileError);
          username = 'Guest';
        } else {
          username = profile.username || 'Guest';
        }
      } else {
        window.location.href = '/auth/signin';
      }
    });
  
    let debounceTimeout;
  
    async function getSearch() {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(async () => {
        try {
          await authenticateClientCredentials();
          if (search.trim() !== "") {
            trackData = await spotify.searchTracks(search, { limit: 5 });
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
      searchResults = data.tracks.items;
    }
  
    function selectSong(track) {
      selectedTrack = track;
      searchResults = [];
      search = '';
    }
  
    async function makePost() {
      errorMessage = '';
      successMessage = '';
  
      if (!selectedTrack) {
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
          selectedTrack.id,
          parseInt(rating)
        );
  
        if (error) {
          console.error('Error submitting review:', error);
          errorMessage = 'Error submitting review.';
        } else {
          successMessage = 'Review submitted successfully!';
          selectedTrack = null;
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
        {#if !selectedTrack}
          <div class="song-search">
            <input type="text" bind:value={search} on:input={getSearch} placeholder="Search for a song..." />
            {#if searchResults.length > 0}
              <ul class="search-results">
                {#each searchResults as track}
                  <li on:click={() => selectSong(track)}>
                    <img src={track.album.images[0]?.url} alt="album cover" />
                    <div class="song-info">
                      <p class="song-name">{track.name}</p>
                      <p class="artist-name">{track.artists[0]?.name}</p>
                    </div>
                  </li>
                {/each}
              </ul>
            {/if}
          </div>
        {:else}
          <div class="selected-song">
            <img class="album-cover" src={selectedTrack.album.images[0]?.url} alt="album cover" />
            <div class="song-info-wrapper">
              <p class="song-name">{selectedTrack.name}</p>
              <p class="artist-name">{selectedTrack.artists[0]?.name}</p>
              <button on:click={() => { selectedTrack = null; }} class="change-song-button">Change song</button>
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
  <style>
    *,
    *::before,
    *::after {
      box-sizing: border-box;
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
    }
  
    .top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background-color: #26282c;
      padding: 5px 10px;
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
    }
  
    .search-results {
      list-style: none;
      padding: 0;
      margin: 0;
      max-height: 200px;
      overflow-y: auto;
      background-color: #2e2e2e;
      border: 1px solid #444;
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
    }
  
    .selected-song {
      display: flex;
      align-items: center;
    }
  
    .album-cover {
      width: 100px;
      height: 100px;
      object-fit: cover;
      margin-right: 15px;
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
    }
  
    .rating-wrapper input,
    .description-wrapper textarea {
      width: 100%;
      padding: 8px;
      background-color: #2e2e2e;
      border: 1px solid #444;
      color: #fff;
      font-size: 1rem;
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
    }
  
    .submit-button:hover {
      background-color: #0056b3;
    }
  
    .error-message {
      color: red;
      margin-top: 10px;
    }
  
    .success-message {
      color: green;
      margin-top: 10px;
    }
  </style>
  