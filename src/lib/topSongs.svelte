<script>  
    export let tracklist;
    let region = "Global"
    
</script>

<div class="wrapper">
    <p class="title">Top Songs - {region}</p>
    <div class="top-song-list">
        {#each tracklist as song, index}
            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
            <div class="song-listing">
                <span class="ranking-number">{index+1}</span>
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                 <div class="album-cover-container">
                <img 
                    class="song-image" 
                    src={song.track ? song.track.album.images[0]?.url : "https://placehold.co/300}"}
                    alt="album cover"
                    >
                    <a href="/discover/{song.track.id}" class="play-button" aria-label="Play Song">
                        <i class="fa-solid fa-play"></i>
                    </a>
                </div>
                <div class="song-info">
                    <span class="song-title">{song.track.name}</span>
                    <span class="artist-name">{song.track.artists[0].name}</span>
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    .wrapper {
        border-radius: 10px;
        background-color: #1d1f25;
        width: 20vw;
        height: 80vh;
        margin: 20px;
        padding: 0px;
        overflow: hidden;
    }

    .title {
        text-align: center;
        font-size: 30px;
    }

    .top-song-list {
        overflow-y: scroll;
        height: 70vh;
        padding-left: 20px;
        padding-right: 20px;
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        gap: 0px;
    }

    .song-listing {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        padding: 0px;
        gap: 10px;
    }

    .ranking-number {
        font-size: 35px;
        font-weight: bold;
        text-align: center;
        min-width: 40px;
        margin-bottom: 25px;
        margin-top: 12px;
    }

    .song-image {
        height: 64px;
        width: 64px;
    }
    .song-image:hover{
        cursor: pointer;
    }
    .album-cover-container {
        position: relative;
        /* width: 100%; */
        max-width: 100px; /* Optional: Limit maximum width */
        height: auto;
        margin-right: 15px;
        flex-shrink: 0;
    }

    .play-button {
        position: absolute;
        top: 44%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 1.1rem;
        background-color: rgba(0, 0, 0, 0.6);
        border-radius: 50%;
        padding: 12px 14px;
        opacity: 0;
        transition: opacity 0.3s, background-color 0.3s;
        text-decoration: none;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .album-cover-container:hover .play-button {
        opacity: 1;
    }

    .song-info {
        overflow: hidden;
        display: flex;
        flex-direction: column;
        padding-top: 3px;
        gap: 0px;
    }
    
    .song-title {
        font-weight: bold;
        font-size: 1.2rem;
        color: #e4e4e4;
        margin: 3px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }
    
    .artist-name {
        font-size: 1rem;
        font-weight: normal;
        color: #b9b9b9;
        margin: 3px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }

</style>