<script>
    import Sidebar from "$lib/sidebar.svelte";
    import TopSongs from "$lib/topSongs.svelte";
    import { authenticateClientCredentials } from "$lib/utils";
    import { getPlaylist } from "$lib/utils";
    import { onMount } from "svelte";
    let tracklist = [];

    onMount(async () => {
        await authenticateClientCredentials();
        let topSongs = await getPlaylist("37i9dQZEVXbMDoHDwVN2tF"); //Top 50 Global songs via Spotify
        tracklist = topSongs.data.tracks.items;
    });

</script>

<div class="layout">
    <Sidebar />
    <div class="top-songs">
        <TopSongs class="top-songs" tracklist={tracklist}/>
    </div>
</div>



<style>
    .layout {
        display: flex;
        height:88.6vh; /* temporary, add popular posts to fill page later */
    }

    .top-songs {
        display: flex;
        align-items: center;
        margin-right: 0px;
        margin-left: auto;
    }

</style>