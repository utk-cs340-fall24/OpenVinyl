<script>  
    export let tracklist;
    let region = "Global"
    
</script>

<div class="wrapper">
    <p class="title">Top Songs - {region}</p>
    <div class="top-song-list">
        {#each tracklist as song, index}
            <div class="song-listing">
                <span class="ranking-number">{index+1}</span>
                <img 
                    class="song-image" 
                    src={song.track ? song.track.album.images[0]?.url : "https://placehold.co/300}"}
                    alt="album cover"
                    />
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