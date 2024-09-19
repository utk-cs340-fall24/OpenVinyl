<script>
  import Nav from '$lib/nav.svelte';
  import Footer from '$lib/footer.svelte';
</script>

<div class="wrapper">
  <Nav />
  <slot></slot>
  <Footer />
</div>


<style>
  .wrapper{
    background: linear-gradient(360deg, rgba(59,59,59,1) 0%, rgba(85,85,85,1) 84%);
  }
</style>