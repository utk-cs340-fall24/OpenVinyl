<script type="js">
  export let token = "juice";
  export let s;
  console.log("got token: ",token);
  $: {
		console.log(`multiple statements can be combined`);
		console.log(`the current title is ${s}`);
	}
</script>

<div style="margin: 100px">
  {#if token}
  <p>Token: {token}</p>
{:else}
  <p>Loading...</p>
{/if}
</div>

<style>
  div{
    height: 200vh;
  }
</style>