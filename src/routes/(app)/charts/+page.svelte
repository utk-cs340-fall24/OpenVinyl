<script>
    import TopSongs from "$lib/topSongs.svelte";
    import Podium from "$lib/podium.svelte";
    import { authenticateClientCredentials } from "$lib/utils";
    import { getPlaylist } from "$lib/utils";
    import { onMount } from "svelte";
    import { supabase } from "$lib/supabaseClient";
    let tracklist = [];
    let topUsers = [];
    let topUserData = [];
    let postCounts = [];

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
        postCounts = await fetchUserPostCounts(topIds);
        console.log(postCounts);
        topUserData = topUserData.map((profile, index) => ({
            ...profile,
            post_count: postCounts[index].post_count
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
            
            return orderedData;
        }
    }

    async function fetchUserPostCounts(userIds) {
        const { data, error } = await supabase.rpc('count_user_posts', { user_ids: userIds });

        if (error) {
        console.error("Error counting user posts:", error);
        } else {
            const dataLookup = Object.fromEntries(data.map(item => [item.user_id, item.post_count]));

            // Map userIds to data in the original order
            return userIds.map(userId => ({
                user_id: userId,
                post_count: dataLookup[userId] || 0  // Default to 0 if user_id is not in the data
            }));
        }
    }
</script>

<div class="layout">
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
        display: grid;
        grid-template-columns: 68vw 32vw;
        height: auto;
    }

    .podium {
        display: flex;
        justify-content: center;
        padding-top: 0vh;
    }

    .top-songs {
        display: flex;
        align-items: center;
        margin-right: 0px;
        margin-left: auto;
        position: fixed;
        top: 50%;
        left: 90vw;
        transform: translate(-50%, -50%);
        padding-right: 12vw;
    }

    .loading-wrapper {
        display: flex;
        align-items: center;
        margin: auto;
        text-align: center;
        vertical-align: center;
        height: 100vh;
    }


    .loading-text {
        font-size: 50px;
        display: flex;
        text-align: center;
        padding: auto;
    }

    @media (max-width: 1300px) {

        .layout {
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .top-songs {
            position: relative;
            left: 50vw;
            top: 0%;
            padding-right: auto;
            transform: translate(-50%, 0%);
            padding-bottom: 50px;
            padding-top: 50px;
        }
    }

</style>