<script lang="js">
  import { supabase } from "$lib/supabaseClient";
  import Post from "$lib/post.svelte";
  import { onMount, onDestroy } from "svelte";
  import { spotify } from "$lib/spotifyClient.js";
  import { goto } from "$app/navigation";
  import AddPost from "$lib/addPost.svelte";
  import { createEventDispatcher } from "svelte";
  // import { selectedSong } from "$lib/stores";
  import { getSongs, authenticateClientCredentials } from "$lib/utils.js";
  import { sidebarHidden } from "$lib/stores";

  let isSidebarHidden = false;
  const unsubscribeSidebar = sidebarHidden.subscribe(value => {
    isSidebarHidden = value;
  });

  onDestroy(() => {
    unsubscribeSidebar();
    // unsubscribe();
  });

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
  let loadingPage = true;
  const dispatch = createEventDispatcher();
  // const unsubscribe = selectedSong.subscribe((song) => {
  //   if (song) {
  //     localSelectedTrack = {
  //       id: song.id,
  //       title: song.title,
  //       artist: song.artist,
  //       cover: song.cover,
  //     };
  //   }
  // });
  
  function handleDrop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("application/json");
    if (data && isDroppableArea) {
      const song = JSON.parse(data);
      // selectedSong.set(song);
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
      // console.log(posts)
      // console.log(post)
      const postWithLikesCount = {
        ...post,
        likes_count: post.likes_count !== undefined ? post.likes_count : 0,
      };

      // console.log(postWithLikesCount)
      console.log("posts before: ", posts)
      posts = [postWithLikesCount, ...posts];
      console.log("posts after", posts)
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
      const response = await fetch(`/api/posts?page=${data.nextPage}&filter=${filterOption}&sort=${sortOption}&user_id=${session_uuid}`);

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

  let filterOption = 'all';
  let sortOption = 'recent';

  onMount(async () => {
    setTimeout(() => {
      loadingPage = false;
    }, 10); // loading screen will be displayed for this amount of time
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

  async function reloadPosts(){
    posts = [];
    loading = true;
    try {
      const response = await fetch(`/api/posts?page=1&filter=${filterOption}&sort=${sortOption}&user_id=${session_uuid}`);

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
</script>

<div class="loading-screen" style="display:{loadingPage ? 'block' : 'none'}">
  <div class="loading-spinner"><span class="loader"></span></div>
</div>
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="wrapper"
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  on:drop={handleDrop}
>
  <div class="posts-wrapper {isDragOver ? 'drag-over' : ''} {isSidebarHidden ? '' : 'sidebarHidden'}">
    <AddPost on:reviewSubmitted={handleReviewSubmitted} />
    <div class="filter-dropdowns-wrapper">
      <select bind:value={filterOption} on:change={reloadPosts}>
        <option value="all">All</option>
        <option value="following">Following</option>
      </select>
      <select bind:value={sortOption} on:change={reloadPosts}>
        <option value="recent">Recent</option>
        <option value="popular">Popular</option>
        <option value="asc">Rating (Descending)</option>
        <option value="desc">Rating (Ascending)</option>
      </select>
    </div>

    {#each posts as post (post.id)}
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
        created_at={post.created_at}
      ></Post>
    {/each}

    {#if loading}
      <div class="loading-spinner">Loading... </div>
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

</div>

<style>
  .wrapper {
    display: flex;
    background-color: #121212;
    min-height: 90vh;
    width: 100%;
    position: relative;
    transition:
      background-color 0.3s,
      border 0.3s;
  }

  .wrapper.drag-over {
    /* border: 2px dashed #007bff;
    background-color: rgba(0, 123, 255, 0.1); */
  }

  .add-post-wrapper {
    position: fixed;
    z-index: 1000;
    right: 2%;
    bottom: 4%;
  }

  .sidebarHidden{
    margin-left: 0 !important;
    margin-right: 0 !important;
    width: 100% !important;
    transition: margin-left 0.5s ease-in-out, width 0.5 ease-in-out;
  }

  .posts-wrapper {
    display: inline-block;
    padding:0px;
    width:80%;
    height: fit-content;
    margin-left:250px;
    transition: margin-left 0.5s ease-in-out, width 0.5s ease-in-out;
  }

  .loader {
    width: 100px;
    height: 100px;
    border: 10px solid #FFF;
    border-bottom-color: #8d22f9;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
  } 

  @keyframes rotation {
  0% {
      transform: rotate(0deg);
  }
  100% {
      transform: rotate(360deg);
  }
  } 

  @media (max-width: 768px) {
    .sidebar {
      display: none;
    }

    .posts-wrapper {
      width: 100%;
      margin-left:0;
    }

    .wrapper {
      margin-left:0;
      flex-direction: column;
    }
  }

  .posts-wrapper.drag-over {
    /* border: 2px dashed #007bff;
    background-color: rgba(0, 123, 255, 0.1); */
  }

  .loading-spinner {
    margin-top: 40vh;
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

  .loading-screen{
    position:absolute;
    z-index: 1000;
    width:100vw;
    height:150vh;
    background-color: #121212;
  }

  .filter-dropdowns-wrapper {
    width: 70%;
    margin-left:auto;
    margin-right:auto;
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    justify-content: left;
    align-items: center;
  }

  .filter-dropdowns-wrapper select {
    padding: 5px;
    font-size: 16px;
    border-radius: 5px;
    background-color: #1d1f2500;
    color: white;
    border: none;
    text-align: center;
  }

  .filter-dropdowns-wrapper select:focus {
    outline: none;
    border-color: #007bff;
  }
</style>
