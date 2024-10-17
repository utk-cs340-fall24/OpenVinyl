<script>
  import { SupabaseAuthClient } from "@supabase/supabase-js/dist/module/lib/SupabaseAuthClient";
  import { supabase } from "$lib/supabaseClient";
  import { onMount } from "svelte";

export let podiumData;

let profile_pic_url = [];
let username = [];

    onMount(async () => {
        await fetchMultipleUsers(podiumData);
    });

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

            orderedData.forEach((user, index) => {
                username[index] = user?.username || 'Unknown';
                profile_pic_url[index] = user?.avatar_url || 'https://placehold.co/100'; 
            });
        }
    }

</script>



<div class="wrapper">
    <div>
        <p class="header">Top users</p>
    </div>
    <div class="podium-wrapper">
        {#each username as user, index}
        <div class="podium-position">
            <div class="profile-picture-wrapper">
                <div class="profile-picture">
                    <img class=profile-picture src={profile_pic_url[index]} alt="profile-pic" />
                </div>
            </div>
                <div>
                    <p class="username">{username[index]}</p>
                </div>
                <div class="podium-bar"></div>
            </div>
        {/each}
    </div>

    <div class="divider"></div>
    
</div>


<style>

    .wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .header {
        font-size: 50px;
        text-align: center;
        position: relative;
        margin-bottom: 180px;
    }

    .podium-wrapper {
        display: flex;
        justify-content: center;
        align-items: flex-end;
        gap: 20px;
        color: #121212;
    }


    .profile-picture-wrapper {
        position: absolute;
        top: -120px;
        overflow: hidden;
    }
    
    .profile-picture {
        color: white;
        width: 100px;
        height: 100px;
        border-radius: 50%;
        margin-bottom: 10px;
    }

    .username {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }

    .podium-position {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 200px;
        padding: 10px;
        text-align: center;
        border-top-left-radius: 20px;
        border-top-right-radius: 20px;
        position: relative;
    }

    .podium-bar {
        width: 100%;
    }
    
    .podium-position:nth-child(1) {
        height: 280px;
        background-color: silver;
    }
    
    .podium-position:nth-child(2) {
        height: 360px;
        background-color: gold;
    }

    .podium-position:nth-child(3) {
        height: 200px;
        background-color: #cd7f32;
    }
    
    .divider {
        width: 80%;
        height: 3px; 
        background-color: #2c2f34; 
    }

</style>