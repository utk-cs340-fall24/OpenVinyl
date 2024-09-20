<script>
  import {spotify} from "$lib/spotifyClient";
  import AddPost from '$lib/addPost.svelte';
  import Post from '$lib/post.svelte';
  import Sidebar from "../lib/sidebar.svelte";
  export let data;

  spotify.setAccessToken(data.token);
  console.log(data);
</script>

<div class="wrapper">
  <Sidebar />
  
  <div class="posts-wrapper">
    {#each data.posts_dummy as post}
      <Post username="{post.profile_id}" rating="{post.rating}" desc="{post.content}" song_id="{post.song_id}"></Post>
    {/each}

    <AddPost></AddPost>
    <h2>Load more...</h2>
  </div>
</div>
  
<style>
  .wrapper{
    display: flex;
    min-height:90vh;

  }
  .posts-wrapper{
    padding-top:100px;
    display: inline-block;
    width: 70vw;
  }
  h2{
    text-align:center;
  }
</style>