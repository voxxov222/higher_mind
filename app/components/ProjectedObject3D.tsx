import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { motion } from 'motion/react';
import { useHigherMind } from './HigherMindProvider';
import { OBJECT_ANIMATIONS } from '../constants/animations';

export const ProjectedObject3D = ({ item, position }: { item: any, position: [number, number, number] }) => {
  const [showMenu, setShowMenu] = useState(false);
  const { removeProjectedItem } = useHigherMind();
  
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); setShowMenu(true); }}>
      <Html occlude>
        <div style={{ pointerEvents: 'auto', background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '10px' }}>
            {item.children}
        </div>
      </Html>
      {showMenu && (
        <Html center>
           <div className="bg-black/90 text-white p-4 rounded-xl border border-white/20 z-50">
             <h3 className="text-sm font-bold uppercase">{item.componentName}</h3>
             <button onClick={() => removeProjectedItem(item.id)}>Delete</button>
             <button onClick={() => setShowMenu(false)}>Close</button>
             {/* Animations */}
             <div className="grid grid-cols-2 gap-2 mt-2">
                {OBJECT_ANIMATIONS.map(anim => <button key={anim.id} className="text-xs">{anim.name}</button>)}
             </div>
           </div>
        </Html>
      )}
    </group>
  );
};
