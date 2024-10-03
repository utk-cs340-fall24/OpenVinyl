<script>
  export let uuid; // Owner of post
  export let logged_in_user_uuid; // Logged in user (possibly null if not logged in)
  export let rating;
  export let post_id;
  export let song_id;
  export let likes_cnt;
  export let desc;
  export let likes_arr;


  import { spotify } from "$lib/spotifyClient";
  import { onMount } from "svelte";
  import { authenticateClientCredentials } from "$lib/utils";
  import { supabase } from "$lib/supabaseClient";
  import "@fortawesome/fontawesome-free/css/all.css";
  import "@fortawesome/fontawesome-free/js/all.js";

  let trackData = null;
  let username = "";
  let liked = false;
  let processingLike = false; 

  onMount(async () => {
    try {
      await fetchUserData();
      await fetchTrackData();
      await checkIfLiked();
      console.log(desc);
      console.log(likes_arr);
    } catch (err) {
      console.error("Error during onMount:", err);
    }
  });

  async function fetchUserData() {
    const { data, error } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", uuid)
      .maybeSingle();
      
    if (error) throw error;
    if (data) username = data.username;
  }

  async function fetchTrackData() {
    await authenticateClientCredentials();
    const track = await spotify.getTrack(song_id);
    trackData = track;
    console.log(track);
  }

  async function checkIfLiked() {
    if (!logged_in_user_uuid) return;
    
    const { data: existingLike, error } = await supabase
      .from("likes")
      .select("*")
      .eq("post_id", post_id)
      .eq("profile_id", logged_in_user_uuid)
      .maybeSingle();

    if (error) throw error;
    liked = !!existingLike;
  }

  async function toggleLike() {
    if (processingLike || !logged_in_user_uuid) return;

    processingLike = true;
    try {
      const { data: existingLike } = await supabase
        .from("likes")
        .select("*")
        .eq("post_id", post_id)
        .eq("profile_id", logged_in_user_uuid)
        .maybeSingle();

      if (existingLike) {
        await removeLike();
      } else {
        await addLike();
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    } finally {
      processingLike = false;
    }
  }

  async function addLike() {
    const { error } = await supabase
      .from("likes")
      .insert({ post_id, profile_id: logged_in_user_uuid });

    if (error) throw error;

    liked = true;
    likes_cnt += 1;
  }

  async function removeLike() {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("post_id", post_id)
      .eq("profile_id", logged_in_user_uuid);

    if (error) throw error;

    liked = false;
    likes_cnt -= 1;
  }
</script>

<div class="wrapper">
  <div class="user-wrapper">
    <img class="profile-picture" src="https://placehold.co/50" alt="pfp" />
    <h2>{username}</h2>
  </div>

  <div class="rating-wrapper">
    <p>{rating} / 10</p>
    <div>
      <button on:click={toggleLike} disabled={!logged_in_user_uuid} class="like-button">
        <span>{liked ? 'Unlike ' : 'Like '} <i class="fa-solid fa-thumbs-up"></i></span> 
      </button>
      <span>{likes_cnt}</span>
     
      <a class="discover-button" href="/discover/{song_id}" id="discover-button" style="color:white">
        <i class="fa-solid fa-arrow-right-from-bracket"></i>
      </a>
    </div>
  </div>

  {#if trackData}
    <div class="song-info-wrapper">
      <img
        class="img-wrapper"
        src={trackData.album.images[0].url}
        alt="albumImg"
      />
      <div class="info-text-wrapper">
        <p class="song-name">{trackData.name}</p>
        <p class="artist-name">{trackData.artists[0].name}</p>
      </div>
    </div>
  {:else}
    <div class="song-info-wrapper">
      <img class="img-wrapper" src="https://placehold.co/100" alt="albumImg" />
      <div class="info-text-wrapper">
        <p class="song-name">song name</p>
        <p class="artist-name">artist name</p>
      </div>
    </div>
  {/if}
</div>

<style>
  .wrapper {
    display: grid;
    grid-template-columns: 400px auto;
    grid-template-rows: 60px auto;
    background-color: #1e1e1e;
    width: 55vw;
    margin-left: 325px;
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

  .song-name {
    font-size: 24px;
    color: #e4e4e4;
  }

  .artist-name {
    font-size: 16px;
    color: #b9b9b9;
  }

  .discover-button{
    background-color: #00000000;
    border-radius: 5px;
    padding: 15px;
    text-decoration: none;
    font-size: 20px;
    color:white;
  }
  .discover-button:hover{
    color:#404040
  }

  .like-button{
    border:0px;
    border-radius: 5px;
    padding: 5px;
    margin: 5px;
    color:white;
    background-color: #00000000;
    font-size: 20px;
  }
  .like-button:hover{
    color:#404040;
  }
</style>
