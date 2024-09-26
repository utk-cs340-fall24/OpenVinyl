<script>
	export let username;
	export let rating;
  export let desc;
  export let song_id;
  import { spotify, setAccessToken } from "$lib/spotifyClient";
  import { onMount } from 'svelte';
  import { authenticateClientCredentials } from "$lib/utils";
  import { supabase } from "$lib/supabaseClient";
  
  let trackData;
  onMount(async () => {
    const { data, error }  = await supabase.from("profiles").select().eq("id", username);
    username = data[0].username;
    try {
      await authenticateClientCredentials();
      trackData = await spotify.getTrack(song_id); 
      console.log(trackData);
    } catch (err) {
      console.error('Error fetching track data:', err);
    }
  });

</script>



<div class="wrapper">
  <div class="user-wrapper">
    <img class="profile-picture" src="https://placehold.co/50" alt="pfp">
    <h2>{username}</h2>
  </div>
  <div class="rating-wrapper">
    <p>{rating} / 10</p>
    <p>{desc}</p>
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
      <img class="img-wrapper" src=https://placehold.co/100 alt="albumImg">
      <div class="info-text-wrapper">
        <p class="album-name">album name</p>
        <p class="artist-name">artist name</p>
      </div>
    </div>
    {/if}
    
</div>

<style>
  .wrapper{
    display:grid;
    grid-template-columns: 400px auto;
    grid-template-rows: 60px auto;
    background-color: #1E1E1E;
    width: 55vw;
    margin-left:auto;
    margin-right:auto;
    border-radius: 5px;
    margin-top: 25px;
    margin-bottom: 25px;
    color: #f3f1f1;
    border: 2px solid #121212;
    font-family: "Concert One", sans-serif;
    border-radius: 15px;
  }

  .profile-picture{
    margin:10px;
    display:inline-block;
    border-radius:25px;
  }

  .img-wrapper{
    margin: 15px;
    width: 100px;
    height: 100px;
    background-color:#404040;
    display:inline-block;
  }

  .user-wrapper{
    grid-column: 1;
    grid-row: 1;
    width:fit-content;
    display:table;
  }

  .user-wrapper h2{
    display:inline-block;
    padding: 0;
    margin: 0;
    display:table-cell;
    vertical-align: middle;
  }

  .rating-wrapper{
    grid-column: 2;
    grid-row: 2;
    padding:10px;
  }

  .song-info-wrapper{
    background-color:#2c2c2c;
    grid-column: 1;
    grid-row: 2;
    display:grid;
    text-align: left;
    border-radius:10px;
    margin:15px;
  }

  .song-info-wrapper img{
    display:inline-block;
    grid-row: 1 / 3;
    grid-column: 1;
  }

  .info-text-wrapper{
    grid-column: 2;
    grid-row: 2;
    display:inline-block;
    width:fit-content;
    margin:15px;
    margin-left: 0px;
  }

  .info-text-wrapper p {
    margin:0;
  }

  .album-name{
    font-size:24px;
    color:#e4e4e4;
  }

  .artist-name{
    font-size:16px;
    color:#b9b9b9;
  }

</style>