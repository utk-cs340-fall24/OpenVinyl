<script>
  function openPostCreator(){
    document.getElementById("postModal").style.display = "block";
  }
</script>

<div clsas="add-post-button">
  <button class="new-post" on:click={openPostCreator}>
    +
  </button>
</div>

<style>
  .new-post{
    width: 40px;
    border-radius:50px;
    border:0;
    font-size: 32px;
    background-color: #7722cc;
    color:white;
  }
  .new-post:hover{
    background-color: #8436d2;
  }
</style>