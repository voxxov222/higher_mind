import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Sun, Moon, Star, Orbit } from 'lucide-react';
import { soundEngine } from '../lib/soundEffects';

interface AstrologyReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'planets' | 'signs' | 'houses' | 'aspects';
}

const PLANETS_DATA = [
  { name: 'Sun', symbol: '☉', meaning: 'Core identity, ego, life purpose, vitality.', keywords: 'Self, Expression, Vitality' },
  { name: 'Moon', symbol: '☽', meaning: 'Emotions, subconscious, instincts, mother figure.', keywords: 'Feelings, Intuition, Habits' },
  { name: 'Mercury', symbol: '☿', meaning: 'Communication, intellect, thought processes, travel.', keywords: 'Mind, Logic, Connection' },
  { name: 'Venus', symbol: '♀', meaning: 'Love, beauty, values, money, relationships.', keywords: 'Harmony, Attraction, Art' },
  { name: 'Mars', symbol: '♂', meaning: 'Action, drive, passion, energy, conflict.', keywords: 'Courage, Desire, Willpower' },
  { name: 'Jupiter', symbol: '♃', meaning: 'Expansion, growth, optimism, philosophy, luck.', keywords: 'Wisdom, Abundance, Faith' },
  { name: 'Saturn', symbol: '♄', meaning: 'Restriction, discipline, responsibility, karma, structure.', keywords: 'Limits, Authority, Patience' },
  { name: 'Uranus', symbol: '♅', meaning: 'Innovation, rebellion, sudden change, originality.', keywords: 'Awakening, Freedom, Tech' },
  { name: 'Neptune', symbol: '♆', meaning: 'Dreams, illusions, spirituality, inspiration, confusion.', keywords: 'Mysticism, Imagination, Empathy' },
  { name: 'Pluto', symbol: '♇', meaning: 'Transformation, power, rebirth, the underworld, psychology.', keywords: 'Evolution, Depth, Renewal' },
];

const SIGNS_DATA = [
  { name: 'Aries', element: 'Fire', ruler: 'Mars', meaning: 'Pioneering, brave, impulsive.' },
  { name: 'Taurus', element: 'Earth', ruler: 'Venus', meaning: 'Reliable, patient, stubborn.' },
  { name: 'Gemini', element: 'Air', ruler: 'Mercury', meaning: 'Adaptable, curious, inconsistent.' },
  { name: 'Cancer', element: 'Water', ruler: 'Moon', meaning: 'Nurturing, intuitive, moody.' },
  { name: 'Leo', element: 'Fire', ruler: 'Sun', meaning: 'Creative, passionate, arrogant.' },
  { name: 'Virgo', element: 'Earth', ruler: 'Mercury', meaning: 'Analytical, practical, critical.' },
  { name: 'Libra', element: 'Air', ruler: 'Venus', meaning: 'Diplomatic, fair, indecisive.' },
  { name: 'Scorpio', element: 'Water', ruler: 'Pluto', meaning: 'Intense, resourceful, secretive.' },
  { name: 'Sagittarius', element: 'Fire', ruler: 'Jupiter', meaning: 'Optimistic, philosophical, blunt.' },
  { name: 'Capricorn', element: 'Earth', ruler: 'Saturn', meaning: 'Disciplined, responsible, pessimistic.' },
  { name: 'Aquarius', element: 'Air', ruler: 'Uranus', meaning: 'Original, humanitarian, aloof.' },
  { name: 'Pisces', element: 'Water', ruler: 'Neptune', meaning: 'Compassionate, artistic, escapist.' },
];

const HOUSES_DATA = [
  { number: '1st', name: 'House of Self', meaning: 'Identity, physical appearance, first impressions, new beginnings.' },
  { number: '2nd', name: 'House of Value', meaning: 'Money, material possessions, self-worth, resources.' },
  { number: '3rd', name: 'House of Communication', meaning: 'Siblings, short trips, early education, intellect.' },
  { number: '4th', name: 'House of Home', meaning: 'Family, roots, inner security, the mother or father.' },
  { number: '5th', name: 'House of Pleasure', meaning: 'Creativity, romance, children, hobbies, risk.' },
  { number: '6th', name: 'House of Health', meaning: 'Daily routines, work, physical wellness, pets, service.' },
  { number: '7th', name: 'House of Partnerships', meaning: 'Marriage, business partners, contracts, open enemies.' },
  { number: '8th', name: 'House of Transformation', meaning: 'Death, rebirth, shared finances, intimacy, the occult.' },
  { number: '9th', name: 'House of Philosophy', meaning: 'Higher education, long-distance travel, religion, beliefs.' },
  { number: '10th', name: 'House of Career', meaning: 'Public image, achievements, authority figures, fame.' },
  { number: '11th', name: 'House of Friends', meaning: 'Social networks, hopes, dreams, collective goals, rebellion.' },
  { number: '12th', name: 'House of the Unconscious', meaning: 'Hidden things, spirituality, karma, self-undoing, isolation.' },
];

