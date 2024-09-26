<script>
  export let uuid;
  export let username;
  export let rating;
  export let desc;
  export let likes_arr;
  export let post_id;
  export let song_id;
  export let likes_cnt;

  import { spotify } from "$lib/spotifyClient";
  import { onMount } from 'svelte';
  import { authenticateClientCredentials } from "$lib/utils";
  import { supabase } from "$lib/supabaseClient";
  import '@fortawesome/fontawesome-free/css/all.css';
  import '@fortawesome/fontawesome-free/js/all.js';

  let trackData;
  username = "";
  let liked = false;

  onMount(async () => {
    const { data, error } = await supabase.from("profiles").select().eq("id", uuid);
    if (data && data.length > 0) {
      username = data[0].username;
    }

    try {
      await authenticateClientCredentials();
      trackData = await spotify.getTrack(song_id);
    } catch (err) {
      console.error('Error fetching track data:', err);
    }

    // Check if user has already liked the post
    const { data: existingLike, error: checkError } = await supabase
      .from('likes')
      .select('*')
      .eq('post_id', post_id)
      .eq('profile_id', uuid)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing like:', checkError);
    } else {
      liked = !!existingLike;
    }
  });

  async function toggleLike() {
    const { data: existingLike, error: checkError } = await supabase
      .from('likes')
      .select('*')
      .eq('post_id', post_id)
      .eq('profile_id', uuid)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing like:', checkError);
      return;
    }

    if (existingLike) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', post_id)
        .eq('profile_id', uuid);

      if (error) {
        console.error('Error removing like:', error);
        return;
      }

      console.log('Like removed successfully!');
      likes_cnt -= 1;
      liked = false;
    } else {
      // Add the like if it doesn't exist
      const { error } = await supabase
        .from('likes')
        .insert({ post_id, profile_id: uuid });

      if (error) {
        console.error('Error adding like:', error);
        return;
      }

      console.log('Like added successfully!');
      likes_cnt += 1;
      liked = true;
    }
  }
</script>

<div class="wrapper">
  <div class="user-wrapper">
    <img class="profile-picture" src="https://placehold.co/50" alt="pfp">
    <h2>{username}</h2>
  </div>
  
  <div class="rating-wrapper">
    <p>{rating} / 10</p>
    <div>
      <button on:click={toggleLike}>
        <i 
          class="fa-heart fa-3x" 
          class:fa-solid={liked} 
          class:fa-regular={!liked} 
        >
        </i>
      </button>  
      <span style="font-size: 40px;">{likes_cnt}</span>
      <a class="login-href" href="/discover/{song_id}" id="login-button" style="color:white"><i class="fa-solid fa-arrow-right-from-bracket fa-3x"></i></a> 

    </div>
  </div>

  {#if trackData}
    <div class="song-info-wrapper">
      <img class="img-wrapper" src={trackData.album.images[0].url} alt="albumImg">
      <div class="info-text-wrapper">
        <p class="album-name">{trackData.album.name}</p>
        <p class="artist-name">{trackData.artists[0].name}</p>
      </div>
    </div>
  {:else}
    <div class="song-info-wrapper">
      <img class="img-wrapper" src="https://placehold.co/100" alt="albumImg">
      <div class="info-text-wrapper">
        <p class="album-name">album name</p>
        <p class="artist-name">artist name</p>
      </div>
    </div>
  {/if}
</div>

<!-- Styles -->
<style>
  .wrapper {
    display: grid;
    grid-template-columns: 400px auto;
    grid-template-rows: 60px auto;
    background-color: #1E1E1E;
    width: 55vw;
    margin-left: auto;
    margin-right: auto;
    border-radius: 5px;
    margin-top: 25px;
    margin-bottom: 25px;
    color: #f3f1f1;
    border: 2px solid #121212;
    font-family: "Concert One", sans-serif;
    border-radius: 15px;
  }

  .profile-picture {
    margin: 10px;
    display: inline-block;
    border-radius: 25px;
  }

  .img-wrapper {
    margin: 15px;
    width: 100px;
    height: 100px;
    background-color: #404040;
    display: inline-block;
  }

  .user-wrapper {
    grid-column: 1;
    grid-row: 1;
    width: fit-content;
    display: table;
  }

  .user-wrapper h2 {
    display: inline-block;
    padding: 0;
    margin: 0;
    display: table-cell;
    vertical-align: middle;
  }

  .rating-wrapper {
    grid-column: 2;
    grid-row: 2;
    padding: 10px;
  }

  .song-info-wrapper {
    background-color: #2c2c2c;
    grid-column: 1;
    grid-row: 2;
    display: grid;
    text-align: left;
    border-radius: 10px;
    margin: 15px;
  }

  .song-info-wrapper img {
    display: inline-block;
    grid-row: 1 / 3;
    grid-column: 1;
  }

  .info-text-wrapper {
    grid-column: 2;
    grid-row: 2;
    display: inline-block;
    width: fit-content;
    margin: 15px;
    margin-left: 0px;
  }

  .info-text-wrapper p {
    margin: 0;
  }

  .album-name {
    font-size: 24px;
    color: #e4e4e4;
  }

  .artist-name {
    font-size: 16px;
    color: #b9b9b9;
  }
</style>
