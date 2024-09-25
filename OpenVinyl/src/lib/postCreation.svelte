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
    document.getElementById("postModal").style.transform = "translate(2500px, 0px)"
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
    background-color: #515050;
    height:400px;
    width:800px;
    border-radius:20px;
    -webkit-box-shadow: 0px 10px 13px -7px #000000, -1px 4px 12px -2px rgba(0,0,0,0); 
    box-shadow: 0px 10px 13px -7px #000000, -1px 4px 12px -2px rgba(0,0,0,0);
    transform: translate(2500px, 0px);
    transition-duration: 0.2s;
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