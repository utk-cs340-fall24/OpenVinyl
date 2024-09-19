<script>
  import {spotify} from "$lib/spotifyClient";
  import AddPost from '$lib/addPost.svelte';
  import Post from '$lib/post.svelte';
  export let data;

  spotify.setAccessToken(data.token);
  console.log(data);
</script>

<div class="wrapper">
  <div class="your-music-wrapper">
    here is where your recently played music will appear
  </div>
  
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
    display:flex;

  }
  .posts-wrapper{
    padding-top:100px;
    display: inline-block;
    width: 70vw;
  }
  .your-music-wrapper{
    display:inline-block;
    width:15vw;
    height:80vh;
    background-color: #787878;
    margin:10px;
    margin-top: 150px;
  }
  h2{
    text-align:center;
  }
</style>