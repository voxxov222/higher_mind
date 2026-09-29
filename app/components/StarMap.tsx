import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useHigherMind } from './HigherMindProvider';

export default function StarMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    svg.selectAll('*').remove();

    // Create a background
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#050510')
      .attr('opacity', 0.8);

    // Generate random stars for the background
    const numStars = 300;
    const stars = Array.from({ length: numStars }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2,
      opacity: Math.random() * 0.8 + 0.2
    }));

    svg.append('g')
      .selectAll('circle')
      .data(stars)
      .join('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => d.size)
      .attr('fill', '#ffffff')
      .attr('opacity', d => d.opacity)
      .style('animation', 'twinkle 4s infinite alternate')
      .style('animation-delay', () => `${Math.random() * 4}s`);

    // Simulated Constellations Data
    const nodes = [
      { id: 'Sirius', x: width * 0.3, y: height * 0.4, size: 4 },
      { id: 'Betelgeuse', x: width * 0.4, y: height * 0.3, size: 5 },
      { id: 'Rigel', x: width * 0.5, y: height * 0.5, size: 4.5 },
      { id: 'Aldebaran', x: width * 0.6, y: height * 0.2, size: 3.5 },
      { id: 'Capella', x: width * 0.2, y: height * 0.2, size: 3 },
      { id: 'Procyon', x: width * 0.25, y: height * 0.5, size: 3.5 },
      { id: 'Pollux', x: width * 0.15, y: height * 0.35, size: 3 },
    ];

    const links = [
      { source: 'Sirius', target: 'Betelgeuse' },
      { source: 'Betelgeuse', target: 'Rigel' },
      { source: 'Rigel', target: 'Aldebaran' },
      { source: 'Betelgeuse', target: 'Aldebaran' },
      { source: 'Sirius', target: 'Procyon' },
      { source: 'Procyon', target: 'Pollux' },
      { source: 'Pollux', target: 'Capella' },
      { source: 'Capella', target: 'Aldebaran' },
    ];

    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const g = svg.append('g');

    // Add zoom/pan capability
    const zoom = d3.zoom()
      .scaleExtent([0.5, 4])
      .on('zoom', (e) => {
        g.attr('transform', e.transform);
      });
      
    svg.call(zoom as any);

    const link = g.append('g')
      .attr('stroke', 'rgba(100, 150, 255, 0.4)')
      .attr('stroke-width', 1.5)
      .selectAll('line')
      .data(links)
      .join('line');

    const node = g.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', d => d.size)
      .attr('fill', '#a5b4fc')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1);

    const label = g.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text(d => d.id)
      .attr('font-size', '10px')
      .attr('fill', 'rgba(255, 255, 255, 0.7)')
      .attr('dx', 8)
      .attr('dy', 3);

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      label
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });

    const handleResize = () => {
      if (!containerRef.current || !svgRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      svg.attr('width', newWidth).attr('height', newHeight).attr('viewBox', [0, 0, newWidth, newHeight]);
      simulation.force('center', d3.forceCenter(newWidth / 2, newHeight / 2));
      simulation.alpha(0.3).restart();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      simulation.stop();
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-auto overflow-hidden">
      <style>{`
        @keyframes twinkle {
          0% { opacity: 0.2; }
          100% { opacity: 1; }
        }
      `}</style>
      <svg ref={svgRef} className="w-full h-full cursor-move" />
    </div>
  );
}
