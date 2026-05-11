import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Info, Sparkles, Compass, Hexagon, Network, Workflow } from 'lucide-react';

const HOUSE_MEANINGS = [
  { num: 1, name: 'Self & Appearance', description: 'The "Front Door" of your personality. How you present yourself and your initial approach to life.' },
  { num: 2, name: 'Values & Resources', description: 'What you value, your material possessions, and your sense of self-worth and security.' },
  { num: 3, name: 'Communication & Learning', description: 'Your everyday mind, sibling relationships, and how you process and share information.' },
  { num: 4, name: 'Home & Roots', description: 'Foundations, family heritage, your inner world, and where you feel most safe.' },
  { num: 5, name: 'Creativity & Joy', description: 'Self-expression, romance, fun, children, and the things that make your heart sing.' },
  { num: 6, name: 'Work & Wellness', description: 'Daily routines, health, service, and how you manage the practical details of life.' },
  { num: 7, name: 'Partnerships', description: 'One-on-one relationships, marriage, and how you mirror yourself through others.' },
  { num: 8, name: 'Transformation', description: 'Deep bonds, shared resources, mystery, sex, and the process of rebirth.' },
  { num: 9, name: 'Expansion & Philosophy', description: 'Higher learning, travel, spirituality, and your quest for meaning and Truth.' },
  { num: 10, name: 'Career & Legacy', description: 'Your public reputation, status, and what you aim to achieve in the world.' },
  { num: 11, name: 'Community & Hopes', description: 'Friends, networks, social causes, and your visions for the future.' },
  { num: 12, name: 'Subconscious & Spirit', description: 'The "Invisible" world. Dreams, intuition, solitude, and universal connection.' }
];

const NODE_MEANINGS = [
  { name: 'North Node (Rahu)', description: 'Your Soul Compass. Represents the qualities you are meant to develop in this lifetime for spiritual growth.' },
  { name: 'South Node (Ketu)', description: 'Your Comfort Zone. Represents talents and habits brought from past experiences that you must now learn to integrate or move beyond.' }
];

/**
 * BirthChartGuide Component
 * Provides a comprehensive, educational overview of birth chart fundamentals.
 */
const BirthChartGuide: React.FC = () => {
  return (
    <div className="space-y-12 py-6">
      {/* Intro Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <BookOpen className="text-blue-500" size={24} />
          <h2 className="text-2xl font-light text-white tracking-widest uppercase">The Astral Blueprint</h2>
        </div>
        <p className="text-stone-400 text-sm leading-relaxed italic">
          A birth chart is a snapshot of the cosmos at the exact moment of your arrival. It is a mathematical map of your potential, 
          showing how planetary energies interweave through different sectors of your life (Houses).
        </p>
      </section>

      {/* Houses Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Hexagon className="text-purple-500" size={20} />
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-500">The 12 Houses of Experience</h3>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {HOUSE_MEANINGS.map((house) => (
            <motion.div 
              key={house.num}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-5 bg-white/5 border border-white/10 rounded-3xl hover:border-purple-500/30 transition-all hover:bg-white/[0.07]"
            >
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-mono text-xs shrink-0">
                  {house.num}
                </div>
                <div>
                  <h4 className="text-white text-sm font-medium mb-1">{house.name}</h4>
                  <p className="text-[11px] text-stone-500 leading-relaxed font-light">{house.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Nodes Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Compass className="text-emerald-500" size={20} />
          <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-500">The Lunar Nodes (Soul Path)</h3>
        </div>
        <div className="space-y-4">
          {NODE_MEANINGS.map((node) => (
            <div key={node.name} className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl">
              <h4 className="text-emerald-400 text-sm font-bold mb-2 uppercase tracking-widest">{node.name}</h4>
              <p className="text-stone-300 text-xs leading-relaxed italic">{node.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Connections (Aspects) Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Workflow className="text-orange-500" size={20} />
          <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-500">Celestial Connections (Aspects)</h3>
        </div>
        <div className="bg-black/20 p-6 rounded-[2.5rem] border border-white/5 space-y-4">
          <p className="text-xs text-stone-400 leading-relaxed">
            Aspects are the geometric relationships between planets. They determine how different parts of your personality communicate.
          </p>
          <ul className="space-y-3">
            <li className="flex gap-3 text-[11px]">
              <span className="text-white font-bold min-w-[80px] uppercase tracking-tighter">Conjunction</span>
              <span className="text-stone-500">Unified energy. Two planets merging their focus into one powerful drive.</span>
            </li>
            <li className="flex gap-3 text-[11px]">
              <span className="text-blue-400 font-bold min-w-[80px] uppercase tracking-tighter">Sextile/Trine</span>
              <span className="text-stone-500">Harmonious flow. Natural talents and ease between these parts of yourself.</span>
            </li>
            <li className="flex gap-3 text-[11px]">
              <span className="text-red-400 font-bold min-w-[80px] uppercase tracking-tighter">Square/Oppos.</span>
              <span className="text-stone-500">Creative tension. Areas of friction that drive growth, challenge, and ultimate mastery.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Final Wisdom */}
      <section className="p-8 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-[3rem] border border-white/10 text-center space-y-4">
        <Sparkles className="text-yellow-500 mx-auto" size={32} />
        <h3 className="text-xl font-light text-white uppercase tracking-widest">Integrating the Whole</h3>
        <p className="text-sm text-stone-300 italic leading-relaxed max-w-sm mx-auto">
          "Your chart is not a cage, but a set of keys. Each planet is a player, each sign is a costume, and each house is the stage where the drama of your life unfolds."
        </p>
      </section>
    </div>
  );
};

export default BirthChartGuide;
