<script>
  function openPostCreator(){
    document.getElementById("postModal").style.transform = "translate(0px, 0px)";
  }
</script>

<div clsas="add-post-button">
  <button class="new-post" on:click={openPostCreator}>
    Compose Review
  </button>
</div>

<style>
  .new-post{
    padding:5px 12px;
    border-radius:100px;
    border:0;
    font-size: 26px;
    background-color: #ae40cf;
    color:black;
    
    transition-duration: 1s;
  }
  .new-post:hover{
    background-color: #c262e0;
    -webkit-box-shadow:0px 0px 38px 0px rgba(220,46,255,0.66);
    -moz-box-shadow: 0px 0px 38px 0px rgba(220,46,255,0.66);
    box-shadow: 0px 0px 38px 0px rgba(220,46,255,0.66);
    transition-duration: 1s;
  }
</style>