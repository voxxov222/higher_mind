import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Square, Network, Database, Plus, Search, GitMerge, Cpu, Trash2, ArrowRight, Brain, Zap, Settings2, Shield, Activity, X, List, ScrollText } from 'lucide-react';
import { CosmicData } from '../types';
import { swarmEngine, Agent, AgentRole } from '../utils/swarmEngine';

interface AIAgentsSectionProps {
  cosmicData: CosmicData;
}

export const AIAgentsSection: React.FC<AIAgentsSectionProps> = ({ cosmicData }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isSwarmRunning, setIsSwarmRunning] = useState(false);
  const [globalLog, setGlobalLog] = useState<{time: string, msg: string}[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'network' | 'outputs'>('network');
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync with global swarm engine
  useEffect(() => {
    swarmEngine.setCosmicData(cosmicData);
    
    // Initial sync
    setAgents([...swarmEngine.agents]);
    setIsSwarmRunning(swarmEngine.isRunning);
    setGlobalLog([...swarmEngine.logs]);
    
    const unsubscribe = swarmEngine.subscribe(() => {
      setAgents([...swarmEngine.agents]);
      setIsSwarmRunning(swarmEngine.isRunning);
      setGlobalLog([...swarmEngine.logs]);
    });
    return unsubscribe;
  }, [cosmicData]);

  const addAgent = () => {
    const newId = swarmEngine.addAgent();
    if (newId) setSelectedAgentId(newId);
  };

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  // Dragging logic for visualizer
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const handleDragStart = (id: string) => setDraggingId(id);
  const handleDrag = (e: React.MouseEvent) => {
    if (draggingId && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - 20;
      const y = e.clientY - rect.top - 20;
      swarmEngine.updateAgent(draggingId, { x, y });
    }
  };
  const handleDragEnd = () => setDraggingId(null);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col xl:flex-row gap-6 p-4">
      {/* Workflow Visualizer & Outputs Pane */}
      <div 
        className="flex-1 bg-stone-950 border border-white/10 rounded-2xl relative overflow-hidden flex flex-col shadow-2xl"
        onMouseMove={handleDrag}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        <div className="p-4 border-b border-white/5 flex flex-wrap gap-4 justify-between items-center bg-stone-900/50 backdrop-blur z-10">
          <div>
            <h2 className="text-white font-mono uppercase tracking-widest flex items-center gap-2">
              <Network className="w-5 h-5 text-teal-400" />
              Swarm Intelligence Network
            </h2>
            <p className="text-stone-500 text-xs mt-1">Interactive background agent node map. Persistent Memory active.</p>
          </div>
          <div className="flex gap-4">
             <div className="flex bg-stone-900 border border-white/5 rounded-lg p-1">
               <button onClick={() => setViewMode('network')} className={`px-4 py-1.5 rounded-md text-xs font-mono transition-colors flex items-center gap-2 ${viewMode === 'network' ? 'bg-teal-500/10 text-teal-400' : 'text-stone-500 hover:text-stone-300'}`}><Network className="w-3 h-3" /> Map View</button>
               <button onClick={() => setViewMode('outputs')} className={`px-4 py-1.5 rounded-md text-xs font-mono transition-colors flex items-center gap-2 ${viewMode === 'outputs' ? 'bg-purple-500/10 text-purple-400' : 'text-stone-500 hover:text-stone-300'}`}><ScrollText className="w-3 h-3" /> Agent Outputs</button>
             </div>
             <button onClick={addAgent} className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg border border-white/10 flex items-center gap-2 text-xs transition-colors">
               <Plus className="w-4 h-4" /> Add Agent
             </button>
             <button 
               onClick={() => swarmEngine.toggleSwarm()} 
               className={`px-4 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold transition-all shadow-lg ${
                 isSwarmRunning ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 hover:bg-rose-500/30' : 'bg-teal-500 text-stone-950 hover:bg-teal-400'
               }`}
             >
               {isSwarmRunning ? <><Square className="w-4 h-4" /> Halt Swarm</> : <><Play className="w-4 h-4" /> Run Autonomous Swarm</>}
             </button>
          </div>
        </div>

        {viewMode === 'network' ? (
          /* Node Map Area */
          <div className="flex-1 relative overflow-hidden" ref={containerRef}>
            {/* Grid Background */}
            <div className="absolute inset-0 border-[0.5px] border-white/5 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            
            {/* Connection Lines & Memory Lines (SVG) */}
            <svg className="absolute inset-0 pointer-events-none w-full h-full">
              {agents.map(agent => (
                <g key={`lines-${agent.id}`}>
                  {/* Workflow Connections */}
                  {agent.targetAgents.map(targetId => {
                    const target = agents.find(a => a.id === targetId);
                    if (!target) return null;
                    const path = `M ${agent.x + 20} ${agent.y + 20} Q ${(agent.x + target.x) / 2} ${(agent.y + target.y) / 2 + 50} ${target.x + 20} ${target.y + 20}`;
                    return (
                      <g key={`conn-${agent.id}-${targetId}`}>
                        <path
                          d={path}
                          fill="none"
                          stroke={isSwarmRunning ? "rgba(45, 212, 191, 0.4)" : "rgba(255,255,255,0.1)"}
                          strokeWidth="2"
                        />
                        {isSwarmRunning && (
                          <path
                            d={path}
                            fill="none"
                            stroke="rgba(45, 212, 191, 0.8)"
                            strokeWidth="2"
                            strokeDasharray="4 8"
                            className="animate-[dash_1s_linear_infinite]"
                          />
                        )}
                      </g>
                    );
                  })}
                  {/* Memory Connections */}
                  {agent.memory.slice(0, 30).map((_, i) => {
                    const angle = (i * 137.5) * (Math.PI / 180); // Fibonacci spiral angle
                    // Spread them out smoothly
                    const radius = 35 + (i * 2); 
                    const mx = agent.x + 20 + Math.cos(angle) * radius;
                    const my = agent.y + 20 + Math.sin(angle) * radius;
                    return (
                      <line 
                        key={`mem-line-${agent.id}-${i}`}
                        x1={agent.x + 20} y1={agent.y + 20} x2={mx} y2={my}
                        stroke="rgba(45, 212, 191, 0.2)" strokeWidth="1"
                      />
                    );
                  })}
                </g>
              ))}
            </svg>

            {/* Agent Nodes & Memory Nodes */}
            {agents.map((agent) => (
              <React.Fragment key={`agent-group-${agent.id}`}>
                {/* Memory Data Nodes */}
                {agent.memory.slice(0, 30).map((_, i) => {
                  const angle = (i * 137.5) * (Math.PI / 180);
                  const radius = 35 + (i * 2);
                  const mx = agent.x + 20 + Math.cos(angle) * radius;
                  const my = agent.y + 20 + Math.sin(angle) * radius;
                  return (
                    <div 
                      key={`mem-node-${agent.id}-${i}`}
                      className="absolute w-1.5 h-1.5 rounded-full bg-teal-400/60 border-[0.5px] border-teal-300 shadow-[0_0_8px_rgba(45,212,191,0.8)] pointer-events-none transition-all duration-300 ease-out"
                      style={{ 
                        left: mx - 3, 
                        top: my - 3, 
                        animation: `memoryPulse 2s infinite ${i * 0.1}s` 
                      }}
                    />
                  );
                })}
                
                {/* Main Agent Avatar */}
                <div
                  onMouseDown={() => handleDragStart(agent.id)}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`absolute w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-shadow ${
                    selectedAgentId === agent.id ? 'ring-2 ring-teal-400 shadow-[0_0_20px_rgba(45,212,191,0.5)] z-20' : 'hover:ring-2 hover:ring-white/20 z-10'
                  } ${agent.status === 'running' ? 'bg-teal-500/20 border-teal-400' : 'bg-stone-800 border-white/20'} border-2 backdrop-blur-md`}
                  style={{ left: agent.x + 20, top: agent.y + 20 }}
                >
                  <Cpu className={`w-5 h-5 ${agent.status === 'running' ? 'text-teal-400 animate-pulse' : 'text-stone-400'}`} />
                  
                  {/* Agent Label */}
                  <div className="absolute top-12 whitespace-nowrap bg-stone-900/80 px-2 py-1 rounded text-[10px] text-stone-300 font-mono border border-white/10 pointer-events-none">
                    {agent.name} <span className="text-teal-400">[Lvl {agent.level}]</span>
                  </div>
                </div>
              </React.Fragment>
            ))}
            
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes dash {
                to {
                  stroke-dashoffset: -12;
                }
              }
              @keyframes memoryPulse {
                0%, 100% { opacity: 0.8; transform: scale(1); }
                50% { opacity: 0.3; transform: scale(0.8); }
              }
            `}} />
          </div>
        ) : (
          /* Consolidated Outputs View */
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {agents.map(agent => (
                 <div key={`output-${agent.id}`} className="bg-stone-900/60 border border-white/5 rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                      <Cpu className={`w-4 h-4 ${agent.status === 'running' ? 'text-teal-400 animate-pulse' : 'text-stone-500'}`} />
                      <h3 className="text-sm font-mono text-stone-200">{agent.name}</h3>
                      <span className="ml-auto text-[10px] text-stone-500 uppercase">{agent.role}</span>
                    </div>
                    <div className="flex-1 space-y-2">
                       {agent.findings.length === 0 ? (
                          <div className="text-xs text-stone-600 font-mono italic p-2 bg-black/20 rounded">Waiting for data...</div>
                       ) : (
                          agent.findings.slice(0, 5).map((f, i) => (
                             <div key={i} className="text-[10px] sm:text-xs text-teal-100/70 font-mono leading-relaxed bg-black/40 p-2 rounded border border-white/5">
                               &gt; {f}
                             </div>
                          ))
                       )}
                    </div>
                 </div>
               ))}
             </div>
             
             {/* Global Log Stream */}
             <div className="mt-8 pt-6 border-t border-white/10">
                <h3 className="text-sm font-mono text-stone-400 flex items-center gap-2 mb-4">
                   <Activity className="w-4 h-4"/> Global Swarm Log Stream
                </h3>
                <div className="bg-black/60 rounded-xl p-4 h-64 overflow-y-auto border border-stone-800 space-y-1">
                   {globalLog.map((log, i) => (
                     <div key={i} className="text-[10px] sm:text-xs font-mono">
                        <span className="text-stone-600">[{log.time}]</span> <span className="text-stone-300">{log.msg}</span>
                     </div>
                   ))}
                   {globalLog.length === 0 && <span className="text-stone-600 italic text-xs">No logs recorded. Initialize swarm.</span>}
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Selected Agent Properties Panel */}
      <AnimatePresence>
        {selectedAgent && viewMode === 'network' && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: 20 }}
            className="w-full xl:w-96 bg-stone-900/60 border border-white/10 rounded-2xl flex flex-col shadow-xl overflow-hidden"
          >
            <div className="p-4 border-b border-white/5 bg-black/40 flex justify-between items-start">
              <div>
                <input 
                  type="text" 
                  value={selectedAgent.name} 
                  onChange={(e) => swarmEngine.updateAgent(selectedAgent.id, { name: e.target.value })}
                  className="bg-transparent border-none text-teal-300 font-mono font-bold text-lg p-0 focus:ring-0 w-full mb-1"
                />
                <span className="text-[10px] text-stone-500 font-mono uppercase bg-white/5 px-2 py-0.5 rounded border border-white/10">
                  Level {selectedAgent.level} Entity • {selectedAgent.status}
                </span>
              </div>
              <button onClick={() => setSelectedAgentId(null)} className="text-stone-500 hover:text-white mt-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              
              {/* Role & Core Setup */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono text-stone-400 flex items-center gap-2 uppercase"><Settings2 className="w-3 h-3"/> Agent Configuration</h3>
                
                <div className="grid grid-cols-2 gap-2">
                  <select 
                    value={selectedAgent.role}
                    onChange={(e) => swarmEngine.updateAgent(selectedAgent.id, { role: e.target.value as AgentRole })}
                    className="bg-stone-950 border border-white/10 text-stone-300 text-xs rounded-lg p-2 focus:ring-teal-500"
                  >
                    <option value="research">Research</option>
                    <option value="tasks">Tasks</option>
                    <option value="connections">Find Connections</option>
                    <option value="mapping">3D Mind Mapping</option>
                    <option value="autonomous">Autonomous Core</option>
                  </select>
                  
                  <button onClick={() => swarmEngine.upgradeAgent(selectedAgent.id)} className="bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 text-xs rounded-lg p-2 flex items-center justify-center gap-2 transition-colors">
                    <Zap className="w-3 h-3" /> Upgrade Agent
                  </button>
                </div>
              </div>

              {/* Memory & Instructions */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono text-stone-400 flex items-center gap-2 uppercase"><Database className="w-3 h-3"/> Instructions & Database</h3>
                <textarea
                  value={selectedAgent.instructions}
                  onChange={(e) => swarmEngine.updateAgent(selectedAgent.id, { instructions: e.target.value })}
                  placeholder="Blank text box user fills in with it's tasks instructions..."
                  className="w-full h-32 bg-stone-950/80 border border-white/10 rounded-xl p-3 text-sm text-stone-200 placeholder-stone-600 focus:ring-teal-500 focus:border-teal-500 font-mono resize-none leading-relaxed"
                />
              </div>

              {/* Skills/Functions */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono text-stone-400 flex items-center gap-2 uppercase"><Brain className="w-3 h-3"/> Agent Skills & Functions</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedAgent.skills.map((skill, i) => (
                    <span key={i} className="px-2 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-300 text-[10px] rounded-full font-mono">
                      {skill}
                    </span>
                  ))}
                  <button 
                    onClick={() => {
                       const ns = prompt("Enter new skill or function:");
                       if (ns) swarmEngine.updateAgent(selectedAgent.id, { skills: [...selectedAgent.skills, ns] });
                    }}
                    className="px-2 py-1 bg-stone-800 border border-white/10 text-stone-400 hover:text-white text-[10px] rounded-full font-mono flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3"/> Add Skill
                  </button>
                </div>
              </div>

              {/* Outputs / Connections */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono text-stone-400 flex items-center gap-2 uppercase"><GitMerge className="w-3 h-3"/> Data Workflow (Outputs To)</h3>
                <div className="flex flex-col gap-2">
                  {agents.filter(a => a.id !== selectedAgent.id).map(a => {
                    const isConnected = selectedAgent.targetAgents.includes(a.id);
                    return (
                      <div key={a.id} className="flex items-center justify-between bg-stone-950/50 p-2 rounded-lg border border-white/5">
                        <span className="text-xs text-stone-300 font-mono">{a.name}</span>
                        <button 
                          onClick={() => swarmEngine.toggleConnection(selectedAgent.id, a.id)}
                          className={`w-10 h-5 rounded-full relative transition-colors ${isConnected ? 'bg-teal-500' : 'bg-stone-700'}`}
                        >
                          <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${isConnected ? 'left-6' : 'left-1'}`} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Memory Log */}
              {selectedAgent.memory.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <h3 className="text-xs font-mono text-stone-400 flex items-center gap-2 uppercase"><Activity className="w-3 h-3"/> Active Memory Log</h3>
                  <div className="bg-black/60 rounded-xl p-3 h-32 overflow-y-auto space-y-2 font-mono text-[9px] border border-stone-800">
                    {selectedAgent.memory.map((m, i) => (
                      <div key={`mem-${selectedAgent.id}-${i}`} className="text-teal-400/80 leading-tight border-b border-white/5 pb-2 last:border-0">
                        {m}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-white/5 bg-black/40">
               <button 
                 onClick={() => swarmEngine.deleteAgent(selectedAgent.id)}
                 className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-mono flex items-center justify-center gap-2 transition-colors"
               >
                 <Trash2 className="w-4 h-4"/> Delete Agent
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

