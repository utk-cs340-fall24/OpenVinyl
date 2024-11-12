<script>
  import { sort } from "d3";

    export let data;

    let sortingKey = 'total_likes';
    let sortOrder = 'desc';

    let podium = [];

    $: sortedData = [...data].sort((a, b) => {
        let aValue = a[sortingKey];
        let bValue = b[sortingKey];

        if (sortingKey === 'vinyls') {
            aValue = a.vinyls;
            bValue = b.vinyls;
        }

        if (aValue > bValue) {
            return sortOrder === 'asc' ? 1 : -1;
        } else if (aValue < bValue) {
            return sortOrder === 'asc' ? -1 : 1;
        } else {
            return 0;
        }
    });

    $: if (sortedData.length >= 3) {
        podium = [sortedData[1], sortedData[0], sortedData[2]];
    } else {
        podium = [];
    }

    function handleSortChange(key) {
        if (sortingKey === key) {
            sortOrder = sortOrder === 'asc' ? 'desc' : 'desc';
        } else {
            sortingKey = key;
            sortOrder = 'desc';
        }
    }
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
                        <img class="profile-picture" src="{user.avatar_url}" alt="profile-pic" />
                    </div>
                </div>
                <div>
                    <span class="username">{user.username}</span>
                </div>
                {#if sortingKey == 'vinyls'}
                <div class="likes-wrapper">
                    <span class="like-count">{user.vinyls}</span>
                    <span class="likes-text">vinyls</span>
                </div>
                {:else if sortingKey == 'total_likes'}
                <div class="likes-wrapper">
                    <span class="like-count">{user.total_likes}</span>
                    <span class="likes-text">likes</span>
                </div>
                {:else}
                <div class="likes-wrapper">
                    <span class="like-count">{user.post_count}</span>
                    <span class="likes-text">posts</span>
                </div>
                {/if}
                <div class="podium-bar"></div>
            </div>
        {/each}
    </div>
    <div class="page-divider"></div>
    <div class="leaderboard-wrapper">
        <div class="leaderboard-header">
            <span></span>
            <span>User</span>
            <span
                class="user-info {sortingKey === 'vinyls' ? 'selected' : ''}"
                on:click={() => handleSortChange('vinyls')}
            >
                Vinyls
            </span>
            <span
                class="user-info {sortingKey === 'total_likes' ? 'selected' : ''}"
                on:click={() => handleSortChange('total_likes')}
            >
                Likes
            </span>
            <span
                class="user-info {sortingKey === 'post_count' ? 'selected' : ''}"
                on:click={() => handleSortChange('post_count')}
            >
                Posts
            </span>
        </div>
        <div class="leaderboard-divider"></div>
        {#each sortedData as user, index}
            <div class="user">
                <img class="small-profile-pic" src="{user.avatar_url}" alt="profile-pic">
                <a href="/profiles/{user.username}" class="username-1">{user.username}</a>
                <span class="user-info">{user.vinyls}</span>
                <span class="user-info">{user.total_likes}</span>
                <span class="user-info">{user.post_count}</span>
            </div>
            {#if index < sortedData.length - 1}
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
        width: 768px;
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
        width: 100px;
        height: 100px;
        border-radius: 50%;
        margin-bottom: 10px;
    }
    .username-1 {
        text-decoration: none;
        color: white;
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

    .leaderboard-wrapper {
        padding-top: 10px;
        width: 768px;
    }

    .leaderboard-header {
        font-size: 20px;
        display: grid;
        grid-template-columns: 1fr 10fr 1fr 1fr 1fr;
        gap: 1rem;
        padding-left: 30px;
        padding-right: 30px;
        align-items: center;
        padding-top: 3px;
        padding-bottom: 3px;
    }

    .leaderboard-header span {
        /* cursor: pointer; */
    }

    .leaderboard-header .selected {
        text-decoration: underline;
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

    .user {
        font-size: 16px;
        display: grid;
        grid-template-columns: 1fr 10fr 1fr 1fr 1fr;
        gap: 1rem;
        padding-left: 30px;
        padding-right: 30px;
        align-items: center;
        padding-top: 3px;
        padding-bottom: 3px;
    }

    .small-profile-pic {
        width: 30px;
        height: 30px;
        border-radius: 50%;
    }

    .user-info {
        text-align: center;
        cursor: pointer;
    }
</style>