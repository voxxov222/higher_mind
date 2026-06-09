import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Zap, Activity, Shield, Flame, Activity as WaveIcon, 
  Settings, Radio, Cpu, Brain, Infinity as InfinityIcon,
  Plus, History, AlertCircle, RefreshCw, BarChart2
} from 'lucide-react';
import { useHigherMind } from './HigherMindProvider';

// Let's declare our interfaces for the Karma ledger data
interface KarmicEvent {
  id: string;
  timestamp: Date;
  epoch: string;
  source: string; // Thoughts, Feelings, Experiences
  action: string;
  energyShift: number; // -10 to +30
  frequencyHz: number;
  valence: number; // -1 to +1
  bondStrength: number; // 0 to 10
  details: string;
  category: 'Spiritual' | 'Mental' | 'Generational' | 'Pineal Activation' | 'Akashic Healing';
}

const CONSTANT_KARMA_PRESETS: KarmicEvent[] = [
  {
    id: 'k1',
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    epoch: 'Epoch of Separation',
    source: 'Experiences',
    action: 'Ancestral clearing during Saturn conjunction',
    energyShift: 12,
    frequencyHz: 528,
    valence: 0.4,
    bondStrength: 4.5,
    details: 'Initiated deep healing regarding lineage restrictions under Saturn square. Solfeggio 528Hz alignment generated structural cellular resonance.',
    category: 'Generational'
  },
  {
    id: 'k2',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    epoch: 'Epoch of Awakening',
    source: 'Thoughts',
    action: 'Intellectual ego dissolution & neural release',
    energyShift: 18,
    frequencyHz: 741,
    valence: 0.6,
    bondStrength: 6.2,
    details: 'Semantic dissolution of persistent identity paradigms. Deconstructed language patterns to see the universe as pure alphanumeric vibration.',
    category: 'Mental'
  },
  {
    id: 'k3',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    epoch: 'Pineal Recalibration',
    source: 'Feelings',
    action: 'Pineal gland first-phase decalcification',
    energyShift: 15,
    frequencyHz: 963,
    valence: 0.55,
    bondStrength: 5.8,
    details: 'Tuned into high crown resonance. Released dense calcium bindings under targeted wave impulses.',
    category: 'Pineal Activation'
  },
  {
    id: 'k4',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    epoch: 'Gateway Alignment',
    source: 'Experiences',
    action: 'Akashic archive connection & past memory integration',
    energyShift: 24,
    frequencyHz: 852,
    valence: 0.8,
    bondStrength: 7.9,
    details: 'Bound multiple past timelines into a unified thread. Verified alignment vector is now clear and oriented outward.',
    category: 'Akashic Healing'
  },
  {
    id: 'k5',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    epoch: 'Torus Integration',
    source: 'Feelings',
    action: 'Solfeggio heart expansion & shadow integration',
    energyShift: -8, // temporary contraction before growth
    frequencyHz: 396,
    valence: -0.2,
    bondStrength: 3.1,
    details: 'Shadow contraction phase. Integration of root fear archetypes. Solfeggio 396Hz utilized for security and grounding release.',
    category: 'Spiritual'
  },
  {
    id: 'k6',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    epoch: 'Quantum Leap Epoch',
    source: 'Thoughts',
    action: 'Coherent mental state binding & high integration',
    energyShift: 28,
    frequencyHz: 528,
    valence: 0.9,
    bondStrength: 8.8,
    details: 'Synaptic cluster coherence reached peak maximum. Combined thoughts, feeling, and action into a single hyper-dimensional intend vector.',
    category: 'Spiritual'
  }
];

