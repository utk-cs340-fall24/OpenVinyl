<script>
  import Nav from '$lib/nav.svelte';
</script>

<div class="wrapper">
  <Nav />
  <slot></slot>
</div>


<style>
  .wrapper{
    background: linear-gradient(360deg, rgba(59,59,59,1) 0%, rgba(85,85,85,1) 84%);
  }
</style>