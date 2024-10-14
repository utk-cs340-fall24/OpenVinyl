<!-- src/routes/(app)/network/+page.svelte -->
<script lang="js">
    import NetworkGraph from '$lib/networkGraph.svelte'; // The graph component you created
  </script>
  
  <div class="network-page">
    <h1>Network</h1>
    <NetworkGraph />
  </div>
  
  <style>
    .network-page {
      padding: 20px;
      background-color: #121212;
      color: #f3f1f1;
      min-height: 100vh;
    }
  
    h1 {
      text-align: center;
      margin-bottom: 20px;
    }
  </style>
  