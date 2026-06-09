import React, { useEffect, useRef, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'motion/react';
import { Network, Sparkles, Activity, Info, Zap, Compass, RefreshCw } from 'lucide-react';

interface Node extends d3.SimulationNodeDatum {
    id: string;
    label: string;
    type: 'planet' | 'zodiac' | 'house' | 'aspect';
    color: string;
    description: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
    source: string | Node;
    target: string | Node;
    distance: number;
    strength: number;
    type: string;
}

const ARCHETYPES = {
    planets: [
        { id: 'sun', label: 'Sun', color: '#fbbf24', description: 'Core identity, solar consciousness, and ego expression.' },
        { id: 'moon', label: 'Moon', color: '#94a3b8', description: 'Emotional waters, subconscious patterns, and the soul\'s memory.' },
        { id: 'mercury', label: 'Mercury', color: '#10b981', description: 'Mind, communication, and the bridge between realms.' },
        { id: 'venus', label: 'Venus', color: '#f472b6', description: 'Attraction, harmony, and the internal sense of value.' },
        { id: 'mars', label: 'Mars', color: '#ef4444', description: 'Will, drive, and the capacity for focused action.' },
        { id: 'jupiter', label: 'Jupiter', color: '#a855f7', description: 'Expansion, benevolence, and spiritual growth.' },
        { id: 'saturn', label: 'Saturn', color: '#4b5563', description: 'Structure, karma, and the mastery of time.' },
        { id: 'uranus', label: 'Uranus', color: '#22d3ee', description: 'Sudden awakening, revolution, and higher mind.' },
        { id: 'neptune', label: 'Neptune', color: '#6366f1', description: 'Dissolution, mysticism, and the collective unconscious.' },
        { id: 'pluto', label: 'Pluto', color: '#7c3aed', description: 'Transformation, power, and the process of rebirth.' },
    ],
    zodiac: [
        { id: 'aries', label: 'Aries', color: '#ef4444', description: 'Cardinal Fire: The spark of initiation.' },
        { id: 'taurus', label: 'Taurus', color: '#10b981', description: 'Fixed Earth: The vessel of manifestation.' },
        { id: 'gemini', label: 'Gemini', color: '#fbbf24', description: 'Mutable Air: The bridge of duality.' },
        { id: 'cancer', label: 'Cancer', color: '#94a3b8', description: 'Cardinal Water: The womb of nurturing.' },
        { id: 'leo', label: 'Leo', color: '#f97316', description: 'Fixed Fire: The throne of expression.' },
        { id: 'virgo', label: 'Virgo', color: '#84cc16', description: 'Mutable Earth: The craft of refinement.' },
        { id: 'libra', label: 'Libra', color: '#f472b6', description: 'Cardinal Air: The scale of balance.' },
        { id: 'scorpio', label: 'Scorpio', color: '#7c3aed', description: 'Fixed Water: The depth of transformation.' },
        { id: 'sagittarius', label: 'Sagittarius', color: '#a855f7', description: 'Mutable Fire: The arrow of truth.' },
        { id: 'capricorn', label: 'Capricorn', color: '#4b5563', description: 'Cardinal Earth: The mountain of mastery.' },
        { id: 'aquarius', label: 'Aquarius', color: '#22d3ee', description: 'Fixed Air: The flow of innovation.' },
        { id: 'pisces', label: 'Pisces', color: '#6366f1', description: 'Mutable Water: The ocean of unity.' },
    ]
};

const generateSynapticData = () => {
    const nodes: Node[] = [
        ...ARCHETYPES.planets.map(p => ({ ...p, type: 'planet' } as Node)),
        ...ARCHETYPES.zodiac.map(z => ({ ...z, type: 'zodiac' } as Node)),
    ];

    const links: Link[] = [];

    // Connect planets to their natural rulers (zodiac)
    const rulerships: { [key: string]: string[] } = {
        sun: ['leo'],
        moon: ['cancer'],
        mercury: ['gemini', 'virgo'],
        venus: ['taurus', 'libra'],
        mars: ['aries', 'scorpio'],
        jupiter: ['sagittarius', 'pisces'],
        saturn: ['capricorn', 'aquarius'],
        uranus: ['aquarius'],
        neptune: ['pisces'],
        pluto: ['scorpio'],
    };

    Object.entries(rulerships).forEach(([planet, signs]) => {
        signs.forEach(sign => {
            links.push({
                source: planet,
                target: sign,
                distance: 100,
                strength: 0.8,
                type: 'rulership'
            });
        });
    });

    // Add some random "aspect" links between planets
    for (let i = 0; i < 15; i++) {
        const p1 = ARCHETYPES.planets[Math.floor(Math.random() * ARCHETYPES.planets.length)].id;
        const p2 = ARCHETYPES.planets[Math.floor(Math.random() * ARCHETYPES.planets.length)].id;
        if (p1 !== p2 && !links.some(l => (l.source === p1 && l.target === p2) || (l.source === p2 && l.target === p1))) {
            links.push({
                source: p1,
                target: p2,
                distance: 150,
                strength: 0.4,
                type: 'aspect'
            });
        }
    }

    return { nodes, links };
};

export const NeuralSynapticViz: React.FC<{ data: CosmicData | null }> = ({ data }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
    const [zoomLevel, setZoomLevel] = useState(1);

    const synapticData = useMemo(() => {
        if (!data || !data.planets) return generateSynapticData();

        const nodes: Node[] = [
            ...data.planets.map(p => ({
                id: p.name.toLowerCase(),
                label: p.name,
                type: 'planet' as const,
                color: ARCHETYPES.planets.find(ap => ap.id === p.name.toLowerCase())?.color || '#38bdf8',
                description: p.description || p.meaning || `The celestial positioning of ${p.name}.`,
            })),
            ...ARCHETYPES.zodiac.map(z => ({ ...z, type: 'zodiac' } as Node))
        ];

        const links: Link[] = [];

        // Connect planets to their signs (if they match the zodiac node ID)
        data.planets.forEach(p => {
            const planetId = p.name.toLowerCase();
            const signId = p.sign.toLowerCase();
            if (nodes.some(n => n.id === signId)) {
                links.push({
                    source: planetId,
                    target: signId,
                    distance: 120,
                    strength: 0.9,
                    type: 'placement'
                });
            }
        });

        // Add real aspects from cosmicData
        if (data.aspects) {
            data.aspects.forEach(aspect => {
                const p1 = aspect.planet1.toLowerCase();
                const p2 = aspect.planet2.toLowerCase();
                if (nodes.some(n => n.id === p1) && nodes.some(n => n.id === p2)) {
                    links.push({
                        source: p1,
                        target: p2,
                        distance: 200,
                        strength: aspect.type === 'conjunction' ? 1.0 : 0.6,
                        type: 'aspect'
                    });
                }
            });
        }

        // Add rulerships for context
        const rulerships: { [key: string]: string[] } = {
            sun: ['leo'],
            moon: ['cancer'],
            mercury: ['gemini', 'virgo'],
            venus: ['taurus', 'libra'],
            mars: ['aries', 'scorpio'],
            jupiter: ['sagittarius', 'pisces'],
            saturn: ['capricorn', 'aquarius'],
            uranus: ['aquarius'],
            neptune: ['pisces'],
            pluto: ['scorpio'],
        };

        Object.entries(rulerships).forEach(([planet, signs]) => {
            signs.forEach(sign => {
                if (nodes.some(n => n.id === planet) && nodes.some(n => n.id === sign)) {
                     // Only add if not already linked by placement
                     if (!links.some(l => (l.source === planet && l.target === sign) || (l.source === sign && l.target === planet))) {
                        links.push({
                            source: planet,
                            target: sign,
                            distance: 150,
                            strength: 0.3,
                            type: 'rulership'
                        });
                     }
                }
            });
        });

        return { nodes, links };
    }, [data]);

    useEffect(() => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);
        const width = 800;
        const height = 600;

        svg.selectAll("*").remove();

        // Create a container for zoom
        const container = svg.append("g");

        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.5, 3])
            .on("zoom", (event) => {
                container.attr("transform", event.transform);
                setZoomLevel(event.transform.k);
            });

        svg.call(zoom);

        const simulation = d3.forceSimulation<Node>(synapticData.nodes)
            .force("link", d3.forceLink<Node, Link>(synapticData.links).id(d => d.id).distance(d => d.distance).strength(d => d.strength))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide().radius(40));

        // Draw Links
        const link = container.selectAll(".link")
            .data(synapticData.links)
            .enter()
            .append("path")
            .attr("class", "link")
            .attr("stroke", d => {
                const type = (d as any).type;
                if (type === 'placement') return "rgba(56, 189, 248, 0.4)";
                if (type === 'aspect') return "rgba(168, 85, 247, 0.3)";
                return "rgba(255, 255, 255, 0.05)";
            })
            .attr("stroke-width", d => (d as any).type === 'placement' ? 3 : 1)
            .attr("fill", "none")
            .attr("stroke-dasharray", d => (d as any).type === 'aspect' ? "5,5" : "none");

        // Web Glow
        link.clone(true)
            .attr("stroke-width", 6)
            .attr("stroke", d => (d as any).type === 'placement' ? "rgba(56, 189, 248, 0.1)" : "transparent")
            .attr("filter", "blur(4px)");

        // Draw Nodes
        const node = container.selectAll(".node")
            .data(synapticData.nodes)
            .enter()
            .append("g")
            .attr("class", "node")
            .style("cursor", "pointer")
            .on("click", (event, d) => setSelectedNode(d))
            .on("mouseover", (event, d) => setHoveredNode(d))
            .on("mouseout", () => setHoveredNode(null));

        // Node Glow (Atmosphere)
        node.append("circle")
            .attr("r", d => d.type === 'planet' ? 12 : 8)
            .attr("fill", d => d.color)
            .attr("opacity", 0.3)
            .style("filter", "blur(4px)");

        // Primary Node Circle
        node.append("circle")
            .attr("r", d => d.type === 'planet' ? 8 : 6)
            .attr("fill", "#09090b")
            .attr("stroke", d => d.color)
            .attr("stroke-width", 2);

        // Labels
        node.append("text")
            .attr("dy", 20)
            .attr("text-anchor", "middle")
            .attr("fill", "#94a3b8")
            .attr("font-size", "10px")
            .attr("font-family", "monospace")
            .attr("letter-spacing", "1px")
            .text(d => d.label.toUpperCase());

        simulation.on("tick", () => {
            link.attr("d", d => {
                const s = d.source as Node;
                const t = d.target as Node;
                if (!s.x || !s.y || !t.x || !t.y) return "";
                return `M${s.x},${s.y} L${t.x},${t.y}`;
            });

            node.attr("transform", d => `translate(${d.x},${d.y})`);
        });

        // Pulse Interval for "Resonance Flow"
        const pulseInterval = setInterval(() => {
            const activeLinks = link.nodes().filter(n => {
                const d = d3.select(n).datum() as any;
                return d.type === 'aspect' || d.type === 'placement';
            });
            
            if (activeLinks.length === 0) return;

            const randomLink = d3.select(activeLinks[Math.floor(Math.random() * activeLinks.length)]);
            const linkData = randomLink.datum() as any;
            
            svg.append("circle")
                .attr("r", 2.5)
                .attr("fill", linkData.type === 'placement' ? "#38bdf8" : "#a855f7")
                .attr("filter", "drop-shadow(0 0 4px currentColor)")
                .attr("opacity", 1)
                .transition()
                .duration(2500)
                .ease(d3.easeCubicInOut)
                .tween("path", function() {
                  const path = randomLink.node() as SVGPathElement;
                  const l = path.getTotalLength();
                  return function(t) {
                    const p = path.getPointAtLength(t * l);
                    d3.select(this)
                        .attr("cx", p.x)
                        .attr("cy", p.y)
                        .attr("opacity", Math.sin(t * Math.PI)); // Fade in and out
                  };
                })
                .remove();
        }, 800);

        return () => {
            simulation.stop();
            clearInterval(pulseInterval);
        };
    }, [synapticData]);

    return (
        <div className="w-full h-full min-h-[800px] bg-zinc-950 rounded-3xl border border-white/5 relative overflow-hidden font-sans group">
            {/* HUD Header */}
            <div className="absolute top-6 left-6 z-10 flex items-center gap-4">
                <div className="p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-3">
                    <div className="relative">
                        <Network size={24} className="text-indigo-400" />
                        <motion.div 
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }} 
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-indigo-400 rounded-full"
                        />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white uppercase tracking-[0.2em] leading-none mb-1">Neural Synaptic Map</h2>
                        <div className="flex items-center gap-2">
                          <Activity size={10} className="text-indigo-500 animate-pulse" />
                          <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Quantum Consciousness Engine v4.0</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button className="p-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl text-zinc-500 hover:text-white transition-colors">
                        <RefreshCw size={14} />
                    </button>
                    <div className="px-3 py-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl flex items-center gap-2">
                        <span className="text-[10px] font-mono text-zinc-400">ZOOM:</span>
                        <span className="text-[10px] font-mono text-white">{(zoomLevel * 100).toFixed(0)}%</span>
                    </div>
                </div>
            </div>

            {/* D3 Canvas */}
            <svg 
                ref={svgRef} 
                className="w-full h-full z-0 cursor-move"
                viewBox="0 0 800 600"
            />

            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none opacity-30">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.05),transparent_70%)]" />
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            </div>

            {/* Side Info Panel */}
            <AnimatePresence>
                {selectedNode && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="absolute top-6 right-6 bottom-6 w-80 bg-black/70 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 z-10 flex flex-col shadow-2xl"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 rounded-2xl border border-white/5 bg-zinc-900/50" style={{ borderColor: `${selectedNode.color}33` }}>
                                {selectedNode.type === 'planet' ? <Compass style={{ color: selectedNode.color }} size={20} /> : <Zap style={{ color: selectedNode.color }} size={20} />}
                            </div>
                            <button 
                                onClick={() => setSelectedNode(null)}
                                className="text-zinc-500 hover:text-white transition-colors"
                            >
                                <Activity size={18} className="rotate-45" />
                            </button>
                        </div>

                        <div className="space-y-4 flex-1">
                            <div>
                                <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mb-1">Archetypal Focal Point</div>
                                <h3 className="text-2xl font-bold text-white tracking-tight">{selectedNode.label}</h3>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="px-2 py-1 rounded bg-zinc-800 text-[9px] font-mono text-zinc-400 uppercase tracking-widest border border-white/5">
                                    {selectedNode.type}
                                </span>
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedNode.color }} />
                            </div>

                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-sm text-zinc-300 leading-relaxed italic font-serif">
                                    "{selectedNode.description}"
                                </p>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Activity size={12} className="text-indigo-400" /> Synaptic Resonances
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-3 bg-zinc-900/50 rounded-xl border border-white/5 space-y-1">
                                        <div className="text-[9px] text-zinc-500 uppercase">Frequency</div>
                                        <div className="text-xs font-mono text-white">432.2Hz</div>
                                    </div>
                                    <div className="p-3 bg-zinc-900/50 rounded-xl border border-white/5 space-y-1">
                                        <div className="text-[9px] text-zinc-500 uppercase">Neural Load</div>
                                        <div className="text-xs font-mono text-emerald-400">84%</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5">
                            <button className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 transition-colors rounded-2xl text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-indigo-500/20">
                                Deep Dive Research
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Legend / Stats Footer */}
            <div className="absolute bottom-6 left-6 right-6 z-10 flex justify-between items-end pointer-events-none">
                <div className="p-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl pointer-events-auto flex gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">D3 Simulation Engine Active</span>
                    </div>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Nodes: {synapticData.nodes.length}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Synapses: {synapticData.links.length}</span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2 text-right">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[9px] font-mono text-indigo-400">
                      SYSTEM SCANNING ASTRAL DEPTHS...
                    </div>
                    <div className="text-xs font-mono text-zinc-600 uppercase tracking-[0.3em]">Neural Topology Map</div>
                </div>
            </div>

            {/* Map Interaction Legend */}
            <div className="absolute top-6 right-6 flex gap-2 pointer-events-auto">
                <div className="group relative">
                    <button className="p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl text-zinc-400 hover:text-white transition-all">
                        <Info size={16} />
                    </button>
                    <div className="absolute top-full mt-2 right-0 w-64 p-4 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl text-xs text-zinc-300 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                        <strong>Interactive Controls:</strong>
                        <ul className="mt-2 space-y-1 list-disc list-inside text-zinc-400">
                            <li>Drag background to pan</li>
                            <li>Scroll to zoom in/out</li>
                            <li>Click node to lock selection</li>
                            <li>Hover node for rapid focus</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
