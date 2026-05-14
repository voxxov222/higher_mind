import * as React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Info, Sparkles, Compass, Hexagon, Network, Workflow, Sun, Moon, Star } from 'lucide-react';

const PLANETS = [
  { symbol: '☉', name: 'Sun', description: 'Your core identity, ego, and life purpose.' },
  { symbol: '☽', name: 'Moon', description: 'Your emotional needs, habits, and subconscious.' },
  { symbol: '☿', name: 'Mercury', description: 'Your mind, communication style, and intellect.' },
  { symbol: '♀', name: 'Venus', description: 'How you love, value, and approach aesthetics and resources.' },
  { symbol: '♂', name: 'Mars', description: 'Your drive, energy, ambition, and how you assert yourself.' },
  { symbol: '♃', name: 'Jupiter', description: 'Expansion, growth, philosophy, and where you find luck.' },
  { symbol: '♄', name: 'Saturn', description: 'Restriction, structure, discipline, and karmic lessons.' },
  { symbol: '♅', name: 'Uranus', description: 'Innovation, rebellion, sudden changes, and awakening.' },
  { symbol: '♆', name: 'Neptune', description: 'Illusion, dreams, spirituality, and boundless connection.' },
  { symbol: '♇', name: 'Pluto', description: 'Power, transformation, destruction, and rebirth.' }
];

const SIGNS = [
  { symbol: '♈', name: 'Aries', description: 'Assertive, pioneering, energetic, courageous. Cardinal Fire.' },
  { symbol: '♉', name: 'Taurus', description: 'Stable, sensual, practical, stubborn. Fixed Earth.' },
  { symbol: '♊', name: 'Gemini', description: 'Adaptable, communicative, curious, restless. Mutable Air.' },
  { symbol: '♋', name: 'Cancer', description: 'Nurturing, emotional, protective, sensitive. Cardinal Water.' },
  { symbol: '♌', name: 'Leo', description: 'Dramatic, generous, proud, creative. Fixed Fire.' },
  { symbol: '♍', name: 'Virgo', description: 'Analytical, practical, observant, critical. Mutable Earth.' },
  { symbol: '♎', name: 'Libra', description: 'Diplomatic, artistic, balanced, indecisive. Cardinal Air.' },
  { symbol: '♏', name: 'Scorpio', description: 'Intense, transformative, secretive, passionate. Fixed Water.' },
  { symbol: '♐', name: 'Sagittarius', description: 'Optimistic, philosophical, adventurous, blunt. Mutable Fire.' },
  { symbol: '♑', name: 'Capricorn', description: 'Ambitious, disciplined, structured, serious. Cardinal Earth.' },
  { symbol: '♒', name: 'Aquarius', description: 'Innovative, eccentric, humanitarian, detached. Fixed Air.' },
  { symbol: '♓', name: 'Pisces', description: 'Compassionate, imaginative, mystical, elusive. Mutable Water.' }
];

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
  { symbol: '☊', name: 'North Node', description: 'Your Soul Compass. Represents the qualities you are meant to develop in this lifetime for spiritual growth.' },
  { symbol: '☋', name: 'South Node', description: 'Your Comfort Zone. Talents and habits brought from past experiences that you must integrate or transcend.' },
  { symbol: '⚸', name: 'Lilith', description: 'The raw, untamed expression of feminine power, hidden desires, and shadow self.' },
  { symbol: '⚷', name: 'Chiron', description: 'The Wounded Healer. Where you have deep wounds but possess the greatest ability to heal others.' }
];

const ASPECTS = [
  { symbol: '☌', color: 'text-white', name: 'Conjunction (0°)', description: 'Unified energy. Planets merge their focus, blending their qualities powerfully.' },
  { symbol: '⚹', color: 'text-blue-400', name: 'Sextile (60°)', description: 'Harmonious flow. Opportunities and natural talents that require a little effort to activate.' },
  { symbol: '△', color: 'text-green-400', name: 'Trine (120°)', description: 'Easy flow. Innate gifts, harmony, and luck between these planetary energies.' },
  { symbol: '□', color: 'text-red-400', name: 'Square (90°)', description: 'Creative tension. Friction and challenges that drive action, growth, and mastery.' },
  { symbol: '☍', color: 'text-orange-400', name: 'Opposition (180°)', description: 'Polarity. A push-pull dynamic requiring balance and integration of opposing forces.' }
];

/**
 * BirthChartGuide Component
 * Provides a comprehensive, educational overview of birth chart fundamentals and a detailed legend.
 */
