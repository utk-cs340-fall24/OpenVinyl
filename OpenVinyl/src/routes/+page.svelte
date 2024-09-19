<script>
  import AddPost from '$lib/addPost.svelte';
  import Post from '$lib/post.svelte';
</script>

<div class="wrapper">
  <div class="your-music-wrapper">
    now playing...
  </div>
  
  <div class="posts-wrapper">
    <Post></Post>
    <Post></Post>
    <Post></Post>
    <Post></Post>
    <Post></Post>
    <Post></Post>
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