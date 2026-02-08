
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Loader2, 
  Weight, 
  Ruler, 
  Sparkles, 
  Zap, 
  Info,
  Activity,
  Trophy
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer,
} from 'recharts';
import { apiService } from '../services/apiService';
import { PokemonDetail } from '../types';

const STAT_CONFIG: Record<string, { label: string, color: string, short: string }> = {
  hp: { label: 'Health Points', short: 'HP', color: '#ff4d4d' },
  attack: { label: 'Physical Attack', short: 'ATK', color: '#f0932b' },
  defense: { label: 'Physical Defense', short: 'DEF', color: '#f9ca24' },
  specialAttack: { label: 'Special Attack', short: 'SPA', color: '#4834d4' },
  specialDefense: { label: 'Special Defense', short: 'SPD', color: '#6ab04c' },
  speed: { label: 'Movement Speed', short: 'SPE', color: '#eb4d4b' },
};

const TYPE_BG: Record<string, string> = {
  fire: 'bg-orange-50',
  water: 'bg-blue-50',
  grass: 'bg-emerald-50',
  electric: 'bg-yellow-50',
  psychic: 'bg-pink-50',
  dragon: 'bg-indigo-50',
};

const PokemonDetailPage: React.FC = () => {
  const { nameOrId } = useParams<{ nameOrId: string }>();
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!nameOrId) return;
      try {
        const data = await apiService.getPokemonDetail(nameOrId);
        setPokemon(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [nameOrId]);

  const generateAiInsight = async () => {
    if (!pokemon) return;
    setAiLoading(true);
    try {
      const insight = await apiService.getAiInsight(pokemon.name, pokemon.types, pokemon.stats);
      setAiInsight(insight);
    } catch (err) {
      alert('AI service currently unavailable');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin text-red-600" size={48} />
    </div>
  );

  if (!pokemon) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-black mb-4">Pokémon not found!</h2>
      <Link to="/explore" className="text-red-600 font-bold hover:underline">Back to Explore</Link>
    </div>
  );

  // Stats for Radar Chart
  const radarData = Object.entries(pokemon.stats).map(([key, value]) => ({
    subject: STAT_CONFIG[key]?.short || key,
    value,
    fullMark: 255,
  }));

  // Fix: Explicitly cast values to number array for reduce operation to avoid 'unknown' operator error
  const bst = (Object.values(pokemon.stats) as number[]).reduce((a, b) => a + b, 0);
  const mainType = pokemon.types[0];
  const bgColor = TYPE_BG[mainType] || 'bg-slate-50';

  return (
    <div className={`min-h-screen ${bgColor} transition-colors duration-1000 pb-20`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <Link to="/explore" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-extrabold text-sm transition-all mb-10 uppercase tracking-widest">
          <ArrowLeft size={18} strokeWidth={3} /> Return to PokéDex
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Section: Visuals */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="bg-white rounded-[3.5rem] p-12 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] relative overflow-hidden flex flex-col items-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-20 -mt-20"></div>
              
              <span className="z-10 text-slate-300 font-black text-4xl mb-6">#{String(pokemon.id).padStart(3, '0')}</span>
              
              <img 
                src={pokemon.image} 
                alt={pokemon.name} 
                className="z-10 w-72 h-72 object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.2)] hover:scale-105 transition-transform duration-700"
              />
              
              <h1 className="z-10 text-6xl font-black text-slate-900 capitalize mt-8 mb-4 tracking-tight">{pokemon.name}</h1>
              
              <div className="z-10 flex gap-3 mb-12">
                {pokemon.types.map(type => (
                  <span key={type} className="px-8 py-2.5 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20">
                    {type}
                  </span>
                ))}
              </div>

              <div className="z-10 grid grid-cols-2 gap-4 w-full">
                <div className="bg-slate-50 rounded-[2rem] p-6 flex flex-col items-center border border-slate-100">
                   <div className="bg-white p-3 rounded-2xl shadow-sm text-blue-500 mb-3"><Ruler size={24} /></div>
                   <span className="text-2xl font-black text-slate-800 tracking-tighter">{pokemon.height / 10}m</span>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Height</span>
                </div>
                <div className="bg-slate-50 rounded-[2rem] p-6 flex flex-col items-center border border-slate-100">
                   <div className="bg-white p-3 rounded-2xl shadow-sm text-orange-500 mb-3"><Weight size={24} /></div>
                   <span className="text-2xl font-black text-slate-800 tracking-tighter">{pokemon.weight / 10}kg</span>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Weight</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
              <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                <Info className="text-slate-300" size={24} strokeWidth={3} /> Core Abilities
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {pokemon.abilities.map(ability => (
                  <div key={ability} className="bg-slate-50 p-5 rounded-2xl flex items-center justify-between group hover:bg-slate-900 transition-all duration-300 cursor-default border border-slate-100">
                    <span className="font-extrabold text-slate-700 group-hover:text-white capitalize">{ability}</span>
                    <Zap className="text-slate-200 group-hover:text-yellow-400" size={18} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Advanced Stats & AI */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <div className="bg-white rounded-[3.5rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] border border-white flex flex-col">
              <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-600 rounded-2xl text-white shadow-lg shadow-red-100">
                    <Activity size={24} strokeWidth={3} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Battle DNA</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Base Statistics Matrix</p>
                  </div>
                </div>
                <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 flex flex-col items-end">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Base Stat Total</span>
                   <span className="text-2xl font-black text-red-600 leading-none">{bst}</span>
                </div>
              </div>

              <div className="p-8 grid grid-cols-1 xl:grid-cols-2 gap-10">
                {/* Radar visualization */}
                <div className="flex items-center justify-center bg-slate-50 rounded-[2.5rem] p-4 min-h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="#e2e8f0" strokeWidth={1} />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 800 }} />
                      <Radar
                        name={pokemon.name}
                        dataKey="value"
                        stroke="#ef4444"
                        strokeWidth={3}
                        fill="#ef4444"
                        fillOpacity={0.15}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Tactical Bars */}
                <div className="space-y-5 flex flex-col justify-center">
                  {Object.entries(pokemon.stats).map(([key, value]) => {
                    const config = STAT_CONFIG[key];
                    // Fix: Explicitly treat value as number for arithmetic operations to resolve 'unknown' type error
                    const percentage = Math.min(((value as number) / 180) * 100, 100); // 180 is a high enough cap for visual impact
                    return (
                      <div key={key} className="space-y-1.5">
                        <div className="flex justify-between items-end px-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{config.label}</span>
                          <span className="text-sm font-black text-slate-700 font-mono">{value}</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                          <div 
                            className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_-2px_rgba(0,0,0,0.1)]"
                            style={{ 
                              width: `${percentage}%`, 
                              backgroundColor: config.color,
                              boxShadow: `0 0 10px ${config.color}44`
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* AI Module */}
            <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/30 rounded-full blur-[100px] -mr-40 -mt-40 group-hover:bg-red-500/40 transition-colors duration-1000"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="bg-red-600 p-4 rounded-2xl shadow-2xl shadow-red-600/40 transform -rotate-3 group-hover:rotate-0 transition-transform">
                      <Sparkles size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black tracking-tight">AI Battle Protocol</h3>
                      <p className="text-red-400 text-xs font-bold uppercase tracking-widest mt-0.5">Tactical Analysis 2.0</p>
                    </div>
                  </div>
                  {!aiInsight && !aiLoading && (
                    <button 
                      onClick={generateAiInsight}
                      className="bg-white text-slate-900 px-8 py-4 rounded-[1.5rem] font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10"
                    >
                      Analyze Target
                    </button>
                  )}
                </div>

                {aiLoading ? (
                  <div className="py-16 flex flex-col items-center">
                    <div className="relative mb-6">
                      <Loader2 className="animate-spin text-red-500" size={56} strokeWidth={3} />
                      <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white animate-pulse" size={20} />
                    </div>
                    <p className="text-slate-400 font-bold tracking-widest uppercase text-[10px] animate-pulse">Scanning genetic capabilities...</p>
                  </div>
                ) : aiInsight ? (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 leading-relaxed text-slate-300 font-medium">
                      {aiInsight.split('\n').map((para, i) => (
                        <p key={i} className={i > 0 ? 'mt-6' : ''}>{para}</p>
                      ))}
                    </div>
                    <button 
                      onClick={() => setAiInsight(null)}
                      className="text-[10px] font-black text-slate-500 hover:text-white transition-all uppercase tracking-[0.3em]"
                    >
                      Dismiss Report
                    </button>
                  </div>
                ) : (
                  <div className="p-8 bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <p className="text-slate-400 leading-relaxed font-medium">
                      Initiate the AI module to receive a deep-dive tactical report, including optimal combat roles, counters, and synergy recommendations.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonDetailPage;
