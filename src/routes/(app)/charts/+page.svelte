<script>
    import Sidebar from "$lib/sidebar.svelte";
    import TopSongs from "$lib/topSongs.svelte";
    import Podium from "$lib/podium.svelte";
    import { authenticateClientCredentials } from "$lib/utils";
    import { getPlaylist } from "$lib/utils";
    import { onMount } from "svelte";
    import { supabase } from "$lib/supabaseClient";
    let tracklist = [];
    let topUsers = [];
    let topUserData = [];

    onMount(async () => {
        await authenticateClientCredentials();
        let topSongs = await getPlaylist("37i9dQZEVXbMDoHDwVN2tF"); //Top 50 Global songs via Spotify
        tracklist = topSongs.data.tracks.items;
        topUsers = await fetchTopUsers();
        const topIds = topUsers.map(item => item.user_id);
        topUserData = await fetchMultipleUsers(topIds);
        topUserData = topUserData.map((profile, index) => ({
            ...profile,
            total_likes: topUsers[index].total_likes
        }));
        
    });
    
    async function fetchTopUsers() {
        const { data, error } = await supabase.rpc("get_top_users_likes");
        if (error) 
        throw error;
    if (data) {
        const topUsers = data.map(item => ({
            user_id: item.user_id,
            total_likes: item.total_likes
        }));
        return topUsers;
        }
    }

    async function fetchMultipleUsers(userIds) {
        const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);
        
        if (error) {
            console.error('Error fetching users:', error);
        }
        if(data) {
            const orderedData = userIds.map(id => data.find(user => user.id === id));
            
            return orderedData
        }
    }
</script>

<div class="layout">
    <Sidebar />
    {#if topUserData.length > 0}
        <div class="podium">
            <Podium data={topUserData}/>
        </div>
    {:else}
        <div class="loading-wrapper">
            <span class="loading-text">Loading podium data...</span>
        </div>
    {/if}
    <div class="top-songs">
        <TopSongs class="top-songs" tracklist={tracklist}/>
    </div>
</div>

<style>
    .layout {
        display: flex;
        height: auto; /* temporary, add popular posts to fill page later */
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

    .loading-wrapper {
        display: flex;
        align-items: center;
        margin-left: auto;
    }


    .loading-text {
        font-size: 50px;
        display: flex;
        text-align: center;
        padding: auto;
    }

</style>