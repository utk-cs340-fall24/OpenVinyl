<script lang="js">
  import AddPostBtn from "$lib/addPostBtn.svelte";
  import { supabase } from "$lib/supabaseClient";
  import PostCreation from "$lib/postCreation.svelte";
  import Post from "$lib/post.svelte";
  import Sidebar from "$lib/sidebar.svelte";
  import { onMount } from "svelte";
  import {spotify} from "$lib/spotifyClient.js"
  import { goto } from '$app/navigation';
  import AddPost from "$lib/addPost.svelte";
  import { selectedSong } from '$lib/stores'; 
  
  import { getSongs, authenticateClientCredentials } from "$lib/utils.js"; 

  export let data;

  let session_uuid;
  let user = null;
  let posts = [...data.posts]; 
  let songData = {}; 
  let loading = false; 
  let isDragOver = false; 
  let isDroppableArea = false;

function handleDrop(event) {
  event.preventDefault();
  const data = event.dataTransfer.getData('application/json');
  if (data && isDroppableArea) { 
    const song = JSON.parse(data);
    selectedSong.set(song); 
  }
  isDragOver = false;
}

function handleDragOver(event) {
  event.preventDefault();
  isDragOver = true;
  isDroppableArea = true; 
}

function handleDragLeave(event) {
  isDragOver = false;
  isDroppableArea = false; 
}
async function fetchSongData() {
  await authenticateClientCredentials();
  
  // Collect song IDs from posts
  let testIds = posts.map(post => post.song_id); // Use map for cleaner code
  
  const options = {};
  spotify.getTracks(testIds, options, (error, data) => {
    if (error) {
      console.error("Error fetching tracks:", error);
      return;
    }

    if (data && data.tracks) { 
      console.log("Fetched tracks successfully:", data.tracks);
      
      data.tracks.forEach(track => {
        if (track) { 
          songData[track.id] = {
            title: track.name,
            artist: track.artists[0].name, 
            image: track.album.images[0]?.url 
          };
        }
      });
    } else {
      console.log("No tracks found for the given IDs.");
    }
    console.log(songData)

  });
}

  async function loadNextPage() {
    loading = true;
    const response = await fetch(`?page=${data.nextPage}`);
    const newPostsData = await response.json();
    
    posts = [...posts, ...newPostsData.posts];
    data.nextPage = newPostsData.nextPage; 

    await fetchSongData();
    loading = false;
  }

  onMount(async () => {
    await fetchSongData();

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loading) {
        loadNextPage(); 
      }
    }, { threshold: 0.1 });

    const loadMoreElement = document.querySelector('#load-more-trigger');
    if (loadMoreElement) {
      observer.observe(loadMoreElement);
    }

    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error fetching session:", error);
    } else if (!session) {
      console.log("No active session. User is not signed in.");
    } else {
      user = session.user;
      session_uuid = user?.id;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session_uuid)
        .single();
      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else {
        if (!profile?.username) {
          goto('/account');
        }
      }
    }
  });
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="wrapper"
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  on:drop={handleDrop}
>
<Sidebar />

  <div class="add-post-wrapper">
    <AddPostBtn></AddPostBtn>
  </div>


  <div class="posts-wrapper {isDragOver ? 'drag-over' : ''}">
    <AddPost/>

    {#each posts as post}
      <Post
        logged_in_user_uuid={session_uuid}
        uuid={post.profile_id}
        rating={post.rating}
        desc={post.content}
        song_id={post.song_id}
        song_title={songData[post.song_id]?.title}
        song_artist={songData[post.song_id]?.artist}
        song_image={songData[post.song_id]?.image}
        likes_cnt={post.likes_count}
        post_id={post.id}
      ></Post>
    {/each}

    {#if loading}
      <div class="loading-spinner">Loading...</div>
    {/if}

    <div id="load-more-trigger"></div>
  </div>

  <PostCreation></PostCreation>
</div>

<style>
  .wrapper {
    display: flex;
    min-height: 90vh;
    width: 100%;
    position: relative;
    transition: background-color 0.3s, border 0.3s;
  }

  .wrapper.drag-over {
    border: 2px dashed #007bff;
    background-color: rgba(0, 123, 255, 0.1);
  }

  .add-post-wrapper {
    position: fixed;
    z-index: 1000;
    right: 2%;
    bottom: 4%;
  }

  .posts-wrapper {
    display: inline-block;
    margin-left: 0;
    width: calc(100% - 300px);
    padding: 20px;
    overflow-y: auto;
    height: 100vh; 
    background-color: #121212; 
    transition: background-color 0.3s;
  }

  @media (max-width: 768px) {
    .sidebar {
      display: none;
    }

    .posts-wrapper {
      width: 100%;
    }

    .wrapper {
      flex-direction: column;
    }
  }

  .posts-wrapper.drag-over {
    border: 2px dashed #007bff;
    background-color: rgba(0, 123, 255, 0.1);
  }



  .loading-spinner {
    text-align: center;
    padding: 20px;
    color: #b9b9b9;
  }
</style>