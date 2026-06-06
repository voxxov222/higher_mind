import React, { useEffect, useRef } from 'react';
import * as animejs from 'animejs';
const anime = animejs.default || animejs;

export const AnimeVisualizer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear previous elements
    containerRef.current.innerHTML = '';

    const fragment = document.createDocumentFragment();
    
    // Grid settings
    const colCount = 20;
    const rowCount = 10;
    const totalCount = colCount * rowCount;
    
    // Create grid layout
    containerRef.current.style.display = 'grid';
    containerRef.current.style.gridTemplateColumns = `repeat(${colCount}, 1fr)`;
    containerRef.current.style.gridTemplateRows = `repeat(${rowCount}, 1fr)`;
    containerRef.current.style.gap = '2px';
    containerRef.current.style.width = '100%';
    containerRef.current.style.height = '100%';
    containerRef.current.style.padding = '20px';
    
    for (let i = 0; i < totalCount; i++) {
      const el = document.createElement('div');
      el.classList.add('anime-stagger-el');
      
      // Styling the element
      el.style.backgroundColor = '#14b8a6'; // tailwind teal-500
      el.style.borderRadius = '2px';
      el.style.opacity = '0';
      el.style.transformOrigin = 'center center';
      
      fragment.appendChild(el);
    }
    
    containerRef.current.appendChild(fragment);

    // Stagger animation based on anime.js incredible grid stagger feature
    const animation = anime({
      targets: '.anime-stagger-el',
      scale: [
        {value: .1, easing: 'easeOutSine', duration: 500},
        {value: 1, easing: 'easeInOutQuad', duration: 1200}
      ],
      opacity: [
        {value: 0, duration: 200},
        {value: 1, duration: 500}
      ],
      translateX: anime.stagger(10, {grid: [colCount, rowCount], from: 'center', axis: 'x'}),
      translateY: anime.stagger(10, {grid: [colCount, rowCount], from: 'center', axis: 'y'}),
      rotateZ: anime.stagger([0, 90], {grid: [colCount, rowCount], from: 'center', axis: 'x'}),
      backgroundColor: [
        { value: '#14b8a6', duration: 1000 },
        { value: '#8b5cf6', duration: 1000 },
        { value: '#f43f5e', duration: 1000 },
        { value: '#14b8a6', duration: 1000 },
      ],
      delay: anime.stagger(200, {grid: [colCount, rowCount], from: 'center'}),
      loop: true,
      direction: 'alternate',
      easing: 'easeInOutQuad'
    });

    return () => {
      animation.pause();
    };
  }, []);

  return (
    <div className="w-full h-full min-h-[400px] relative overflow-hidden bg-black/80 rounded-2xl flex items-center justify-center">
      <div className="absolute inset-0 z-0" ref={containerRef} />
      <div className="z-10 pointer-events-none text-center p-8 bg-black/60 backdrop-blur-md rounded-xl border border-white/20">
        <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-purple-500 to-rose-500 uppercase tracking-[0.3em] mb-2 pointer-events-none">Anime.js Stagger Grid</h3>
        <p className="text-xs text-stone-300 font-light pointer-events-none">Advanced kinetic choreography.</p>
      </div>
    </div>
  );
};
