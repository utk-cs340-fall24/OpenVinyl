<script>
  import {createPost} from "$lib/utils";
  function makePost() {
    console.log(parseInt(document.getElementById("rating").value));
    createPost(
      document.getElementById("profile_id").value,
      document.getElementById("title").value,
      document.getElementById("content").value,
      document.getElementById("song_id").value,
      parseInt(document.getElementById("rating").value)
    )
  }
</script>

<div>
  <input id="profile_id" type="text" placeholder="username">
  <input id="title" type="text" placeholder="title">
  <input id="content" type="text" placeholder="content">
  <input id="song_id" type="text" placeholder="song name">
  <input id="rating" type="text" placeholder="rating">
  <button on:click={makePost}>Create Post</button>
</div>