export const KarmaLedger: React.FC = () => {
  const { thoughts, feelings, experiences, coherence, alignment } = useHigherMind();
  
  // Ledger state
  const [ledgerEvents, setLedgerEvents] = useState<KarmicEvent[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('astral_karma_events');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return parsed.map((p: any) => ({
            ...p,
            timestamp: new Date(p.timestamp)
          }));
        } catch (e) {
          return CONSTANT_KARMA_PRESETS;
        }
      }
    }
    return CONSTANT_KARMA_PRESETS;
  });

  // Mode tabs: 'ledger' for D3 visualization, 'higherself' for connection tools
  const [activeSubTab, setActiveSubTab] = useState<'ledger' | 'higherself'>('ledger');

  // New log form state
  const [newAction, setNewAction] = useState('');
  const [newCategory, setNewCategory] = useState<'Spiritual' | 'Mental' | 'Generational' | 'Pineal Activation' | 'Akashic Healing'>('Spiritual');
  const [newFrequency, setNewFrequency] = useState(528);
  const [newEnergyShift, setNewEnergyShift] = useState(15);
  const [formOpen, setFormOpen] = useState(false);

  // D3 References
  const d3ContainerRef = useRef<SVGSVGElement>(null);
  const [hoveredEvent, setHoveredEvent] = useState<KarmicEvent | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<'energy' | 'frequency' | 'valence' | 'bond'>('energy');

  // Higher Self states
  const [bondStrength, setBondStrength] = useState<number>(5.0); // 0 to 10
  const [selfFrequency, setSelfFrequency] = useState<number>(528); // Standard Solfeggio
  const [pinealDecalcification, setPinealDecalcification] = useState<number>(24); // 0 to 100 % (starts partially calcified)
  const [isInjecting, setIsInjecting] = useState<boolean>(false);
  const [injectionLogs, setInjectionLogs] = useState<string[]>(['[MATRIX] Ready for alignment sequence.']);
  const [isAudioRunning, setIsAudioRunning] = useState<boolean>(false);
  const [binauralAudioStatus, setBinauralAudioStatus] = useState<string>('Inactive');
  const [customAffirmation, setCustomAffirmation] = useState('');

  // Audio refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Save/load to local storage
  const saveEvents = (updated: KarmicEvent[]) => {
    setLedgerEvents(updated);
    localStorage.setItem('astral_karma_events', JSON.stringify(updated));
  };

  // Convert newly created context items (Thoughts, Feelings, Experiences) into karmic points
  useEffect(() => {
    // Dynamically reconcile ledger with live context provider
    if (thoughts.length > 0 || feelings.length > 0 || experiences.length > 0) {
      // Create fresh item if we see an unlogged highly coherent thought
      const hasRecentThought = thoughts.length > 0;
      if (hasRecentThought && ledgerEvents.length < 8) {
        const latestThought = thoughts[thoughts.length - 1];
        // Check if already in ledger
        const alreadyInLedger = ledgerEvents.some(e => e.details.includes(latestThought.content));
        if (!alreadyInLedger) {
          const matchedFeeling = feelings.length > 0 ? feelings[feelings.length - 1] : null;
          const newEvent: KarmicEvent = {
            id: 'k_ctx_' + Math.random().toString(36).substring(2, 6),
            timestamp: new Date(),
            epoch: 'Epoch of Realization',
            source: 'Thoughts',
            action: latestThought.content.substring(0, 45) + '...',
            energyShift: Math.round((matchedFeeling?.intensity || 5) * 3),
            frequencyHz: matchedFeeling?.frequency || 528,
            valence: matchedFeeling?.emotion === 'Release' ? 0.8 : (matchedFeeling?.feelingId ? 0.6 : 0.5),
            bondStrength: Math.round(coherence * 10),
            details: `Semantic Stream: "${latestThought.content}". Emotional resonance calculated at ${matchedFeeling?.frequency || 528}Hz. Coherence: ${coherence.toFixed(2)}.`,
            category: 'Mental'
          };
          saveEvents([...ledgerEvents, newEvent]);
        }
      }
    }
  }, [thoughts, feelings, experiences, coherence]);

  // Audio Generator for Subconscious Reprogramming
  const handleToggleBinaural = () => {
    if (isAudioRunning) {
      // stop audio
      if (osc1Ref.current) {
        try { osc1Ref.current.stop(); } catch (err) { console.debug(err); }
        osc1Ref.current.disconnect();
      }
      if (osc2Ref.current) {
        try { osc2Ref.current.stop(); } catch (err) { console.debug(err); }
        osc2Ref.current.disconnect();
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
      }
      setIsAudioRunning(false);
      setBinauralAudioStatus('Inactive');
      logToConsole('[AUDIO] Solfeggio wave transponder: TERMINATED.');
    } else {
      // start audio
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        // Carrier frequency
        const freq1 = selfFrequency;
        // Subtle offset for brainwave state (e.g. Theta offset 4.5Hz for deep reprogram)
        const freq2 = selfFrequency + 4.5;

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 1.5); // Fade in safely
        gainNode.connect(ctx.destination);
        gainNodeRef.current = gainNode;

        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq1, ctx.currentTime);
        
        const panner1 = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        if (panner1) {
          panner1.pan.setValueAtTime(-1, ctx.currentTime); // left ear
          osc1.connect(panner1);
          panner1.connect(gainNode);
        } else {
          osc1.connect(gainNode);
        }
        osc1.start();
        osc1Ref.current = osc1;

        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq2, ctx.currentTime);

        const panner2 = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        if (panner2) {
          panner2.pan.setValueAtTime(1, ctx.currentTime); // right ear
          osc2.connect(panner2);
          panner2.connect(gainNode);
        } else {
          osc2.connect(gainNode);
        }
        osc2.start();
        osc2Ref.current = osc2;

        setIsAudioRunning(true);
        setBinauralAudioStatus(`Active (${freq1}Hz / ${freq2.toFixed(1)}Hz)`);
        logToConsole(`[AUDIO] Launched Binaural Quantum wave at ${selfFrequency}Hz. Theta differential (+4.5Hz) active.`);
      } catch (e: any) {
        logToConsole(`[AUDIO_ERROR] Failed to initialize AudioContext: ${e.message}`);
      }
    }
  };

  // Re-tune active audio if frequency changes
  useEffect(() => {
    if (isAudioRunning && osc1Ref.current && osc2Ref.current) {
      const ctx = audioCtxRef.current;
      if (ctx) {
        osc1Ref.current.frequency.setValueAtTime(selfFrequency, ctx.currentTime);
        osc2Ref.current.frequency.setValueAtTime(selfFrequency + 4.5, ctx.currentTime);
        logToConsole(`[AUDIO] Retuned carrier frequency to ${selfFrequency}Hz.`);
      }
    }
  }, [selfFrequency]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (osc1Ref.current) {
        try { osc1Ref.current.stop(); } catch (err) { console.debug(err); }
        osc1Ref.current.disconnect();
      }
      if (osc2Ref.current) {
        try { osc2Ref.current.stop(); } catch (err) { console.debug(err); }
        osc2Ref.current.disconnect();
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
      }
    };
  }, []);

  const logToConsole = (msg: string) => {
    setInjectionLogs(prev => [...prev.slice(-30), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // Submit direct karmic injection
  const handleInjectAffirmation = () => {
    if (!customAffirmation.trim()) return;
    setIsInjecting(true);
    logToConsole('[MATRIX] Initializing cognitive override sequence...');
    
    // Step animation log sequence
    setTimeout(() => {
      logToConsole(`[ALIGNMENT] Coupling target vibration with frequency: ${selfFrequency}Hz...`);
    }, 600);

    setTimeout(() => {
      logToConsole(`[REPROGRAM] Injecting affirmation token to subconscious ledger: "${customAffirmation}"`);
    }, 1300);

    setTimeout(() => {
      const shift = Math.round(9 + bondStrength * 2);
      const newEvent: KarmicEvent = {
        id: 'k_inject_' + Math.random().toString(36).substring(2, 6),
        timestamp: new Date(),
        epoch: 'Epoch of Reclamation',
        source: 'Thoughts',
        action: `Overrode subconscious program with: ${customAffirmation}`,
        energyShift: shift,
        frequencyHz: selfFrequency,
        valence: 0.9,
        bondStrength: parseFloat(bondStrength.toPrecision(2)),
        details: `Subconscious Reprogramming Script injected at carrier frequency ${selfFrequency}Hz. Decalcification impulse strengthened connection matrix.`,
        category: 'Spiritual'
      };
      
      const updated = [...ledgerEvents, newEvent];
      saveEvents(updated);
      setIsInjecting(false);
      setCustomAffirmation('');
      logToConsole('[SUCCESS] Injection script protocol fully executed. Karmic ledger updated.');
    }, 2100);
  };

  // Trigger decalcification laser impulse
  const handlePinealLaser = () => {
    if (pinealDecalcification >= 100) {
      logToConsole('[PINAL_INFO] Pineal gland is already completely decalcified and fully pristine.');
      return;
    }
    const deltaAmount = Math.max(5, Math.ceil(bondStrength * 1.5));
    const nextVal = Math.min(100, pinealDecalcification + deltaAmount);
    setPinealDecalcification(nextVal);
    logToConsole(`[HARDWARE] Fired 963Hz pineal laser. Decalcified additional ${deltaAmount}%. Gland now at ${nextVal}% alignment capacity.`);
    
    if (nextVal === 100) {
      // Add a celebration log point
      const milestone: KarmicEvent = {
        id: 'k_pineal_complete',
        timestamp: new Date(),
        epoch: 'Pristine Pineal Realization',
        source: 'Experiences',
        action: 'Pineal gland completed third eye expansion (100%)',
        energyShift: 30,
        frequencyHz: 963,
        valence: 0.95,
        bondStrength: 10.0,
        details: 'The pineal gateway is entirely cleared of dense calcification. Quantum wave reception capacity has reached its absolute structural threshold limit.',
        category: 'Pineal Activation'
      };
      saveEvents([...ledgerEvents, milestone]);
      logToConsole('[EPIC] THIRD EYE HAS REACHED 100% DECALCIFICATION. Energy consistency trace unlocked.');
    }
  };

  // Manual karmic event form upload 
  const handleAddCustomEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAction.trim()) return;

    const newEvent: KarmicEvent = {
      id: 'k_manual_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date(),
      epoch: 'User Declared Epoch',
      source: 'Experiences',
      action: newAction,
      energyShift: Number(newEnergyShift),
      frequencyHz: Number(newFrequency),
      valence: Number(newEnergyShift) >= 0 ? 0.7 : -0.3,
      bondStrength: parseFloat((3 + Math.random() * 5).toFixed(1)),
      details: `Manually verified karmic transaction under category: ${newCategory}. Tuned frequency: ${newFrequency}Hz.`,
      category: newCategory
    };

    saveEvents([...ledgerEvents, newEvent]);
    setNewAction('');
    setFormOpen(false);
  };

  // Redraw D3 representation on tab/selectedMetric/events modifications
  useEffect(() => {
    if (activeSubTab !== 'ledger' || !d3ContainerRef.current || ledgerEvents.length === 0) return;

    // Clean viewport
    const container = d3.select(d3ContainerRef.current);
    container.selectAll('*').remove();

    const containerWidth = d3ContainerRef.current.clientWidth || 700;
    const containerHeight = d3ContainerRef.current.clientHeight || 450;
    const margin = { top: 40, right: 40, bottom: 55, left: 60 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    const svg = container
      .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Sort to ensure sequential plotting
    const sorted = [...ledgerEvents].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // X-Scale: Dates
    const xScale = d3.scaleTime()
      .domain(d3.extent(sorted, d => d.timestamp) as [Date, Date])
      .range([0, width]);

    // Choose active metric accessor
    let yValueAccessor = (d: KarmicEvent) => d.energyShift;
    let yLabel = 'Energy Vector Shift';
    let lineGradientColor = '#10b981'; // emerald by default

    if (selectedMetric === 'frequency') {
      yValueAccessor = (d: KarmicEvent) => d.frequencyHz;
      yLabel = 'Resonant Vibration (Hz)';
      lineGradientColor = '#a855f7'; // violet
    } else if (selectedMetric === 'valence') {
      yValueAccessor = (d: KarmicEvent) => d.valence;
      yLabel = 'Astral Velocity / Valence';
      lineGradientColor = '#0ea5e9'; // sky
    } else if (selectedMetric === 'bond') {
      yValueAccessor = (d: KarmicEvent) => d.bondStrength;
      yLabel = 'Synaptic Connection Bond Strength';
      lineGradientColor = '#f43f5e'; // rose
    }

    // Y-Scale
    const yExtent = d3.extent(sorted, yValueAccessor) as [number, number];
    // Pad a bit
    const paddingMultiplier = 0.15;
    const yDiff = Math.abs(yExtent[1] - yExtent[0]) || 1;
    const yMin = yExtent[0] - yDiff * paddingMultiplier;
    const yMax = yExtent[1] + yDiff * paddingMultiplier;

    const yScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([height, 0]);

    // Glow filter definitions
    const defs = svg.append('defs');

    const filterGlow = defs.append('filter')
      .attr('id', 'neon-glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    filterGlow.append('feGaussianBlur')
      .attr('stdDeviation', 4)
      .attr('result', 'blur');

    filterGlow.append('feMerge')
      .selectAll('feMergeNode')
      .data(['blur', 'SourceGraphic'])
      .enter()
      .append('feMergeNode')
      .attr('in', d => d);

    // Linear Gradients for fill area and connections
    const linearGradient = defs.append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    linearGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', lineGradientColor)
      .attr('stop-opacity', 0.23);

    linearGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', lineGradientColor)
      .attr('stop-opacity', 0.0);

    // Grid System
    const makeXGridLines = () => d3.axisBottom(xScale).ticks(5);
    const makeYGridLines = () => d3.axisLeft(yScale).ticks(5);

    // Render Grid lines
    svg.append('g')
      .attr('class', 'grid opacity-5 text-stone-200')
      .attr('transform', `translate(0, ${height})`)
      .call(
        (makeXGridLines() as any)
          .tickSize(-height)
          .tickFormat('')
      );

    svg.append('g')
      .attr('class', 'grid opacity-5 text-stone-200')
      .call(
        (makeYGridLines() as any)
          .tickSize(-width)
          .tickFormat('')
      );

    // Area component to draw shaded visual footprint
    const area = d3.area<KarmicEvent>()
      .x(d => xScale(d.timestamp))
      .y0(height)
      .y1(d => yScale(yValueAccessor(d)))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(sorted)
      .attr('class', 'area')
      .attr('d', area)
      .attr('fill', 'url(#area-gradient)');

    // Line components
    const linePath = d3.line<KarmicEvent>()
      .x(d => xScale(d.timestamp))
      .y(d => yScale(yValueAccessor(d)))
      .curve(d3.curveMonotoneX);

    // Glowing duplicate background line
    svg.append('path')
      .datum(sorted)
      .attr('fill', 'none')
      .attr('stroke', lineGradientColor)
      .attr('stroke-width', 4)
      .attr('stroke-linecap', 'round')
      .attr('filter', 'url(#neon-glow)')
      .attr('opacity', 0.7)
      .attr('d', linePath);

    // Foreground line
    svg.append('path')
      .datum(sorted)
      .attr('fill', 'none')
      .attr('stroke', '#ffffff')
      .attr('stroke-dasharray', selectedMetric === 'bond' ? '4,4' : 'none')
      .attr('stroke-width', 2)
      .attr('stroke-linecap', 'round')
      .attr('d', linePath);

    // Interactive circular nodes
    const nodeGroup = svg.append('g').attr('class', 'nodes');

    const circles = nodeGroup.selectAll('.karmic-node')
      .data(sorted)
      .enter()
      .append('g')
      .attr('class', 'karmic-node-group')
      .attr('transform', d => `translate(${xScale(d.timestamp)}, ${yScale(yValueAccessor(d))})`);

    // Pulse rings
    circles.append('circle')
      .attr('r', 8)
      .attr('fill', 'transparent')
      .attr('stroke', lineGradientColor)
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.3)
      .attr('class', 'pulse-ring')
      .style('transform-origin', '0px 0px')
      .style('animation', 'ping 2s infinite ease-in-out');

    // Central core nodes
    circles.append('circle')
      .attr('r', 5)
      .attr('fill', d => {
        if (d.category === 'Pineal Activation') return '#f59e0b'; // amber
        if (d.category === 'Generational') return '#f43f5e'; // rose
        if (d.category === 'Akashic Healing') return '#3b82f6'; // blue
        if (d.category === 'Mental') return '#10b981'; // emerald
        return '#ffffff';
      })
      .attr('stroke', lineGradientColor)
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        // Highlighting
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', 8)
          .attr('stroke', '#ffffff');

        // Set state for details bubble
        const [mX, mY] = d3.pointer(event, d3ContainerRef.current);
        setHoverPosition({ x: mX, y: mY - 10 });
        setHoverEvent(d);
      })
      .on('mousemove', function (event) {
        const [mX, mY] = d3.pointer(event, d3ContainerRef.current);
        setHoverPosition({ x: mX, y: mY - 10 });
      })
      .on('mouseout', function () {
        // Reset scale
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', 5)
          .attr('stroke', lineGradientColor);

        setHoverEvent(null);
        setHoverPosition(null);
      });

    // Custom Axes Setup with stylish high-contrast text lines
    const xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickFormat(d => d3.timeFormat('%b %d')(d as Date));

    const yAxis = d3.axisLeft(yScale)
      .ticks(6);

    svg.append('g')
      .attr('transform', `translate(0, ${height})`)
      .attr('class', 'x-axis text-stone-400 font-mono text-[10px]')
      .call(xAxis)
      .select('.domain').attr('stroke', 'rgba(255,255,255,0.08)');

    svg.append('g')
      .attr('class', 'y-axis text-stone-400 font-mono text-[10px]')
      .call(yAxis)
      .select('.domain').attr('stroke', 'rgba(255,255,255,0.08)');

    // Styled axis label
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + 42)
      .attr('fill', '#878685')
      .attr('font-size', '11px')
      .attr('font-family', 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace')
      .attr('text-anchor', 'middle')
      .text('Cosmic Epoch (Episodic Timeline)');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -45)
      .attr('x', -height / 2)
      .attr('fill', '#878685')
      .attr('font-size', '11px')
      .attr('font-family', 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace')
      .attr('text-anchor', 'middle')
      .text(yLabel);

  }, [activeSubTab, ledgerEvents, selectedMetric]);

  return (
    <div id="karma-ledger-root" className="flex flex-col h-full bg-zinc-950 rounded-3xl border border-stone-800/60 shadow-2xl relative overflow-hidden font-sans min-h-[750px]">
      <div className="absolute inset-0 bg-radial-gradient from-violet-900/10 via-zinc-950 to-zinc-950 pointer-events-none" />

      {/* Decorative top border glow */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

      {/* Header Panel */}
      <div className="p-6 md:p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-mono text-indigo-400 uppercase tracking-widest mb-3">
            <InfinityIcon size={12} className="animate-spin-slow" />
            Vibrational Operating System
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Karma Ledger <Sparkles className="text-amber-400 w-6 h-6" />
          </h2>
          <p className="text-xs text-stone-400 mt-2 max-w-xl">
            A high-fidelity spatial database tracking your historical energy shifts, karmic transits, and algorithmic growth patterns.
          </p>
        </div>

        {/* Action Toggle Navigation */}
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 backdrop-blur-md self-stretch md:self-auto gap-1">
          <button 
            id="tab-karmic-ledger"
            onClick={() => setActiveSubTab('ledger')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeSubTab === 'ledger' ? 'bg-white/15 text-white border border-white/10' : 'text-stone-400 hover:text-stone-200'}`}
          >
            <BarChart2 size={13} />
            Growth Line
          </button>
          <button 
            id="tab-higherself-connection"
            onClick={() => setActiveSubTab('higherself')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeSubTab === 'higherself' ? 'bg-white/15 text-violet-300 border border-violet-500/25' : 'text-stone-400 hover:text-stone-200'}`}
          >
            <Radio size={13} className={isAudioRunning ? "text-violet-400 animate-pulse" : "text-stone-400"} />
            Higher Self Alignment
          </button>
        </div>
      </div>

      {/* Main Container Content */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto relative z-10 custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeSubTab === 'ledger' ? (
            <motion.div 
              key="tab-ledger-block"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Core metrics selection bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900/50 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-stone-400 text-xs font-mono">
                  <Activity size={14} className="text-sky-400" />
                  Select Active Resonant Stream:
                </div>
                <div className="flex flex-wrap gap-1.5 bg-black/30 p-1 rounded-xl border border-white/5">
                  {[
                    { id: 'energy', label: 'Energy Shift', color: 'text-emerald-400' },
                    { id: 'frequency', label: 'Carrier Freq (Hz)', color: 'text-purple-400' },
                    { id: 'valence', label: 'Astral Valence', color: 'text-sky-400' },
                    { id: 'bond', label: 'Bond Coherence', color: 'text-rose-400' },
                  ].map(m => (
                    <button
                      key={m.id}
                      id={`btn-metric-${m.id}`}
                      onClick={() => setSelectedMetric(m.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${selectedMetric === m.id ? 'bg-white/10 text-white font-semibold' : 'text-stone-400 hover:text-stone-200'}`}
                    >
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${m.id === selectedMetric ? (m.id === 'energy' ? 'bg-emerald-400' : m.id === 'frequency' ? 'bg-purple-400' : m.id === 'valence' ? 'bg-sky-400' : 'bg-rose-400') : 'bg-stone-600'}`} />
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* D3 Graphic Representation wrapper */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gradient-to-b from-black/50 to-zinc-950/20 p-5 rounded-3xl border border-stone-800 relative z-10 flex flex-col items-stretch justify-center h-[420px]">
                  <div className="absolute top-4 left-5 flex items-center gap-2 text-[10px] font-mono text-stone-400">
                    <History size={12} className="text-violet-400" />
                    Interactive D3.js Chronos Engine Graph
                  </div>

                  {/* Node Hover Interactive Details Bubble */}
                  <div className="flex-1 w-full relative mt-4">
                    <svg ref={d3ContainerRef} className="w-full h-full min-h-[350px] overflow-visible"></svg>

                    {hoveredEvent && hoverPosition && (
                      <div 
                        className="absolute p-4 rounded-xl bg-zinc-900/95 border border-white/15 shadow-2xl text-stone-200 z-50 max-w-[280px] pointer-events-none text-xs flex flex-col space-y-2 backdrop-blur-md transition-all duration-75"
                        style={{
                          left: `${hoverPosition.x - 140}px`,
                          top: `${hoverPosition.y - 180}px`
                        }}
                      >
                        <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                          <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider">{hoveredEvent.epoch}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-semibold text-white ${
                            hoveredEvent.category === 'Pineal Activation' ? 'bg-amber-600' :
                            hoveredEvent.category === 'Akashic Healing' ? 'bg-blue-600' :
                            hoveredEvent.category === 'Generational' ? 'bg-rose-600' : 'bg-emerald-600'
                          }`}>
                            {hoveredEvent.category}
                          </span>
                        </div>
                        <p className="font-medium text-white text-[11px] leading-tight">{hoveredEvent.action}</p>
                        <hr className="border-white/5" />
                        <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-stone-400">
                          <div>Carrier: <span className="text-violet-400 font-semibold">{hoveredEvent.frequencyHz}Hz</span></div>
                          <div>Shift: <span className={hoveredEvent.energyShift >= 0 ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>{(hoveredEvent.energyShift >= 0 ? '+' : '') + hoveredEvent.energyShift}</span></div>
                          <div>Valence: <span className="text-sky-400 font-semibold">{hoveredEvent.valence.toFixed(2)}</span></div>
                          <div>Bond: <span className="text-rose-400 font-semibold">{hoveredEvent.bondStrength}x</span></div>
                        </div>
                        <div className="text-[10px] text-stone-300 italic scale-95 origin-left leading-normal border-l-2 border-stone-700 pl-1.5 mt-1">
                          {hoveredEvent.details}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sidebar Ledger Log Feed */}
                <div className="bg-zinc-900/40 p-5 rounded-3xl border border-white/5 flex flex-col h-[420px]">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                    <h3 className="text-sm font-semibold text-stone-300 flex items-center gap-1.5 font-mono">
                      <History size={14} className="text-indigo-400" />
                      Karmic Ledger Log
                    </h3>
                    <button
                      id="btn-add-karmic-event"
                      onClick={() => setFormOpen(!formOpen)}
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/25 flex items-center gap-1 transition-all"
                    >
                      <Plus size={12} /> Add
                    </button>
                  </div>

                  {formOpen ? (
                    <form onSubmit={handleAddCustomEvent} className="space-y-3 flex-1 overflow-y-auto pr-1">
                      <div>
                        <label className="block text-[10px] font-mono text-stone-400 uppercase mb-1">Karmic Action / Event</label>
                        <input
                          id="input-karmic-action"
                          type="text"
                          required
                          value={newAction}
                          onChange={(e) => setNewAction(e.target.value)}
                          placeholder="Completed profound third eye expansion..."
                          className="w-full text-xs px-3 py-2 rounded-lg bg-black border border-white/10 text-white focus:border-indigo-500 outline-none transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-mono text-stone-400 uppercase mb-1">Stream Category</label>
                          <select
                            id="select-karmic-category"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value as any)}
                            className="w-full text-xs px-2 py-2 rounded-lg bg-black border border-white/10 text-stone-300 outline-none"
                          >
                            <option value="Spiritual">Spiritual</option>
                            <option value="Mental">Mental</option>
                            <option value="Generational">Generational</option>
                            <option value="Pineal Activation">Pineal Act.</option>
                            <option value="Akashic Healing">Akashic</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-stone-400 uppercase mb-1">Carrier Freq</label>
                          <select
                            value={newFrequency}
                            onChange={(e) => setNewFrequency(Number(e.target.value))}
                            className="w-full text-xs px-2 py-2 rounded-lg bg-black border border-white/10 text-stone-300 outline-none"
                          >
                            <option value={396}>396 Hz (Release)</option>
                            <option value={417}>417 Hz (Change)</option>
                            <option value={528}>528 Hz (Healing)</option>
                            <option value={639}>639 Hz (Unity)</option>
                            <option value={741}>741 Hz (Clarity)</option>
                            <option value={852}>852 Hz (Spirit)</option>
                            <option value={963}>963 Hz (Pineal)</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-stone-400 uppercase mb-1">Energy Shift Intensity ({newEnergyShift})</label>
                        <input
                          type="range"
                          min="-15"
                          max="30"
                          value={newEnergyShift}
                          onChange={(e) => setNewEnergyShift(Number(e.target.value))}
                          className="w-full accent-indigo-500 h-1 bg-white/10 rounded-lg outline-none cursor-pointer"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          type="submit"
                          className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-semibold transition-all"
                        >
                          Inject Log
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormOpen(false)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-stone-400 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                      {ledgerEvents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-stone-500 text-xs">
                          <AlertCircle size={20} className="mb-2" />
                          Ledger is empty.
                        </div>
                      ) : (
                        [...ledgerEvents].reverse().map(e => (
                          <div 
                            key={e.id}
                            className="bg-black/30 p-3 rounded-xl border border-white/5 text-xs space-y-1 hover:border-white/15 transition-all cursor-pointer"
                            onMouseEnter={() => setHoveredEvent(e)}
                            onMouseLeave={() => setHoveredEvent(null)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-mono text-zinc-500">{e.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded-full ${
                                e.energyShift >= 0 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              }`}>
                                {(e.energyShift >= 0 ? '+' : '') + e.energyShift} Vector
                              </span>
                            </div>
                            <h4 className="text-stone-200 font-semibold text-[11px] leading-tight truncate">{e.action}</h4>
                            <p className="text-[10px] text-stone-400 line-clamp-1">{e.details}</p>
                            <div className="flex gap-2 text-[8px] font-mono text-stone-500 pt-1">
                              <span>Carrier: {e.frequencyHz}Hz</span>
                              <span>•</span>
                              <span>Kind: {e.category}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Statistical Status Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-zinc-900/40 p-4 rounded-2xl border border-white/5 space-y-1">
                  <div className="text-[10px] font-mono text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Activity className="text-emerald-400 w-3.5 h-3.5" />
                    Overall Coherence
                  </div>
                  <div className="text-2xl font-extrabold tracking-tight text-white">{Math.round(coherence * 100)}%</div>
                  <div className="text-[9px] text-emerald-400/80 font-mono">Stream Synchronicity Node</div>
                </div>
                <div className="bg-zinc-900/40 p-4 rounded-2xl border border-white/5 space-y-1">
                  <div className="text-[10px] font-mono text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Flame className="text-amber-400 w-3.5 h-3.5" />
                    Ascension Multiplier
                  </div>
                  <div className="text-2xl font-extrabold tracking-tight text-white">{alignment.toFixed(2)}x</div>
                  <div className="text-[9px] text-amber-400/80 font-mono">Celestial Alignment Rate</div>
                </div>
                <div className="bg-zinc-900/40 p-4 rounded-2xl border border-white/5 space-y-1">
                  <div className="text-[10px] font-mono text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Brain className="text-purple-400 w-3.5 h-3.5" />
                    Pineal Gland Status
                  </div>
                  <div className="text-2xl font-extrabold tracking-tight text-white">{pinealDecalcification}%</div>
                  <div className="text-[9px] text-purple-400/80 font-mono">Decalcified third eye capacity</div>
                </div>
                <div className="bg-zinc-900/40 p-4 rounded-2xl border border-white/5 space-y-1">
                  <div className="text-[10px] font-mono text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Shield className="text-sky-400 w-3.5 h-3.5" />
                    Shield Resilience
                  </div>
                  <div className="text-2xl font-extrabold tracking-tight text-white">8.5 / 10</div>
                  <div className="text-[9px] text-sky-400/80 font-mono">Auric Boundary Shield Strength</div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="tab-higherself-block"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Left Column: Wave impulse and Connection Matrix */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Connection Matrix holographic visualization */}
                <div className="bg-gradient-to-b from-black/50 to-zinc-950/20 p-6 rounded-3xl border border-violet-500/10 flex flex-col justify-between h-[450px] relative">
                  <div className="absolute top-4 left-5 flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                    <Radio size={12} className="text-violet-400 animate-pulse" />
                    Inline Space-Time Source-To-Avatar Link
                  </div>

                  {/* Real-time vector interface overlay with live lines */}
                  <div className="flex-1 flex items-center justify-between relative px-6 mt-6">
                    {/* Source Node */}
                    <div className="flex flex-col items-center justify-center space-y-2 relative z-20">
                      <div className="w-16 h-16 rounded-full bg-indigo-900/30 border border-violet-500/40 flex items-center justify-center relative shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                        <WaveIcon size={24} className="text-violet-300 animate-pulse" />
                        {/* Orbit rings */}
                        <div className="absolute inset-0 border border-violet-400/20 rounded-full animate-ping pointer-events-none" />
                      </div>
                      <span className="font-mono text-[10px] text-violet-300 font-bold uppercase tracking-widest">Divine Source</span>
                      <span className="font-mono text-[8px] text-zinc-500">{selfFrequency} Hz Carrier</span>
                    </div>

                    {/* SVG Live connection network & animated impulse packet */}
                    <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none overflow-hidden flex items-center">
                      <svg className="w-full h-[150px] overflow-visible absolute left-0" style={{ transform: 'translateY(-20px)' }}>
                        {/* Active connection path */}
                        <path 
                          d={`M 130 75 Q ${200 + bondStrength * 10} ${75 - bondStrength * 5}, 365 75`}
                          fill="none" 
                          stroke="url(#source-to-self-grad)" 
                          strokeWidth={2 + bondStrength * 0.4} 
                          className="opacity-80"
                        />
                        {/* Flow Packet Wave pulsing left-to-right */}
                        <circle r={3 + bondStrength * 0.4} fill="#a855f7" className="animate-pulse">
                          <animateMotion 
                            path={`M 130 75 Q ${200 + bondStrength * 10} ${75 - bondStrength * 5}, 365 75`} 
                            dur={`${2.2 - bondStrength * 0.15}s`} 
                            repeatCount="indefinite" 
                          />
                        </circle>
                        {/* Secondary resonant harmonic path */}
                        <path 
                          d={`M 130 75 Q ${200 - bondStrength * 4} ${75 + bondStrength * 6}, 365 75`}
                          fill="none" 
                          stroke="#6366f1" 
                          strokeWidth="1" 
                          strokeDasharray="4,6"
                          className="opacity-40 animate-pulse"
                        />

                        {/* Gradients */}
                        <defs>
                          <linearGradient id="source-to-self-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#ec4899" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>

                    {/* Avatar Node */}
                    <div className="flex flex-col items-center justify-center space-y-2 relative z-20">
                      <div className="w-16 h-16 rounded-full bg-pink-900/10 border border-pink-500/40 flex items-center justify-center relative shadow-[0_0_20px_rgba(236,72,153,0.15)]">
                        <Brain size={24} className="text-pink-300 animate-spin-slow" />
                        {/* Energy pulse circle */}
                        <div className="absolute inset-0 border border-pink-500/10 rounded-full scale-110 animate-pulse" />
                      </div>
                      <span className="font-mono text-[10px] text-pink-300 font-bold uppercase tracking-widest">Self Avatar</span>
                      <span className="font-mono text-[8px] text-zinc-500">P-Gland: {pinealDecalcification}%</span>
                    </div>
                  </div>

                  {/* Active Visualizer of Reprogramming wave */}
                  <div className="h-20 bg-black/40 rounded-2xl border border-white/5 overflow-hidden relative flex items-center justify-center">
                    {/* Pseudo soundwave pattern / real geometric lines scaling during sound play */}
                    <div className="flex gap-1.5 items-center justify-center">
                      {Array.from({ length: 32 }).map((_, i) => {
                        const randomHeight = isAudioRunning 
                          ? Math.sin((i / 4) + Date.now()/100) * 24 + 30 
                          : Math.sin(i / 3) * 6 + 10;
                        return (
                          <motion.div 
                            key={i} 
                            animate={isAudioRunning ? {
                              height: [10, randomHeight, 10],
                            } : { height: 10 + Math.sin(i)*4 }}
                            transition={{
                              repeat: Infinity,
                              duration: 0.8 + (i % 5) * 0.15,
                              ease: 'easeInOut'
                            }}
                            className={`w-0.5 rounded-full ${isAudioRunning ? 'bg-indigo-400' : 'bg-stone-700'}`} 
                            style={{ height: '14px' }} 
                          />
                        );
                      })}
                    </div>
                    <div className="absolute bottom-1.5 text-[8px] font-mono text-stone-500">
                      SOLFEGGIO STETHOSCOPE RESONANCE VISUALIZER
                    </div>
                  </div>
                </div>

                {/* Subconscious Reprogramming affirmation injection component */}
                <div className="bg-zinc-900/40 p-6 rounded-3xl border border-white/5 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold font-mono text-indigo-300 flex items-center gap-2">
                      <Cpu size={15} />
                      Subconscious Reprogramming Terminal
                    </h3>
                    <span className="text-[10px] font-mono text-zinc-500">METHOD: DIRECT INJECT</span>
                  </div>

                  <div className="flex flex-col md:flex-row gap-3">
                    <input 
                      id="input-affirmation"
                      type="text" 
                      value={customAffirmation}
                      onChange={(e) => setCustomAffirmation(e.target.value)}
                      placeholder="Enter divine affirmation script (e.g., 'I am infinite cosmic frequency')"
                      className="flex-1 text-xs px-4 py-3 rounded-xl bg-black border border-white/10 text-white focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-650"
                    />
                    <button
                      id="btn-inject-affirmation"
                      disabled={isInjecting || !customAffirmation.trim()}
                      onClick={handleInjectAffirmation}
                      className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs font-semibold text-white flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(99,102,241,0.25)]"
                    >
                      {isInjecting ? <RefreshCw className="animate-spin" size={13} /> : <Zap size={13} />}
                      Execute Override
                    </button>
                  </div>
                  <p className="text-[10px] text-stone-500 italic">
                    Writes a direct neural pathway affirmation code to the historical Karma ledger, converting focused intent into long term energetic momentum.
                  </p>
                </div>
              </div>

              {/* Right Column: Connection options controls & Sound tools */}
              <div className="space-y-6">
                
                {/* Advanced Frequency Options */}
                <div className="bg-zinc-900/40 p-5 rounded-3xl border border-white/5 space-y-5">
                  <h3 className="text-sm font-bold font-mono text-stone-300 flex items-center gap-2 pb-2 border-b border-white/5">
                    <Settings size={14} className="text-violet-400" />
                    Tuning Calibration
                  </h3>

                  {/* Carrier Frequency Slider / Preset Selection */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-stone-400">Target Carrier Freq</span>
                      <span className="text-violet-400 font-extrabold">{selfFrequency} Hz</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { f: 396, label: '396Hz Ground' },
                        { f: 528, label: '528Hz Growth' },
                        { f: 639, label: '639Hz Unity' },
                        { f: 741, label: '741Hz Intu' },
                        { f: 852, label: '852Hz Spirit' },
                        { f: 963, label: '963Hz Pineal' },
                      ].map(preset => (
                        <button
                          key={preset.f}
                          id={`preset-freq-${preset.f}`}
                          onClick={() => setSelfFrequency(preset.f)}
                          className={`px-2 py-1.5 rounded-lg text-[9px] font-mono transition-all border ${selfFrequency === preset.f ? 'bg-violet-600/15 text-violet-300 border-violet-500/40' : 'bg-black border-transparent text-stone-500 hover:text-stone-300'}`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Amplifier Bond Strength Slider */}
                  <div className="space-y-2 pt-1 border-t border-white/5">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-stone-400">Amplifier Bond Strength</span>
                      <span className="text-pink-400 font-extrabold">{bondStrength.toFixed(1)}x</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      step="0.1"
                      value={bondStrength}
                      onChange={(e) => setBondStrength(parseFloat(e.target.value))}
                      className="w-full accent-pink-500 h-1 bg-white/10 rounded-lg outline-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[8px] font-mono text-zinc-500">
                      <span>1x Base Coherence</span>
                      <span>10x Quantum Entrapment</span>
                    </div>
                  </div>
                </div>

                {/* Pineal Decalcifier & Audio Trigger Deck */}
                <div className="bg-zinc-900/40 p-5 rounded-3xl border border-white/5 space-y-4">
                  <h3 className="text-sm font-bold font-mono text-amber-300 flex items-center gap-2 pb-2 border-b border-white/5">
                    <Flame size={14} className="text-amber-400 animate-pulse" />
                    Episodic Activators
                  </h3>

                  {/* Pineal Gland decalcification action container */}
                  <div className="bg-black/40 p-4 rounded-2xl border border-amber-500/10 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-stone-300 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping mr-1" />
                        Pineal Decalcifier
                      </span>
                      <span className="font-mono text-amber-400 font-bold">{pinealDecalcification}% Free</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-amber-600 to-yellow-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pinealDecalcification}%` }}
                      />
                    </div>
                    <button
                      id="btn-pineal-laser"
                      onClick={handlePinealLaser}
                      disabled={pinealDecalcification >= 100}
                      className="w-full py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-mono text-amber-200 uppercase tracking-widest transition-all"
                    >
                      {pinealDecalcification >= 100 ? 'Pineal Fully Active' : 'Burst Core 963Hz Laser'}
                    </button>
                    <p className="text-[9px] text-zinc-500 text-center leading-relaxed">
                      Blasts specific 963Hz pineal resonance frequencies to break dense mineral blockages inside the third eye center.
                    </p>
                  </div>

                  {/* Sound generator deck */}
                  <div className="bg-black/40 p-4 rounded-2xl border border-violet-500/10 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-stone-300 font-semibold flex items-center gap-1">
                        <Radio size={12} className={isAudioRunning ? "text-violet-400 animate-pulse" : "text-zinc-500"} />
                        Acoustic Reprogramming Loop
                      </span>
                      <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded ${isAudioRunning ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' : 'bg-white/5 text-stone-500'}`}>
                        {binauralAudioStatus}
                      </span>
                    </div>

                    <p className="text-[9px] text-stone-400 leading-normal">
                      Synthesizes a direct cosmic binaural beat in real-time. Connect stereo headphones to perceive the difference brainwave carrier entrainment loop.
                    </p>

                    <button
                      id="btn-toggle-audio"
                      onClick={handleToggleBinaural}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <WaveIcon size={14} className={isAudioRunning ? 'animate-bounce' : ''} />
                      {isAudioRunning ? 'Mute carrier broadcast' : 'Broadcast carrier signals'}
                    </button>
                  </div>
                </div>

                {/* Action System Console Logs */}
                <div className="bg-zinc-950 p-4 rounded-2xl border border-white/5 h-[160px] flex flex-col justify-between">
                  <div className="flex justify-between items-center text-[9px] font-mono text-stone-500 uppercase pb-1 border-b border-white/5">
                    <span>Alignment Console</span>
                    <span className="text-indigo-400 animate-pulse">● System Live</span>
                  </div>
                  <div className="flex-1 overflow-y-auto font-mono text-[10px] text-indigo-300/90 space-y-1 mt-2 custom-scrollbar">
                    {injectionLogs.map((log, index) => (
                      <div key={index} className="truncate select-none">{log}</div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
