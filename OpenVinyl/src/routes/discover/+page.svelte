<script lang="js">
  let center_x = 1;
  let center_y = 1;
  import { spotify } from "$lib/spotifyClient";
  import { getRecommendationsFromSong } from "$lib/utils";
  let test_song_id = "2up3OPMp9Tb4dAKM2erWXQ";
let boxes = [
    { id: 1, imageUrl: 'https://via.placeholder.com/200', songId:  "2up3OPMp9Tb4dAKM2erWXQ" },
    { id: 2, imageUrl: 'https://via.placeholder.com/200', songId: " 2up3OPMp9Tb4dAKM2erWXQ"},
    { id: 3, imageUrl: 'https://via.placeholder.com/200', songId: "2up3OPMp9Tb4dAKM2erWXQ" },
    { id: 4, imageUrl: 'https://via.placeholder.com/200', songId: "2up3OPMp9Tb4dAKM2erWXQ" },
    { id: 5, imageUrl: 'https://via.placeholder.com/200', songId: "2up3OPMp9Tb4dAKM2erWXQ" },
    { id: 6, imageUrl: 'https://via.placeholder.com/200', songId: "2up3OPMp9Tb4dAKM2erWXQ" },
    { id: 7, imageUrl: 'https://via.placeholder.com/200', songId: "2up3OPMp9Tb4dAKM2erWXQ" },
    { id: 8, imageUrl: 'https://via.placeholder.com/200', songId: "2up3OPMp9Tb4dAKM2erWXQ" },
    { id: 9, imageUrl: 'https://via.placeholder.com/200', songId: "2up3OPMp9Tb4dAKM2erWXQ" }
  ];

  function onKeyDown(e) {
		 switch(e.keyCode) {
			 case 38:
                //up
                
				 break;
			 case 40:
                //down
				 break;
			 case 37:
                //left
				 break;
			 case 39:
                //right
				 break;
		 }
	}

</script>


<div class="game-board">
    {#each boxes as box (box.id)}
      <div class="box">
        <img src={box.imageUrl} alt="Image {box.id}" />
      </div>
    {/each}
  </div>

<style>
  .game-board {
    display: grid;
    grid-template-rows: 200px 200px 200px;
    grid-template-columns: 200px 200px 200px;
    gap: 10px;
    width: fit-content;
    margin-left: auto;
    margin-right: auto;
    padding-top: 100px;
    padding-bottom: 100px;
  }

  .box {
    background: #444;
    border: 1px solid #555;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #aaa;
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover; 
    border-radius: 10px; 
  }
</style>
<svelte:window on:keydown|preventDefault={onKeyDown} />