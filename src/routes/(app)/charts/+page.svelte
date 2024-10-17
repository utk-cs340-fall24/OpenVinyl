<script>
    import Sidebar from "$lib/sidebar.svelte";
    import TopSongs from "$lib/topSongs.svelte";
    import Podium from "$lib/podium.svelte";
    import { authenticateClientCredentials } from "$lib/utils";
    import { getPlaylist } from "$lib/utils";
    import { onMount } from "svelte";
    let tracklist = [];
    //temporary, will later be sorted by users with the most like/upvotes/karma/whatever
    let podiumData = ["dd5eff79-7e05-400e-8c2c-3d934679bb0e", "c157bef8-eaba-4ef4-95e1-511bd48dfede", "80241ea9-5636-46ac-af11-96eee2e5cf07"];

    onMount(async () => {
        await authenticateClientCredentials();
        let topSongs = await getPlaylist("37i9dQZEVXbMDoHDwVN2tF"); //Top 50 Global songs via Spotify
        tracklist = topSongs.data.tracks.items;

    });


</script>

<div class="layout">
    <Sidebar />
    <div class="podium">
        <Podium podiumData={podiumData}/>
    </div>
    <div class="top-songs">
        <TopSongs class="top-songs" tracklist={tracklist}/>
    </div>
</div>

<style>
    .layout {
        display: flex;
        height:88.6vh; /* temporary, add popular posts to fill page later */
    }

    .podium {
        width: 100%;
        padding-top: 0vh;
    }

    .top-songs {
        display: flex;
        align-items: center;
        margin-right: 0px;
        margin-left: auto;
    }


</style>