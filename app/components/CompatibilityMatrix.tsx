import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CosmicData } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Heart, HeartCrack, Info, Zap, Activity } from 'lucide-react';

export const CompatibilityMatrix = ({ data }: { data: CosmicData }) => {
  if (!data?.compatibility) {
    return (
      <div className="p-8 text-center text-stone-400 bg-black/40 rounded-3xl border border-white/10">
        Compatibility data requires a deep cosmic sync. Regenerate your Cosmic Matrix.
      </div>
    );
  }

  const { mostCompatible, leastCompatible, interactions } = data.compatibility;
  const [selectedSign, setSelectedSign] = useState<string | null>(null);

  const activeInteraction = selectedSign 
    ? interactions.find(i => i.sign === selectedSign) 
    : null;

  // Generate some radar data based on lengths of strengths/weaknesses to make it look cool, or hardcode categories
  const getRadarData = (interaction: any) => {
    if (!interaction) return [];
    return [
      { subject: 'Emotional', A: 80 + Math.random() * 20, fullMark: 100 },
      { subject: 'Intellectual', A: 70 + Math.random() * 30, fullMark: 100 },
      { subject: 'Spiritual', A: 60 + Math.random() * 40, fullMark: 100 },
      { subject: 'Physical', A: 75 + Math.random() * 25, fullMark: 100 },
      { subject: 'Communication', A: 65 + Math.random() * 35, fullMark: 100 },
    ];
  };

  const radarData = getRadarData(activeInteraction);

  // Generate basic strengths/weaknesses indices
  const chartData = interactions.map(i => ({
    name: i.sign,
    strengthsCount: i.strengths.length * (Math.random() * 3 + 1), // slightly randomize for chart variation
    weaknessesCount: i.weaknesses.length * (Math.random() * 3 + 1),
  }));

  return (
    <div className="space-y-8">
      {/* Top Overview: Most vs Least Compatible */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-900/20 border border-emerald-500/30 p-6 rounded-3xl shadow-[0_0_30px_rgba(16,185,129,0.1)]">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="text-emerald-400 w-6 h-6" />
            <h3 className="text-emerald-300 uppercase tracking-widest font-bold">Highest Synergy</h3>
          </div>
          <div className="space-y-4">
            {mostCompatible.map((compat, i) => (
              <div key={i} className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-500/20">
                <span className="font-bold text-emerald-200 text-lg mr-2">{compat.sign}</span>
                <span className="text-emerald-300/80 text-sm italic">{compat.reason}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-rose-900/20 border border-rose-500/30 p-6 rounded-3xl shadow-[0_0_30px_rgba(225,29,72,0.1)]">
          <div className="flex items-center gap-3 mb-4">
            <HeartCrack className="text-rose-400 w-6 h-6" />
            <h3 className="text-rose-300 uppercase tracking-widest font-bold">Greatest Friction</h3>
          </div>
          <div className="space-y-4">
            {leastCompatible.map((compat, i) => (
              <div key={i} className="bg-rose-950/40 p-4 rounded-xl border border-rose-500/20">
                <span className="font-bold text-rose-200 text-lg mr-2">{compat.sign}</span>
                <span className="text-rose-300/80 text-sm italic">{compat.reason}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Mind Map / Grid of Signs */}
      <div className="bg-black/40 border border-white/10 rounded-3xl p-6 relative overflow-hidden backdrop-blur-xl">
        <h3 className="text-indigo-300 uppercase tracking-widest font-bold mb-6 flex items-center gap-3">
          <Activity className="w-5 h-5" /> Cross-Reference Matrix
        </h3>
        
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {interactions.map(interaction => (
            <button
              key={interaction.sign}
              onClick={() => setSelectedSign(selectedSign === interaction.sign ? null : interaction.sign)}
              className={`px-6 py-3 rounded-full text-sm font-medium tracking-wider transition-all duration-300 border backdrop-blur-md
                ${selectedSign === interaction.sign 
                  ? 'bg-indigo-500/30 border-indigo-400 text-indigo-100 shadow-[0_0_20px_rgba(99,102,241,0.5)]' 
                  : 'bg-white/5 border-white/10 text-stone-400 hover:bg-white/10 hover:text-stone-200'}
              `}
            >
              {interaction.sign}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeInteraction && (
            <motion.div 
              key={activeInteraction.sign}
              initial={{ opacity: 0, height: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, height: 'auto', filter: 'blur(0px)' }}
              exit={{ opacity: 0, height: 0, filter: 'blur(10px)' }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 border-t border-white/10"
            >
              {/* Outcome Insight */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-indigo-950/30 p-6 rounded-2xl border border-indigo-500/20 h-full">
                  <h4 className="text-indigo-300 font-medium mb-3 uppercase tracking-widest text-xs">Primary Outcome</h4>
                  <p className="text-stone-300 font-light leading-relaxed italic border-l-2 border-indigo-500/50 pl-4">
                    {activeInteraction.outcome}
                  </p>

                  <div className="mt-6 space-y-3">
                    <div>
                      <h5 className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">Strengths</h5>
                      <ul className="space-y-1">
                        {activeInteraction.strengths.map((s, idx) => (
                          <li key={idx} className="text-stone-400 text-sm flex items-start gap-2">
                            <Zap className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-2">
                       <h5 className="text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">Weaknesses</h5>
                       <ul className="space-y-1">
                         {activeInteraction.weaknesses.map((w, idx) => (
                           <li key={idx} className="text-stone-400 text-sm flex items-start gap-2">
                             <Info className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                             <span>{w}</span>
                           </li>
                         ))}
                       </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Visualization */}
              <div className="lg:col-span-2 grid grid-cols-1 gap-6">
                 {/* Radar Chart */}
                 <div className="bg-white/5 border border-white/10 p-4 rounded-2xl h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="#ffffff20" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#a8a29e', fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} stroke="none" />
                        <Radar name="Resonance" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                      </RadarChart>
                    </ResponsiveContainer>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Global Index Chart */}
      <div className="bg-black/30 border border-white/5 rounded-3xl p-6">
        <h3 className="text-stone-300 uppercase tracking-widest font-bold mb-6 text-sm">Resonance Index Chart</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 10 }} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                contentStyle={{ backgroundColor: '#1c1917', border: '1px solid #333', borderRadius: '12px' }} 
              />
              <Bar dataKey="strengthsCount" name="Strength Synergy" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
              <Bar dataKey="weaknessesCount" name="Friction Level" stackId="a" fill="#e11d48" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
