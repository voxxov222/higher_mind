import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { PersistentAstrological3DLayer } from './PersistentAstrological3DLayer';
import VoiceCommander from './VoiceCommander';
import { DailyTarotPopup } from './DailyTarotPopup';
import { soundEngine } from '../lib/soundEffects';

export const GlobalHUD = ({ children, setActiveTab }: { children: React.ReactNode, setActiveTab: (tab: any) => void }) => {
    const [isTarotPopupOpen, setIsTarotPopupOpen] = useState(false);

    return (
        <div className="relative w-full h-full overflow-hidden">
            {/* Base Content */}
            <div className="relative z-0 w-full h-full">
                {children}
            </div>

            {/* Persistent Astrological 3D layer */}
            <PersistentAstrological3DLayer />

            {/* Daily Tarot Draw Calibration Trigger */}
            <div className="fixed bottom-40 left-6 z-[1000] pointer-events-auto">
                <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(6,182,212,0.4)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        soundEngine.click();
                        setIsTarotPopupOpen(true);
                    }}
                    className="flex h-10 items-center gap-2.5 bg-stone-950/90 hover:bg-black border border-hud-cyan/40 hover:border-hud-cyan px-4 py-2 rounded-xl text-hud-cyan font-orbitron text-[10px] tracking-widest uppercase transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.15)] group"
                >
                    <Sparkles size={13} className="animate-pulse group-hover:scale-110 transition-transform" />
                    <span>Daily Tarot</span>
                </motion.button>
            </div>

            {/* Universal Voice Interface */}
            <div className="fixed bottom-24 left-6 z-[1000] pointer-events-auto">
                 <VoiceCommander setActiveTab={setActiveTab} />
            </div>

            {/* Daily Tarot Reading Popup Overlay */}
            <DailyTarotPopup isOpen={isTarotPopupOpen} onClose={() => setIsTarotPopupOpen(false)} />
        </div>
    );
};
