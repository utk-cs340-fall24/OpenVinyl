<script>  
    import { onMount } from "svelte";
    import { getPlaylist } from "$lib/utils";
  
    let isDropdownOpen = false; // State to control dropdown visibility
    let countryList = [];
    export let tracklist;
    let region = "Global";

    function toggleDropdown() {
        isDropdownOpen = !isDropdownOpen;
    }

    function handleCountrySelect(country) {
        isDropdownOpen = false;
        processCountry(country);
    }
  
    async function processCountry(countryName) {
        region = countryName;
        const id = countryList.find(c => c.name === countryName).playlistId;
        let topSongs = await getPlaylist(id);
        tracklist = topSongs.data.tracks.items;
    }
  
    onMount(() => {
        // list of valid countries and their id's
        countryList = [
            {name: "Global",         playlistId: "37i9dQZEVXbMDoHDwVN2tF"},
            {name: "Argentina",      playlistId: "37i9dQZEVXbMMy2roB9myp"},
            {name: "Australia",      playlistId: "37i9dQZEVXbJPcfkRz0wJ0"},
            {name: "Brazil",         playlistId: "37i9dQZEVXbMXbN3EUUhlg"},
            {name: "Canada",         playlistId: "37i9dQZEVXbKj23U1GF4IR"},
            {name: "France",         playlistId: "37i9dQZEVXbIPWwFssbupI"},
            {name: "Germany",        playlistId: "37i9dQZEVXbJiZcmkrIHGU"},
            {name: "India",          playlistId: "37i9dQZEVXbLZ52XmnySJg"},
            {name: "Indonesia",      playlistId: "37i9dQZEVXbObFQZ3JLcXt"},
            {name: "Italy",          playlistId: "37i9dQZEVXbIQnj7RRhdSX"},
            {name: "Japan",          playlistId: "37i9dQZEVXbKXQ4mDTEBXq"},
            {name: "Mexico",         playlistId: "37i9dQZEVXbO3qyFxbkOE1"},
            {name: "Netherlands",    playlistId: "37i9dQZEVXbKCF6dqVpDkS"},
            {name: "New Zealand",    playlistId: "37i9dQZEVXbM8SIrkERIYl"},
            {name: "South Africa",   playlistId: "37i9dQZEVXbMH2jvi6jvjk"},
            {name: "South Korea",    playlistId: "37i9dQZEVXbNxXF4SkHj9F"},
            {name: "Spain",          playlistId: "37i9dQZEVXbNFJfN1Vw8d9"},
            {name: "Sweden",         playlistId: "37i9dQZEVXbLoATJ81JYXz"},
            {name: "United Kingdom", playlistId: "37i9dQZEVXbLnolsZ8PSNw"},
            {name: "United States",  playlistId: "37i9dQZEVXbLRQDuF5jeBp"},
        ];
    });
    
</script>

<div class="wrapper">
    <div class="top-bar">
        <button on:click={toggleDropdown} class="set-country-button"><i class="fa-solid fa-flag"></i></button>
        <div class="dropdown-content {isDropdownOpen ? 'show' : ''}">
            {#each countryList as country}
              <div on:click={() => handleCountrySelect(country.name)} aria-hidden="true">
                {country.name}
              </div>
            {/each}
          </div>
        <p class="title">Top Songs - {region}</p>
    </div>
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
        width: 30vw;
        height: 80vh;
        margin: 20px;
        padding: 0px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .dropdown-content {
        display: none;
        position: absolute;
        background-color: #1d1f25;
        width: 200px;
        box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
        z-index: 1;
        color: #f3f1f1;
        border-width: 1px;
        border-style: solid;
        border-color: #000000;
        max-height: 30vh;
        overflow-y: scroll;
        overflow-x: hidden;
    }

    .dropdown-content.show {
        display: block;
    }

    .dropdown-content div {
        padding: 3px;
        cursor: pointer;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }

    .dropdown-content div:hover {
        background-color: #434343;
    }

    .top-bar {
        width: 100%;
    }

    .title {
        text-align: center;
        font-size: 30px;
        justify-content: center;
        margin-top: 0px;
    }

    .set-country-button {
        display: flex;
        background-color: transparent;
        color: #f3f1f1;
        font-size: 20px;
        cursor: pointer;
        border-radius: 50%;
        height: 36px;
        width: 36px;
        border-style: none;
        padding-top: 10px;
        padding-left: 10px;
        margin-right: auto;
        transition: background-color 0.2s;
    }
    
    .set-country-button:hover {
        background-color: #434343;
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

    @media (max-width: 1300px) {
        .wrapper {
            width: 80vw;
            margin-left: 17vw;
        }

    }
    @media (max-width: 768px) {
        .wrapper {
            width: 90vw;
            margin-left: 17vw;
        }
    }

</style>