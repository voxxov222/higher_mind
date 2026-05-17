import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Network, Folder, File, FileText, Share2, Plus, Edit3, Eye, Zap, Save, Trash2, Search, Settings, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import * as d3 from 'd3';
import { soundEngine } from '../lib/soundEffects';

interface VaultNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  links: string[]; // IDs of other notes it links to
  createdAt: number;
  updatedAt: number;
}

const DEFAULT_NOTES: VaultNote[] = [
  {
    id: 'root',
    title: 'Root Concepts',
    content: '# Root Concepts\n\nThis is the genesis of your Akashic Vault. From here, you can branch out into different domains like [[astrology]] and [[kabbalah]].\n\n- Spiritual synchronicity\n- Neural mapping\n- Quantum entanglement',
    tags: ['genesis', 'core'],
    links: ['astrology', 'kabbalah'],
    createdAt: Date.now() - 100000,
    updatedAt: Date.now() - 100000,
  },
  {
    id: 'astrology',
    title: 'Astrology',
    content: '# Astrology\n\nThe study of the movements and relative positions of celestial bodies interpreted as having an influence on human affairs and the natural world.\n\nConnects strongly with [[hermetic-principles]].',
    tags: ['celestial', 'stars'],
    links: ['hermetic-principles'],
    createdAt: Date.now() - 50000,
    updatedAt: Date.now() - 50000,
  },
  {
    id: 'kabbalah',
    title: 'Kabbalah',
    content: '# Kabbalah\n\nAn esoteric method, discipline, and school of thought in Jewish mysticism.\n\nThe Tree of Life represents the map of creation. See [[hermetic-principles]].',
    tags: ['mysticism', 'sephirot'],
    links: ['hermetic-principles'],
    createdAt: Date.now() - 40000,
    updatedAt: Date.now() - 40000,
  },
  {
    id: 'hermetic-principles',
    title: 'Hermetic Principles',
    content: '# Hermetic Principles\n\n1. Mentalism\n2. Correspondence\n3. Vibration\n4. Polarity\n5. Rhythm\n6. Cause and Effect\n7. Gender\n\n"As above, so below" - linking the [[astrology]] with the inner self.',
    tags: ['hermetic', 'laws'],
    links: ['astrology'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
];

export const ObsidianVaultSection = () => {
  const [notes, setNotes] = useState<VaultNote[]>(DEFAULT_NOTES);
  const [activeNoteId, setActiveNoteId] = useState<string | null>('root');
  const [mode, setMode] = useState<'edit' | 'preview' | 'graph'>('preview');
  const [searchQuery, setSearchQuery] = useState('');
  
  const activeNote = useMemo(() => notes.find(n => n.id === activeNoteId), [notes, activeNoteId]);

  const handleCreateNote = () => {
    soundEngine.click();
    const newNote: VaultNote = {
      id: Math.random().toString(36).substring(7),
      title: 'Untitled ' + Math.floor(Math.random() * 1000),
      content: '# New Note\n\nStart typing here...',
      tags: [],
      links: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    setMode('edit');
  };

  const handleUpdateNote = (field: 'title' | 'content', value: string) => {
    if (!activeNoteId) return;
    
    setNotes(notes.map(note => {
      if (note.id === activeNoteId) {
        const updated = { ...note, [field]: value, updatedAt: Date.now() };
        
        // Auto-extract wikilinks like [[Note Title]] and map them to IDs
        if (field === 'content') {
           const wikilinkRegex = /\[\[([^\]]+)\]\]/g;
           const matches = [...value.matchAll(wikilinkRegex)];
           const links: string[] = [];
           matches.forEach(match => {
             const title = match[1].toLowerCase();
             // Find note by title
             const linkedNote = notes.find(n => n.title.toLowerCase() === title);
             if (linkedNote) links.push(linkedNote.id);
           });
           updated.links = [...new Set(links)]; // deduplicate
        }
        
        return updated;
      }
      return note;
    }));
  };

  const handleDeleteNote = (id: string) => {
    soundEngine.close();
    setNotes(notes.filter(n => n.id !== id));
    if (activeNoteId === id) setActiveNoteId(notes[0]?.id || null);
  };

  const filteredNotes = useMemo(() => {
    if (!searchQuery) return notes;
    return notes.filter(n => 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [notes, searchQuery]);

  return (
    <div className="h-full flex gap-4 relative z-10 overflow-hidden">
      
      {/* LEFT SIDEBAR - FILE EXPLORER */}
      <div className="w-64 bg-stone-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-4 flex flex-col shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-sm uppercase tracking-widest font-bold flex items-center gap-2">
            <Folder size={14} className="text-purple-400" /> Akashic Vault
          </h3>
          <button 
            onClick={handleCreateNote}
            onMouseEnter={() => soundEngine.hover()}
            className="p-1.5 hover:bg-white/10 rounded-lg text-stone-400 hover:text-white transition-all"
            title="New Note"
          >
            <Plus size={16} />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
          <input 
            type="text" 
            placeholder="Search notes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-purple-500/50 transition-all"
          />
        </div>

        {/* Note List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
          {filteredNotes.map(note => (
            <button
              key={note.id}
              onClick={() => { soundEngine.open(); setActiveNoteId(note.id); if(mode === 'graph') setMode('preview'); }}
              onMouseEnter={() => soundEngine.hover()}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between group transition-all ${
                activeNoteId === note.id && mode !== 'graph'
                  ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30' 
                  : 'text-stone-400 hover:bg-white/5 hover:text-stone-200 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <FileText size={12} className={activeNoteId === note.id && mode !== 'graph' ? 'text-purple-400' : 'text-stone-500'} />
                <span className="truncate">{note.title}</span>
              </div>
            </button>
          ))}
        </div>
        
        {/* Toggle Graph View Button bottom */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <button
            onClick={() => { soundEngine.scan(); setMode('graph'); }}
            onMouseEnter={() => soundEngine.hover()}
            className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
              mode === 'graph' 
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                : 'bg-black/40 text-stone-400 border border-white/10 hover:border-white/20 hover:text-white'
            }`}
          >
            <Network size={14} /> Graph View
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl flex flex-col overflow-hidden shadow-inset-subtle relative">
        
        {mode === 'graph' ? (
          <GraphView notes={notes} onNodeClick={(id) => { setActiveNoteId(id); setMode('preview'); }} />
        ) : (
          activeNote ? (
            <>
              {/* Note Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex-1 mr-4">
                  {mode === 'edit' ? (
                    <input 
                      type="text" 
                      value={activeNote.title}
                      onChange={(e) => handleUpdateNote('title', e.target.value)}
                      className="w-full bg-transparent border-none text-2xl font-light text-white focus:outline-none focus:ring-0 p-0"
                      placeholder="Note Title"
                    />
                  ) : (
                    <h2 className="text-2xl font-light text-white">{activeNote.title}</h2>
                  )}
                </div>
                <div className="flex items-center gap-2 bg-stone-900/80 p-1.5 rounded-xl border border-white/10">
                  <button
                    onClick={() => { soundEngine.click(); setMode('edit'); }}
                    className={`p-2 rounded-lg text-sm transition-all ${mode === 'edit' ? 'bg-purple-500/20 text-purple-300' : 'text-stone-400 hover:text-white hover:bg-white/5'}`}
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => { soundEngine.click(); setMode('preview'); }}
                    className={`p-2 rounded-lg text-sm transition-all ${mode === 'preview' ? 'bg-purple-500/20 text-purple-300' : 'text-stone-400 hover:text-white hover:bg-white/5'}`}
                  >
                    <Eye size={16} />
                  </button>
                  <div className="w-px h-6 bg-white/10 mx-1"></div>
                  <button
                    onClick={() => handleDeleteNote(activeNote.id)}
                    className="p-2 rounded-lg text-sm text-stone-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Note Body */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
                {mode === 'edit' ? (
                  <textarea
                    value={activeNote.content}
                    onChange={(e) => handleUpdateNote('content', e.target.value)}
                    className="w-full h-full min-h-[500px] bg-transparent text-stone-300 resize-none focus:outline-none font-mono text-sm leading-relaxed"
                    placeholder="Type your markdown here..."
                  />
                ) : (
                  <div className="prose prose-invert prose-purple max-w-3xl mx-auto font-light leading-relaxed">
                    <ReactMarkdown 
                      components={{
                        p: ({node, ...props}) => {
                          // Simple client-side hack to highlight [[links]] in preview
                          if (typeof props.children === 'string') {
                            // Using a somewhat simplistic approach for display, full parsing is complex for ReactMarkdown without custom plugins
                            // But ReactMarkdown renders children as array if it contains links.
                          }
                          return <p className="mb-6" {...props} />
                        },
                        a: ({node, ...props}) => <a className="text-purple-400 hover:text-purple-300 hover:underline decoration-purple-500/30 underline-offset-4 transition-all" {...props} />,
                        h1: ({node, ...props}) => <h1 className="text-3xl font-light text-white mb-6 tracking-wide" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-2xl font-light text-white mt-10 mb-4 tracking-wide" {...props} />,
                        ul: ({node, ...props}) => <ul className="space-y-2 mb-6 ml-4 list-disc marker:text-purple-500" {...props} />,
                        li: ({node, ...props}) => <li className="text-stone-300 pl-2" {...props} />
                      }}
                    >
                      {activeNote.content.replace(/\[\[([^\]]+)\]\]/g, '[$1](#)')}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-stone-500">
              <Folder size={48} className="mb-4 opacity-20" />
              <p>Select a note to view or create a new one.</p>
            </div>
          )
        )}
      </div>

    </div>
  );
};

// D3 Force Graph Component
const GraphView = ({ notes, onNodeClick }: { notes: VaultNote[], onNodeClick: (id: string) => void }) => {
  const d3Container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!d3Container.current || notes.length === 0) return;

    soundEngine.scan();

    const width = d3Container.current.clientWidth;
    const height = d3Container.current.clientHeight;

    // Prepare data
    const nodes = notes.map(n => ({ id: n.id, title: n.title, radius: 15 + Math.sqrt(n.content.length) * 0.2 }));
    
    // Find links
    const links: any[] = [];
    notes.forEach(note => {
      note.links.forEach(targetId => {
        // Ensure target exists
        if (nodes.find(n => n.id === targetId)) {
          links.push({ source: note.id, target: targetId, value: 1 });
        }
      });
      
      // Also look for inverse links where target note's title is in this note's content using exact wording
      notes.forEach(otherNote => {
          if (note.id !== otherNote.id && !note.links.includes(otherNote.id)) {
              if (note.content.toLowerCase().includes(`[[${otherNote.title.toLowerCase()}]]`)) {
                 links.push({ source: note.id, target: otherNote.id, value: 1 });
              }
          }
      });
    });

    d3Container.current.innerHTML = '';
    const svg = d3.select(d3Container.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .call(d3.zoom().on('zoom', (event) => {
        svgGroup.attr('transform', event.transform);
      }) as any);

    const svgGroup = svg.append('g');

    // Add glowing filter
    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'glow');
    filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius((d: any) => d.radius + 10));

    const link = svgGroup.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', 'rgba(168, 85, 247, 0.3)')
      .attr('stroke-width', 2);

    const node = svgGroup.append('g')
      .selectAll('g')
      .data(nodes)
      .enter().append('g')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any)
      .on('click', (event, d: any) => {
        soundEngine.click();
        onNodeClick(d.id);
      })
      .on('mouseover', function(event, d) {
          d3.select(this).select('circle').attr('fill', '#c084fc');
          d3.select(this).select('text').attr('opacity', 1).attr('font-weight', 'bold');
          soundEngine.hover();
      })
      .on('mouseout', function(event, d) {
          d3.select(this).select('circle').attr('fill', '#9333ea');
          d3.select(this).select('text').attr('opacity', 0.8).attr('font-weight', 'normal');
      });

    node.append('circle')
      .attr('r', (d: any) => d.radius)
      .attr('fill', '#9333ea')
      .attr('style', 'filter: url(#glow)');

    node.append('text')
      .text((d: any) => d.title)
      .attr('x', (d: any) => d.radius + 8)
      .attr('y', 4)
      .attr('fill', '#e5e7eb')
      .attr('font-size', '12px')
      .attr('font-family', 'sans-serif')
      .attr('opacity', 0.8);

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [notes]);

  return (
    <div className="w-full h-full relative cursor-move">
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h3 className="text-xl font-light text-white tracking-widest uppercase">Akashic Graph</h3>
        <p className="text-stone-400 text-sm">Force-directed neural connections</p>
      </div>
      <div ref={d3Container} className="w-full h-full" />
    </div>
  );
};
