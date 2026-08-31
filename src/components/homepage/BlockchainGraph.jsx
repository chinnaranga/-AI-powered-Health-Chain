import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Plus, Minus, Maximize } from 'lucide-react';

const BlockchainGraph = () => {
  const containerRef = useRef(null);
  const svgWrapperRef = useRef(null);
  const zoomRef = useRef(null);
  const zoomGRef = useRef(null);

  useEffect(() => {
    if (!svgWrapperRef.current) return;
    
    // Clear previous SVG on hot reload
    d3.select(svgWrapperRef.current).selectAll("*").remove();

    const width = svgWrapperRef.current.clientWidth;
    const height = svgWrapperRef.current.clientHeight || 400;

    const svg = d3.select(svgWrapperRef.current)
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`);

    const g = svg.append("g");
    zoomGRef.current = g;

    const nodes = [
      { id: "hash0", group: "genesis", label: "Genesis Block", size: 30, fx: width * 0.15, fy: height / 2 },
      { id: "hash1", group: "record", label: "Blood Test", size: 24 },
      { id: "hash2", group: "record", label: "Prescription", size: 24 },
      { id: "hash3", group: "record", label: "MRI Scan", size: 24 },
      { id: "hash4", group: "record", label: "ECG Report", size: 24 },
      { id: "hash5", group: "record", label: "Lab Results", size: 24, fx: width * 0.85, fy: height / 2 }
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

    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    
    zoomRef.current = { svg, zoom };
    svg.call(zoom);

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(d => d.size + 40).iterations(2));

    const link = g.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke", "rgba(0, 212, 255, 0.4)")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    const HelperTruncateHash = (hashStr) => {
       if(hashStr.length > 10) {
           return hashStr.slice(0, 6) + "..." + hashStr.slice(-4);
       }
       return hashStr;
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
      if(d.id !== "hash0" && d.id !== "hash5") {
          d.fx = null;
          d.fy = null;
      }
    }

    const node = g.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .enter().append("g")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

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

    node.append("text")
      .attr("dx", 0)
      .attr("dy", -2)
      .attr("text-anchor", "middle")
      .attr("fill", "#ffffff")
      .style("font-family", "'Inter', sans-serif")
      .style("font-size", "12px")
      .style("font-weight", "500")
      .text(d => d.label);
      
    node.append("text")
      .attr("dx", 0)
      .attr("dy", 12) 
      .attr("text-anchor", "middle")
      .attr("fill", "rgba(232, 244, 248, 0.4)")
      .style("font-family", "'JetBrains Mono', monospace")
      .style("font-size", "9px")
      .text(d => HelperTruncateHash("0x" + Math.random().toString(16).slice(2, 10).toUpperCase() + d.id));

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    if(width < 768) {
      svg.call(zoom.transform, d3.zoomIdentity.scale(0.7).translate(width * 0.2, height * 0.2));
    }

    return () => {
      simulation.stop();
    };
  }, []);

  const handleZoomIn = () => {
    if (zoomRef.current) {
      zoomRef.current.svg.transition().duration(300).call(zoomRef.current.zoom.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (zoomRef.current) {
      zoomRef.current.svg.transition().duration(300).call(zoomRef.current.zoom.scaleBy, 0.7);
    }
  };

  const handleFitGraph = () => {
    if (zoomRef.current) {
      zoomRef.current.svg.transition().duration(750).call(zoomRef.current.zoom.transform, d3.zoomIdentity);
    }
  };

  return (
    <section className="hc-graph-section">
      <div className="hc-container">
        <div className="hc-section-header">
          <h2>Live Blockchain Graph</h2>
          <p>Explore the network of medical records stored on the blockchain.</p>
        </div>
        
        <div className="hc-graph-container-wrapper" ref={containerRef}>
          <div id="hc-d3-graph-container" ref={svgWrapperRef}></div>
          
          <div className="hc-graph-controls">
            <button onClick={handleZoomIn} title="Zoom In"><Plus size={18} /></button>
            <button onClick={handleZoomOut} title="Zoom Out"><Minus size={18} /></button>
            <button onClick={handleFitGraph} title="Fit to Screen"><Maximize size={18} /></button>
          </div>
          
          <div className="hc-graph-legend">
            <div className="hc-legend-item">
              <span className="hc-legend-color hc-color-genesis"></span>
              <span className="hc-legend-label">Genesis Block</span>
            </div>
            <div className="hc-legend-item">
              <span className="hc-legend-color hc-color-record"></span>
              <span className="hc-legend-label">Medical Record</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlockchainGraph;
