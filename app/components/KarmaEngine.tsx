import React, { useState, useEffect, useRef } from 'react';
import { HUDPanel } from './HUDPanel';
import { motion } from 'motion/react';
import { Network, Zap } from 'lucide-react';
import * as d3 from 'd3';

export const KarmaEngine = () => {
    const [actionInput, setActionInput] = useState("");
    const [isSimulating, setIsSimulating] = useState(false);
    const [graphData, setGraphData] = useState<any>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const [karmaScore, setKarmaScore] = useState(34); // Starting score
    
    const simulateAction = async () => {
        if (!actionInput.trim()) return;
        setIsSimulating(true);

        try {
            const prompt = `Analyze this action for karmic ripple effects: "${actionInput}".
            Generate a cause-effect graph mapping this decision across 3 timelines (Now, Ancestral, Future Soul).
            Return JSON in this format EXACTLY:
            {
                "nodes": [
                    {"id": "Action", "label": "Action", "group": 1},
                    // Generate 5-8 more nodes like Consequences, Ripples, Ancestral Healing, etc. group 1, 2 or 3.
                ],
                "links": [
                    {"source": "Action", "target": "another node id"} // Generate valid connections
                ],
                "scoreModifier": number (from -5 to 5 representing karma impact),
                "insight": "Short mystical explanation"
            }`;

            const response = await fetch('/api/gemini-raw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    model: 'gemini-2.5-flash',
                    systemInstruction: 'You are the HIGHER MIND Karma Engine. You calculate multidimensional cause-and-effect.'
                })
            });

            if (!response.ok) throw new Error("API failed");
            
            const data = await response.json();
            const result = data.data; // assume parsed json
            
            if (result && result.nodes && result.links) {
                setGraphData(result);
                setKarmaScore(prev => prev + (result.scoreModifier || 0));
            }
        } catch(e) {
            console.error(e);
        } finally {
            setIsSimulating(false);
        }
    };

    // D3 Graph rendering
    useEffect(() => {
        if (!graphData || !svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove(); // Clear previous

        const width = 500;
        const height = 300;

        const colorScale = d3.scaleOrdinal()
            .domain([1, 2, 3]) // Group 1, 2, 3
            .range(["#f59e0b", "#00d4ff", "#8b5cf6"]);

        const simulation = d3.forceSimulation(graphData.nodes)
            .force("link", d3.forceLink(graphData.links).id((d: any) => d.id).distance(80))
            .force("charge", d3.forceManyBody().strength(-200))
            .force("center", d3.forceCenter(width / 2, height / 2));

        const link = svg.append("g")
            .attr("stroke", "rgba(0, 212, 255, 0.2)")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(graphData.links)
            .join("line")
            .attr("stroke-dasharray", "3,3")
            .attr("stroke-width", 1.5);

        const node = svg.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 0.5)
            .selectAll("circle")
            .data(graphData.nodes)
            .join("circle")
            .attr("r", (d: any) => d.id === "Action" ? 12 : 8)
            .attr("fill", (d: any) => colorScale(d.group) as string)
            .call(drag(simulation));

        const labels = svg.append("g")
            .selectAll("text")
            .data(graphData.nodes)
            .join("text")
            .text((d: any) => d.label)
            .attr("font-size", 8)
            .attr("fill", "#fff")
            .attr("text-anchor", "middle")
            .attr("dy", 18)
            .attr("font-family", "Orbitron");

        simulation.on("tick", () => {
            link
                .attr("x1", (d: any) => d.source.x)
                .attr("y1", (d: any) => d.source.y)
                .attr("x2", (d: any) => d.target.x)
                .attr("y2", (d: any) => d.target.y);

            node
                .attr("cx", (d: any) => d.x = Math.max(10, Math.min(width - 10, d.x)))
                .attr("cy", (d: any) => d.y = Math.max(10, Math.min(height - 10, d.y)));

            labels
                .attr("x", (d: any) => d.x)
                .attr("y", (d: any) => d.y);
        });

        // Add glow filters
        const defs = svg.append("defs");
        const filter = defs.append("filter").attr("id", "glow");
        filter.append("feGaussianBlur").attr("stdDeviation", "2.5").attr("result", "coloredBlur");
        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "coloredBlur");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");

        node.attr("filter", "url(#glow)");

    }, [graphData]);

    // Drag behavior for D3 nodes
    const drag = (simulation: any) => {
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
            .on("end", dragended) as any;
    }

    return (
        <HUDPanel title="KARMA ENGINE" idLabel="SYS.KARMA.01" solfeggioFreq={396} className="h-full">
             <div className="flex flex-col gap-4 h-[500px]">
                 {/* Input form */}
                <div className="flex gap-2">
                    <input 
                        type="text"
                        className="flex-1 bg-black/50 border border-hud-gold/30 rounded p-2 text-sm font-share text-white focus:outline-none focus:border-hud-gold/70 shadow-inner"
                        placeholder="Enter an action or decision to simulate..."
                        value={actionInput}
                        onChange={e => setActionInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && simulateAction()}
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={simulateAction}
                        disabled={isSimulating || !actionInput}
                        className="bg-hud-gold/20 text-hud-gold border border-hud-gold/50 px-4 py-2 rounded flex items-center justify-center disabled:opacity-50"
                    >
                        {isSimulating ? <Network className="animate-spin" size={16} /> : <Zap size={16} />}
                    </motion.button>
                </div>

                {/* Score */}
                <div className="flex justify-between items-center bg-black/30 border border-white/5 p-2 rounded">
                   <span className="font-share text-[10px] uppercase tracking-widest text-white/50">Cumulative Karma</span>
                   <span className="font-orbitron font-bold text-hud-gold text-lg drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                       {karmaScore > 0 ? '+' : ''}{karmaScore}
                   </span>
                </div>

                {/* Force Graph area */}
                <div className="flex-1 border border-white/10 rounded-lg overflow-hidden bg-black/60 relative">
                    {!graphData && !isSimulating && (
                        <div className="absolute inset-0 flex items-center justify-center text-white/30 font-share text-xs tracking-widest uppercase">
                            Awaiting Interaction Vector
                        </div>
                    )}
                    
                    <svg ref={svgRef} className="w-full h-full" viewBox="0 0 500 300" preserveAspectRatio="xMidYMid meet"></svg>
                </div>

                {/* Insight */}
                 {graphData?.insight && (
                    <div className="bg-hud-gold/10 border border-hud-gold/30 rounded p-3 font-serif text-sm text-hud-gold italic shadow-inner">
                        "{graphData.insight}"
                    </div>
                )}
             </div>
        </HUDPanel>
    );
};
