<script>
  import { createPost } from "$lib/utils";
  import { authenticateClientCredentials } from "$lib/utils";
  import { supabase } from '$lib/supabaseClient.js';
  import { spotify } from "./spotifyClient";
  import { onMount } from "svelte";

  let user;
  let trackData;
  let selectedTrack;

  let content;
  let rating;
  let search;

  onMount(async () => {
    user = await supabase.auth.getUser();
  });

  
  function cancelPost(){
    document.getElementById("postModal").style.transform = "translate(2500px, 0px)";
    search = "";
    content = "";
    rating = "";
    searchTable = null;
  }
  
  let debounceTimeout;

  async function getSearch() {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(async () => {
      try {
        await authenticateClientCredentials();
        if(search != ""){
          trackData = await spotify.searchTracks(search, { limit: 5 });
          displayResults(trackData);
        }else{
          console.log("empty search");
        }
      } catch (err) {
        console.error('Error fetching track data:', err);
      }
    }, 300); // Adjust the delay as needed
  }
  
  function makePost() {
    createPost(
      user.data.user.id,
      content,
      selectedTrack.id,
      parseInt(rating)
    )
    setTimeout(() => {
      cancelPost();
    }, 250);
  }

  let searchTable;

  function displayResults(data){
    searchTable = data;
  }

  function selectSong(data){
    selectedTrack = data;
    const rows = document.querySelectorAll(".search-table tr");
    rows.forEach(row => row.style.backgroundColor = ""); // Reset all rows' background color
    const selectedRow = Array.from(rows).find(row => row.dataset.trackId === data.id);
    if (selectedRow) {
      selectedRow.style.backgroundColor = "#e0e0e0"; // Change the color of the selected row
    }
  }
</script>

<div class="post-creation-popup" id="postModal">
  <div class="inner-wrapper">
    <div class="search-wrapper">
      <input on:input={getSearch} id="search_bar" bind:value={search}>
      <table class="search-table">
        {#if searchTable}
          <tbody>
            {#each searchTable.tracks.items as track}
              <tr on:click={selectSong(track)} data-track-id={track.id}>
                <td>{track.name}</td>
                <td>{track.artists[0].name}</td>
                <td>{track.album.name}</td>
              </tr>
            {/each}
          </tbody>
        {:else}
          <p>No results found</p>
        {/if}
      </table>
    </div>
    <input id="content" type="text" placeholder="content" bind:value={content}>
    <input id="rating" type="text" placeholder="rating out of 10" bind:value={rating}>
    <button on:click={makePost}>Create Post</button>
    <button on:click={cancelPost}>Cancel</button>
  </div>
</div>

<style>
  .post-creation-popup{
    position:fixed;
    top:25%;
    left:25%;
    background-color: #515050;
    height:550px;
    width:800px;
    border-radius:20px;
    -webkit-box-shadow: 0px 10px 13px -7px #000000, -1px 4px 12px -2px rgba(0,0,0,0); 
    box-shadow: 0px 10px 13px -7px #000000, -1px 4px 12px -2px rgba(0,0,0,0);
    transform: translate(2500px, 0px);
    transition-duration: 0.2s;
  }
  .inner-wrapper{
    padding:30px;
    display:flex;
    flex-direction: column;
    justify-content: space-around;
  }
  .inner-wrapper input{
    margin:10px;
    padding:5px;
  }
  .inner-wrapper button{
    border: 0;
    background-color:#93269b;
    width: fit-content;
    margin-left:auto;
    margin-right:auto;
    padding:10px;
    margin-top:5px;
    margin-bottom:5px;
    border-radius:15px;
  }
  .inner-wrapper button:hover{
    background-color: #a72baf;
  }
  .search-wrapper{
    display:flex;
    flex-direction: column;
    justify-content: space-around;
    text-align: center;
  }
  .search-table{
    background-color: #d0d0d0;
    width: inherit;
    text-align: left;
  }
  .search-table tr{
    border-bottom: 3px solid black;
  }
</style>