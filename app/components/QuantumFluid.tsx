import React, { useState } from 'react';
import { Maximize2, Minimize2, Info } from 'lucide-react';

export const QuantumFluid: React.FC = () => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    return (
        <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'w-full h-full min-h-[800px] border border-white/10 rounded-2xl overflow-hidden'} bg-black font-sans`}>
            {/* Header / Controls */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-2">
                    <h2 className="text-xl font-bold tracking-widest text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        QUANTUM FLUID SIMULATION
                    </h2>
                    <div className="group relative">
                        <div className="w-5 h-5 rounded-full border border-cyan-500/50 flex items-center justify-center text-cyan-500 cursor-help hover:bg-cyan-500/20 transition-colors">
                            <Info size={12} />
                        </div>
                        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-64 p-3 bg-black/90 backdrop-blur-md border border-cyan-500/30 rounded-lg text-xs leading-relaxed text-cyan-100 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <strong>WebGPU Fluid Dynamic Engine</strong>
                            <br/>
                            A high-performance quantum fluid representation powered by WebGPU. Use this as a meditative focus tool or for visualizing energetic etheric fields. Click and drag to interact with the fluid flow.
                            <br/>
                            <span className="text-[10px] text-cyan-500/70 mt-2 block">Powered by jeantimex/webgpu-water</span>
                        </div>
                    </div>
                </div>
                
                <button 
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="pointer-events-auto p-2 bg-black/50 hover:bg-cyan-900/50 backdrop-blur border border-cyan-500/30 rounded-lg text-cyan-400 transition-all cursor-pointer"
                >
                    {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
            </div>

            {/* IFrame embedding the actual tool output */}
            <iframe 
                src="https://jeantimex.github.io/webgpu-water/" 
                title="WebGPU Water Simulation"
                className="w-full h-full border-none pointer-events-auto"
                style={{ 
                    filter: "hue-rotate(180deg) saturate(1.5) contrast(1.2)" // Tweak colors to fit the cyans/purples of the astral app
                }}
                sandbox="allow-scripts allow-same-origin"
            />
            
            {/* Overlay to give a bit of a "HUD" feel over the simulation without blocking interaction entirely */}
            <div className="absolute inset-0 pointer-events-none border-[1px] border-cyan-500/10 rounded-2xl overflow-hidden" style={{ boxShadow: "inset 0 0 50px rgba(0,0,0,0.8)" }}></div>
            
            {!isFullscreen && (
                <div className="absolute bottom-4 left-4 p-3 bg-black/50 backdrop-blur border border-cyan-500/20 rounded-xl text-[10px] font-mono text-cyan-300 pointer-events-none">
                    <div className="flex justify-between w-32 border-b border-cyan-500/20 pb-1 mb-1">
                        <span>SYS.STATE:</span>
                        <span className="text-emerald-400">ONLINE</span>
                    </div>
                    <div className="flex justify-between w-32 border-b border-cyan-500/20 pb-1 mb-1">
                        <span>RENDER:</span>
                        <span className="text-cyan-400">WEBGPU</span>
                    </div>
                    <div className="flex justify-between w-32">
                        <span>MODE:</span>
                        <span className="text-amber-400">ETHERIC</span>
                    </div>
                </div>
            )}
        </div>
    );
};
