<script lang="js">
  import AddPostBtn from "$lib/addPostBtn.svelte";
  import { supabase } from "$lib/supabaseClient";
  import PostCreation from "$lib/postCreation.svelte";
  import Post from "$lib/post.svelte";
  import Sidebar from "$lib/sidebar.svelte";
  import { onMount } from "svelte";
  import { goto } from '$app/navigation'; // For navigating to /account page
  import AddPost from "$lib/addPost.svelte";
  export let data;

  let session_uuid;
  let user = null;

  onMount(async () => {
    console.log("inital load, ", data)
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
          // Redirect to /account if the username is empty
          goto('/account');
        }
      }
    }
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

    {#each data.posts as post}
      <Post
        logged_in_user_uuid={session_uuid}
        uuid={post.profile_id}
        rating={post.rating}
        desc={post.content}
        song_id={post.song_id}
        likes_arr={post.likes}
        likes_cnt={post.likes_count}
        post_id={post.id}
      ></Post>
    {/each}

    <h2>Load more...</h2>
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

  h2 {
    text-align: center;
  }

  .add-post-wrapper {
    position: fixed;
    z-index: 1000;
    right: 2%;
    bottom: 4%;
  }

  /* Hide sidebar on small screens */
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
