<script>
  import Nav from '$lib/nav.svelte';
  import Footer from '$lib/footer.svelte';
  import { onMount } from 'svelte';


</script>

<div class="wrapper">
  <Nav />
  <slot></slot>
  <Footer />
</div>


<style>
  .wrapper{
    background-color: #16181c;
  }
</style>