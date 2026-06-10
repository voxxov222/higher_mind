import React, { useState } from 'react';
import { HUDPanel } from './HUDPanel';
import { motion } from 'motion/react';
import { Moon, Send, Sparkles } from 'lucide-react';
import { useHigherMind } from './HigherMindProvider';

export const AstralDreamLog = () => {
    const { cosmicData } = useHigherMind();
    const [dreamText, setDreamText] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);

    const lunarPhase = cosmicData?.lunarPhase?.phaseName || "WAXING CRESCENT";

    const analyzeDream = async () => {
        if (!dreamText.trim()) return;
        setIsAnalyzing(true);
        setAnalysisResult(null);

        try {
            const prompt = `Analyze this dream log: "${dreamText}". 
Context: User Lunar Phase is ${lunarPhase}.
Extract the following in JSON format precisely:
{
  "symbols": ["array", "of", "core", "symbols"],
  "karmicTheme": "one sentence karmic lesson",
  "pastLifeEcho": "one sentence potential past life connection",
  "solfeggioHz": "suggested frequency number (e.g. 528)",
  "glyphParams": {
    "sides": number (e.g. 3 to 12),
    "rotation": number,
    "color": "hex code"
  }
}`;

            const response = await fetch('/api/gemini-raw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    model: 'gemini-2.5-flash',
                    systemInstruction: 'You are an advanced Astral Archivist AI interpreting dreams via Jungian, Kabbalistic, and Astrological frameworks.'
                })
            });

            if (!response.ok) throw new Error("API failed");
            
            const data = await response.json();
            setAnalysisResult(data.data); // data.data contains the JSON block or parsed result
        } catch(e) {
            console.error("Dream analysis failed", e);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Generating the SVG Glyph
    const renderGlyph = (params: any) => {
        if (!params) return null;
        const cx = 50;
        const cy = 50;
        const r = 40;
        const sides = params.sides || 6;
        let points = "";
        for(let i=0; i<sides; i++){
            const angle = (Math.PI * 2 * i) / sides + (params.rotation || 0);
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            points += `${x},${y} `;
        }

        return (
            <div className="w-24 h-24 relative flex items-center justify-center animate-pulse">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
                    <polygon points={points.trim()} fill="none" stroke={params.color || "#8b5cf6"} strokeWidth="2" />
                    <circle cx="50" cy="50" r="10" fill={params.color || "#8b5cf6"} opacity="0.3" />
                    {sides > 4 && <polygon points={points.trim()} fill="none" stroke={params.color || "#8b5cf6"} strokeWidth="0.5" transform={`rotate(180 50 50) scale(0.5)`} />}
                </svg>
            </div>
        );
    };

    return (
        <HUDPanel title="ASTRAL DREAM LOG" idLabel="SYS.DREAM.01" solfeggioFreq={852} className="h-full">
            <div className="flex flex-col gap-4 h-[500px]">
                
                {/* Header info */}
                <div className="flex justify-between items-center bg-black/40 border border-white/10 rounded p-2">
                    <div className="font-share text-[10px] text-hud-violet uppercase tracking-widest flex items-center gap-2">
                        <Moon size={12} /> LUNAR PHASE: {lunarPhase}
                    </div>
                </div>

                {/* Input Area */}
                <div className="relative flex-1 flex flex-col">
                    <textarea 
                        className="w-full flex-1 bg-black/50 border border-hud-violet/30 rounded-lg p-4 font-serif text-white/90 placeholder-white/20 resize-none focus:outline-none focus:border-hud-violet/70 transition-colors shadow-inner"
                        placeholder="Log your dream telemetry..."
                        value={dreamText}
                        onChange={e => setDreamText(e.target.value)}
                    />
                    
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={analyzeDream}
                        disabled={isAnalyzing || !dreamText.trim()}
                        className="absolute bottom-4 right-4 bg-hud-violet/20 hover:bg-hud-violet/40 text-hud-violet border border-hud-violet/50 px-4 py-2 rounded font-orbitron text-xs flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAnalyzing ? <Sparkles size={14} className="animate-spin" /> : <Send size={14} />}
                        {isAnalyzing ? "DECODING SYMBOLS..." : "ANALYZE DREAM"}
                    </motion.button>
                </div>

                {/* Analysis Results Area */}
                {analysisResult && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="h-48 bg-black/60 border border-white/10 rounded-lg p-4 flex gap-4 overflow-hidden"
                    >
                        {/* Left Side: Glyph */}
                        <div className="flex flex-col items-center justify-center border-r border-white/10 pr-4">
                            {renderGlyph(analysisResult?.glyphParams)}
                            <div className="font-share text-[8px] text-white/50 uppercase tracking-widest mt-2">SACRED GLYPH</div>
                        </div>

                        {/* Right Side: Data */}
                        <div className="flex-1 overflow-y-auto no-scrollbar font-share">
                            
                            <div className="mb-3">
                                <div className="text-[9px] text-hud-cyan uppercase tracking-widest mb-1 flex items-center gap-1">
                                    <Sparkles size={10} /> Extracted Symbols
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {analysisResult?.symbols?.map((sym: string, i: number) => (
                                        <span key={i} className="bg-hud-cyan/10 border border-hud-cyan/30 text-hud-cyan text-[9px] px-2 py-0.5 rounded uppercase font-orbitron">
                                            {sym}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="mb-3">
                                <div className="text-[9px] text-hud-gold uppercase tracking-widest mb-1">Karmic Theme</div>
                                <div className="text-xs text-white/80 border-l border-hud-gold/50 pl-2 italic">
                                    "{analysisResult?.karmicTheme}"
                                </div>
                            </div>

                            <div className="mb-2">
                                <div className="text-[9px] text-hud-violet uppercase tracking-widest mb-1">Past-Life Echo</div>
                                <div className="text-xs text-white/80 border-l border-hud-violet/50 pl-2 italic">
                                    "{analysisResult?.pastLifeEcho}"
                                </div>
                            </div>
                            
                        </div>
                    </motion.div>
                )}
            </div>
        </HUDPanel>
    );
};
