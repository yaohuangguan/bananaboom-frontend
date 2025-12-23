import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { PeriodTrackerWidget } from '../../components/private/leisure/PeriodTrackerWidget';
import { AIChef } from '../../components/private/leisure/AIChef';
import { User } from '../../types';

interface LeisureSpaceProps {
  user: User | null;
}

const DRAWING_BOARD_URL = 'https://orion-drawing-tool.vercel.app/';
const MAHJONG_URL = 'https://game.maj-soul.com/';
const YOUTUBE_URL =
  'https://www.youtube.com/embed/videoseries?list=PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj';
const QUANT_GUIDE_URL = 'https://vpts-quant-trader-guide.vercel.app/';

export const LeisureSpace: React.FC<LeisureSpaceProps> = ({ user }) => {
  const { t } = useTranslation();

  // View State: Default to Mahjong
  const [activeView, setActiveView] = useState<'MAHJONG' | 'DRAWING' | 'YOUTUBE' | 'QUANT'>(
    'MAHJONG'
  );

  // Row 1 Split State
  const [leftWidth, setLeftWidth] = useState(60); // Default 60% for Main View
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Screen Size Detection
  const [isXl, setIsXl] = useState(false);

  useEffect(() => {
    const checkSize = () => setIsXl(window.innerWidth >= 1280);
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  // Resizing Logic (Horizontal for Row 1)
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      let newPercent = ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // Limit range between 30% and 80%
      newPercent = Math.max(30, Math.min(80, newPercent));
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

  const getCurrentUrl = () => {
    switch (activeView) {
      case 'MAHJONG':
        return MAHJONG_URL;
      case 'DRAWING':
        return DRAWING_BOARD_URL;
      case 'YOUTUBE':
        return YOUTUBE_URL;
      case 'QUANT':
        return QUANT_GUIDE_URL;
      default:
        return MAHJONG_URL;
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-20 min-h-screen">
      {/* ROW 1: Main Entertainment/Creative Zone & Utilities */}
      <div
        ref={containerRef}
        className={`flex flex-col xl:flex-row gap-4 xl:gap-0 ${isDragging ? 'select-none' : ''}`}
        // Mahjong requires good vertical space, so keep a generous min-height on desktop
        style={{ minHeight: isXl ? '850px' : 'auto' }}
      >
        {/* LEFT: Main View (Mahjong / Drawing / YouTube Toggle) */}
        <div
          className="flex flex-col shrink-0 transition-all duration-75 ease-out h-[650px] xl:h-auto"
          style={{ width: isXl ? `${leftWidth}%` : '100%' }}
        >
          <div className="bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-700 shadow-2xl relative flex flex-col h-full transition-all duration-300">
            {/* Header Bar with Toggle */}
            <div className="flex items-center justify-between p-3 bg-black/40 backdrop-blur shrink-0 z-20 border-b border-white/5">
              <div className="flex bg-slate-800/50 p-1 rounded-xl overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setActiveView('MAHJONG')}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${activeView === 'MAHJONG' ? 'bg-pink-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  <i className="fas fa-chess-board"></i> {t.privateSpace.leisure.mahjong}
                </button>
                <button
                  onClick={() => setActiveView('DRAWING')}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${activeView === 'DRAWING' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  <i className="fas fa-palette"></i>{' '}
                  {t.privateSpace.leisure.drawingBoard || 'Canvas'}
                </button>
                <button
                  onClick={() => setActiveView('YOUTUBE')}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${activeView === 'YOUTUBE' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  <i className="fab fa-youtube"></i> YouTube
                </button>
                <button
                  onClick={() => setActiveView('QUANT')}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${activeView === 'QUANT' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  <i className="fas fa-chart-line"></i> Quant Guide
                </button>
              </div>

              <div className="flex gap-2 ml-2">
                <a
                  href={getCurrentUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors border border-white/5"
                  title="Open in New Tab"
                >
                  <i className="fas fa-external-link-alt text-xs"></i>
                </a>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 relative bg-[#1a1a1a]">
              {/* Interaction blocker during resize drag */}
              {isDragging && <div className="absolute inset-0 z-50 bg-transparent"></div>}

              {activeView === 'MAHJONG' && (
                <iframe
                  src={MAHJONG_URL}
                  className="w-full h-full border-0"
                  allowFullScreen
                  title="Mahjong Soul"
                />
              )}

              {activeView === 'DRAWING' && (
                <iframe
                  src={DRAWING_BOARD_URL}
                  className="w-full h-full border-0"
                  allowFullScreen
                  title="Drawing Board"
                />
              )}

              {activeView === 'YOUTUBE' && (
                <iframe
                  src={YOUTUBE_URL}
                  className="w-full h-full border-0"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  title="YouTube Player"
                />
              )}

              {activeView === 'QUANT' && (
                <iframe
                  src={QUANT_GUIDE_URL}
                  className="w-full h-full border-0"
                  allowFullScreen
                  title="Quant Trader Guide"
                />
              )}
            </div>
          </div>
        </div>

        {/* RESIZER HANDLE (Desktop Only) */}
        <div
          className="hidden xl:flex w-6 bg-transparent hover:bg-slate-800/50 cursor-col-resize items-center justify-center z-20 shrink-0 transition-colors group -ml-3 -mr-3 relative mx-2"
          onMouseDown={startDrag}
          style={{ width: '24px' }}
        >
          <div className="w-1.5 h-16 bg-slate-700/50 rounded-full group-hover:bg-amber-500 transition-colors shadow-lg"></div>
        </div>

        {/* RIGHT: Tools Stack */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* AI Chef */}
          <div className="h-[500px] shrink-0">
            <AIChef />
          </div>

          {/* Period Tracker */}
          <div className="h-[400px] shrink-0 flex-1">
            <PeriodTrackerWidget user={user} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeisureSpace;
