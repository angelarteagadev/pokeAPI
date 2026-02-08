import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, Trash2, Power, Gamepad, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Activity, ShieldAlert, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer,
} from 'recharts';
import { apiService } from '../services/apiService';
import { soundService } from '../services/soundService';
import { CollectionItem } from '../types';

const TEAMS = ['All', 'Alpha', 'Beta', 'Omega', 'Vanguard', 'Personal'];

const TYPE_LCD_COLORS: Record<string, { bg: string, text: string, accent: string }> = {
  fire: { bg: '#ff9a7b', text: '#2d1b14', accent: '#c0392b' },
  water: { bg: '#85d1ff', text: '#152b3d', accent: '#2980b9' },
  grass: { bg: '#b8e994', text: '#121a00', accent: '#38ada9' },
  electric: { bg: '#f9e79f', text: '#2d2914', accent: '#f39c12' },
  psychic: { bg: '#f8c291', text: '#3d152b', accent: '#e67e22' },
  dragon: { bg: '#a29bfe', text: '#151b3d', accent: '#6c5ce7' },
  poison: { bg: '#d6a2e8', text: '#26153d', accent: '#8e44ad' },
  fighting: { bg: '#fab1a0', text: '#3d1515', accent: '#d63031' },
  default: { bg: '#9cad12', text: '#121a00', accent: '#4d5d00' }
};

const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  specialAttack: 'SPA',
  specialDefense: 'SPD',
  speed: 'SPE'
};

