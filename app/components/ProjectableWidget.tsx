import React, { useState, useRef, useEffect } from 'react';
import { useLongPress } from '../hooks/useLongPress';
import { useHigherMind } from './HigherMindProvider';
import { motion, AnimatePresence } from 'motion/react';
import { Box, X, Workflow, Lock, Settings2, PlayCircle, Loader2, Pin } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ProjectableWidgetProps {
    id: string;
    type: string;
    componentName: string;
    children: React.ReactNode;
    data: any;
}

const ANIMATION_PRESETS = [
    "None",
    "360 Spin", "Orbit Around Core", "Orbit Self", "Zig Zag", "Pulse & Glow", "Zoom In Out", "Hover Float", 
    "Quantum Jitter", "Hyper-drive Drift", "Sine Wave", "Cosine Wave", "Torus Spin", "Flower of Life Bloom",
    "Metatron's Spin", "Merkaba Rotate", "Fibonacci Spiral In", "Fibonacci Spiral Out", "Celestial Sweep",
    "Tachyon Burst", "Gravity Well Drop", "Anti-gravity Lift", "Pendulum Swing", "Magnetic Tremor", 
    "Dimensional Fold", "Nebula Swirl", "Black Hole Suck", "White Hole Expand", "Astral Projection",
    "Etheric Phase", "Chakra Align Spin", "DNA Double Helix Twist", "Kundalini Rise", "Pineal Pulse",
    "Sacred Geometry Morph", "Golden Ratio Dance", "Vesica Piscis Orbit", "Kabbalistic Tree Climb",
    "Sephirot Flash", "Tarot Shuffle Draw", "Zodiac Wheel Spin", "Astrological Transit Move",
    "Planetary Retrograde Slide", "Solar Eclipse Cast", "Lunar Eclipse Shadow", "Starseed Awakening",
    "Cosmic Web Shiver", "Galactic Core Rotation", "Harmonic Resonance Pulse", "Fractal Expansion",
    "Fibonacci Spiral Rotation", "Morphogenic Grid Shift"
];

