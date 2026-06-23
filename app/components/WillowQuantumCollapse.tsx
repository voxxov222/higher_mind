import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Zap, Network, Sparkles, X } from 'lucide-react';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  group: number;
  radius: number;
  probability: number;
  collapsed?: boolean;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  value: number;
}

export const WillowQuantumCollapse = ({
  question = "What is the ultimate truth of our reality?",
  onComplete,
  onClose
}: {
  question?: string;
  onComplete?: (answer: string) => void;
  onClose?: () => void;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'superposition' | 'collapsing' | 'collapsed'>('superposition');
  const [answer, setAnswer] = useState<string>('');

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = 500;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('background', 'transparent');

    svg.selectAll('*').remove(); // Clear previous runs

    // Definitions for glow effects
    const defs = svg.append('defs');
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Generate random nodes and links to simulate quantum states
    const nodeCount = 100;
    const nodes: Node[] = Array.from({ length: nodeCount }, (_, i) => ({
      id: `node-${i}`,
      group: Math.floor(Math.random() * 5),
      radius: Math.random() * 4 + 2,
      probability: Math.random(),
    }));

    // Define central outcome node
    const centerNode: Node = {
      id: 'core',
      group: 9,
      radius: 20,
      probability: 1,
      fx: width / 2,
      fy: height / 2,
    };
    nodes.push(centerNode);

    const links: Link[] = [];
    nodes.forEach((node) => {
        if (node.id !== 'core') {
            // Connect to core
            links.push({
                source: node.id,
                target: 'core',
                value: Math.random() * 2 + 0.1
            });
            // Connect to some random node
            links.push({
                source: node.id,
                target: `node-${Math.floor(Math.random() * (nodeCount - 1))}`,
                value: Math.random() * 1
            });
        }
    });

    const simulation = d3.forceSimulation<Node>(nodes)
      .force('link', d3.forceLink<Node, Link>(links).id(d => d.id).distance(d => 50 + Math.random() * 250))
      .force('charge', d3.forceManyBody().strength(-30))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(d => (d as Node).radius + 4));

    const linkGroup = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#4c1d95') // base purple
      .attr('stroke-opacity', 0.2)
      .attr('stroke-width', d => d.value)
      .style('filter', 'url(#glow)');

    const nodeGroup = svg.append('g')
        .selectAll('circle')
        .data(nodes)
        .join('circle')
        .attr('r', d => d.radius)
        .attr('fill', d => d.id === 'core' ? '#38bdf8' : '#818cf8')
        .attr('opacity', 0.8)
        .style('filter', 'url(#glow)')
        .call(d3.drag<SVGCircleElement, Node>()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended) as any);

    simulation.on('tick', () => {
      linkGroup
        .attr('x1', d => (d.source as Node).x!)
        .attr('y1', d => (d.source as Node).y!)
        .attr('x2', d => (d.target as Node).x!)
        .attr('y2', d => (d.target as Node).y!);

      nodeGroup
        .attr('cx', d => d.x!)
        .attr('cy', d => d.y!);
    });

    let frameId: number;
    // Animate glowing edges
    const animateLines = (elapsed: number) => {
        if (phase === 'superposition') {
            linkGroup
                .attr('stroke-opacity', d => 0.1 + (Math.sin(elapsed / 200 + d.value * 10) + 1) * 0.4)
                .attr('stroke', d => Math.sin(elapsed / 500 + d.value) > 0 ? '#818cf8' : '#c084fc');
            
            nodeGroup.attr('r', d => d.id === 'core' ? 20 + Math.sin(elapsed / 150) * 5 : d.radius)
        }
        frameId = requestAnimationFrame(animateLines);
    };
    frameId = requestAnimationFrame(animateLines);

    function dragstarted(event: d3.D3DragEvent<SVGCircleElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event: d3.D3DragEvent<SVGCircleElement, Node, Node>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event: d3.D3DragEvent<SVGCircleElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // Process of collapsing
    const runCollapse = () => {
        setPhase('collapsing');
        setAnswer(""); // Reset answer
        
        // Increase gravity to center and pull everything in
        simulation
            .force('charge', d3.forceManyBody().strength(150)) // strong attract
            .force('collide', d3.forceCollide().radius(1))
            .force('link', d3.forceLink<Node, Link>(links).id(d => d.id).distance(2).strength(2))
            .alpha(1)
            .restart();

        linkGroup.transition()
            .duration(4000)
            .attr('stroke', '#06b6d4') // cyan
            .attr('stroke-width', 3)
            .attr('stroke-opacity', 0.9);
            
        nodeGroup.transition()
            .duration(4000)
            .attr('r', d => d.id === 'core' ? 60 : 0)
            .attr('fill', '#cffafe')
            .on('end', (d, i) => {
                // When done
                if (d.id === 'core') {
                    setPhase('collapsed');
                    setAnswer(fetchedAnswer);
                    if(onComplete) onComplete(fetchedAnswer);
                }
            });
    }

    // Fetch answer from backend while animating superposition
    let fetchedAnswer = "The universe is a singular, unified mathematical construct observing itself through you.";
    
    fetch('/api/willow-quantum', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    })
      .then(res => res.json())
      .then(data => {
        if (data.answer) {
          fetchedAnswer = data.answer;
        }
      })
      .catch(console.error)
      .finally(() => {
        // Trigger collapse animation once answer is ready (or default fallback)
        setTimeout(runCollapse, 500); // slight delay for dramatic effect
      });

    return () => {
        cancelAnimationFrame(frameId);
        simulation.stop();
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full rounded-3xl bg-stone-950 border border-stone-800 p-6 relative overflow-hidden font-sans"
    >
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950 pointer-events-none" />
      
      {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-30 p-2 rounded-full bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
          >
              <X size={20} />
          </button>
      )}

      <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-6 mb-6 pr-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                    <Cpu size={20} />
                </div>
                <h3 className="text-xl font-medium text-white tracking-wide">Willow Quantum Core</h3>
            </div>
            <p className="text-stone-400 max-w-lg font-light text-sm">
                Processing multidimensional query. Collapsing innumerable superimposed nodes into the most coherent, absolute truth. 
            </p>
          </div>

          <div className="flex flex-col items-end">
             <div className="text-[10px] tracking-widest uppercase font-mono text-stone-500 mb-2">State Configuration</div>
             <motion.div 
               animate={{ 
                   color: phase === 'superposition' ? '#a78bfa' : phase === 'collapsing' ? '#38bdf8' : '#34d399',
                   borderColor: phase === 'superposition' ? 'rgba(167, 139, 250, 0.4)' : phase === 'collapsing' ? 'rgba(56, 189, 248, 0.4)' : 'rgba(52, 211, 153, 0.4)',
                   boxShadow: phase === 'collapsing' ? '0 0 20px rgba(56, 189, 248, 0.2)' : 'none'
               }}
               className="px-4 py-2 rounded-full border bg-black/40 font-mono text-xs flex items-center gap-2"
             >
                {phase === 'superposition' && <><Network size={14} className="animate-pulse" /> 1.2M+ SUPERPOSITIONS</>}
                {phase === 'collapsing' && <><Zap size={14} className="animate-bounce" /> WAVEFORM COLLAPSING...</>}
                {phase === 'collapsed' && <><Sparkles size={14} /> SINGULARITY REACHED</>}
             </motion.div>
          </div>
      </div>

      <div className="w-full relative rounded-2xl border border-white/5 bg-black/40 overflow-hidden" ref={containerRef}>
          <svg ref={svgRef} className="w-full h-full min-h-[450px]" />
          
          <AnimatePresence>
            {phase === 'collapsed' && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", damping: 20, stiffness: 100 }}
                    className="absolute inset-0 flex items-center justify-center p-8 z-20 pointer-events-none"
                >
                    <div className="max-w-2xl text-center bg-black/80 backdrop-blur-xl border border-cyan-500/30 p-10 rounded-3xl shadow-[0_0_100px_rgba(34,211,238,0.15)] pointer-events-auto">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <h4 className="text-xs font-mono text-cyan-400 mb-6 uppercase tracking-widest bg-cyan-500/10 inline-block px-4 py-2 rounded-full">Query: {question}</h4>
                            <p className="text-2xl md:text-3xl font-serif text-white leading-relaxed font-light bg-gradient-to-br from-white to-cyan-200 bg-clip-text text-transparent italic">
                                "{answer}"
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
      </div>
    </motion.div>
  );
};