const Collection: React.FC = () => {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTeam, setActiveTeam] = useState('All');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isConsoleOn, setIsConsoleOn] = useState(false);

  useEffect(() => {
    fetchCollection();
    // Power on sound after initial interaction might be tricky, 
    // but typically users will interact with the page first.
    const timer = setTimeout(() => {
      setIsConsoleOn(true);
      soundService.playPowerOn();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const fetchCollection = async () => {
    setLoading(true);
    try {
      const data = await apiService.getCollection();
      setItems(data);
    } catch (err) {
      console.error("Error loading collection:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    return activeTeam === 'All' 
      ? items 
      : items.filter(i => i.team === activeTeam);
  }, [items, activeTeam]);

  useEffect(() => {
    if (filteredItems.length === 0) {
      setSelectedIndex(0);
    } else if (selectedIndex >= filteredItems.length) {
      setSelectedIndex(Math.max(0, filteredItems.length - 1));
    }
  }, [filteredItems, selectedIndex]);

  const currentItem = filteredItems[selectedIndex] || null;

  const handlePowerToggle = () => {
    const newState = !isConsoleOn;
    setIsConsoleOn(newState);
    if (newState) {
      soundService.playPowerOn();
    } else {
      soundService.playPowerOff();
    }
  };

  const handleTeamChange = (team: string) => {
    soundService.playSelect();
    setActiveTeam(team);
    setSelectedIndex(0);
  };

  const handleDelete = async () => {
    if (!currentItem) return;
    if (!window.confirm(`¿Liberar a ${currentItem.pokemonName.toUpperCase()} definitivamente del equipo?`)) return;
    
    const idToDelete = currentItem.id;
    try {
      soundService.playRelease();
      await apiService.deleteFromCollection(idToDelete);
      setItems(prev => prev.filter(item => item.id !== idToDelete));
    } catch (err) {
      soundService.playError();
      alert('Error de conexión: El comando de liberación ha fallado.');
    }
  };

  const nextItem = () => {
    if (filteredItems.length > 1) {
      soundService.playNavigate();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    }
  };

  const prevItem = () => {
    if (filteredItems.length > 1) {
      soundService.playNavigate();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    }
  };

  const radarData = useMemo(() => {
    if (!currentItem?.details?.stats) return [];
    return Object.entries(currentItem.details.stats).map(([key, value]) => ({
      subject: STAT_LABELS[key] || key,
      value: typeof value === 'number' ? value : 0,
      fullMark: 255,
    }));
  }, [currentItem]);

  const lcdTheme = useMemo(() => {
    if (!currentItem?.details?.types?.[0]) return TYPE_LCD_COLORS.default;
    return TYPE_LCD_COLORS[currentItem.details.types[0]] || TYPE_LCD_COLORS.default;
  }, [currentItem]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Loader2 className="animate-spin text-red-600" size={64} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 mb-2 tracking-tighter uppercase italic">Control de Escuadrón</h1>
        <div className="flex items-center justify-center gap-2">
          <div className="h-2 w-2 rounded-full bg-red-600 animate-ping"></div>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs">
            Unidades Operativas: {items.length}
          </p>
        </div>
      </div>

      {/* CHASIS DE LA CONSOLA */}
      <div className="relative bg-[#c0392b] p-4 sm:p-14 rounded-[3.5rem] sm:rounded-[6rem] shadow-[0_40px_0_0_#962d22] border-r-[10px] border-[#962d22] w-full max-w-4xl">
        
        {/* PANTALLA LCD */}
        <div className="bg-slate-300 p-2 sm:p-10 rounded-[2.5rem] sm:rounded-[3.5rem] border-b-[10px] border-slate-400 shadow-inner mb-12">
          
          <div 
            className={`relative w-full rounded-2xl overflow-hidden transition-all duration-700 border-[6px] border-slate-900 flex flex-col`}
            style={{ 
              backgroundColor: isConsoleOn ? lcdTheme.bg : '#0f172a',
              minHeight: '520px'
            }}
          >
            {!isConsoleOn ? (
              <div className="flex-grow flex flex-col items-center justify-center gap-4">
                <Power className="text-slate-800 animate-pulse" size={48} />
                <span className="text-slate-800 font-black text-xs uppercase tracking-widest font-retro">SIN SEÑAL</span>
              </div>
            ) : (
              <div 
                className="flex-grow p-4 sm:p-8 flex flex-col font-retro"
                style={{ color: lcdTheme.text }}
              >
                {/* Header de la Pantalla */}
                <div className="flex justify-between items-start border-b-4 pb-3 mb-6" style={{ borderColor: `${lcdTheme.text}44` }}>
                  <div>
                    <div className="text-[10px] sm:text-sm mb-1 font-black">GRUPO: {activeTeam.toUpperCase()}</div>
                    <div className="text-[8px] opacity-60 uppercase font-bold tracking-widest">
                       {currentItem?.details?.types?.join(' + ') || '---'}
                    </div>
                  </div>
                  <Activity size={20} className="animate-pulse" />
                </div>

                {!currentItem ? (
                  <div className="flex-grow flex flex-col items-center justify-center text-center px-6">
                    <ShieldAlert size={60} className="mb-6 opacity-30" />
                    <div className="text-sm leading-relaxed mb-10 uppercase font-black">Escuadrón Vacío</div>
                    <Link to="/explore" className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-xs hover:invert transition-all uppercase tracking-[0.2em]">
                       Capturar Unidades
                    </Link>
                  </div>
                ) : (
                  <div className="flex-grow flex flex-col">
                    {/* Información Superior */}
                    <div className="flex items-center gap-6 mb-8">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-black/10 rounded-3xl flex items-center justify-center border-2 border-black/10 shrink-0 shadow-lg">
                         <img 
                          src={currentItem.details?.image} 
                          className="w-20 h-20 sm:w-28 sm:h-28 object-contain pixelated drop-shadow-xl" 
                          alt={currentItem.pokemonName} 
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-xl sm:text-4xl uppercase tracking-tighter font-black leading-none mb-3">{currentItem.pokemonName}</h3>
                        
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete();
                          }}
                          className="flex items-center gap-2 bg-black/10 hover:bg-black hover:text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-black/20"
                        >
                          <Trash2 size={14} /> Liberar Unidad
                        </button>
                      </div>
                    </div>

                    {/* GRÁFICO DE ESTADÍSTICAS */}
                    <div className="mb-6 bg-black/5 rounded-[2rem] border-2 border-black/10 p-4">
                      <div className="text-[9px] font-black opacity-40 uppercase mb-4 tracking-widest">Matriz de Combate v4.1</div>
                      
                      <div className="h-[280px] sm:h-[320px] w-full relative">
                        {radarData.length > 0 && (
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                              <PolarGrid stroke={lcdTheme.text} strokeOpacity={0.2} strokeWidth={2} />
                              <PolarAngleAxis 
                                dataKey="subject" 
                                tick={{ fill: lcdTheme.text, fontSize: 10, fontWeight: '900' }} 
                              />
                              <Radar
                                name={currentItem.pokemonName}
                                dataKey="value"
                                stroke={lcdTheme.accent}
                                strokeWidth={4}
                                fill={lcdTheme.accent}
                                fillOpacity={0.4}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                       {radarData.map(stat => (
                         <div key={stat.subject} className="flex flex-col bg-black/10 p-2 rounded-xl border border-black/5">
                            <span className="text-[7px] font-black opacity-40 uppercase">{stat.subject}</span>
                            <span className="text-xs font-black">{stat.value}</span>
                         </div>
                       ))}
                    </div>
                  </div>
                )}

                {/* Footer LCD */}
                <div className="mt-8 flex justify-between items-center text-[10px] pt-4 border-t-4" style={{ borderColor: `${lcdTheme.text}44` }}>
                  <span className="font-black">INDICE: {filteredItems.length > 0 ? selectedIndex + 1 : 0}/{filteredItems.length}</span>
                  <div className="flex gap-2 items-center">
                    <Zap size={12} className="text-emerald-600 animate-pulse" />
                    <span className="font-black tracking-widest">SISTEMA_OK</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CONTROLES FÍSICOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-4">
          
          {/* CRUCETA (D-PAD) */}
          <div className="flex justify-center md:justify-start">
            <div className="relative w-44 h-44">
              <div className="absolute top-1/2 left-0 w-full h-14 bg-slate-800 -translate-y-1/2 rounded-md shadow-[0_8px_0_0_#000] border-y-2 border-slate-700"></div>
              <div className="absolute left-1/2 top-0 h-full w-14 bg-slate-800 -translate-x-1/2 rounded-md shadow-[0_8px_0_0_#000] border-x-2 border-slate-700"></div>
              
              <button 
                onClick={() => {
                  const idx = TEAMS.indexOf(activeTeam);
                  handleTeamChange(TEAMS[(idx - 1 + TEAMS.length) % TEAMS.length]);
                }} 
                className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-14 bg-slate-700 hover:bg-slate-600 active:translate-y-1 rounded-t-xl flex items-center justify-center text-white z-20 border-b-4 border-black"
              >
                <ChevronUp size={36} strokeWidth={3} />
              </button>
              <button 
                onClick={() => {
                  const idx = TEAMS.indexOf(activeTeam);
                  handleTeamChange(TEAMS[(idx + 1) % TEAMS.length]);
                }} 
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-14 bg-slate-700 hover:bg-slate-600 active:translate-y-[-4px] rounded-b-xl flex items-center justify-center text-white z-20 border-b-4 border-black"
              >
                <ChevronDown size={36} strokeWidth={3} />
              </button>
              
              <button 
                onClick={prevItem} 
                className="absolute left-0 top-1/2 -translate-y-1/2 w-14 h-14 bg-slate-700 hover:bg-slate-600 active:translate-x-1 rounded-l-xl flex items-center justify-center text-white z-20 border-b-4 border-black"
              >
                <ChevronLeft size={36} strokeWidth={3} />
              </button>
              <button 
                onClick={nextItem} 
                className="absolute right-0 top-1/2 -translate-y-1/2 w-14 h-14 bg-slate-700 hover:bg-slate-600 active:translate-x-[-4px] rounded-r-xl flex items-center justify-center text-white z-20 border-b-4 border-black"
              >
                <ChevronRight size={36} strokeWidth={3} />
              </button>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-600 shadow-inner"></div>
            </div>
          </div>

          {/* ACCIÓN SECUNDARIA */}
          <div className="flex flex-col gap-6">
             <div className="grid grid-cols-3 gap-4">
                {TEAMS.map(team => (
                  <button 
                    key={team}
                    onClick={() => handleTeamChange(team)}
                    className={`py-5 rounded-3xl text-[10px] font-black border-b-[8px] transition-all active:translate-y-1 active:border-b-0 ${activeTeam === team ? 'bg-slate-900 border-black text-white' : 'bg-slate-200 border-slate-400 text-slate-700'}`}
                  >
                    {team.toUpperCase()}
                  </button>
                ))}
             </div>
             
             <div className="flex justify-end gap-6 pt-4">
                <div className="flex flex-col items-center gap-3">
                  <button 
                    onClick={handlePowerToggle}
                    className={`w-20 h-20 rounded-full border-b-[10px] transition-all active:translate-y-1 active:border-b-0 flex items-center justify-center ${isConsoleOn ? 'bg-emerald-500 border-emerald-700 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-slate-800 border-black text-slate-500'}`}
                  >
                    <Power size={32} />
                  </button>
                  <span className="text-[10px] font-black text-red-950 uppercase tracking-widest">Power</span>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <Link 
                    to="/explore"
                    onClick={() => soundService.playSelect()}
                    className="w-20 h-20 rounded-full bg-white border-b-[10px] border-slate-300 flex items-center justify-center text-red-600 hover:bg-slate-100 transition-all active:translate-y-1 active:border-b-0"
                  >
                    <Gamepad size={32} />
                  </Link>
                  <span className="text-[10px] font-black text-red-950 uppercase tracking-widest">Capturar</span>
                </div>
             </div>
          </div>
        </div>
      </div>
      
      <div className="mt-20 flex items-center gap-8 text-slate-300 text-[10px] font-black uppercase tracking-[0.8em]">
        <div className="h-px w-24 bg-slate-200"></div>
        Nex-Gen Terminal OS v5.2 // Audio Linked
        <div className="h-px w-24 bg-slate-200"></div>
      </div>
    </div>
  );
};

export default Collection;
