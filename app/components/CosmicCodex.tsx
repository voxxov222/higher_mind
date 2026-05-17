import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, X, Sun, Moon, Compass, Star, Zap, Info, Shield, Layers, Wind, Droplets, Flame, Mountain } from 'lucide-react';

const PLANETS = [
  { name: 'Sun', symbol: '☉', meaning: 'Core essence, identity, and vitality. Represents your conscious will.', element: 'Fire', ruler: 'Leo' },
  { name: 'Moon', symbol: '☽', meaning: 'Emotions, intuition, and the subconscious. Represents your inner security.', element: 'Water', ruler: 'Cancer' },
  { name: 'Mercury', symbol: '☿', meaning: 'Communication, intellect, and processing. How you share ideas.', element: 'Air', ruler: 'Gemini/Virgo' },
  { name: 'Venus', symbol: '♀', meaning: 'Love, values, and social harmony. Governs attraction and pleasure.', element: 'Earth/Air', ruler: 'Taurus/Libra' },
  { name: 'Mars', symbol: '♂', meaning: 'Action, assertion, and drive. How you achieve your goals.', element: 'Fire', ruler: 'Aries' },
  { name: 'Jupiter', symbol: '♃', meaning: 'Expansion, abundance, and higher learning. Where you find luck.', element: 'Fire', ruler: 'Sagittarius' },
  { name: 'Saturn', symbol: '♄', meaning: 'Structure, karma, and discipline. Your boundaries and lessons.', element: 'Earth', ruler: 'Capricorn' },
  { name: 'Uranus', symbol: '♅', meaning: 'Innovation, rebellion, and sudden awakening. Rules the futuristic.', element: 'Air', ruler: 'Aquarius' },
  { name: 'Neptune', symbol: '♆', meaning: 'Spirituality, dreams, and the dissolution of boundaries.', element: 'Water', ruler: 'Pisces' },
  { name: 'Pluto', symbol: '♇', meaning: 'Transformation, power, and the underworld. Deep rebirth.', element: 'Water', ruler: 'Scorpio' },
];

const HOUSES = [
  { id: 1, name: 'First House', theme: 'Self', meaning: 'Appearance, identity, first impressions, and your approach to life.' },
  { id: 2, name: 'Second House', theme: 'Values', meaning: 'Money, possessions, self-worth, and tangible resources.' },
  { id: 3, name: 'Third House', theme: 'Mind', meaning: 'Communication, siblings, short trips, and early learning.' },
  { id: 4, name: 'Fourth House', theme: 'Roots', meaning: 'Family, home, inner foundation, and emotional security.' },
  { id: 5, name: 'Fifth House', theme: 'Joy', meaning: 'Creativity, romance, children, play, and self-expression.' },
  { id: 6, name: 'Sixth House', theme: 'Ritual', meaning: 'Health, service, daily routines, and refinement of skill.' },
  { id: 7, name: 'Seventh House', theme: 'Relationship', meaning: 'Partnership, marriage, balance, and the "other".' },
  { id: 8, name: 'Eighth House', theme: 'Merge', meaning: 'Intimacy, shared resources, death, and psychological rebirth.' },
  { id: 9, name: 'Ninth House', theme: 'Spirit', meaning: 'Wisdom, travel, higher education, and philosophy.' },
  { id: 10, name: 'Tenth House', theme: 'Mastery', meaning: 'Career, status, public identity, and life achievements.' },
  { id: 11, name: 'Eleventh House', theme: 'Network', meaning: 'Friendships, goals, humanitarianism, and collective hopes.' },
  { id: 12, name: 'Twelfth House', theme: 'Endings', meaning: 'Subconscious, hidden patterns, spiritual transcendence, and isolation.' },
];

const ASPECTS = [
  { name: 'Conjunction (0°)', type: 'Merge', meaning: 'Two planets blend their energies into a single, combined force.' },
  { name: 'Opposition (180°)', type: 'Polarity', meaning: 'Planets face each other, requiring balance and integration of opposites.' },
  { name: 'Trine (120°)', type: 'Flow', meaning: 'Harmonious energy where planets support each other effortlessly.' },
  { name: 'Square (90°)', type: 'Challenge', meaning: 'Tension that demands action and creates growth through friction.' },
  { name: 'Sextile (60°)', type: 'Opportunity', meaning: 'Pleasant support that offers opportunities for those who look for them.' },
];

