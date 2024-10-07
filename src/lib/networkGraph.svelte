<script>
    import { onMount } from "svelte";
    import * as d3 from "d3";
    import { supabase } from "$lib/supabaseClient";
    import { selectedSong } from "$lib/stores";
  
    let graphData = { nodes: [], links: [] };
  
    onMount(async () => {
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, username'); 
  
      if (usersError) {
        console.error('Error fetching users:', usersError.message);
        return;
      }
  
      const { data: follows, error: followsError } = await supabase
        .from('follows')
        .select('*');
  
      if (followsError) {
        console.error('Error fetching follows:', followsError.message);
        return;
      }
  
      graphData.nodes = users.map(user => ({
        id: user.id,
        username: user.username,
      }));
  
      graphData.links = follows.map(follow => ({
        source: follow.follower_id,
        target: follow.following_id,
      }));
  
      initializeGraph();
    });
  
    function initializeGraph() {
      const width = 800;
      const height = 600;
  
      const svg = d3.select("#network-graph")
        .attr("width", width)
        .attr("height", height)
        .call(d3.zoom().on("zoom", (event) => {
          svg.attr("transform", event.transform);
        }))
        .append("g");
  
      const simulation = d3.forceSimulation(graphData.nodes)
        .force("link", d3.forceLink(graphData.links).id(d => d.id).distance(150))
        .force("charge", d3.forceManyBody().strength(-500)) 
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(60)); 
  
      const link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graphData.links)
        .enter().append("line")
        .attr("stroke", "#aaa");
  
      const node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(graphData.nodes)
        .enter().append("circle")
        .attr("r", 40)
        .attr("fill", "#69b3a2")
        .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));
  
      const labels = svg.append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(graphData.nodes)
        .enter().append("text")
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .text(d => d.username)
        .style("pointer-events", "none")
        .style("font-size", "14px")
        .style("fill", "#fff");
  
      node.on("mouseover", (event, d) => {
        d3.select(event.target).attr("fill", "#ffcc00");
        d3.select("#tooltip")
          .style("visibility", "visible")
          .text(`Username: ${d.username}`);
      }).on("mousemove", (event) => {
        d3.select("#tooltip")
          .style("top", (event.pageY - 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      }).on("mouseout", (event) => {
        d3.select(event.target).attr("fill", "#69b3a2"); 
        d3.select("#tooltip").style("visibility", "hidden");
      });
  
      simulation.nodes(graphData.nodes).on("tick", ticked);
      simulation.force("link").links(graphData.links);
  
      function ticked() {
        link.attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);
  
        node.attr("cx", d => d.x)
          .attr("cy", d => d.y);
  
        labels.attr("x", d => d.x)
          .attr("y", d => d.y);
      }
  
      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
  
      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }
  
      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
    }
  </script>
  
  <div>
    <svg id="network-graph"></svg>
    <div id="tooltip" style="position: absolute; visibility: hidden; background-color: white; border: 1px solid #ccc; padding: 5px; font-size: 12px;"></div>
  </div>
  
  <style>
    svg {
      border: 1px solid #ccc;
      background-color: #1d1f25;
    }
  
    .links line {
      stroke: #aaa;
      stroke-width: 1.5px;
    }
  
    .nodes circle {
      stroke: #fff;
      stroke-width: 1.5px;
    }
  
    .labels text {
      font-family: Arial, sans-serif;
      pointer-events: none;
    }
  </style>
  