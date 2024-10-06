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
  import { getSongs, authenticateClientCredentials } from "$lib/utils.js"; 

  export let data;

  let session_uuid;
  let user = null;
  let posts = [...data.posts];  // Store all posts and append later
  let songData = {};  // Object to store song details by song_id
  let loading = false;  // Show loading spinner

  // Function to fetch song data for each post
  async function fetchSongData() {
    await authenticateClientCredentials();
    const songIds = posts.map(post => post.song_id);
    try {
      const songs = await getSongs(songIds);
      songs.forEach(song => {
        songData[song.id] = {
          title: song.title,
          artist: song.artist,
          image: song.image_url
        };
      });
    } catch (err) {
      console.error("Error fetching song data:", err);
    }
  }

  // Function to handle loading more posts
  async function loadNextPage() {
    loading = true;
    const response = await fetch(`?page=${data.nextPage}`);
    const newPostsData = await response.json();
    
    // Append new posts and fetch song data for them
    posts = [...posts, ...newPostsData.posts];
    data.nextPage = newPostsData.nextPage;  // Update the next page info

    // Fetch song data for the new posts
    await fetchSongData();
    loading = false;
  }

  onMount(async () => {
    // Fetch initial song data
    await fetchSongData();

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loading) {
        loadNextPage(); // Load more posts when the user scrolls down
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

      // Fetch the profile to check if the username is empty
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
    // Fetch session logic here
  });
</script>

<div class="wrapper">
  <div class="add-post-wrapper">
    <AddPostBtn></AddPostBtn>
  </div>

  <!-- Sidebar -->
  <Sidebar />

  <div class="posts-wrapper">
    <AddPost />

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

    <!-- Loader for when posts are loading -->
    {#if loading}
      <div class="loading-spinner">Loading...</div>
    {/if}

    <!-- The element that triggers loading more posts when scrolled into view -->
    <div id="load-more-trigger"></div>
  </div>

  <PostCreation></PostCreation>
</div>

<style>
  .wrapper {
    display: flex;
    min-height: 90vh;
  }

  .posts-wrapper {
    display: inline-block;
    margin-left: 0;
    width: calc(100% - 275px); /* Adjust according to sidebar width */
  }

  .add-post-wrapper {
    position: fixed;
    z-index: 1000;
    right: 2%;
    bottom: 4%;
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
</style>
