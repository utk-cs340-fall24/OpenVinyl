<script>
  // Playback control functions
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
    { title: "Great song #1", artist: "Niche artist #1", cover: "https://picsum.photos/200" },
    { title: "Great song #2", artist: "Niche artist #2", cover: "https://picsum.photos/200" },
    { title: "Great song #3", artist: "Niche artist #3", cover: "https://picsum.photos/200" },
    { title: "Great song #4", artist: "Niche artist #4", cover: "https://picsum.photos/200" },
    { title: "Great song #5", artist: "Niche artist #5", cover: "https://picsum.photos/200" }
  ];
</script>

<div class="sidebar">
  <div class="playback-section">
    <div class="playback-img">
      <img src="https://picsum.photos/200" alt="Album Cover" />
    </div>
    <div class="playback-controls">
      <button on:click={playPrev} class="control-button">⏮</button>
      <button on:click={pause} class="control-button">⏸</button>
      <button on:click={playNext} class="control-button">⏭</button>
    </div>
    <div class="song-info">
      <p class="song-title">Cool song name</p>
      <p class="song-artist">Chief Keef</p>
    </div>
  </div>
  <div class="recent-songs">
    <p class="section-header">Recent Songs</p>
    {#each recentSongs.slice(0, 3) as song}
      <div class="recent-song">
        <img src={song.cover} alt="Album Cover" class="recent-song-image" />
        <div class="recent-song-info">
          <p class="recent-song-title">{song.title}</p>
          <p class="recent-song-artist">{song.artist}</p>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  /* Global Styles */
  :global(body) {
    margin: 0;
    font-family: "Concert One", sans-serif;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  .sidebar {
    display: flex;
    flex-direction: column;
    background-color: #1d1f25;
    width: 100%;
    max-width: 300px;
    padding: 20px;
    color: #f3f1f1;
    border-right: 1px solid #26282c;
  }

  .playback-section {
    text-align: center;
    margin-bottom: 30px;
  }

  .playback-img img {
    width: 100%;
    max-width: 200px;
    border-radius: 10px;
    margin-bottom: 15px;
  }

  .playback-controls {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-bottom: 15px;
  }

  .control-button {
    width: 50px;
    height: 50px;
    background-color: #26282c;
    border: none;
    border-radius: 50%;
    color: #f3f1f1;
    font-size: 20px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .control-button:hover {
    background-color: #007BFF;
  }

  .song-info {
    text-align: center;
  }

  .song-title {
    font-size: 1.2rem;
    margin: 5px 0;
  }

  .song-artist {
    font-size: 1rem;
    color: #b9b9b9;
  }

  /* Recent Songs Section */
  .recent-songs {
    flex: 1;
  }

  .section-header {
    font-size: 1.1rem;
    margin-bottom: 15px;
    border-bottom: 1px solid #26282c;
    padding-bottom: 10px;
  }

  .recent-song {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    cursor: pointer;
    transition: background-color 0.2s;
    padding: 5px;
    border-radius: 5px;
  }

  .recent-song:hover {
    background-color: #26282c;
  }

  .recent-song-image {
    width: 60px;
    height: 60px;
    border-radius: 5px;
    margin-right: 15px;
  }

  .recent-song-info {
    flex: 1;
  }

  .recent-song-title {
    font-size: 1rem;
    margin: 0;
  }

  .recent-song-artist {
    font-size: 0.9rem;
    color: #b9b9b9;
    margin: 0;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .sidebar {
      /* max-width: 100%; */
      display: none;
      border-right: none;
      border-bottom: 1px solid #26282c;
    }

    .playback-controls {
      gap: 10px;
    }

    .control-button {
      width: 40px;
      height: 40px;
    }

    .playback-img img {
      max-width: 150px;
    }
  }
</style>
