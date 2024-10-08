<script lang="js">
  import AddPostBtn from "$lib/addPostBtn.svelte";
  import { supabase } from "$lib/supabaseClient";
  import PostCreation from "$lib/postCreation.svelte";
  import Post from "$lib/post.svelte";
  import Sidebar from "$lib/sidebar.svelte";
  import { onMount, onDestroy } from "svelte";
  import { spotify } from "$lib/spotifyClient.js";
  import { goto } from "$app/navigation";
  import AddPost from "$lib/addPost.svelte";
  import { createEventDispatcher } from "svelte";
  import { selectedSong } from "$lib/stores";
  import { getSongs, authenticateClientCredentials } from "$lib/utils.js";

  export let data;

  let session_uuid;
  let user = null;
  let posts = [...data.posts];
  let songData = {};
  let loading = false;
  let isDragOver = false;
  let isDroppableArea = false;
  let localSelectedTrack;
  let hasMorePosts = data.nextPage !== null;
  const dispatch = createEventDispatcher();
  const unsubscribe = selectedSong.subscribe((song) => {
    if (song) {
      localSelectedTrack = {
        id: song.id,
        title: song.title,
        artist: song.artist,
        cover: song.cover,
      };
    }
  });
  onDestroy(() => {
    unsubscribe();
  });
  function handleDrop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("application/json");
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
  function handleReviewSubmitted(event) {
    const { post } = event.detail;
    if (post) {
      const postWithLikesCount = {
        ...post,
        likes_count: post.likes_count !== undefined ? post.likes_count : 0,
      };

      posts = [postWithLikesCount, ...posts];

      if (post.song_id && !songData[post.song_id]) {
        // Fetch song data for the new song_id (maybe remove it may not be necessary since we have all the information, not sure)
        fetchSongData();
      }
    }
  }

  async function fetchSongData() {
    await authenticateClientCredentials();

    // Collect song IDs from posts
    let testIds = posts.map((post) => post.song_id);

    const options = {};
    spotify.getTracks(testIds, options, (error, data) => {
      if (error) {
        console.error("Error fetching tracks:", error);
        return;
      }

      if (data && data.tracks) {
        console.log("Fetched tracks successfully:", data.tracks);

        data.tracks.forEach((track) => {
          if (track) {
            songData[track.id] = {
              title: track.name,
              artist: track.artists[0].name,
              image: track.album.images[0]?.url,
            };
          }
        });
      } else {
        console.log("No tracks found for the given IDs.");
      }
      console.log(songData);
    });
  }

  async function loadNextPage() {
    if (!hasMorePosts || loading) return;

    loading = true;
    try {
      const response = await fetch(`/api/posts?page=${data.nextPage}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newPostsData = await response.json();

      if (!newPostsData.success) {
        throw new Error("Failed to load posts");
      }

      posts = [...posts, ...newPostsData.posts];
      data.nextPage = newPostsData.nextPage;

      hasMorePosts = newPostsData.nextPage !== null;

      await fetchSongData(); // Fetch additional song data if necessary
    } catch (error) {
      console.error("Error loading next page:", error);
    } finally {
      loading = false;
    }
  }

  onMount(async () => {
    await fetchSongData();

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) {
      console.error("Error fetching session:", error);
    } else if (!session) {
      console.log("No active session. User is not signed in.");
    } else {
      user = session.user;
      session_uuid = user?.id;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", session_uuid)
        .single();
      if (profileError) {
        console.error("Error fetching profile:", profileError);
      } else {
        if (!profile?.username) {
          // goto("/account");
          console.log("no username")
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

  <div class="posts-wrapper {isDragOver ? 'drag-over' : ''}">
    <AddPost on:reviewSubmitted={handleReviewSubmitted} />

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

    {#if hasMorePosts}
      <button
        class="load-more-button"
        on:click={loadNextPage}
        disabled={loading}
      >
        {loading ? "Loading..." : "Load More Reviews"}
      </button>
    {/if}
  </div>

  <PostCreation></PostCreation>
</div>

<style>
  .wrapper {
    display: flex;
    min-height: 90vh;
    width: 100%;
    position: relative;
    transition:
      background-color 0.3s,
      border 0.3s;
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
    padding: 0px;
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

  .load-more-button {
    display: block;
    margin: 20px auto;
    padding: 10px 20px;
    background-color: #1d1f25;
    color: white;
    border: 1px solid #26282c;
    font-family: "Concert One", sans-serif;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
  }

  .load-more-button:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }

  .load-more-button:hover:not(:disabled) {
    background-color: #121212;
  }
</style>
