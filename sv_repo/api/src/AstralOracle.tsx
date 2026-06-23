import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Compass, Zap, Brain } from 'lucide-react';
import { CosmicData } from '../types';

interface AstralOracleProps {
  data: CosmicData | null;
}

export const AstralOracle: React.FC<AstralOracleProps> = ({ data }) => {
  const [oracleInsight, setOracleInsight] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const requestGuidance = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'fetchCosmicChatResponse',
          payload: {
            userMessage: "Provide my daily, personalized cosmic guidance based on my astrological profile and current planetary transits. Keep it concise, profound, and highly insightful.",
            chatHistory: [],
            cosmicData: data
          }
        })
      });
      if (!response.ok) {
          throw new Error(`Server returned ${response.status} ${response.statusText}`);
      }
      const result = await response.json();
      setOracleInsight(result.text);
    } catch (error) {
      console.error("Oracle error:", error);
      setOracleInsight("The stars are currently silent. Re-align your intention.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (data) {
        requestGuidance();
    }
  }, [data]);

  return (
    <div className="w-full h-full bg-slate-950/40 rounded-[3rem] border border-indigo-500/20 backdrop-blur-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden group shadow-[0_0_50px_rgba(99,102,241,0.1)]">
        <header className="z-10 mb-8 space-y-4">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 rounded-full flex items-center justify-center border border-indigo-500/40 mx-auto shadow-[0_0_30px_rgba(99,102,241,0.2)]">
            <Compass className="text-indigo-400 w-12 h-12" />
          </div>
          <h2 className="text-4xl font-light text-white tracking-[0.4em] uppercase font-serif mt-6">Astral Oracle</h2>
        </header>

        <div className="z-10 flex-1 w-full max-w-2xl text-center overflow-y-auto">
            {isLoading ? (
                <div className="flex items-center justify-center h-full">
                    <Sparkles className="animate-spin w-12 h-12 text-indigo-500/50" />
                </div>
            ) : (
                <div className="prose prose-invert prose-sm">
                    {oracleInsight}
                </div>
            )}
        </div>
        
        <button 
            onClick={requestGuidance}
            disabled={isLoading}
            className="z-10 mt-6 flex items-center justify-center gap-3 px-8 py-4 bg-transparent border border-indigo-500/30 text-indigo-400 rounded-full text-xs uppercase tracking-[0.3em] hover:bg-indigo-500/10 transition-all"
        >
            <Brain size={16} />
            Recalibrate Guidance
        </button>
    </div>
  );
};
