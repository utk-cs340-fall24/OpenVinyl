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
  function cancelPost(){
    document.getElementById("postModal").style.display = "none";
  }
</script>

<div class="post-creation-popup" id="postModal">
  <div class="inner-wrapper">
    <input id="profile_id" type="text" placeholder="username">
    <input id="title" type="text" placeholder="title">
    <input id="content" type="text" placeholder="content">
    <input id="song_id" type="text" placeholder="song name">
    <input id="rating" type="text" placeholder="rating">
    <button on:click={makePost}>Create Post</button>
    <button on:click={cancelPost}>Cancel</button>
  </div>
</div>

<style>
  .post-creation-popup{
    position:absolute;
    top:25%;
    left:25%;
    background-color: rgb(136, 136, 136);
    display: none;
    height:400px;
    width:800px;
    border-radius:20px;
  }
  .inner-wrapper{
    padding:30px;
    display:flex;
    flex-direction: column;
    justify-content: space-around;
  }
  .inner-wrapper input{
    margin:10px;
    padding:5px;
  }
  .inner-wrapper button{
    border: 0;
    background-color:#93269b;
    width: fit-content;
    margin-left:auto;
    margin-right:auto;
    padding:10px;
    margin-top:5px;
    margin-bottom:5px;
    border-radius:15px;
  }
  .inner-wrapper button:hover{
    background-color: #a72baf;
  }
</style>