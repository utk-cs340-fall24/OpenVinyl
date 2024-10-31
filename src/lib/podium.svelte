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
        <p class="header">Top Users</p>
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
    <div class="page-divider"></div>
    <div class="leaderboard-wrapper">
        <div class="leaderboard-header">
            <span></span>
            <span>User</span>
            <span>Likes</span>
            <span>Posts</span>
        </div>
        <div class="leaderboard-divider"></div>
        {#each data as user, index}
        <div class="user">
            <img class="small-profile-pic" src={user.avatar_url} alt="profile-pic">
            <span>{user.username}</span>
            <span>{user.total_likes}</span>
            <span>{user.post_count}</span>
        </div>
        {#if index < data.length - 1}
            <div class="user-divider"></div>
        {/if}
        {/each}
    </div>

    
</div>


<style>

    .wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-bottom: 20px;
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
        padding-top: 15px;
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
    
    .page-divider {
        width: 768px;
        height: 3px; 
        background-color: #2c2f34; 
    }

    .leaderboard-wrapper{
        padding-top: 10px;
        width: 768px;
    }

    .leaderboard-header {
        font-size: 20px;
    }

    .user {
        font-size: 16px;
    }

    .leaderboard-header, .user {
        display: grid;
        grid-template-columns: 1fr 11fr 1fr 1fr;
        gap: 1rem;
        padding-left:30px;
        padding-right:30px;
        align-items: center;
        padding-top: 3px;
        padding-bottom: 3px;
    }

    .leaderboard-divider {
        width: 768px;
        background-color: #FFFFFF;
        height: 3px;
    }
    
    .user-divider {
        width: 740px;
        background-color: #2c2f34;
        height: 3px;
        margin: 0 auto;
    }

    .leaderboard-header span:nth-child(1), .user span:nth-child(2)
    .user span:nth-child(1), .user span:nth-child(2) {
        text-align: left;
    }
    .leaderboard-header span:nth-child(3), .leaderboard-header span:nth-child(4),
    .user span:nth-child(3), .user span:nth-child(4) {
        text-align: center;
    }

    .small-profile-pic {
        color: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
    }

</style>