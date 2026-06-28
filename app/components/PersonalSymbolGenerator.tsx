import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Download, Hexagon, Wand2 } from 'lucide-react';
import { CosmicData } from '../services/gemini.server';

interface Props {
  cosmicData: CosmicData;
}

export function PersonalSymbolGenerator({ cosmicData }: Props) {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSymbol = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/generate-sigil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cosmicData })
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      if (data.svg) {
        setSvgContent(data.svg);
      }
    } catch (err: any) {
      setError(err.message || "Failed to channel the cosmic symbol.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cosmic-sigil-${cosmicData.profile?.name?.replace(/\s+/g, '-').toLowerCase() || 'symbol'}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full h-full p-8 flex flex-col items-center overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pb-32">
      <div className="max-w-3xl w-full flex flex-col items-center text-center space-y-6 mb-12">
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl shadow-[0_0_30px_rgba(217,119,6,0.15)]">
          <Hexagon className="w-12 h-12 text-amber-400" />
        </div>
        
        <h1 className="text-4xl font-light text-white tracking-widest uppercase">Ancient Personal Sigil</h1>
        <p className="text-stone-400 font-light max-w-xl leading-relaxed">
          Channel your unique life path, birth date, name, and cosmic blueprint into a one-of-a-kind sacred geometry symbol. This sigil acts as a visual anchor for your highest timeline.
        </p>

        {!svgContent && !isLoading && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateSymbol}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-500 rounded-xl text-white font-medium shadow-[0_0_30px_rgba(217,119,6,0.3)] hover:shadow-[0_0_50px_rgba(217,119,6,0.5)] transition-all mt-4"
          >
            <Wand2 className="w-5 h-5" />
            Generate My Symbol
          </motion.button>
        )}
      </div>

      <div className="w-full max-w-2xl aspect-square relative flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-black/40 rounded-3xl backdrop-blur-sm border border-white/5">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
              <Hexagon className="w-16 h-16 text-amber-500/50" />
            </motion.div>
            <div className="text-amber-400/80 font-mono tracking-widest text-sm animate-pulse">
              CHANNELING COSMIC FREQUENCIES...
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-950/20 rounded-3xl border border-red-500/30 text-red-400 p-8 text-center flex-col gap-4">
             <p>{error}</p>
             <button onClick={generateSymbol} className="px-4 py-2 bg-red-500/20 rounded-lg hover:bg-red-500/40 transition-colors">Retry Connection</button>
          </div>
        )}

        <AnimatePresence>
          {svgContent && !isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="w-full h-full relative flex items-center justify-center"
            >
              {/* SVG Container */}
              <div 
                className="w-[80%] h-[80%] p-8 bg-stone-900/50 border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-visible [&>svg]:w-full [&>svg]:h-full [&>svg]:drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
              
              {/* Action Buttons */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4">
                 <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={downloadSvg}
                    className="flex items-center gap-2 px-6 py-3 bg-stone-800 hover:bg-stone-700 border border-white/10 rounded-full text-white font-medium text-sm transition-colors shadow-lg"
                 >
                    <Download className="w-4 h-4" /> Save SVG
                 </motion.button>
                 <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={generateSymbol}
                    className="flex items-center gap-2 px-6 py-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 rounded-full text-amber-400 font-medium text-sm transition-colors shadow-lg"
                 >
                    <Sparkles className="w-4 h-4" /> Regenerate
                 </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
