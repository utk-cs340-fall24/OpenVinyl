<script>

  //connect to use functions later
  const playPrev = () => {
    console.log('playPrev clicked');
  };
  const pause = () => {
    console.log('pause clicked');
  };
  const playNext = () => {
    console.log('playNext clicked');
  };


  let recentSongs = [
    { title: "Great song #1", artist: "Niche artist #1", cover: "https://picsum.photos/200"},
    { title: "Great song #2", artist: "Niche artist #2", cover: "https://picsum.photos/200"},
    { title: "Great song #3", artist: "Niche artist #3", cover: "https://picsum.photos/200"},
    { title: "Great song #4", artist: "Niche artist #4", cover: "https://picsum.photos/200"},
    { title: "Great song #5", artist: "Niche artist #5", cover: "https://picsum.photos/200"}
  ]


</script>

<div class="wrapper">
  <div class="playback-img">
      <img src="https://picsum.photos/200" alt="albumImg" class="playback-img">
  </div>
  <div class="playback-button">
      <button on:click={playPrev} class="button-style">⏮</button>
      <button on:click={pause} class="button-style">⏸</button>
      <button on:click={playNext} class="button-style">⏭</button>
    </div>
    <div class="song-info">
      <p class="song-title">Cool song name</p>
      <p class="song-artist">Chief Keef</p>
    </div>
    <div class="previous-songs">
      <p class="prev-songs-header">Recent songs:</p>
      {#each recentSongs.slice(0, 5) as song}
        <div class="prev-song">
          <img src={song.cover} alt="albumImg" class="prev-song-image">
          <div class="prev-song-info">
            <p class="prev-song-title">{song.title}</p>
            <p class="prev-song-artist">{song.artist}</p>
          </div>
        </div>
      {/each}
    </div>
  </div>
  
  
<style>
  .wrapper{
    display: inline-block;
    width: 300px;
    background-color: #787878;
    margin: 10px;
    margin-top: 150px;
    margin-bottom: auto;
    border-radius:30px;
    font-family: "Concert One", sans-serif;
  }
  .playback-img{
    text-align: center;
    padding: 25px;
    padding-bottom: 10px;
    width: 250;
    height: 250;
  }
  .playback-button{
    display: flex;
    justify-content: space-evenly;
    padding-left: 40px;
    padding-right: 40px;
  }
  .button-style{
    width: 50px;
    height: 50px;
    background-color: #202020;
    border: none;
    border-radius: 50%;
    color: white;
    font-size: 20px;
    cursor :pointer;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .button-style:hover {
    background-color: #424242;
  }
  .song-info{
    text-align: center;
    padding: 5px;
    margin-top: 10px;
    white-space: nowrap;
    overflow: hidden;
    max-width: 100%;
    text-overflow: ellipsis;
  }
  .song-title{
    text-emphasis: bold;
    font-size: 25px;
    margin-bottom: 5px;
  }
  .song-artist{
    font-size: 20 px;
  }
  .prev-songs-header{
    margin:0px;
    padding-left: 10px;
  }
  .previous-songs{
    max-height: 40%;
    margin: 10px;
  }
  .prev-song{
    text-align: center;
    padding-left: 5px;
    padding-right: 5px;
    width: 200;
    height: 75px;
    display: flex;
    flex-direction: row;
    max-width: 100%;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .prev-song-image{
    padding: 10px;
    width: 75px;
    height: 75px;
  }
  .prev-song-info{
    display: flex;
    flex-direction: column;
    margin: 10px;
    justify-content: center;
  }
  .prev-song-title{
    text-emphasis: bold;
    font-size: 18px;
    margin: 5px;
  }
  .prev-song-artist{
    font-size: 14px;
    margin: 5px;
  }
  
  * {
    box-sizing: border-box;
  }
</style>