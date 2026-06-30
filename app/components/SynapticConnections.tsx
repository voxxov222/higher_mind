import React, { useEffect, useState, useRef } from 'react';
import { useSpring, animated } from '@react-spring/web';

interface Point {
  x: number;
  y: number;
}

interface Connection {
  id: string;
  start: Point;
  end: Point;
  active: boolean;
  isClose: boolean;
}

interface SynapticConnectionsProps {
  containerRef: React.RefObject<HTMLElement | null>;
  hoveredWidgetId: string | null;
}

const AnimatedLine: React.FC<{ connection: Connection }> = ({ connection }) => {
  const props = useSpring({
    to: {
      x1: connection.start.x,
      y1: connection.start.y,
      x2: connection.end.x,
      y2: connection.end.y,
      opacity: connection.active ? 0.8 : (connection.isClose ? 0.15 : 0),
      strokeWidth: connection.active ? 3 : 1,
    },
    config: { tension: 120, friction: 14 }
  });

  return (
    <>
      {connection.active && (
        <style>
          {`
            @keyframes synapticFlow {
              to {
                stroke-dashoffset: -20;
              }
            }
          `}
        </style>
      )}
      <animated.line
        x1={props.x1}
        y1={props.y1}
        x2={props.x2}
        y2={props.y2}
        stroke="url(#neonGradient)"
        strokeWidth={props.strokeWidth}
        strokeDasharray="5, 5"
        style={{
          animation: connection.active ? 'synapticFlow 0.5s linear infinite' : 'none'
        }}
        opacity={props.opacity}
        filter={connection.active ? "url(#neonGlow)" : ""}
        strokeLinecap="round"
      />
    </>
  );
};

export const SynapticConnections: React.FC<SynapticConnectionsProps> = ({ containerRef, hoveredWidgetId }) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const updateConnections = () => {
      if (!containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const widgets = Array.from(containerRef.current.querySelectorAll('[data-widget-id]'));
      
      const newConnections: Connection[] = [];
      const points: { id: string; p: Point }[] = [];

      widgets.forEach(w => {
        const rect = w.getBoundingClientRect();
        const id = w.getAttribute('data-widget-id') || '';
        points.push({
          id,
          p: {
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top + rect.height / 2
          }
        });
      });

      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].p.x - points[j].p.x;
          const dy = points[i].p.y - points[j].p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          const isClose = dist < 500;
          const isActive = isClose && (points[i].id === hoveredWidgetId || points[j].id === hoveredWidgetId);
          
          newConnections.push({
            id: `${points[i].id}-${points[j].id}`,
            start: points[i].p,
            end: points[j].p,
            active: isActive,
            isClose
          });
        }
      }
      
      setConnections(newConnections);
    };

    updateConnections();
    const interval = setInterval(updateConnections, 50);
    window.addEventListener('resize', updateConnections);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updateConnections);
    };
  }, [containerRef, hoveredWidgetId]);

  return (
    <svg 
      ref={svgRef}
      className="absolute inset-0 pointer-events-none z-0" 
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="1" />
          <stop offset="50%" stopColor="#d946ef" stopOpacity="1" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="1" />
        </linearGradient>
        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {connections.map((conn) => (
        <AnimatedLine key={conn.id} connection={conn} />
      ))}
    </svg>
  );
};
