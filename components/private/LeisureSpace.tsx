
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';

// --- MOCK DATA FOR MUSIC SEARCH ---
const DEMO_SONGS = [
  { id: 1, title: 'Lofi Study Beat 1', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112762.mp3' },
  { id: 2, title: 'Relaxing Rain', url: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_07364d50c5.mp3?filename=rain-and-nostalgia-110236.mp3' },
  { id: 3, title: 'Ambient Space', url: 'https://cdn.pixabay.com/download/audio/2022/02/10/audio_fc8c6c2e35.mp3?filename=ambient-piano-10114.mp3' },
  { id: 4, title: 'Pirate Chantey', url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d0.mp3?filename=pirate-15828.mp3' },
];

// --- SUDOKU GAME ---
const LEVEL_1_INITIAL = [
  5, 3, 0, 0, 7, 0, 0, 0, 0,
  6, 0, 0, 1, 9, 5, 0, 0, 0,
  0, 9, 8, 0, 0, 0, 0, 6, 0,
  8, 0, 0, 0, 6, 0, 0, 0, 3,
  4, 0, 0, 8, 0, 3, 0, 0, 1,
  7, 0, 0, 0, 2, 0, 0, 0, 6,
  0, 6, 0, 0, 0, 0, 2, 8, 0,
  0, 0, 0, 4, 1, 9, 0, 0, 5,
  0, 0, 0, 0, 8, 0, 0, 7, 9
];

const LEVEL_2_INITIAL = [
  0, 0, 0, 6, 0, 0, 4, 0, 0,
  7, 0, 0, 0, 0, 3, 6, 0, 0,
  0, 0, 0, 0, 9, 1, 0, 8, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 5, 0, 1, 8, 0, 0, 0, 3,
  0, 0, 0, 3, 0, 6, 0, 4, 5,
  0, 4, 0, 2, 0, 0, 0, 6, 0,
  9, 0, 3, 0, 0, 0, 0, 0, 0,
  0, 2, 0, 0, 0, 0, 1, 0, 0
];

const SudokuGame: React.FC = () => {
  const { t } = useTranslation();
  const [level, setLevel] = useState(1);
  const [board, setBoard] = useState<number[]>([]);
  const [initialBoard, setInitialBoard] = useState<number[]>([]);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [status, setStatus] = useState<'PLAYING' | 'SOLVED' | 'FAILED'>('PLAYING');

  useEffect(() => {
    startLevel(level);
  }, [level]);

  const startLevel = (lvl: number) => {
    const data = lvl === 1 ? LEVEL_1_INITIAL : LEVEL_2_INITIAL;
    setBoard([...data]);
    setInitialBoard([...data]);
    setStatus('PLAYING');
    setSelectedCell(null);
  };

  const handleCellClick = (index: number) => {
    if (initialBoard[index] !== 0) return; // Cannot edit initial cells
    setSelectedCell(index);
  };

  const handleInput = (num: number) => {
    if (selectedCell === null || status !== 'PLAYING') return;
    const newBoard = [...board];
    newBoard[selectedCell] = num;
    setBoard(newBoard);
  };

  const checkSolution = () => {
    // Basic Sudoku Rules Check
    // 1. No zeros
    if (board.includes(0)) {
       setStatus('FAILED');
       return;
    }

    // 2. Rows, Cols, Boxes unique 1-9
    if (isValidSudoku(board)) {
       setStatus('SOLVED');
    } else {
       setStatus('FAILED');
    }
  };

  const isValidSudoku = (grid: number[]) => {
     // Check Rows
     for (let r = 0; r < 9; r++) {
       const seen = new Set();
       for (let c = 0; c < 9; c++) {
          const val = grid[r * 9 + c];
          if (seen.has(val)) return false;
          seen.add(val);
       }
     }
     // Check Cols
     for (let c = 0; c < 9; c++) {
       const seen = new Set();
       for (let r = 0; r < 9; r++) {
          const val = grid[r * 9 + c];
          if (seen.has(val)) return false;
          seen.add(val);
       }
     }
     // Check Boxes
     for (let br = 0; br < 3; br++) {
       for (let bc = 0; bc < 3; bc++) {
          const seen = new Set();
          for (let r = 0; r < 3; r++) {
             for (let c = 0; c < 3; c++) {
                const val = grid[(br * 3 + r) * 9 + (bc * 3 + c)];
                if (seen.has(val)) return false;
                seen.add(val);
             }
          }
       }
     }
     return true;
  };

  return (
    <div className="bg-slate-900 rounded-[2rem] p-6 border border-slate-700 shadow-xl h-full flex flex-col items-center">
       <div className="w-full flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-emerald-400">
             <i className="fas fa-border-all"></i>
             <h3 className="font-display font-bold uppercase text-xs tracking-widest">{t.privateSpace.leisure.sudoku.title}</h3>
          </div>
          <span className="text-xs font-mono text-slate-500">{t.privateSpace.leisure.sudoku.level} {level}</span>
       </div>

       {/* Grid */}
       <div className="grid grid-cols-9 gap-px bg-slate-700 border-2 border-slate-600 mb-4 select-none">
          {board.map((cell, idx) => {
             const isInitial = initialBoard[idx] !== 0;
             const isSelected = selectedCell === idx;
             const row = Math.floor(idx / 9);
             const col = idx % 9;
             // Add thicker borders for 3x3 boxes
             const borderB = (row + 1) % 3 === 0 && row < 8 ? 'mb-0.5' : '';
             const borderR = (col + 1) % 3 === 0 && col < 8 ? 'mr-0.5' : '';
             
             return (
               <div 
                 key={idx}
                 onClick={() => handleCellClick(idx)}
                 className={`w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-sm font-bold cursor-pointer transition-colors ${borderB} ${borderR} 
                    ${isSelected ? 'bg-emerald-600 text-white' : isInitial ? 'bg-slate-800 text-slate-400' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
               >
                 {cell !== 0 ? cell : ''}
               </div>
             );
          })}
       </div>

       {/* Controls */}
       <div className="w-full flex flex-col gap-3">
          <div className="flex justify-between gap-1">
             {[1,2,3,4,5,6,7,8,9].map(num => (
               <button 
                 key={num}
                 onClick={() => handleInput(num)}
                 className="flex-1 py-1 bg-slate-800 text-slate-300 rounded hover:bg-emerald-600 hover:text-white text-xs font-bold transition-colors"
               >
                 {num}
               </button>
             ))}
             <button onClick={() => handleInput(0)} className="flex-1 py-1 bg-red-900/30 text-red-400 rounded hover:bg-red-600 hover:text-white text-xs"><i className="fas fa-eraser"></i></button>
          </div>

          <div className="flex justify-between items-center">
             {status === 'SOLVED' ? (
                <div className="text-emerald-400 font-bold text-xs uppercase animate-pulse">
                   <i className="fas fa-check mr-2"></i> {t.privateSpace.leisure.sudoku.solved}
                </div>
             ) : status === 'FAILED' ? (
                <div className="text-red-400 font-bold text-xs uppercase">
                   <i className="fas fa-times mr-2"></i> {t.privateSpace.leisure.sudoku.failed}
                </div>
             ) : (
                <button 
                  onClick={() => startLevel(level)} 
                  className="text-xs text-slate-500 hover:text-white uppercase tracking-wider"
                >
                  {t.privateSpace.leisure.sudoku.reset}
                </button>
             )}

             {status === 'SOLVED' && level === 1 ? (
                <button 
                   onClick={() => setLevel(2)} 
                   className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase rounded shadow-lg shadow-emerald-500/20"
                >
                   {t.privateSpace.leisure.sudoku.nextLevel}
                </button>
             ) : status === 'SOLVED' && level === 2 ? (
                <span className="text-xs text-emerald-500 font-bold">{t.privateSpace.leisure.sudoku.complete}</span>
             ) : (
                <button 
                   onClick={checkSolution}
                   className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase rounded shadow-lg shadow-blue-500/20"
                >
                   {t.privateSpace.leisure.sudoku.check}
                </button>
             )}
          </div>
       </div>
    </div>
  );
};

// --- THE FOUR PIRATE LORDS GAME ---
// A highly complex 7x6 sliding puzzle

const COLS = 7;
const ROWS = 6;
type Faction = 'RED' | 'BLUE' | 'GREEN' | 'YELLOW' | 'NEUTRAL';
type UnitType = 'CAPTAIN' | 'SHIP' | 'TREASURE' | 'MAP' | 'CREW' | 'EMPTY';

interface GameBlock {
  id: string;
  faction: Faction;
  type: UnitType;
  x: number;
  y: number;
  isTarget: boolean; // True if this block belongs to a faction that needs to go home
}

const PirateLordsGame: React.FC = () => {
  const { t } = useTranslation();
  const [blocks, setBlocks] = useState<GameBlock[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showRules, setShowRules] = useState(true);

  // Initialize Board
  useEffect(() => {
    initializeBoard();
  }, []);

  const initializeBoard = async () => {
    setIsInitializing(true);
    setIsWon(false);
    setMoves(0);

    // 1. Create Solved State (Logic from previous implementation)
    // Red (Top Left), Blue (Top Right), Green (Bottom Left), Yellow (Bottom Right)
    
    let tempBlocks: GameBlock[] = [];
    let idCounter = 0;

    const addBlock = (x: number, y: number, faction: Faction, type: UnitType, isTarget: boolean) => {
      tempBlocks.push({
        id: `b-${idCounter++}`,
        faction,
        type,
        x,
        y,
        isTarget
      });
    };

    const targets = [
       {f: 'RED', t: 'CAPTAIN'}, {f: 'RED', t: 'SHIP'}, {f: 'RED', t: 'TREASURE'}, {f: 'RED', t: 'MAP'},
       {f: 'BLUE', t: 'CAPTAIN'}, {f: 'BLUE', t: 'SHIP'}, {f: 'BLUE', t: 'TREASURE'}, {f: 'BLUE', t: 'MAP'},
       {f: 'GREEN', t: 'CAPTAIN'}, {f: 'GREEN', t: 'SHIP'}, {f: 'GREEN', t: 'TREASURE'}, {f: 'GREEN', t: 'MAP'},
       {f: 'YELLOW', t: 'CAPTAIN'}, {f: 'YELLOW', t: 'SHIP'}, {f: 'YELLOW', t: 'TREASURE'}, {f: 'YELLOW', t: 'MAP'},
    ];

    const getZone = (x: number, y: number) => {
       if (x < 3 && y < 3) return 'RED';
       if (x > 3 && y < 3) return 'BLUE';
       if (x < 3 && y > 2) return 'GREEN';
       if (x > 3 && y > 2) return 'YELLOW';
       return 'NEUTRAL';
    };

    const redT = targets.filter(t => t.f === 'RED');
    const blueT = targets.filter(t => t.f === 'BLUE');
    const greenT = targets.filter(t => t.f === 'GREEN');
    const yellowT = targets.filter(t => t.f === 'YELLOW');

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
         if (x === 3 && (y === 2 || y === 3)) continue; // Empty slots at center

         const zone = getZone(x, y);
         let blockData = { faction: 'NEUTRAL' as Faction, type: 'CREW' as UnitType, isTarget: false };

         if (zone === 'RED' && redT.length > 0) {
             const t = redT.pop()!;
             blockData = { faction: 'RED', type: t.t as UnitType, isTarget: true };
         } else if (zone === 'BLUE' && blueT.length > 0) {
             const t = blueT.pop()!;
             blockData = { faction: 'BLUE', type: t.t as UnitType, isTarget: true };
         } else if (zone === 'GREEN' && greenT.length > 0) {
             const t = greenT.pop()!;
             blockData = { faction: 'GREEN', type: t.t as UnitType, isTarget: true };
         } else if (zone === 'YELLOW' && yellowT.length > 0) {
             const t = yellowT.pop()!;
             blockData = { faction: 'YELLOW', type: t.t as UnitType, isTarget: true };
         }

         addBlock(x, y, blockData.faction, blockData.type, blockData.isTarget);
      }
    }

    // 2. SHUFFLE
    let gridMap = new Map<string, GameBlock>();
    tempBlocks.forEach(b => gridMap.set(`${b.x},${b.y}`, b));

    let emptySpots = [{x: 3, y: 2}, {x: 3, y: 3}];
    let lastMoveBlockId = '';

    for (let i = 0; i < 2000; i++) {
        const empty = emptySpots[Math.floor(Math.random() * emptySpots.length)];
        const neighbors = [
           {x: empty.x, y: empty.y - 1}, {x: empty.x, y: empty.y + 1},
           {x: empty.x - 1, y: empty.y}, {x: empty.x + 1, y: empty.y}
        ].filter(n => n.x >= 0 && n.x < COLS && n.y >= 0 && n.y < ROWS);

        const validNeighbors = neighbors.filter(n => gridMap.has(`${n.x},${n.y}`));
        if (validNeighbors.length > 0) {
            const targetPos = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
            const blockToMove = gridMap.get(`${targetPos.x},${targetPos.y}`)!;
            if (blockToMove.id === lastMoveBlockId && Math.random() > 0.1) continue;
            gridMap.delete(`${targetPos.x},${targetPos.y}`);
            blockToMove.x = empty.x;
            blockToMove.y = empty.y;
            gridMap.set(`${empty.x},${empty.y}`, blockToMove);
            const emptyIdx = emptySpots.indexOf(empty);
            emptySpots[emptyIdx] = targetPos;
            lastMoveBlockId = blockToMove.id;
        }
    }

    setBlocks(Array.from(gridMap.values()));
    setIsInitializing(false);
  };

  const handleBlockClick = (block: GameBlock) => {
    if (isWon || isInitializing) return;
    const occupied = new Set(blocks.map(b => `${b.x},${b.y}`));
    const dirs = [[0,1], [0,-1], [1,0], [-1,0]];
    for (const [dx, dy] of dirs) {
        const targetX = block.x + dx;
        const targetY = block.y + dy;
        if (targetX >= 0 && targetX < COLS && targetY >= 0 && targetY < ROWS) {
            if (!occupied.has(`${targetX},${targetY}`)) {
                const newBlocks = blocks.map(b => 
                    b.id === block.id ? { ...b, x: targetX, y: targetY } : b
                );
                setBlocks(newBlocks);
                setMoves(m => m + 1);
                checkWinCondition(newBlocks);
                return;
            }
        }
    }
  };

  const checkWinCondition = (currentBlocks: GameBlock[]) => {
      const isRedComplete = currentBlocks.filter(b => b.faction === 'RED').every(b => b.x < 3 && b.y < 3);
      const isBlueComplete = currentBlocks.filter(b => b.faction === 'BLUE').every(b => b.x > 3 && b.y < 3);
      const isGreenComplete = currentBlocks.filter(b => b.faction === 'GREEN').every(b => b.x < 3 && b.y > 2);
      const isYellowComplete = currentBlocks.filter(b => b.faction === 'YELLOW').every(b => b.x > 3 && b.y > 2);

      if (isRedComplete && isBlueComplete && isGreenComplete && isYellowComplete) {
          setIsWon(true);
      }
  };

  const getIcon = (type: UnitType) => {
      switch(type) {
          case 'CAPTAIN': return 'fa-skull-crossbones';
          case 'SHIP': return 'fa-ship';
          case 'TREASURE': return 'fa-gem';
          case 'MAP': return 'fa-map-marked-alt';
          case 'CREW': return Math.random() > 0.5 ? 'fa-anchor' : 'fa-wine-bottle';
          default: return 'fa-circle';
      }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full aspect-[7/6] bg-[#1a1510] rounded-xl overflow-hidden shadow-2xl border-[6px] border-[#3f2e22] select-none">
         {/* UI Header */}
         <div className="absolute top-0 left-0 right-0 h-10 bg-[#2a1f18] border-b border-[#5e4533] flex items-center justify-between px-4 z-30">
            <div className="text-[#c2a281] font-display font-bold text-xs uppercase tracking-widest flex items-center gap-2">
               <i className="fas fa-compass fa-spin-slow"></i>
               {t.privateSpace.leisure.pirate.title}
            </div>
            <div className="flex gap-4 text-[10px] font-mono text-[#8b735b]">
               <span>{t.privateSpace.leisure.pirate.moves}: <span className="text-white">{moves}</span></span>
               <button onClick={initializeBoard} className="hover:text-amber-500 transition-colors"><i className="fas fa-redo"></i> {t.privateSpace.leisure.pirate.reset}</button>
            </div>
         </div>

         {/* WIN MODAL */}
         {isWon && (
             <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center animate-fade-in backdrop-blur-sm">
                 <i className="fas fa-trophy text-6xl text-amber-500 mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"></i>
                 <h2 className="text-3xl text-white font-display font-bold tracking-widest mb-2">{t.privateSpace.leisure.pirate.victory}</h2>
                 <p className="text-[#c2a281] mb-6">{t.privateSpace.leisure.pirate.victoryDesc}</p>
                 <button onClick={initializeBoard} className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold uppercase rounded shadow-lg transition-all">{t.privateSpace.leisure.pirate.playAgain}</button>
             </div>
         )}

         {/* Loading Overlay */}
         {isInitializing && (
             <div className="absolute inset-0 z-50 bg-[#1a1510] flex flex-col items-center justify-center">
                 <i className="fas fa-dharmachakra fa-spin text-4xl text-[#5e4533] mb-4"></i>
                 <p className="text-[#5e4533] font-mono text-xs uppercase tracking-widest">Shuffling Deck...</p>
             </div>
         )}

         {/* BOARD BACKGROUND (Territories) */}
         <div className="absolute inset-0 top-10 flex">
             <div className="w-[42.85%] h-full flex flex-col">
                <div className="h-1/2 bg-red-900/10 border-r border-b border-red-900/20 relative">
                   <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none"><i className="fas fa-volcano text-6xl text-red-500"></i></div>
                </div>
                <div className="h-1/2 bg-emerald-900/10 border-r border-t border-emerald-900/20 relative">
                   <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none"><i className="fas fa-biohazard text-6xl text-emerald-500"></i></div>
                </div>
             </div>
             <div className="w-[14.3%] h-full bg-[#120f0c] border-x border-[#3f2e22]/30 flex flex-col items-center justify-center opacity-30">
                <div className="h-full w-px bg-white/5"></div>
             </div>
             <div className="w-[42.85%] h-full flex flex-col">
                <div className="h-1/2 bg-cyan-900/10 border-l border-b border-cyan-900/20 relative">
                   <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none"><i className="fas fa-icicles text-6xl text-cyan-500"></i></div>
                </div>
                <div className="h-1/2 bg-amber-900/10 border-l border-t border-amber-900/20 relative">
                   <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none"><i className="fas fa-sun text-6xl text-amber-500"></i></div>
                </div>
             </div>
         </div>

         {/* BLOCKS LAYER */}
         <div className="absolute inset-0 top-10">
            {blocks.map(block => {
               const isNeutral = block.faction === 'NEUTRAL';
               let colorClass = '';
               let borderClass = '';
               let glowClass = '';

               switch(block.faction) {
                  case 'RED': colorClass = 'bg-[#450a0a] text-red-400'; borderClass = 'border-red-600'; glowClass = 'shadow-[0_0_10px_rgba(220,38,38,0.3)]'; break;
                  case 'BLUE': colorClass = 'bg-[#082f49] text-cyan-400'; borderClass = 'border-cyan-600'; glowClass = 'shadow-[0_0_10px_rgba(8,145,178,0.3)]'; break;
                  case 'GREEN': colorClass = 'bg-[#052e16] text-emerald-400'; borderClass = 'border-emerald-600'; glowClass = 'shadow-[0_0_10px_rgba(5,150,105,0.3)]'; break;
                  case 'YELLOW': colorClass = 'bg-[#451a03] text-amber-400'; borderClass = 'border-amber-600'; glowClass = 'shadow-[0_0_10px_rgba(217,119,6,0.3)]'; break;
                  default: colorClass = 'bg-[#292524] text-[#57534e]'; borderClass = 'border-[#44403c]';
               }

               return (
                 <div
                    key={block.id}
                    onClick={() => handleBlockClick(block)}
                    className={`absolute transition-all duration-200 ease-in-out cursor-pointer p-0.5 z-10`}
                    style={{
                       width: `${100/COLS}%`,
                       height: `${100/ROWS}%`,
                       left: `${(block.x * 100) / COLS}%`,
                       top: `${(block.y * 100) / ROWS}%`,
                    }}
                 >
                    <div className={`w-full h-full border-2 rounded-lg flex items-center justify-center relative overflow-hidden ${colorClass} ${borderClass} ${!isNeutral ? glowClass : 'opacity-90'}`}>
                       {isNeutral && <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>}
                       <i className={`fas ${getIcon(block.type)} text-xl relative z-10`}></i>
                       {!isNeutral && (
                          <div className={`absolute top-0 right-0 w-3 h-3 rounded-bl-lg ${block.faction === 'RED' ? 'bg-red-500' : block.faction === 'BLUE' ? 'bg-cyan-500' : block.faction === 'GREEN' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                       )}
                    </div>
                 </div>
               );
            })}
         </div>
      </div>

      {/* Rules Section - Always visible below game */}
      <div className="bg-[#2a1f18] rounded-xl p-4 border border-[#5e4533] shadow-lg">
         <button 
           onClick={() => setShowRules(!showRules)}
           className="w-full flex justify-between items-center text-[#c2a281] font-bold text-xs uppercase tracking-widest hover:text-white"
         >
           <span><i className="fas fa-scroll mr-2"></i> {t.privateSpace.leisure.pirate.rulesTitle}</span>
           <i className={`fas ${showRules ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
         </button>
         
         {showRules && (
           <ul className="mt-4 space-y-2 text-[11px] text-[#8b735b] font-mono leading-relaxed list-disc list-inside">
             {t.privateSpace.leisure.pirate.rules.map((rule, i) => (
                <li key={i}>{rule}</li>
             ))}
           </ul>
         )}
      </div>
    </div>
  );
};

export const LeisureSpace: React.FC = () => {
  const { t } = useTranslation();
  const [audioUrl, setAudioUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Split Pane States
  const [leftWidth, setLeftWidth] = useState(60); // Percentage for Mahjong
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isXl, setIsXl] = useState(false);
  
  // Audio Player Logic
  const playUrl = (url: string) => {
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play();
      setIsPlaying(true);
      setAudioUrl(url);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  // Screen Size Detection
  useEffect(() => {
    const checkSize = () => setIsXl(window.innerWidth >= 1280);
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  // Resizing Logic
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      let newPercent = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      // Clamp between 30% and 70%
      newPercent = Math.max(30, Math.min(70, newPercent));
      setLeftWidth(newPercent);
    };

    const handleUp = () => {
      setIsDragging(false);
      document.body.style.cursor = 'default';
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
      document.body.style.cursor = 'col-resize';
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging]);

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  return (
    <div 
      ref={containerRef} 
      className={`flex flex-col xl:flex-row gap-6 xl:gap-0 h-full lg:overflow-hidden min-h-[600px] overflow-y-auto ${isDragging ? 'select-none cursor-col-resize' : ''}`}
    >
      
      {/* LEFT COLUMN: Mahjong Soul Iframe */}
      <div 
         className="h-[600px] xl:h-full bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-700 shadow-2xl relative order-1 shrink-0"
         style={{ width: isXl ? `${leftWidth}%` : '100%' }}
      >
         {/* Overlay to catch mouse events during drag */}
         {isDragging && <div className="absolute inset-0 z-50 bg-transparent"></div>}

         <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></div>
            {t.privateSpace.leisure.mahjong}
         </div>
         <iframe 
           src="https://game.maj-soul.com/" 
           className="w-full h-full border-0"
           allowFullScreen
           title="Mahjong Soul"
         />
      </div>

      {/* RESIZER HANDLE (Desktop Only) */}
      <div 
         className="hidden xl:flex w-6 bg-transparent hover:bg-slate-800/50 cursor-col-resize items-center justify-center z-20 order-2 shrink-0 transition-colors group -ml-3 -mr-3 relative mx-2"
         onMouseDown={startDrag}
         style={{ width: '24px' }}
      >
         {/* Visible Line */}
         <div className="w-1.5 h-16 bg-slate-700 rounded-full group-hover:bg-amber-500 transition-colors shadow-lg"></div>
         
         {/* Hover Tooltip */}
         <div className="absolute bottom-1/2 translate-y-1/2 left-8 bg-slate-800 text-slate-200 text-[10px] px-2 py-1 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700 pointer-events-none z-50 font-bold uppercase tracking-wider">
            <i className="fas fa-arrows-alt-h mr-1"></i> Drag to Resize
         </div>
      </div>

      {/* RIGHT COLUMN: Scrollable Tools */}
      <div 
        className="flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar xl:pl-2 pb-20 order-3 flex-1 min-w-0"
      >
         {/* Top Row: Compact Music & Sudoku */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Compact Music Player */}
            <div className="bg-white/80 rounded-[2rem] p-5 border border-white shadow-lg backdrop-blur-md flex flex-col">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-lg">
                     <i className={`fas fa-compact-disc ${isPlaying ? 'animate-spin-slow' : ''}`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                     <h3 className="font-bold text-slate-800 text-sm truncate">{t.privateSpace.leisure.musicTitle}</h3>
                     <p className="text-[10px] text-slate-500 uppercase">{isPlaying ? t.privateSpace.leisure.nowPlaying : t.privateSpace.leisure.stopped}</p>
                  </div>
               </div>

               <audio ref={audioRef} onEnded={() => setIsPlaying(false)} className="hidden" />
               
               <div className="flex gap-2 mb-4">
                 <input 
                   type="text" 
                   value={audioUrl}
                   onChange={(e) => setAudioUrl(e.target.value)}
                   placeholder="MP3 URL..."
                   className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                 />
                 <button onClick={() => playUrl(audioUrl)} className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-500 hover:text-white transition-colors flex items-center justify-center">
                   <i className="fas fa-play text-xs"></i>
                 </button>
               </div>

               <div className="bg-slate-900 rounded-xl p-3 text-white flex justify-between items-center shadow-inner mt-auto">
                  <button className="text-slate-400 hover:text-white"><i className="fas fa-backward"></i></button>
                  <button onClick={togglePlay} className="w-8 h-8 rounded-full bg-indigo-500 hover:bg-indigo-400 flex items-center justify-center shadow-lg transition-transform hover:scale-105">
                    <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play pl-0.5'} text-xs`}></i>
                  </button>
                  <button className="text-slate-400 hover:text-white"><i className="fas fa-forward"></i></button>
               </div>

               <div className="mt-4 flex-1 overflow-y-auto max-h-32 custom-scrollbar">
                  {DEMO_SONGS.map(song => (
                    <div key={song.id} onClick={() => playUrl(song.url)} className="flex items-center gap-2 p-2 hover:bg-indigo-50 rounded-lg cursor-pointer text-xs group">
                       <i className="fas fa-music text-slate-300 group-hover:text-indigo-400"></i>
                       <span className="truncate text-slate-600 group-hover:text-indigo-700">{song.title}</span>
                    </div>
                  ))}
               </div>
            </div>

            {/* Sudoku Game */}
            <div className="h-80">
               <SudokuGame />
            </div>
         </div>

         {/* Bottom: Full Width Pirate Lords */}
         <div className="w-full">
            <PirateLordsGame />
         </div>

      </div>
    </div>
  );
};
