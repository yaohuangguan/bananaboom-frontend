
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { ai } from '../../services/geminiService';
import { toast } from '../Toast';
import { apiService } from '../../services/api';
import { PeriodRecord, PeriodResponse } from '../../types';
import { createPortal } from 'react-dom';

// --- PERIOD TRACKER WIDGET ---

// Helper: Normalize date to YYYY-MM-DD
const toDateStr = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

interface PeriodTrackerWidgetProps {
  onRefresh?: () => void;
}

const PeriodTrackerWidget: React.FC<PeriodTrackerWidgetProps> = ({ onRefresh }) => {
  const { t } = useTranslation();
  const [viewDate, setViewDate] = useState(new Date());
  const [data, setData] = useState<PeriodResponse | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeRecord, setActiveRecord] = useState<Partial<PeriodRecord>>({});

  // Fetch Data on mount
  const fetchData = async () => {
    try {
      const res = await apiService.getPeriodData();
      setData(res);
    } catch (e) {
      // Quiet fail if API not ready
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calendar Logic
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const dateStr = toDateStr(clickedDate);
    setSelectedDate(clickedDate);

    // Find existing record covering this date
    const record = data?.records.find(r => {
        if (!r.startDate) return false;
        // Simple check: is start date? or is within start-end?
        // Let's match by Start Date primarily for editing the *entry*, 
        // but robustly, if clicked in middle of period, we should edit the period that covers it.
        const start = r.startDate.split('T')[0];
        // If end date exists, check range
        if (r.endDate) {
            const end = r.endDate.split('T')[0];
            return dateStr >= start && dateStr <= end;
        }
        return dateStr === start;
    });

    if (record) {
       setActiveRecord({ ...record });
    } else {
       // New Record
       setActiveRecord({
          startDate: dateStr,
          flow: 'medium',
          symptoms: []
       });
    }
    
    setIsModalOpen(true);
  };

  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRecord.startDate) return;
    
    try {
       await apiService.savePeriodRecord(activeRecord);
       toast.success(t.privateSpace.leisure.cycle.save + " Success");
       setIsModalOpen(false);
       fetchData(); // Refresh calendar
    } catch (e) {
       toast.error("Failed to save");
    }
  };

  const handleDeleteRecord = async () => {
     if (!activeRecord._id) return;
     if (!confirm("Delete this log?")) return;
     try {
        await apiService.deletePeriodRecord(activeRecord._id);
        toast.success("Deleted");
        setIsModalOpen(false);
        fetchData();
     } catch (e) {
        toast.error("Failed to delete");
     }
  };

  // Helper to determine day status
  const getDayStatus = (year: number, month: number, day: number) => {
     if (!data) return null;
     const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
     
     // 1. Actual Period?
     const actual = data.records.find(r => {
        const start = r.startDate.split('T')[0];
        const end = r.endDate ? r.endDate.split('T')[0] : start; // Default to single day if no end
        // However, standard visual is start + duration. Backend might only provide start. 
        // If frontend relies on duration, we calculate end.
        // Let's use the provided End Date or fallback to Start + Duration
        let effectiveEnd = end;
        if (!r.endDate && r.duration) {
            const s = new Date(r.startDate);
            s.setDate(s.getDate() + r.duration - 1);
            effectiveEnd = toDateStr(s);
        }
        return dateStr >= start && dateStr <= effectiveEnd;
     });
     if (actual) return 'ACTUAL';

     // 2. Prediction?
     if (data.prediction) {
        // Next Period
        const nextStart = data.prediction.nextPeriodStart.split('T')[0];
        // Avg Duration for predicted length
        const predictedEnd = new Date(data.prediction.nextPeriodStart);
        predictedEnd.setDate(predictedEnd.getDate() + (data.avgDuration || 5) - 1);
        const nextEnd = toDateStr(predictedEnd);
        
        if (dateStr >= nextStart && dateStr <= nextEnd) return 'PREDICTED';

        // Ovulation
        const ov = data.prediction.ovulationDate.split('T')[0];
        if (dateStr === ov) return 'OVULATION';

        // Fertile Window
        const fertileStart = data.prediction.fertileWindow.start.split('T')[0];
        const fertileEnd = data.prediction.fertileWindow.end.split('T')[0];
        if (dateStr >= fertileStart && dateStr <= fertileEnd) return 'FERTILE';
     }

     return null;
  };

  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const cells = [];

    // Padding
    for (let i = 0; i < firstDay; i++) {
        cells.push(<div key={`pad-${i}`} className="h-8 md:h-10"></div>);
    }

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
        const status = getDayStatus(year, month, d);
        const isToday = toDateStr(new Date()) === `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        
        let cellClass = "bg-slate-50 text-slate-600 hover:bg-slate-100";
        let content = <span className="relative z-10">{d}</span>;

        if (status === 'ACTUAL') {
            cellClass = "bg-rose-500 text-white shadow-md shadow-rose-300 font-bold border border-rose-600";
        } else if (status === 'PREDICTED') {
            cellClass = "bg-rose-50 text-rose-500 border-2 border-rose-300 border-dashed font-medium";
        } else if (status === 'OVULATION') {
            cellClass = "bg-purple-500 text-white font-bold shadow-md shadow-purple-300 relative overflow-hidden";
            content = (
                <>
                  <span className="relative z-10">{d}</span>
                  <div className="absolute inset-0 flex items-center justify-center opacity-30">
                     <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </>
            );
        } else if (status === 'FERTILE') {
            cellClass = "bg-purple-100 text-purple-700 font-bold border border-purple-200";
        }

        if (isToday) {
            cellClass += " ring-2 ring-amber-400 font-extrabold";
        }

        cells.push(
            <button 
               key={d} 
               onClick={() => handleDateClick(d)}
               className={`h-8 md:h-10 rounded-full flex items-center justify-center text-xs transition-all ${cellClass}`}
            >
               {content}
            </button>
        );
    }
    return cells;
  };

  // Calculate days until next period
  const daysUntil = useMemo(() => {
     if (!data?.prediction) return null;
     const today = new Date();
     const next = new Date(data.prediction.nextPeriodStart);
     const diff = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
     return diff;
  }, [data]);

  return (
    <div className="bg-white rounded-[2rem] p-6 border-4 border-pink-100 shadow-xl h-full flex flex-col relative overflow-hidden group">
       {/* Background Decoration */}
       <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
       
       {/* Header */}
       <div className="flex justify-between items-center mb-4 z-10">
          <div className="flex items-center gap-2 text-rose-500">
             <i className="fas fa-moon text-lg animate-pulse-slow"></i>
             <div>
                <h3 className="font-bold text-sm uppercase tracking-wider leading-none">{t.privateSpace.leisure.cycle.title}</h3>
                {daysUntil !== null && (
                   <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {t.privateSpace.leisure.cycle.nextPeriod}: {t.privateSpace.leisure.cycle.inDays.replace('{days}', daysUntil.toString())}
                   </p>
                )}
             </div>
          </div>
          <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
             <button onClick={handlePrevMonth} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:bg-white hover:text-rose-500 rounded-md transition-all"><i className="fas fa-chevron-left text-[10px]"></i></button>
             <span className="text-[10px] font-bold text-slate-600 px-2 flex items-center">
                {viewDate.toLocaleDateString(undefined, { month: 'short' })}
             </span>
             <button onClick={handleNextMonth} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:bg-white hover:text-rose-500 rounded-md transition-all"><i className="fas fa-chevron-right text-[10px]"></i></button>
          </div>
       </div>

       {/* Calendar Grid */}
       <div className="grid grid-cols-7 gap-1 flex-1 content-start z-10">
          {['S','M','T','W','T','F','S'].map((d,i) => (
             <div key={i} className="text-center text-[9px] font-bold text-slate-300 mb-1">{d}</div>
          ))}
          {renderCalendar()}
       </div>

       {/* Legend */}
       <div className="mt-4 pt-2 border-t border-slate-100 flex justify-center gap-3 text-[9px] text-slate-500 uppercase font-bold tracking-wider z-10 flex-wrap">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm border border-rose-600"></span> {t.privateSpace.leisure.cycle.legend.period}</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-50 border-2 border-rose-300 border-dashed"></span> {t.privateSpace.leisure.cycle.legend.predicted}</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-100 border border-purple-300 text-purple-700"></span> {t.privateSpace.leisure.cycle.legend.fertile}</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 border border-purple-600"></span> {t.privateSpace.leisure.cycle.legend.ovulation}</div>
       </div>

       {/* MODAL */}
       {isModalOpen && createPortal(
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
             <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                <div className="p-5 border-b border-rose-100 bg-rose-50 flex justify-between items-center">
                   <h3 className="font-bold text-rose-600 text-lg flex items-center gap-2">
                      <i className="fas fa-calendar-plus"></i> {t.privateSpace.leisure.cycle.log}
                   </h3>
                   <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-white text-rose-400 hover:text-rose-600 flex items-center justify-center"><i className="fas fa-times"></i></button>
                </div>
                
                <form onSubmit={handleSaveRecord} className="p-6 space-y-5">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Start Date</label>
                         <input 
                           type="date" 
                           required
                           value={activeRecord.startDate || ''}
                           onChange={e => setActiveRecord({...activeRecord, startDate: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:border-rose-400 outline-none"
                         />
                      </div>
                      <div>
                         <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">End Date</label>
                         <input 
                           type="date" 
                           value={activeRecord.endDate || ''}
                           onChange={e => setActiveRecord({...activeRecord, endDate: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:border-rose-400 outline-none"
                         />
                      </div>
                   </div>

                   <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">{t.privateSpace.leisure.cycle.flow}</label>
                      <div className="flex bg-slate-50 p-1 rounded-xl">
                         {['light', 'medium', 'heavy'].map(f => (
                            <button
                               key={f}
                               type="button"
                               onClick={() => setActiveRecord({...activeRecord, flow: f as any})}
                               className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                                  activeRecord.flow === f 
                                     ? 'bg-rose-500 text-white shadow-md' 
                                     : 'text-slate-400 hover:text-slate-600'
                               }`}
                            >
                               {t.privateSpace.leisure.cycle.flows[f as keyof typeof t.privateSpace.leisure.cycle.flows]}
                            </button>
                         ))}
                      </div>
                   </div>

                   <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">{t.privateSpace.leisure.cycle.symptoms}</label>
                      <div className="flex flex-wrap gap-2">
                         {['cramps', 'headache', 'backpain', 'fatigue', 'bloating', 'acne', 'moody'].map(sym => {
                            const isSelected = activeRecord.symptoms?.includes(sym);
                            return (
                               <button
                                  key={sym}
                                  type="button"
                                  onClick={() => {
                                     const current = activeRecord.symptoms || [];
                                     const newSyms = isSelected ? current.filter(s => s !== sym) : [...current, sym];
                                     setActiveRecord({...activeRecord, symptoms: newSyms});
                                  }}
                                  className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                                     isSelected 
                                        ? 'bg-purple-100 border-purple-300 text-purple-600 font-bold' 
                                        : 'bg-white border-slate-200 text-slate-500 hover:border-purple-200'
                                  }`}
                               >
                                  {t.privateSpace.leisure.cycle.symptomList[sym as keyof typeof t.privateSpace.leisure.cycle.symptomList]}
                               </button>
                            )
                         })}
                      </div>
                   </div>

                   <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{t.privateSpace.leisure.cycle.note}</label>
                      <textarea 
                         value={activeRecord.note || ''}
                         onChange={e => setActiveRecord({...activeRecord, note: e.target.value})}
                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:border-rose-400 outline-none resize-none h-20"
                         placeholder="..."
                      />
                   </div>

                   <div className="pt-2 flex gap-3">
                      {activeRecord._id && (
                         <button 
                           type="button" 
                           onClick={handleDeleteRecord}
                           className="px-4 py-3 bg-red-50 text-red-500 rounded-xl font-bold text-xs uppercase hover:bg-red-100"
                         >
                            <i className="fas fa-trash"></i>
                         </button>
                      )}
                      <button 
                        type="submit"
                        className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all"
                      >
                         {t.privateSpace.leisure.cycle.save}
                      </button>
                   </div>
                </form>
             </div>
          </div>,
          document.body
       )}
    </div>
  );
};

// --- CHEF'S WHEEL (Updated) ---
const INGREDIENTS = {
  MEAT: ['beef', 'pork', 'chicken', 'lamb', 'duck'],
  SEAFOOD: ['fish', 'shrimp', 'oyster', 'crab', 'clam'],
  VEGGIE: ['egg', 'tofu', 'tomato', 'potato', 'cucumber', 'broccoli', 'cabbage', 'napa', 'bokchoy', 'lettuce', 'carrot', 'eggplant', 'pepper', 'mushroom']
};

const STYLES = [
  { id: 'home', color: '#fb7185', icon: 'fa-home' }, // Rose-400
  { id: 'spicy', color: '#ef4444', icon: 'fa-pepper-hot' }, // Red-500
  { id: 'sweet', color: '#f59e0b', icon: 'fa-lemon' }, // Amber-500
  { id: 'braised', color: '#7c2d12', icon: 'fa-fire-burner' }, // Brown
  { id: 'steam', color: '#10b981', icon: 'fa-leaf' }, // Emerald-500
  { id: 'fry', color: '#eab308', icon: 'fa-bacon' }, // Yellow-500
];

interface Recipe {
  title: string;
  time: string;
  difficulty: string;
  ingredients: string[];
  steps: string[];
}

const ChefsWheel: React.FC = () => {
  const { t, language } = useTranslation();
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const toggleIngredient = (key: string) => {
    const next = new Set(selectedIngredients);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelectedIngredients(next);
  };

  const handleSpin = () => {
    if (isSpinning) return;
    if (selectedIngredients.size === 0) {
      toast.error(t.privateSpace.leisure.chefWheel.selectIngredients);
      return;
    }

    setRecipes([]);
    setIsSpinning(true);
    setSelectedStyle(null);
    setShowResult(false);

    // Calculate rotation: 6 segments = 60deg each.
    // 0deg is Top. CSS Rotate is clockwise.
    // We want to land on a random segment.
    const randomSpins = 5 + Math.random() * 5; // 5 to 10 full spins
    const randomDegree = Math.floor(Math.random() * 360);
    const finalRotation = rotation + (randomSpins * 360) + randomDegree;
    
    setRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      
      // Determine winner
      // Normalize final rotation to 0-360
      const normalizedDeg = finalRotation % 360;
      // The pointer is at TOP (0 deg).
      // The wheel rotated clockwise. The segment at TOP corresponds to (360 - rotation) % 360.
      const winningAngle = (360 - normalizedDeg) % 360;
      const segmentSize = 360 / STYLES.length;
      const winningIndex = Math.floor(winningAngle / segmentSize);
      
      const style = STYLES[winningIndex];
      const styleLabel = t.privateSpace.leisure.chefWheel.styles[style.id as keyof typeof t.privateSpace.leisure.chefWheel.styles];
      
      setSelectedStyle(styleLabel);
      generateRecipes(styleLabel);
    }, 4500); // Match CSS transition duration
  };

  const generateRecipes = async (styleLabel: string) => {
    setLoadingRecipes(true);
    try {
      // Convert keys to labels
      const ingredientLabels = Array.from(selectedIngredients).map(k => 
        t.privateSpace.leisure.chefWheel.ingredients[k as keyof typeof t.privateSpace.leisure.chefWheel.ingredients]
      );

      const prompt = `
        You are a Michelin Star Chef.
        Ingredients available: "${ingredientLabels.join(', ')}".
        Cooking Style: "${styleLabel}".
        Language: ${language === 'zh' ? 'Chinese (Simplified)' : 'English'}.
        
        Generate 3 distinct, delicious recipes based on these ingredients and style.
        Strictly output a JSON array of objects with this structure:
        [
          {
            "title": "Recipe Name",
            "time": "e.g. 20 mins",
            "difficulty": "Easy/Medium/Hard",
            "ingredients": ["List of exact ingredients and amounts"],
            "steps": ["Step 1", "Step 2", "Step 3"]
          }
        ]
        Do not include markdown code blocks. Just raw JSON.
      `;

      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const text = result.text || "[]";
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(cleanJson);
      
      setRecipes(data);
      setShowResult(true);
    } catch (e) {
      console.error(e);
      toast.error("The chef burnt the food. Try again.");
    } finally {
      setLoadingRecipes(false);
    }
  };

  // Conic Gradient for the Wheel
  // We need to generate the CSS string dynamically based on STYLES colors
  const gradientString = STYLES.map((s, i) => {
    const start = (i * 100) / STYLES.length;
    const end = ((i + 1) * 100) / STYLES.length;
    return `${s.color} ${start}% ${end}%`;
  }).join(', ');

  return (
    <div className="bg-white/90 backdrop-blur rounded-[2rem] p-5 border border-white shadow-xl flex flex-col h-full relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 z-10 shrink-0">
        <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg">
          <i className="fas fa-utensils"></i>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-800 text-sm truncate">{t.privateSpace.leisure.chefWheel.title}</h3>
          <p className="text-[10px] text-slate-500 uppercase">{t.privateSpace.leisure.chefWheel.instruction}</p>
        </div>
        <button 
           onClick={() => { setSelectedIngredients(new Set()); setRecipes([]); setShowResult(false); }}
           className="text-[10px] text-slate-400 hover:text-rose-500 underline"
        >
           {t.privateSpace.leisure.chefWheel.reset}
        </button>
      </div>

      {/* Main Layout: Split Top/Bottom on small screens, Side-by-side if enough space */}
      <div className="flex-1 flex flex-col min-h-0">
         
         {/* Ingredient Cloud (Scrollable) */}
         <div className="h-1/3 min-h-[120px] overflow-y-auto custom-scrollbar mb-4 border-b border-slate-100 pb-2">
            {Object.entries(INGREDIENTS).map(([cat, items]) => (
               <div key={cat} className="mb-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                     {t.privateSpace.leisure.chefWheel.cats[cat.toLowerCase() as keyof typeof t.privateSpace.leisure.chefWheel.cats]}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                     {items.map(key => {
                        const isSelected = selectedIngredients.has(key);
                        return (
                           <button
                              key={key}
                              onClick={() => toggleIngredient(key)}
                              className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                                 isSelected 
                                    ? 'bg-rose-500 text-white border-rose-500 shadow-md' 
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-rose-300'
                              }`}
                           >
                              {t.privateSpace.leisure.chefWheel.ingredients[key as keyof typeof t.privateSpace.leisure.chefWheel.ingredients]}
                           </button>
                        )
                     })}
                  </div>
               </div>
            ))}
         </div>

         {/* Wheel Area */}
         <div className="flex-1 relative flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border border-slate-100 p-4 overflow-hidden">
            {/* Pointer */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 text-slate-800 drop-shadow-md">
               <i className="fas fa-caret-down text-3xl"></i>
            </div>

            {/* The Wheel */}
            <div 
               className="w-48 h-48 sm:w-56 sm:h-56 rounded-full shadow-2xl relative transition-transform cubic-bezier(0.1, 0.7, 0.1, 1)"
               style={{ 
                  background: `conic-gradient(${gradientString})`,
                  transform: `rotate(${rotation}deg)`,
                  transitionDuration: isSpinning ? '4500ms' : '0s'
               }}
            >
               {/* Inner Circle for donut look (optional, but cleaner for text) */}
               <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
               
               {/* Labels */}
               {STYLES.map((style, idx) => {
                  const angle = (idx * 360) / STYLES.length;
                  const offsetAngle = angle + (360 / STYLES.length) / 2; // Center of segment
                  
                  return (
                     <div 
                        key={style.id}
                        className="absolute top-0 left-1/2 w-8 h-1/2 -ml-4 origin-bottom flex flex-col justify-start pt-2 items-center"
                        style={{ transform: `rotate(${offsetAngle}deg)` }}
                     >
                        <div className="flex flex-col items-center gap-1 text-white drop-shadow-md transform -rotate-0">
                           <i className={`fas ${style.icon} text-sm`}></i>
                           <span className="text-[10px] font-bold whitespace-nowrap writing-vertical-rl">
                              {t.privateSpace.leisure.chefWheel.styles[style.id as keyof typeof t.privateSpace.leisure.chefWheel.styles]}
                           </span>
                        </div>
                     </div>
                  );
               })}
            </div>

            {/* Spin Button Overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
               <button 
                  onClick={handleSpin}
                  disabled={isSpinning}
                  className="w-16 h-16 bg-white rounded-full shadow-xl border-4 border-rose-50 flex items-center justify-center text-rose-500 font-bold text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all disabled:opacity-80"
               >
                  {isSpinning ? t.privateSpace.leisure.chefWheel.spinning : t.privateSpace.leisure.chefWheel.spin}
               </button>
            </div>
         </div>
      </div>

      {/* Loading Overlay */}
      {loadingRecipes && (
         <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in rounded-[2rem]">
            <div className="relative mb-4">
               <i className="fas fa-hat-chef text-6xl text-rose-500 animate-bounce"></i>
               <div className="absolute -bottom-2 w-16 h-2 bg-black/10 rounded-full blur-sm animate-pulse"></div>
            </div>
            <p className="text-lg font-bold text-slate-800">{t.privateSpace.leisure.chefWheel.cooking}</p>
            <p className="text-xs text-slate-500 mt-2 font-mono">Generating 3 unique recipes...</p>
         </div>
      )}

      {/* Recipe Result Modal */}
      {showResult && recipes.length > 0 && (
        <div className="absolute inset-0 z-40 bg-white z-50 flex flex-col animate-slide-up rounded-[2rem] overflow-hidden">
           {/* Modal Header */}
           <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                 <h3 className="font-bold text-slate-800">{t.privateSpace.leisure.chefWheel.title}</h3>
                 <span className="text-xs text-rose-500 font-bold bg-rose-100 px-2 py-0.5 rounded">{selectedStyle}</span>
              </div>
              <button onClick={() => setShowResult(false)} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500">
                 <i className="fas fa-times"></i>
              </button>
           </div>

           {/* Content */}
           <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
              {recipes.map((recipe, idx) => (
                 <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {/* Only show image for first recipe to save bandwidth/speed, or show placeholders */}
                    {idx === 0 && (
                       <div className="h-32 bg-slate-100 overflow-hidden relative">
                          <img 
                             src={`https://image.pollinations.ai/prompt/delicious ${recipe.title} food photography?width=600&height=300&nologo=true`} 
                             alt={recipe.title} 
                             className="w-full h-full object-cover"
                             loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                          <div className="absolute bottom-2 left-4 text-white font-bold text-lg drop-shadow-md">{recipe.title}</div>
                       </div>
                    )}
                    
                    <div className="p-4">
                       {idx !== 0 && <h4 className="font-bold text-lg text-slate-800 mb-2">{recipe.title}</h4>}
                       
                       <div className="flex gap-4 text-xs text-slate-500 mb-4 font-mono">
                          <span className="flex items-center gap-1"><i className="far fa-clock"></i> {recipe.time}</span>
                          <span className="flex items-center gap-1"><i className="fas fa-signal"></i> {recipe.difficulty}</span>
                       </div>

                       <div className="mb-4">
                          <p className="text-xs font-bold uppercase text-slate-400 mb-2">Ingredients</p>
                          <div className="flex flex-wrap gap-1">
                             {recipe.ingredients.map((ing, i) => (
                                <span key={i} className="text-xs bg-slate-50 px-2 py-1 rounded text-slate-600 border border-slate-100">{ing}</span>
                             ))}
                          </div>
                       </div>

                       <div>
                          <p className="text-xs font-bold uppercase text-slate-400 mb-2">Steps</p>
                          <ol className="list-decimal list-outside ml-4 space-y-1 text-sm text-slate-600 leading-relaxed">
                             {recipe.steps.map((step, i) => (
                                <li key={i}>{step}</li>
                             ))}
                          </ol>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      )}
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
  isTarget: boolean; 
}

const PirateLordsGame: React.FC = () => {
  const { t } = useTranslation();
  const [blocks, setBlocks] = useState<GameBlock[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showRules, setShowRules] = useState(true);

  useEffect(() => {
    initializeBoard();
  }, []);

  const initializeBoard = async () => {
    setIsInitializing(true);
    setIsWon(false);
    setMoves(0);

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
         if (x === 3 && (y === 2 || y === 3)) continue; 

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

         {isWon && (
             <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center animate-fade-in backdrop-blur-sm">
                 <i className="fas fa-trophy text-6xl text-amber-500 mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"></i>
                 <h2 className="text-3xl text-white font-display font-bold tracking-widest mb-2">{t.privateSpace.leisure.pirate.victory}</h2>
                 <p className="text-[#c2a281] mb-6">{t.privateSpace.leisure.pirate.victoryDesc}</p>
                 <button onClick={initializeBoard} className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold uppercase rounded shadow-lg transition-all">{t.privateSpace.leisure.pirate.playAgain}</button>
             </div>
         )}

         {isInitializing && (
             <div className="absolute inset-0 z-50 bg-[#1a1510] flex flex-col items-center justify-center">
                 <i className="fas fa-dharmachakra fa-spin text-4xl text-[#5e4533] mb-4"></i>
                 <p className="text-[#5e4533] font-mono text-xs uppercase tracking-widest">Shuffling Deck...</p>
             </div>
         )}

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
  const [leftWidth, setLeftWidth] = useState(50); 
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isXl, setIsXl] = useState(false);
  
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
         <div className="w-1.5 h-16 bg-slate-700 rounded-full group-hover:bg-amber-500 transition-colors shadow-lg"></div>
         
         <div className="absolute bottom-1/2 translate-y-1/2 left-8 bg-slate-800 text-slate-200 text-[10px] px-2 py-1 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700 pointer-events-none z-50 font-bold uppercase tracking-wider">
            <i className="fas fa-arrows-alt-h mr-1"></i> Drag to Resize
         </div>
      </div>

      {/* RIGHT COLUMN: Scrollable Tools */}
      <div 
        className="flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar xl:pl-2 pb-20 order-3 flex-1 min-w-0"
      >
         {/* Top Row: Chef's Wheel & Period Tracker */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Chef's Wheel Replacement */}
            <div className="h-[480px]">
               <ChefsWheel />
            </div>

            {/* Period Tracker (Replaced Clock) */}
            <div className="h-[480px]">
               <PeriodTrackerWidget />
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