export const ProjectableWidget: React.FC<ProjectableWidgetProps> = ({ id, type, componentName, children, data }) => {
    const { addProjectedItem, setIsProjected, addProfileWidget, userData, removeProfileWidget } = useHigherMind();
    const [menuPos, setMenuPos] = useState<{ x: number, y: number } | null>(null);
    const [showAnimations, setShowAnimations] = useState(false);
    const [locked, setLocked] = useState(false);
    const [selectedAnimation, setSelectedAnimation] = useState("None");
    const [orbitTarget, setOrbitTarget] = useState("");

    const isPinned = userData?.profileWidgets?.some(w => w.id === id);

    const longPress = useLongPress((e: React.MouseEvent | React.TouchEvent) => {
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }
        setMenuPos({ x: clientX, y: clientY });
        setShowAnimations(false);
    });

    const handlePlaceOnCanvas = () => {
        addProjectedItem({ 
            id, 
            type, 
            componentName, 
            children,
            config: {
                locked,
                animation: selectedAnimation,
                orbitTarget: selectedAnimation.includes('Orbit') ? orbitTarget : undefined
            }
        });
        setIsProjected(true);
        setMenuPos(null);
    };

    const handlePinToProfile = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isPinned) {
            removeProfileWidget(id);
        } else {
            addProfileWidget({ id, type, componentName, data });
        }
        setMenuPos(null);
    };

    // Close menu if clicked outside
    useEffect(() => {
        if (!menuPos) return;
        const handleDocClick = () => setMenuPos(null);
        window.addEventListener('pointerdown', handleDocClick);
        return () => window.removeEventListener('pointerdown', handleDocClick);
    }, [menuPos]);

    return (
        <>
            <motion.div
                {...longPress}
                whileHover={{ scale: 1.02 }}
                className="cursor-pointer relative group/projectable"
                onContextMenu={(e) => {
                    e.preventDefault();
                    setMenuPos({ x: e.clientX, y: e.clientY });
                    setShowAnimations(false);
                }}
            >
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        const rect = e.currentTarget.getBoundingClientRect();
                        setMenuPos({ x: rect.left, y: rect.bottom });
                        setShowAnimations(false);
                    }}
                    className="absolute top-2 right-2 z-[60] bg-zinc-900/90 hover:bg-purple-600/90 border border-purple-500/35 text-purple-300 hover:text-white p-1.5 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.3)] md:opacity-0 group-hover/projectable:opacity-100 opacity-100 transition-all duration-300 backdrop-blur-md flex items-center justify-center gap-1 cursor-pointer hover:scale-105 active:scale-95"
                    title="Widget Configuration Menu"
                >
                    <Settings2 size={12} className="animate-pulse" />
                    <span className="text-[8px] font-mono tracking-wider font-semibold uppercase">Tune</span>
                </button>
                {children}
            </motion.div>

            {menuPos && typeof document !== 'undefined' && createPortal(
                <div 
                    className="fixed inset-0 z-50 pointer-events-auto"
                    onPointerDown={(e) => {
                        if (e.target === e.currentTarget) {
                            setMenuPos(null);
                        }
                    }}
                >
                    <AnimatePresence>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="fixed bg-zinc-900/95 border border-white/10 rounded-xl shadow-2xl p-2 w-[240px] max-h-[80vh] overflow-y-auto backdrop-blur-xl no-scrollbar"
                            style={{ 
                                left: Math.min(menuPos.x, typeof window !== 'undefined' ? window.innerWidth - 260 : menuPos.x), 
                                top: Math.min(menuPos.y, typeof window !== 'undefined' ? window.innerHeight - 300 : menuPos.y)
                            }}
                            onPointerDown={e => e.stopPropagation()}
                        >
                            <div className="text-[10px] text-zinc-500 uppercase tracking-widest px-3 pt-2 pb-3 flex items-center justify-between border-b border-white/5 mb-2">
                                <span>Widget Options</span>
                                <button onClick={() => setMenuPos(null)} className="hover:text-white transition-colors">
                                    <X size={12} />
                                </button>
                            </div>
                            
                            {!showAnimations ? (
                                <>
                                    <button
                                        onClick={handlePlaceOnCanvas}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 rounded-lg text-sm text-stone-300 hover:text-white transition-all text-left group"
                                    >
                                        <Workflow size={14} className="text-purple-400 group-hover:text-purple-300" />
                                        Place on Spatial Canvas
                                    </button>
                                    
                                    <button
                                        onClick={handlePinToProfile}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 rounded-lg text-sm transition-all text-left group border-b border-white/5"
                                    >
                                        <Pin size={14} className={isPinned ? "text-amber-400" : "text-stone-500 group-hover:text-amber-300"} />
                                        <span className={isPinned ? "text-amber-400" : "text-stone-300"}>{isPinned ? "Unpin from Profile" : "Pin to User Profile"}</span>
                                    </button>
                                    
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setLocked(!locked); }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 rounded-lg text-sm transition-all text-left group"
                                    >
                                        <Lock size={14} className={locked ? "text-rose-400" : "text-stone-500"} />
                                        <span className={locked ? "text-rose-400" : "text-stone-300"}> {locked ? "Locked Position" : "Lock Position"} </span>
                                    </button>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowAnimations(true); }}
                                        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/10 rounded-lg text-sm text-stone-300 hover:text-white transition-all text-left group mt-2 border-t border-white/5"
                                    >
                                        <div className="flex items-center gap-3">
                                            <PlayCircle size={14} className="text-amber-400 group-hover:text-amber-300" />
                                            <span>Animation Preset</span>
                                        </div>
                                        <span className="text-[10px] text-stone-500 max-w-[60px] truncate">{selectedAnimation}</span>
                                    </button>
                                </>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                                        <button onClick={(e) => { e.stopPropagation(); setShowAnimations(false); }} className="hover:text-white text-stone-400 p-1">
                                            ← Back
                                        </button>
                                        <span className="text-xs text-stone-300 font-mono">Select Animation</span>
                                    </div>
                                    
                                    {selectedAnimation.includes('Orbit') && (
                                        <div className="px-2 pb-2">
                                            <input 
                                                type="text" 
                                                value={orbitTarget}
                                                onChange={(e) => setOrbitTarget(e.target.value)}
                                                placeholder="Orbit target (e.g. Center, Widget 1)"
                                                className="w-full bg-black/40 border border-white/10 text-xs text-white p-1.5 rounded"
                                            />
                                        </div>
                                    )}

                                    {ANIMATION_PRESETS.map(preset => (
                                        <button
                                            key={preset}
                                            onClick={(e) => { e.stopPropagation(); setSelectedAnimation(preset); }}
                                            className={`w-full text-left px-3 py-1.5 rounded text-xs ${selectedAnimation === preset ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-stone-400 hover:bg-white/5 hover:text-white'}`}
                                        >
                                            {preset}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>,
                document.body
            )}
        </>
    );
};
