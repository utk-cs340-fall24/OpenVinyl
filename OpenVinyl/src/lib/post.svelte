<script>
	export let username;
	export let rating;
  export let desc;
  export let song_id;
  import { spotify, setAccessToken } from "$lib/spotifyClient";
  import { onMount } from 'svelte';
  import { authenticateClientCredentials } from "$lib/utils";
  
  let trackData;
  onMount(async () => {
    try {
      await authenticateClientCredentials();
      trackData = await spotify.getTrack(song_id); 
    } catch (err) {
      console.error('Error fetching track data:', err);
    }
  });

</script>



<div class="wrapper">
  <div class="user-wrapper">
    <h2>(pfp)  {username}</h2>
  </div>
  <div class="rating-wrapper">
    <p>{rating}</p>
    <p>{desc}</p>
  </div>
  {#if trackData}
      <img class="img-wrapper" src={trackData.album.images[0].url} width="100" height="100" alt="albumImg">
    {/if}
    
</div>

<style>
  .wrapper{
    display:grid;
    grid-template-columns: auto;
    grid-template-rows: auto;
    background-color: #b7b7b7;
    width:55vw;
    margin-left:auto;
    margin-right:auto;
    border-radius: 15px;
    margin-top:25px;
    margin-bottom:25px;
  }

  .img-wrapper{
    grid-column: 1;
    grid-row: 2;
    margin: 20px;
    width: 100px;
    height: 100px;
    background-color:#999999;
  }

  .user-wrapper{
    grid-column: 1;
    grid-row: 1;
    width:fit-content;
  }

  .rating-wrapper{
    grid-column: 2;
    grid-row:2;
  }

</style>