export const CosmicCodex = () => {
  const [activeTab, setActiveTab] = useState<'planets' | 'houses' | 'aspects'>('planets');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  return (
    <div className="flex flex-col h-full bg-stone-950/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-light text-white tracking-widest uppercase flex items-center gap-3">
            <Book className="text-purple-400" /> Cosmic Codex
          </h2>
          <p className="text-xs text-stone-500 mt-1 uppercase tracking-widest font-bold">Divine Reference Guide v1.0</p>
        </div>
        <div className="flex gap-2 bg-stone-900/40 p-1 rounded-2xl border border-white/5">
          {['planets', 'houses', 'aspects'].map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab as any); setSelectedItem(null); }}
              className={`px-6 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all ${
                activeTab === tab ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-stone-500 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* List Side */}
        <div className="w-1/3 border-r border-white/5 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {activeTab === 'planets' && PLANETS.map(p => (
            <button
              key={p.name}
              onClick={() => setSelectedItem(p)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border ${
                selectedItem?.name === p.name ? 'bg-purple-500/20 border-purple-500/30 text-white' : 'bg-white/5 border-transparent text-stone-400 hover:bg-white/10'
              }`}
            >
              <span className="text-2xl opacity-80">{p.symbol}</span>
              <span className="text-xs uppercase tracking-widest font-bold">{p.name}</span>
            </button>
          ))}
          {activeTab === 'houses' && HOUSES.map(h => (
            <button
              key={h.id}
              onClick={() => setSelectedItem(h)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border ${
                selectedItem?.id === h.id ? 'bg-purple-500/20 border-purple-500/30 text-white' : 'bg-white/5 border-transparent text-stone-400 hover:bg-white/10'
              }`}
            >
              <span className="text-lg font-serif italic text-purple-400 w-6">{h.id}</span>
              <span className="text-xs uppercase tracking-widest font-bold">{h.name}</span>
            </button>
          ))}
          {activeTab === 'aspects' && ASPECTS.map(a => (
            <button
              key={a.name}
              onClick={() => setSelectedItem(a)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border ${
                selectedItem?.name === a.name ? 'bg-purple-500/20 border-purple-500/30 text-white' : 'bg-white/5 border-transparent text-stone-400 hover:bg-white/10'
              }`}
            >
              <Zap className={`w-4 h-4 ${selectedItem?.name === a.name ? 'text-purple-300' : 'text-stone-600'}`} />
              <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] uppercase tracking-widest font-bold">{a.name}</span>
                <span className="text-[8px] opacity-40 uppercase tracking-tighter mt-1">{a.type}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Content Side */}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          <AnimatePresence mode="wait">
            {selectedItem ? (
              <motion.div
                key={selectedItem.name || selectedItem.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-xl space-y-8"
              >
                <div className="flex items-center gap-6">
                  {selectedItem.symbol ? (
                    <div className="w-20 h-20 rounded-3xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-5xl text-purple-400">
                      {selectedItem.symbol}
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-3xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-4xl font-serif italic text-purple-400">
                      {selectedItem.id || '⚡'}
                    </div>
                  )}
                  <div>
                    <h1 className="text-4xl font-light text-white tracking-widest uppercase">{selectedItem.name}</h1>
                    {selectedItem.theme && <p className="text-sm font-bold text-purple-400 uppercase tracking-[0.3em] mt-1">{selectedItem.theme}</p>}
                    {selectedItem.type && <p className="text-sm font-bold text-blue-400 uppercase tracking-[0.3em] mt-1">{selectedItem.type}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {selectedItem.element && (
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                      <Layers size={16} className="text-stone-500" />
                      <div className="leading-none">
                        <span className="text-[8px] uppercase tracking-widest text-stone-500 font-bold block mb-1">Element</span>
                        <span className="text-xs text-stone-200">{selectedItem.element}</span>
                      </div>
                    </div>
                  )}
                  {selectedItem.ruler && (
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                      <Star size={16} className="text-stone-500" />
                      <div className="leading-none">
                        <span className="text-[8px] uppercase tracking-widest text-stone-500 font-bold block mb-1">Ruler</span>
                        <span className="text-xs text-stone-200">{selectedItem.ruler}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-stone-500 border-b border-white/5 pb-2">Archival Knowledge</h4>
                  <p className="text-lg font-light text-stone-300 leading-relaxed italic">"{selectedItem.meaning}"</p>
                </div>

                <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-900/20 to-stone-900/20 border border-purple-500/10 flex items-start gap-4">
                  <Info className="text-purple-400 shrink-0 mt-1" size={18} />
                  <p className="text-xs text-stone-400 leading-relaxed font-light">
                    This cosmic archetype operates and resonates within your unique neural brain lattice. Observe how it anchors into your birth chart to understand its specific mission in your incarnation.
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-30 text-center space-y-6">
                <Compass size={80} className="animate-spin-slow" />
                <div className="max-w-xs">
                  <h3 className="text-xl font-light uppercase tracking-[0.2em] mb-2">Select a Node</h3>
                  <p className="text-xs">Explore the symbolic architecture of the astral information fields through the codex side-bar.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
