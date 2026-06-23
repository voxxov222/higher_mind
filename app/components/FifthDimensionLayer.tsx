import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Brain, Sparkles, Loader2 } from 'lucide-react';
import { soundEngine } from '../lib/soundEffects';

export const FifthDimensionLayer = ({ cosmicData }: { cosmicData?: any }) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [affirmation, setAffirmation] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setIsProcessing(true);
    soundEngine.click();

    try {
      // In a real app, integrate Gemini API here to transform input
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAffirmation(`Transformed Command: "I am actively rewriting my reality: ${input}"`);
      soundEngine.success();
    } catch (error) {
      setAffirmation('Error in neural transformation.');
      soundEngine.error();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-black/80 rounded-3xl border border-fuchsia-500/20 shadow-[0_0_50px_rgba(192,38,211,0.1)]">
      <h2 className="text-3xl font-light text-fuchsia-200 tracking-widest uppercase mb-8">5D Consciousness Layer</h2>
      
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full h-32 bg-stone-900/50 border border-fuchsia-500/30 rounded-2xl p-4 text-sm text-white placeholder:text-stone-500 focus:border-fuchsia-400 outline-none transition-all"
          placeholder="Enter subconscious command to overwrite..."
        />
        <button
          type="submit"
          disabled={isProcessing}
          className="w-full bg-fuchsia-900/50 hover:bg-fuchsia-800 text-fuchsia-100 py-3 rounded-xl uppercase tracking-widest text-xs font-bold transition-all flex items-center justify-center gap-2"
        >
          {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <Brain size={16} />}
          {isProcessing ? 'Rewriting...' : 'Execute Transformation'}
        </button>
      </form>

      {affirmation && (
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="mt-8 p-6 bg-fuchsia-950/20 border border-fuchsia-500/20 rounded-2xl text-center"
        >
          <Sparkles className="mx-auto mb-2 text-fuchsia-400" size={24} />
          <p className="text-fuchsia-100 font-mono text-sm">{affirmation}</p>
        </motion.div>
      )}
    </div>
  );
};
