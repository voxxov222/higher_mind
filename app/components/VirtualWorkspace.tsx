import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Box, X, Edit2, Check, Download, Trash2, Move, LayoutGrid, Plus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export interface WorkspaceItem {
  id: string;
  title: string;
  content: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color?: string;
}

interface DragInfo {
  id: string;
  startX: number;
  startY: number;
  initialItemX: number;
  initialItemY: number;
}

interface SnapLine {
  axis: 'x' | 'y';
  pos: number;
}

export function VirtualWorkspace() {
  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [dragInfo, setDragInfo] = useState<DragInfo | null>(null);
  const [snapLines, setSnapLines] = useState<SnapLine[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('virtual_workspace_items');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse workspace items", e);
      }
    }

    const handleSendToWorkspace = (e: CustomEvent) => {
      const { title, content } = e.detail;
      const newItem: WorkspaceItem = {
        id: Math.random().toString(36).substring(2, 9),
        title,
        content,
        x: Math.random() * 200 + 40,
        y: Math.random() * 200 + 40,
        w: 320,
        h: 240,
        color: ['#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6'][Math.floor(Math.random() * 5)]
      };
      setItems(prev => {
        const next = [...prev, newItem];
        localStorage.setItem('virtual_workspace_items', JSON.stringify(next));
        return next;
      });
    };

    window.addEventListener('sendToWorkspace' as any, handleSendToWorkspace);
    return () => window.removeEventListener('sendToWorkspace' as any, handleSendToWorkspace);
  }, []);

  const saveItems = (newItems: WorkspaceItem[]) => {
    setItems(newItems);
    localStorage.setItem('virtual_workspace_items', JSON.stringify(newItems));
  };

  const removeItem = (id: string) => {
    saveItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<WorkspaceItem>) => {
    saveItems(items.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const bringToFront = (id: string) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === id);
      if (idx === -1 || idx === prev.length - 1) return prev;
      const next = [...prev];
      const [it] = next.splice(idx, 1);
      next.push(it);
      localStorage.setItem('virtual_workspace_items', JSON.stringify(next));
      return next;
    });
  };

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    if ((e.target as HTMLElement).closest('.no-drag')) return;
    bringToFront(id);
    const item = items.find(i => i.id === id);
    if (!item) return;
    
    setDragInfo({
      id,
      startX: e.clientX,
      startY: e.clientY,
      initialItemX: item.x,
      initialItemY: item.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragInfo) return;
    
    let newX = dragInfo.initialItemX + (e.clientX - dragInfo.startX);
    let newY = dragInfo.initialItemY + (e.clientY - dragInfo.startY);

    const GRID_SIZE = 40;
    const SNAP_THRESHOLD = 15;
    const activeLines: SnapLine[] = [];

    // Grid snapping
    const remainderX = newX % GRID_SIZE;
    if (remainderX < SNAP_THRESHOLD) { newX -= remainderX; activeLines.push({axis: 'x', pos: newX}); }
    else if (GRID_SIZE - remainderX < SNAP_THRESHOLD) { newX += (GRID_SIZE - remainderX); activeLines.push({axis: 'x', pos: newX + GRID_SIZE}); }

    const remainderY = newY % GRID_SIZE;
    if (remainderY < SNAP_THRESHOLD) { newY -= remainderY; activeLines.push({axis: 'y', pos: newY}); }
    else if (GRID_SIZE - remainderY < SNAP_THRESHOLD) { newY += (GRID_SIZE - remainderY); activeLines.push({axis: 'y', pos: newY + GRID_SIZE}); }
    
    // Item snapping
    const item = items.find(i => i.id === dragInfo.id);
    if (item) {
       const w = item.w;
       const h = item.h;
       const centerX = newX + w / 2;
       const centerY = newY + h / 2;

       items.forEach(other => {
          if (other.id === dragInfo.id) return;
          
          const otherLeft = other.x;
          const otherRight = other.x + other.w;
          const otherCenterX = other.x + other.w / 2;
          
          if (Math.abs(newX - otherLeft) < SNAP_THRESHOLD) { newX = otherLeft; activeLines.push({axis: 'x', pos: otherLeft}); }
          else if (Math.abs(newX - otherRight) < SNAP_THRESHOLD) { newX = otherRight; activeLines.push({axis: 'x', pos: otherRight}); }
          else if (Math.abs(centerX - otherCenterX) < SNAP_THRESHOLD) { newX = otherCenterX - w/2; activeLines.push({axis: 'x', pos: otherCenterX}); }
          else if (Math.abs(newX + w - otherLeft) < SNAP_THRESHOLD) { newX = otherLeft - w; activeLines.push({axis: 'x', pos: otherLeft}); }
          else if (Math.abs(newX + w - otherRight) < SNAP_THRESHOLD) { newX = otherRight - w; activeLines.push({axis: 'x', pos: otherRight}); }
          
          const otherTop = other.y;
          const otherBottom = other.y + other.h;
          const otherCenterY = other.y + other.h / 2;
          
          if (Math.abs(newY - otherTop) < SNAP_THRESHOLD) { newY = otherTop; activeLines.push({axis: 'y', pos: otherTop}); }
          else if (Math.abs(newY - otherBottom) < SNAP_THRESHOLD) { newY = otherBottom; activeLines.push({axis: 'y', pos: otherBottom}); }
          else if (Math.abs(centerY - otherCenterY) < SNAP_THRESHOLD) { newY = otherCenterY - h/2; activeLines.push({axis: 'y', pos: otherCenterY}); }
          else if (Math.abs(newY + h - otherTop) < SNAP_THRESHOLD) { newY = otherTop - h; activeLines.push({axis: 'y', pos: otherTop}); }
          else if (Math.abs(newY + h - otherBottom) < SNAP_THRESHOLD) { newY = otherBottom - h; activeLines.push({axis: 'y', pos: otherBottom}); }
       });
    }

    setSnapLines(activeLines);

    updateItem(dragInfo.id, {
      x: newX,
      y: newY
    });
  };

  const handleMouseUp = () => {
    setDragInfo(null);
    setSnapLines([]);
  };

  const clearWorkspace = () => {
    if (confirm('Are you sure you want to clear the entire workspace?')) {
        saveItems([]);
    }
  };

  const addNewTextNode = () => {
    const newItem: WorkspaceItem = {
      id: Math.random().toString(36).substring(2, 9),
      title: 'New Idea',
      content: 'Enter your thoughts here...',
      x: 100 + Math.random() * 100,
      y: 100 + Math.random() * 100,
      w: 320,
      h: 240,
      color: '#a78bfa'
    };
    saveItems([...items, newItem]);
    setIsEditing(newItem.id);
  };

  return (
    <div 
      className="w-full h-full bg-stone-950 relative overflow-hidden flex flex-col"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      
      <div className="flex justify-between items-center p-4 border-b border-white/10 bg-black/40 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-white font-medium">Holographic Workspace</h2>
            <p className="text-stone-400 text-xs">Drag, drop, and snap elements. Long press information widgets to send them here.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={addNewTextNode} className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors border border-emerald-500/20 text-sm">
             <Plus className="w-4 h-4" /> New Text Node
          </button>
          <button onClick={clearWorkspace} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/20 text-sm">
             <Trash2 className="w-4 h-4" /> Clear All
          </button>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 relative w-full h-full overflow-auto">
        {/* Holographic Snap Lines */}
        <AnimatePresence>
          {snapLines.map((line, i) => (
            <motion.div
              key={`snap-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bg-cyan-400/50 pointer-events-none shadow-[0_0_10px_rgba(34,211,238,0.8)] z-40"
              style={{
                ...(line.axis === 'x' 
                  ? { left: line.pos, top: 0, bottom: 0, width: 1 } 
                  : { top: line.pos, left: 0, right: 0, height: 1 })
              }}
            />
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {items.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`absolute bg-stone-900 border shadow-2xl rounded-xl overflow-hidden flex flex-col transition-[box-shadow] duration-200 ${dragInfo?.id === item.id ? 'shadow-[0_0_30px_rgba(255,255,255,0.1)]' : ''}`}
              style={{
                left: item.x,
                top: item.y,
                width: Math.max(200, item.w),
                height: Math.max(150, item.h),
                borderColor: dragInfo?.id === item.id ? item.color : item.color + '40',
                zIndex: dragInfo?.id === item.id ? 100 : 1
              }}
              onMouseDown={(e) => handleMouseDown(e, item.id)}
            >
              {/* Header / Drag Handle */}
              <div 
                className={`px-4 py-2 flex items-center justify-between border-b cursor-move transition-colors ${dragInfo?.id === item.id ? 'border-white/20' : 'border-white/5'}`}
                style={{ backgroundColor: item.color + (dragInfo?.id === item.id ? '30' : '15') }}
              >
                {isEditing === item.id ? (
                  <input
                    className="no-drag bg-black/50 border border-white/10 rounded px-2 py-1 text-sm text-white w-full mr-2 outline-none"
                    value={item.title}
                    onChange={(e) => updateItem(item.id, { title: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditing(null)}
                    autoFocus
                  />
                ) : (
                  <h3 className="text-sm font-medium text-white truncate pr-2 pointer-events-none select-none flex items-center gap-2">
                     <Move className="w-3 h-3 opacity-50" /> {item.title}
                  </h3>
                )}
                
                <div className="flex items-center gap-1 no-drag">
                  <button onClick={() => setIsEditing(isEditing === item.id ? null : item.id)} className="p-1 hover:bg-white/10 rounded text-stone-400 hover:text-white transition-colors">
                    {isEditing === item.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Edit2 className="w-3 h-3" />}
                  </button>
                  <button onClick={() => removeItem(item.id)} className="p-1 hover:bg-red-500/20 rounded text-stone-400 hover:text-red-400 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 p-4 overflow-y-auto no-drag custom-scrollbar text-sm text-stone-300 bg-stone-900/50 backdrop-blur-sm">
                {isEditing === item.id ? (
                  <textarea
                    className="w-full h-full bg-black/30 border border-white/5 rounded p-3 text-stone-300 resize-none outline-none focus:border-white/20 transition-colors"
                    value={item.content}
                    onChange={(e) => updateItem(item.id, { content: e.target.value })}
                    placeholder="Write something..."
                  />
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none hover:prose-a:text-cyan-400">
                     <ReactMarkdown>{item.content}</ReactMarkdown>
                  </div>
                )}
              </div>
              
              {/* Resize Handle (Bottom Right) */}
              <div 
                className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize no-drag flex items-end justify-end p-1.5 opacity-30 hover:opacity-100 transition-opacity"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  bringToFront(item.id);
                  const startX = e.clientX;
                  const startY = e.clientY;
                  const startW = item.w;
                  const startH = item.h;
                  
                  const handleResize = (moveEvent: MouseEvent) => {
                    let newW = Math.max(200, startW + (moveEvent.clientX - startX));
                    let newH = Math.max(150, startH + (moveEvent.clientY - startY));

                    // Basic grid snapping for resize
                    const GRID_SIZE = 40;
                    const SNAP_THRESHOLD = 15;
                    const activeLines: SnapLine[] = [];

                    const remainderW = (item.x + newW) % GRID_SIZE;
                    if (remainderW < SNAP_THRESHOLD) { newW -= remainderW; activeLines.push({axis: 'x', pos: item.x + newW}); }
                    else if (GRID_SIZE - remainderW < SNAP_THRESHOLD) { newW += (GRID_SIZE - remainderW); activeLines.push({axis: 'x', pos: item.x + newW}); }
                    
                    const remainderH = (item.y + newH) % GRID_SIZE;
                    if (remainderH < SNAP_THRESHOLD) { newH -= remainderH; activeLines.push({axis: 'y', pos: item.y + newH}); }
                    else if (GRID_SIZE - remainderH < SNAP_THRESHOLD) { newH += (GRID_SIZE - remainderH); activeLines.push({axis: 'y', pos: item.y + newH}); }

                    setSnapLines(activeLines);

                    updateItem(item.id, {
                      w: newW,
                      h: newH
                    });
                  };
                  
                  const handleResizeEnd = () => {
                    setSnapLines([]);
                    window.removeEventListener('mousemove', handleResize);
                    window.removeEventListener('mouseup', handleResizeEnd);
                  };
                  
                  window.addEventListener('mousemove', handleResize);
                  window.addEventListener('mouseup', handleResizeEnd);
                }}
              >
                <div className="w-2.5 h-2.5 border-r-2 border-b-2 border-stone-400" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {items.length === 0 && (
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                 <LayoutGrid className="w-16 h-16 text-white/5 mx-auto mb-4" />
                 <p className="text-stone-500">Your workspace is empty.</p>
                 <p className="text-stone-600 text-sm mt-2">Long press any widget in other tools to send it here,</p>
                 <p className="text-stone-600 text-sm">or click "New Text Node" to start writing.</p>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}

