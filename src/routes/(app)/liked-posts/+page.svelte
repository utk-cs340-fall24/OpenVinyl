<script>
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabaseClient.js';
    import { spotify } from '$lib/spotifyClient';
    import Post from "$lib/post.svelte";
    import { authenticateClientCredentials } from "$lib/utils.js";
    let user;
    let songData = {};
    let likedPostData = [];
    let dislikedPostData = [];


    onMount(async () => {
        await authenticateClientCredentials();
        const session = await supabase.auth.getSession();
        user = session?.data?.session?.user?.id;
        
        const likedPosts = await fetchLikedPosts(user);
        const likedPostIds = likedPosts.map(post => post.post_id);
        likedPostData = await fetchPostData(likedPostIds);
        const likedSongIds = likedPostData.map(post => post.song_id);
        const likedTracklist = await spotify.getTracks(likedSongIds);
        if (likedTracklist && likedTracklist.tracks) {
        likedTracklist.tracks.forEach((track) => {
          if (track) {
            songData[track.id] = {
              title: track.name,
              artist: track.artists.map((artist) => artist.name).join(", "),
              image_url:
                track.album.images[0]?.url || "https://placehold.co/300",
            };
          }
        });
      } else {
        console.log("No tracks found for the given IDs.");
      }

      const dislikedPosts = await fetchDislikedPosts(user);
      const dislikedPostIds = dislikedPosts.map(post => post.post_id);
      dislikedPostData = await fetchPostData(dislikedPostIds);
      const dislikedSongIds = dislikedPostData.map(post => post.song_id);
      const dislikedTracklist = await spotify.getTracks(dislikedSongIds);
      if (dislikedTracklist && dislikedTracklist.tracks) {
      dislikedTracklist.tracks.forEach((track) => {
          if (track) {
            songData[track.id] = {
              title: track.name,
              artist: track.artists.map((artist) => artist.name).join(", "),
              image_url:
                track.album.images[0]?.url || "https://placehold.co/300",
            };
          }
        });
      } else {
        console.log("No tracks found for the given IDs.");
      }
    });

    async function fetchLikedPosts (userId) {
        const { data, error } = await supabase
            .from('likes')
            .select('post_id, created_at') // Select the post ID and liked timestamp
            .eq('profile_id', userId) // Filter by the provided user ID
            .eq('isLiked', true)
            .order('created_at', { ascending: false }); // Sort in chronological order
        
        // Error handling
        if (error) {
            console.error('Error fetching liked posts:', error);
            return null;
        }

        // Return the liked posts data
        // if (data.length == 0) {

        // }
        return data;
    }

    async function fetchDislikedPosts (userId) {
        const { data, error } = await supabase
            .from('likes')
            .select('post_id, created_at') // Select the post ID and liked timestamp
            .eq('profile_id', userId) // Filter by the provided user ID
            .eq('isLiked', false)
            .order('created_at', { ascending: false }); // Sort in chronological order
        
        // Error handling
        if (error) {
            console.error('Error fetching liked posts:', error);
            return null;
        }

        // Return the liked posts data
        // if (data.length == 0) {

        // }
        return data;
    }
    

    async function fetchPostData(postIds) {
        const { data, error } = await supabase
        .from('posts')
        .select('*')
        .in('id', postIds)
        .order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching user posts:', error);
            return [];
        }
        return data;
    }

    

</script>


<div class="page-wrapper">
    {#if likedPostData.length > 0}
    <div class="disliked-posts-divider"></div>
        <span class="header-text">Liked Posts</span>
        <div class="header-divider"></div>
        {#each likedPostData as post}
            <Post
            logged_in_user_uuid={user}
            uuid={post.profile_id}
            rating={post.rating}
            desc={post.content}
            song_id={post.song_id}
            song_title={songData[post.song_id]?.title}
            song_artist={songData[post.song_id]?.artist}
            song_image={songData[post.song_id]?.image_url}
            likes_cnt={post.likes_count}
            post_id={post.id}
            created_at={post.created_at}
            ></Post>
        {/each}
    {:else}
        <span class="no-posts">No liked posts...</span>
    {/if}
    <div class="disliked-posts-divider"></div>
    <span class="header-text">Disliked Posts</span>
    <div class="header-divider"></div>
    {#if dislikedPostData.length > 0}
        {#each dislikedPostData as post}
            <Post
            logged_in_user_uuid={user}
            uuid={post.profile_id}
            rating={post.rating}
            desc={post.content}
            song_id={post.song_id}
            song_title={songData[post.song_id]?.title}
            song_artist={songData[post.song_id]?.artist}
            song_image={songData[post.song_id]?.image_url}
            likes_cnt={post.likes_count}
            post_id={post.id}
            created_at={post.created_at}
            ></Post>
        {/each}
    {:else}
        <span class="no-posts">No disliked posts...</span>

        <!-- {:else}
            <span class="header-text">No posts liked</span>
        {/if} -->
    {/if}

</div>


<style>
    .page-wrapper {
        display: flex;
        flex-direction: column;
        width: 90%;
        background-color: transparent;
        border-radius: 30px;
        justify-content: center;
        margin: 0 auto;
        margin-bottom: 3vh;
        padding-bottom: 20px;
        padding-top: 10px;
    }

    .header-text {
        text-align: center;
        font-size: 35px;
        font-weight: bold;
        padding-bottom: 10px;
        padding-top: 10px;
    }

    .header-divider {
        width: 250px;
        background-color: #FFFFFF;
        height: 2px;
        margin: 0 auto;
    }

    .disliked-posts-divider {
        width: 250px;
        background-color: #FFFFFF;
        height: 2px;
        margin: 0 auto;
        margin-top: 20px;
    }

    .no-posts {
        text-align: center;
        margin-top: 20px;
        font-size: 20px;
        padding-bottom: 10px;
        padding-top: 10px;
    }



</style>