const BirthChartGuide = () => {
  return (
    <div className="space-y-12 py-6">
      {/* Intro Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <BookOpen className="text-blue-500" size={24} />
          <h2 className="text-2xl font-light text-white tracking-widest uppercase">The Astral Blueprint Legend</h2>
        </div>
        <p className="text-stone-400 text-sm leading-relaxed italic">
          A birth chart is a snapshot of the cosmos at the exact moment of your arrival. It is a mathematical map of your potential. 
          Use this comprehensive legend to decipher the symbols, planets, zodiac signs, houses, and aspects that weave the story of your life.
        </p>
      </section>

      {/* Planets Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-2">
          <Sun className="text-yellow-500" size={20} />
          <h3 className="text-sm uppercase tracking-[0.3em] font-bold text-stone-300">Planetary Bodies</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLANETS.map((planet) => (
            <motion.div 
              key={planet.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-4 bg-white/5 border border-white/10 rounded-2xl flex gap-4 items-start"
            >
              <div className="text-2xl text-yellow-400 font-light w-8 text-center">{planet.symbol}</div>
              <div>
                <h4 className="text-white text-sm font-bold mb-1 uppercase tracking-wider">{planet.name}</h4>
                <p className="text-[11px] text-stone-400 leading-relaxed font-light">{planet.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Zodiac Signs Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-2">
          <Star className="text-fuchsia-500" size={20} />
          <h3 className="text-sm uppercase tracking-[0.3em] font-bold text-stone-300">Zodiac Signs</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SIGNS.map((sign) => (
            <motion.div 
              key={sign.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-4 bg-fuchsia-500/5 border border-fuchsia-500/20 rounded-2xl flex gap-4 items-start"
            >
              <div className="text-2xl text-fuchsia-400 font-light w-8 text-center">{sign.symbol}</div>
              <div>
                <h4 className="text-white text-sm font-bold mb-1 uppercase tracking-wider">{sign.name}</h4>
                <p className="text-[11px] text-stone-400 leading-relaxed font-light">{sign.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Houses Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-2">
          <Hexagon className="text-purple-500" size={20} />
          <h3 className="text-sm uppercase tracking-[0.3em] font-bold text-stone-300">The 12 Houses</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {HOUSE_MEANINGS.map((house) => (
            <motion.div 
              key={house.num}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-4 bg-white/5 border border-white/10 rounded-2xl flex gap-4 items-start"
            >
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-mono text-sm shrink-0">
                {house.num}
              </div>
              <div>
                <h4 className="text-white text-sm font-bold mb-1 uppercase tracking-wider">{house.name}</h4>
                <p className="text-[11px] text-stone-400 leading-relaxed font-light">{house.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Aspects Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-2">
          <Workflow className="text-blue-400" size={20} />
          <h3 className="text-sm uppercase tracking-[0.3em] font-bold text-stone-300">Aspects (Geometric Angles)</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ASPECTS.map((aspect) => (
            <motion.div 
              key={aspect.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-4 bg-black/40 border border-white/10 rounded-2xl flex gap-4 items-start"
            >
              <div className={`text-2xl font-light w-8 text-center ${aspect.color}`}>{aspect.symbol}</div>
              <div>
                <h4 className="text-white text-sm font-bold mb-1 uppercase tracking-wider">{aspect.name}</h4>
                <p className="text-[11px] text-stone-400 leading-relaxed font-light">{aspect.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Nodes & Asteroids Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-2">
          <Compass className="text-emerald-500" size={20} />
          <h3 className="text-sm uppercase tracking-[0.3em] font-bold text-stone-300">Nodes & Deep Space Objects</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {NODE_MEANINGS.map((node) => (
            <motion.div 
              key={node.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex gap-4 items-start"
            >
               <div className="text-2xl text-emerald-400 font-light w-8 text-center">{node.symbol}</div>
               <div>
                <h4 className="text-emerald-400 text-sm font-bold mb-1 uppercase tracking-wider">{node.name}</h4>
                <p className="text-stone-400 text-[11px] leading-relaxed italic">{node.description}</p>
               </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final Wisdom */}
      <section className="p-8 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-[3rem] border border-white/10 text-center space-y-4">
        <Sparkles className="text-yellow-500 mx-auto" size={32} />
        <h3 className="text-xl font-light text-white uppercase tracking-widest">Integrating the Whole</h3>
        <p className="text-sm text-stone-300 italic leading-relaxed max-w-xl mx-auto">
          "Your chart is not a cage, but a set of keys. Each planet is a player, each sign is a costume, and each house is the stage where the drama of your life unfolds."
        </p>
      </section>
    </div>
  );
};

export default BirthChartGuide;
