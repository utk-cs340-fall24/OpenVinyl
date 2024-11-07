<script>
  import Plinko from "$lib/Plinko.svelte";
  import VideoEmbed from "$lib/VideoEmbed.svelte";
</script>

<div class="main-content">
  <div class="left-side">
  </div>
  <div class="center-content">
    <Plinko />
  </div>
  <!-- <div class="right-side">
    <VideoEmbed />
  </div> -->
</div>

<style>
  .main-content {
    display: flex;
    height: 100vh;
  }

  .left-side {
    flex: 0.1;
  }

  .center-content {
    /* justify-content: center; */
    flex: 0.75;
  }

  .right-side {
    flex: 0.15;
   
  }
</style>