const ASPECTS_DATA = [
  { name: 'Conjunction', angle: '0°', meaning: 'Planets are together in the same sign. Energies merge and blend, intensifying each other. This is a point of powerful focus and unified action, but can lack objectivity.' },
  { name: 'Sextile', angle: '60°', meaning: 'Planets are two signs apart. Energies flow smoothly together, offering opportunities, talents, and natural abilities that require some effort to activate.' },
  { name: 'Square', angle: '90°', meaning: 'Planets are three signs apart. Energies clash, creating tension, friction, and challenging circumstances. This aspect drives action, growth, and forces resolution through effort.' },
  { name: 'Trine', angle: '120°', meaning: 'Planets are four signs apart (same element). Energies are in harmony, creating ease, luck, and natural flow. Can sometimes lead to laziness if not utilized actively.' },
  { name: 'Opposition', angle: '180°', meaning: 'Planets are six signs apart (opposite each other). Energies polarize, creating a tug-of-war, projection, or a need for balance. Usually involves relationships and finding a middle ground.' },
];

export const AstrologyReferenceModal: React.FC<AstrologyReferenceModalProps> = ({ 
  isOpen, 
  onClose,
  initialTab = 'planets'
}) => {
  const [activeTab, setActiveTab] = useState<'planets' | 'signs' | 'houses' | 'aspects'>(initialTab);

  if (!isOpen) return null;

  const playClick = () => soundEngine.click();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={() => { playClick(); onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-stone-900 border border-purple-500/30 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-[0_0_50px_rgba(168,85,247,0.15)] overflow-hidden relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/20">
            <h2 className="text-2xl font-light text-white flex items-center gap-3">
              <BookOpen className="text-purple-400" />
              Astrology Reference Guide
            </h2>
            <button 
              onClick={() => { playClick(); onClose(); }}
              className="p-2 rounded-xl hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-black/40 border-b border-white/10 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => { playClick(); setActiveTab('planets'); }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-medium text-sm tracking-widest uppercase transition-colors whitespace-nowrap min-w-fit ${activeTab === 'planets' ? 'text-purple-300 border-b-2 border-purple-500 bg-purple-500/10' : 'text-stone-400 hover:text-stone-200'}`}
            >
              <Sun size={16} /> Planets
            </button>
            <button 
              onClick={() => { playClick(); setActiveTab('signs'); }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-medium text-sm tracking-widest uppercase transition-colors whitespace-nowrap min-w-fit ${activeTab === 'signs' ? 'text-purple-300 border-b-2 border-purple-500 bg-purple-500/10' : 'text-stone-400 hover:text-stone-200'}`}
            >
              <Star size={16} /> Signs
            </button>
            <button 
              onClick={() => { playClick(); setActiveTab('houses'); }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-medium text-sm tracking-widest uppercase transition-colors whitespace-nowrap min-w-fit ${activeTab === 'houses' ? 'text-purple-300 border-b-2 border-purple-500 bg-purple-500/10' : 'text-stone-400 hover:text-stone-200'}`}
            >
              <Moon size={16} /> Houses
            </button>
            <button 
              onClick={() => { playClick(); setActiveTab('aspects'); }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-medium text-sm tracking-widest uppercase transition-colors whitespace-nowrap min-w-fit ${activeTab === 'aspects' ? 'text-purple-300 border-b-2 border-purple-500 bg-purple-500/10' : 'text-stone-400 hover:text-stone-200'}`}
            >
              <Orbit size={16} /> Aspects
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
            
            {activeTab === 'planets' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {PLANETS_DATA.map(planet => (
                  <div key={planet.name} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center text-2xl font-bold">
                        {planet.symbol}
                      </div>
                      <div>
                        <h3 className="text-lg font-light text-white">{planet.name}</h3>
                        <p className="text-xs uppercase tracking-widest text-purple-400">{planet.keywords}</p>
                      </div>
                    </div>
                    <p className="text-stone-300 text-sm leading-relaxed">{planet.meaning}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'signs' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SIGNS_DATA.map(sign => (
                  <div key={sign.name} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-medium text-white">{sign.name}</h3>
                      <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-md border 
                        ${sign.element === 'Fire' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : ''}
                        ${sign.element === 'Water' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : ''}
                        ${sign.element === 'Earth' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : ''}
                        ${sign.element === 'Air' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : ''}
                      `}>
                        {sign.element}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mb-2">Ruled by <span className="text-stone-300">{sign.ruler}</span></p>
                    <p className="text-stone-300 text-sm leading-relaxed">{sign.meaning}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'houses' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {HOUSES_DATA.map(house => (
                  <div key={house.number} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex gap-4 hover:bg-white/10 transition-colors">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center font-bold">
                      {house.number}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white mb-1">{house.name}</h3>
                      <p className="text-stone-300 text-sm leading-relaxed">{house.meaning}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'aspects' && (
              <div className="flex flex-col gap-6">
                {ASPECTS_DATA.map(aspect => (
                  <div key={aspect.name} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-light text-white">{aspect.name}</h3>
                      <span className="text-xs font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-1 rounded-md">
                        {aspect.angle}
                      </span>
                    </div>
                    <p className="text-stone-300 text-sm md:text-base leading-relaxed">{aspect.meaning}</p>
                  </div>
                ))}
              </div>
            )}

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
