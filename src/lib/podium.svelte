<script>
  import { onMount } from "svelte";

    export let data;

    let podium = [];

    
    onMount(async () => {
        podium = [...podium, data[1], data[0], data[2]];
    });

</script>



<div class="wrapper">
    <div>
        <p class="header">Top users</p>
    </div>
    <div class="podium-wrapper">
        {#each podium as user}
        <div class="podium-position">
            <div class="profile-picture-wrapper">
                <div class="profile-picture">
                    <img class=profile-picture src={user.avatar_url} alt="profile-pic" />
                </div>
            </div>
            <div>
                <span class="username">{user.username}</span>
            </div>
            <div class="likes-wrapper">
                <span class="like-count">{user.total_likes}</span>
                <span class="likes-text">likes</span>
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
        font-size: 20px;
    }

    .likes-wrapper {
        display: flex;
        flex-direction: column;
        padding-top: 30px;
    }

    .like-count {
        font-size: 40px;
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
        width: 70%;
        height: 3px; 
        background-color: #2c2f34; 
    }

</style>