/**
 * HealthChain - D3 Force Directed Graph
 * Interactive simulation of blockchain records network.
 */

document.addEventListener('DOMContentLoaded', () => {
    initBlockchainGraph();
  });
  
  function initBlockchainGraph() {
    const container = document.getElementById('d3-graph-container');
    if (!container) return;
  
    // 1. Setup SVG and dimensions
    const width = container.clientWidth;
    const height = container.clientHeight;
  
    const svg = d3.select("#d3-graph-container")
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`);
  
    // Add a group wrapper for zooming/panning
    const g = svg.append("g");
  
    // 2. Data (Nodes and Links)
    const nodes = [
      { id: "hash0", group: "genesis", label: "Genesis Block", icon: "database", size: 30, fx: width * 0.15, fy: height / 2 },
      { id: "hash1", group: "record", label: "Blood Test", icon: "activity", size: 24 },
      { id: "hash2", group: "record", label: "Prescription", icon: "file-text", size: 24 },
      { id: "hash3", group: "record", label: "MRI Scan", icon: "camera", size: 24 },
      { id: "hash4", group: "record", label: "ECG Report", icon: "heart-pulse", size: 24 },
      { id: "hash5", group: "record", label: "Lab Results", icon: "flask-conical", size: 24, fx: width * 0.85, fy: height / 2 }
    ];
  
    const links = [
      { source: "hash0", target: "hash1" },
      { source: "hash0", target: "hash2" },
      { source: "hash1", target: "hash3" },
      { source: "hash2", target: "hash4" },
      { source: "hash3", target: "hash5" },
      { source: "hash4", target: "hash5" },
      { source: "hash1", target: "hash4" }
    ];
  
    // 3. Define Zoom Behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
  
    svg.call(zoom);
  
    // 4. Force Simulation Setup
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(d => d.size + 40).iterations(2));
  
    // 5. Draw Links (Edges)
    const link = g.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke", "rgba(0, 212, 255, 0.4)")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5"); // Dashed cyan lines
  
    // 6. Draw Nodes
    const node = g.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .enter().append("g")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
  
    // Base shape: Dark rounded rectangle
    const rectWidth = 140;
    const rectHeight = 44;
    
    node.append("rect")
      .attr("width", rectWidth)
      .attr("height", rectHeight)
      .attr("x", -rectWidth / 2)
      .attr("y", -rectHeight / 2)
      .attr("rx", 8)
      .attr("ry", 8)
      .attr("fill", "#0d1b2e")
      .attr("stroke", d => d.group === "genesis" ? "rgba(168, 85, 247, 0.6)" : "rgba(0, 212, 255, 0.3)")
      .attr("stroke-width", 1.5)
      .style("filter", d => d.group === "genesis" ? "drop-shadow(0 0 8px rgba(168, 85, 247, 0.3))" : "drop-shadow(0 0 8px rgba(0, 212, 255, 0.15))");
  
    // Add text label
    node.append("text")
      .attr("dx", 0)
      .attr("dy", -2) // Center horizontally, shift up slightly
      .attr("text-anchor", "middle")
      .attr("fill", "#ffffff")
      .style("font-family", "'Inter', sans-serif")
      .style("font-size", "12px")
      .style("font-weight", "500")
      .text(d => d.label);
      
    // Add fake hash string
    node.append("text")
      .attr("dx", 0)
      .attr("dy", 12) 
      .attr("text-anchor", "middle")
      .attr("fill", "rgba(232, 244, 248, 0.4)")
      .style("font-family", "'JetBrains Mono', monospace")
      .style("font-size", "9px")
      .text(d => truncateHash("0x" + Math.random().toString(16).slice(2, 10).toUpperCase() + d.id));
  
    // 7. Tick Function (Update positions)
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
  
      node
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });
  
    // 8. Drag Handlers
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
      // We keep the fixed positions for genesis and the last node to keep layout somewhat structured
      if(d.id !== "hash0" && d.id !== "hash5") {
          d.fx = null;
          d.fy = null;
      }
    }
  
    // 9. Zoom Controls Integration
    document.getElementById('zoom-in').addEventListener('click', () => {
      svg.transition().duration(300).call(zoom.scaleBy, 1.3);
    });
  
    document.getElementById('zoom-out').addEventListener('click', () => {
      svg.transition().duration(300).call(zoom.scaleBy, 0.7);
    });
  
    document.getElementById('fit-graph').addEventListener('click', () => {
      svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    });
  
    // Helper to truncate long hashes for UI
    function truncateHash(hashStr) {
        if(hashStr.length > 10) {
            return hashStr.slice(0, 6) + "..." + hashStr.slice(-4);
        }
        return hashStr;
    }
  
    // Initial scaling to ensure fits smaller screens nicely
    if(width < 768) {
        svg.call(zoom.transform, d3.zoomIdentity.scale(0.7).translate(width * 0.2, height * 0.2));
    }
  }
