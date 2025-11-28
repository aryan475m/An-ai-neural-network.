import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { D3Node, D3Link } from '../types';

interface NetworkGraphProps {
  nodeCount: number;
  cpuLoad: number;
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({ nodeCount, cpuLoad }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Generate stable random nodes based on count
  const data = useMemo(() => {
    const nodes: D3Node[] = Array.from({ length: nodeCount }, (_, i) => ({
      id: `node-${i}`,
      group: Math.floor(Math.random() * 3) + 1,
      x: 0, 
      y: 0
    }));

    // Create a mesh-like structure
    const links: D3Link[] = [];
    nodes.forEach((node, i) => {
      // Connect to next node (ring)
      links.push({
        source: node.id,
        target: nodes[(i + 1) % nodes.length].id,
        value: 1
      });
      // Random extra connections for density
      if (Math.random() > 0.7) {
        const targetIndex = Math.floor(Math.random() * nodes.length);
        if (targetIndex !== i) {
            links.push({
                source: node.id,
                target: nodes[targetIndex].id,
                value: 1
            });
        }
      }
    });

    return { nodes, links };
  }, [nodeCount]);

  useEffect(() => {
    if (!svgRef.current || !wrapperRef.current) return;

    const width = wrapperRef.current.clientWidth;
    const height = wrapperRef.current.clientHeight;

    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("width", width)
      .attr("height", height);

    // Dynamic coloring based on load
    const loadColor = d3.interpolateRgb("#3b82f6", "#ef4444")(cpuLoad / 100);
    
    const simulation = d3.forceSimulation(data.nodes)
      .force("link", d3.forceLink(data.links).id((d: any) => d.id).distance(50))
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(10));

    const link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.3)
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke-width", d => Math.sqrt(d.value));

    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(data.nodes)
      .join("circle")
      .attr("r", 5)
      .attr("fill", loadColor)
      .call(drag(simulation) as any);

    // Add glowing effect to nodes
    node.attr("filter", "drop-shadow(0 0 5px rgba(59, 130, 246, 0.5))");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);
    });

    function drag(simulation: d3.Simulation<D3Node, undefined>) {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

    return () => {
      simulation.stop();
    };
  }, [data, cpuLoad]);

  return (
    <div ref={wrapperRef} className="w-full h-full min-h-[400px] relative overflow-hidden bg-black/40 rounded-xl border border-white/10 shadow-inner">
      <svg ref={svgRef} className="w-full h-full block" />
      <div className="absolute top-4 left-4 text-xs font-mono text-blue-400 pointer-events-none">
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            VISUALIZER_ACTIVE
        </div>
        <div>NODES: {nodeCount}</div>
        <div>VIRTUAL_LINKS: {data.links.length}</div>
      </div>
    </div>
  );
};

export default NetworkGraph;