import React, { useState, useRef, useEffect } from 'react';
import { useLongPress } from '../hooks/useLongPress';
import { useHigherMind } from './HigherMindProvider';
import { motion, AnimatePresence } from 'motion/react';
import { Box, X, Workflow } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ProjectableWidgetProps {
    id: string;
    type: string;
    componentName: string;
    children: React.ReactNode;
    data: any;
}

export const ProjectableWidget: React.FC<ProjectableWidgetProps> = ({ id, type, componentName, children, data }) => {
    const { addProjectedItem, setIsProjected } = useHigherMind();
    const [menuPos, setMenuPos] = useState<{ x: number, y: number } | null>(null);

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
    });

    const handlePlaceOnCanvas = () => {
        addProjectedItem({ id, type, componentName, children });
        setIsProjected(true); // Assuming 'true' enables the spatial projection view
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
                className="cursor-pointer relative"
                onContextMenu={(e) => {
                    // Optionally also trigger on right click
                    e.preventDefault();
                    setMenuPos({ x: e.clientX, y: e.clientY });
                }}
            >
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
                            className="fixed bg-zinc-900/95 border border-white/10 rounded-xl shadow-2xl p-2 min-w-[200px] backdrop-blur-xl"
                            style={{ 
                                left: Math.min(menuPos.x, typeof window !== 'undefined' ? window.innerWidth - 220 : menuPos.x), 
                                top: Math.min(menuPos.y, typeof window !== 'undefined' ? window.innerHeight - 100 : menuPos.y)
                            }}
                            onPointerDown={e => e.stopPropagation()}
                        >
                            <div className="text-[10px] text-zinc-500 uppercase tracking-widest px-3 pt-2 pb-3 flex items-center justify-between border-b border-white/5 mb-2">
                                <span>Widget Options</span>
                                <button onClick={() => setMenuPos(null)} className="hover:text-white transition-colors">
                                    <X size={12} />
                                </button>
                            </div>
                            
                            <button
                                onClick={handlePlaceOnCanvas}
                                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 rounded-lg text-sm text-stone-300 hover:text-white transition-all text-left group"
                            >
                                <Workflow size={16} className="text-purple-400 group-hover:text-purple-300" />
                                Place on Spatial Canvas
                            </button>
                        </motion.div>
                    </AnimatePresence>
                </div>,
                document.body
            )}
        </>
    );
};
