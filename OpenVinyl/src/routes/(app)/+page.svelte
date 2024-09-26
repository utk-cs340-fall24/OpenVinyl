<script lang="js">
  import AddPostBtn from "$lib/addPostBtn.svelte";
  import { supabase } from "$lib/supabaseClient";
  import PostCreation from "$lib/postCreation.svelte";
  import Post from "$lib/post.svelte";
  import Sidebar from "$lib/sidebar.svelte";
  import { supabase } from '$lib/supabaseClient.js';
  import { onMount } from "svelte";
  export let data;
  
  console.log(data);

  if (data.success) {
    console.log("successfully retrieved data");
    let session = supabase.auth.getSession();
    let userid = supabase.auth.getUser();

    console.log(supabase.auth.getSession());
    console.log(supabase.auth.getUser());
    console.log("successfully retrieved data");
  }
  onMount(async () => {
    console.log(supabase.auth.getUser());
  });

</script>

<div class="wrapper">
  <div class="add-post-wrapper">
    <AddPostBtn></AddPostBtn>
  </div>

  <Sidebar />

  <div class="posts-wrapper">
    {#each data.posts_dummy as post}
      <Post
        username={post.profile_id}
        rating={post.rating}
        desc={post.content}
        song_id={post.song_id}
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
    padding-top: 100px;
    display: inline-block;
    width: 70vw;
  }
  h2 {
    text-align: center;
  }
  .add-post-wrapper {
    position: fixed;
    z-index: 1000;
    left: 78%;
    padding-top: 16px;
  }
</style>
