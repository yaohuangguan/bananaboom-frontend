
import React from 'react';

export const ScenicBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#f4f1ea] transition-colors duration-1000">
      {/* 1. Paper Texture Layer (Noise & Grain) */}
      <div 
        className="absolute inset-0 opacity-60 pointer-events-none mix-blend-multiply"
        style={{ 
          backgroundImage: `url("https://www.transparenttextures.com/patterns/old-map.png")`,
          backgroundSize: '400px'
        }}
      ></div>
      
      {/* 2. Vignette for aged look */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(168,162,158,0.15)_100%)]"></div>

      {/* 3. Da Vinci / Blueprint Sketches - Animated SVG Container */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.12] pointer-events-none select-none">
         <svg viewBox="0 0 1000 1000" className="w-[140vmax] h-[140vmax] animate-[spin_240s_linear_infinite]">
            <defs>
               {/* Sketchy Filter to make lines look like ink/pencil on rough paper */}
               <filter id="ink-sketch" x="-20%" y="-20%" width="140%" height="140%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" result="noise" />
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
               </filter>
            </defs>

            <g filter="url(#ink-sketch)" stroke="#3f3c38" fill="none">
               {/* Central Sacred Geometry - Flower of Life Pattern */}
               <g strokeWidth="0.6">
                  <circle cx="500" cy="500" r="100" />
                  <circle cx="500" cy="300" r="100" />
                  <circle cx="500" cy="700" r="100" />
                  <circle cx="326" cy="400" r="100" />
                  <circle cx="673" cy="400" r="100" />
                  <circle cx="326" cy="600" r="100" />
                  <circle cx="673" cy="600" r="100" />
                  
                  {/* Outer Flower Rings */}
                  <circle cx="500" cy="500" r="200" strokeDasharray="4,4" />
                  <circle cx="500" cy="500" r="210" strokeWidth="0.3" />
               </g>

               {/* Cosmic Orbital Rings / Zodiac-style Ticks */}
               <circle cx="500" cy="500" r="350" strokeWidth="0.8" strokeDasharray="20,10" />
               <circle cx="500" cy="500" r="360" strokeWidth="0.3" />
               <path d="M500,140 L500,160 M500,840 L500,860 M140,500 L160,500 M840,500 L860,500" strokeWidth="1.5" />

               {/* Architectural Blueprint Lines */}
               <line x1="500" y1="0" x2="500" y2="1000" strokeWidth="0.4" strokeDasharray="50,20" opacity="0.6" />
               <line x1="0" y1="500" x2="1000" y2="500" strokeWidth="0.4" strokeDasharray="50,20" opacity="0.6" />
               
               {/* Diagonals forming a pyramid structure */}
               <line x1="100" y1="100" x2="900" y2="900" strokeWidth="0.3" opacity="0.5" />
               <line x1="900" y1="100" x2="100" y2="900" strokeWidth="0.3" opacity="0.5" />
               
               {/* Geometric Shapes */}
               <rect x="300" y="300" width="400" height="400" strokeWidth="0.5" transform="rotate(45 500 500)" opacity="0.4" />
               <circle cx="500" cy="500" r="420" strokeWidth="1.5" strokeDasharray="100, 20" opacity="0.3" />
            </g>
         </svg>
      </div>

      {/* 4. Floating Notes / Equations (Static placements) */}
      <div className="absolute top-[15%] left-[10%] opacity-15 pointer-events-none hidden md:block select-none transform -rotate-6">
         <svg width="200" height="150" viewBox="0 0 200 150">
            <g filter="url(#ink-sketch)" stroke="#3f3c38" fill="none" strokeWidth="1">
               <path d="M10,80 Q50,10 90,80 T180,80" strokeDasharray="4,2" />
               <circle cx="50" cy="80" r="2" fill="#3f3c38" />
               <circle cx="90" cy="80" r="2" fill="#3f3c38" />
               <circle cx="180" cy="80" r="2" fill="#3f3c38" />
               <text x="10" y="120" fontFamily="serif" fontSize="18" fill="#3f3c38" stroke="none" style={{ fontStyle: 'italic' }}>Figura I. Orbis</text>
            </g>
         </svg>
      </div>

       <div className="absolute bottom-[20%] right-[10%] opacity-15 pointer-events-none hidden md:block select-none transform rotate-3">
         <svg width="250" height="200" viewBox="0 0 250 200">
             <defs>
               <filter id="ink-sketch-2">
                  <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" />
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
               </filter>
            </defs>
            <text x="40" y="40" fontFamily="serif" fontSize="14" fill="#3f3c38" style={{ fontStyle: 'italic' }}>
                Divina Proportio
             </text>
            <g filter="url(#ink-sketch-2)" stroke="#3f3c38" fill="none" strokeWidth="1">
               <rect x="50" y="60" width="80" height="130" />
               <line x1="50" y1="60" x2="130" y2="190" />
               <circle cx="90" cy="125" r="30" strokeDasharray="2,2" />
               <text x="140" y="100" fontSize="12" fill="#3f3c38" stroke="none">φ = 1.618</text>
            </g>
         </svg>
      </div>

      {/* 5. Additional decorative strokes */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[url('https://www.transparenttextures.com/patterns/scratches.png')] opacity-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[url('https://www.transparenttextures.com/patterns/scratches.png')] opacity-10 pointer-events-none"></div>
    </div>
  );
};
