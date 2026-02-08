
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Loader2, ChevronLeft, ChevronRight, Filter, Globe, Plus, X, AlertCircle } from 'lucide-react';
import PokemonCard from '../components/PokemonCard';
import { PokemonSummary, CollectionItem } from '../types';
import { apiService } from '../services/apiService';

const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 
  'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

const GENS = [
  { id: '1', region: 'Kanto' },
  { id: '2', region: 'Johto' },
  { id: '3', region: 'Hoenn' },
  { id: '4', region: 'Sinnoh' },
  { id: '5', region: 'Unova' },
  { id: '6', region: 'Kalos' },
  { id: '7', region: 'Alola' },
  { id: '8', region: 'Galar' },
  { id: '9', region: 'Paldea' },
];

const TEAMS = ['Alpha', 'Beta', 'Omega', 'Vanguard', 'Personal'];
const LIMIT = 20;

const Explore: React.FC = () => {
  const [pokemon, setPokemon] = useState<PokemonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedGen, setSelectedGen] = useState<string>('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [collection, setCollection] = useState<CollectionItem[]>([]);
  const [capturingPokemon, setCapturingPokemon] = useState<PokemonSummary | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pokedata, collectionData] = await Promise.all([
        apiService.getPokemonList(LIMIT, page * LIMIT, debouncedSearch, selectedType, selectedGen),
        apiService.getCollection()
      ]);
      setPokemon(pokedata.results);
      setTotal(pokedata.count);
      setCollection(collectionData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, selectedType, selectedGen]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCapture = async (team: string) => {
    if (!capturingPokemon) return;
    const teamCount = collection.filter(i => i.team === team).length;
    
    if (teamCount >= 6) {
      alert(`El equipo ${team} ya tiene el máximo reglamentario de 6 Pokémon.`);
      return;
    }
    
    try {
      await apiService.addToCollection(capturingPokemon.id, capturingPokemon.name, undefined, team);
      // Refetch collection to get updated state
      const updatedCollection = await apiService.getCollection();
      setCollection(updatedCollection);
      setCapturingPokemon(null);
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || 'Error en la captura.');
    }
  };

  const collectionIds = useMemo(() => collection.map(i => i.pokemonId), [collection]);
  
  const totalPages = Math.ceil(total / LIMIT);
  const pageNumbers = useMemo(() => {
    const pages = [];
    const start = Math.max(0, page - 2);
    const end = Math.min(totalPages, start + 5);
    for (let i = start; i < end; i++) pages.push(i);
    return pages;
  }, [page, totalPages]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 mb-20">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <div className="h-1 w-12 bg-red-600 rounded-full"></div>
             <span className="text-red-600 font-black text-xs uppercase tracking-[0.4em]">Exploración Global</span>
          </div>
          <h1 className="text-6xl font-extrabold text-slate-900 tracking-tight leading-none mb-6">Discovery.</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Equipos operativos gestionados: {TEAMS.length}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full lg:max-w-3xl">
          <div className="relative">
            <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} strokeWidth={3} />
            <select 
              value={selectedGen}
              onChange={(e) => { setSelectedGen(e.target.value); setPage(0); }}
              className="w-full pl-14 pr-8 py-5 bg-white border border-slate-200 rounded-[2rem] outline-none shadow-sm font-black text-slate-700 appearance-none text-sm cursor-pointer hover:border-red-200 transition-colors"
            >
              <option value="">Todas las Regiones</option>
              {GENS.map(g => <option key={g.id} value={g.id}>{g.region}</option>)}
            </select>
          </div>
          <div className="relative">
            <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} strokeWidth={3} />
            <select 
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); setPage(0); }}
              className="w-full pl-14 pr-8 py-5 bg-white border border-slate-200 rounded-[2rem] outline-none shadow-sm font-black text-slate-700 appearance-none text-sm capitalize cursor-pointer hover:border-red-200 transition-colors"
            >
              <option value="">Todos los Tipos</option>
              {POKEMON_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} strokeWidth={3} />
            <input 
              type="text" 
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-5 bg-white border border-slate-200 rounded-[2rem] outline-none shadow-sm font-bold text-slate-800 placeholder:text-slate-300 text-sm focus:border-red-400 transition-all"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40">
          <Loader2 className="animate-spin text-red-600 mb-8" size={64} strokeWidth={3} />
          <p className="text-slate-300 font-black tracking-[0.5em] uppercase text-xs">Sincronizando Poke-Red...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-20">
            {pokemon.map(p => (
              <PokemonCard 
                key={p.id} 
                pokemon={p} 
                isCollected={collectionIds.includes(p.id)}
                onAdd={() => setCapturingPokemon(p)}
              />
            ))}
          </div>

          <div className="flex flex-col items-center gap-6 py-12 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <button 
                disabled={page === 0} 
                onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-600 flex items-center justify-center shadow-sm disabled:opacity-20 transition-all"
              >
                <ChevronLeft size={20} strokeWidth={3} />
              </button>
              
              <div className="flex items-center gap-1">
                {pageNumbers.map(n => (
                  <button
                    key={n}
                    onClick={() => { setPage(n); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`w-12 h-12 rounded-xl font-black text-sm transition-all ${page === n ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                  >
                    {n + 1}
                  </button>
                ))}
              </div>

              <button 
                disabled={(page + 1) >= totalPages} 
                onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-600 flex items-center justify-center shadow-sm disabled:opacity-20 transition-all"
              >
                <ChevronRight size={20} strokeWidth={3} />
              </button>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Mostrando {LIMIT} de {total} especies encontradas</p>
          </div>
        </>
      )}

      {capturingPokemon && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl border border-white/20 transform animate-in zoom-in slide-in-from-bottom-10 duration-500">
            <div className="flex justify-between items-start mb-8">
              <div>
                <span className="text-red-600 font-black text-[10px] uppercase tracking-[0.3em]">Asignación de Unidad</span>
                <h3 className="text-3xl font-black text-slate-900 mt-2">Equipo de Destino</h3>
              </div>
              <button onClick={() => setCapturingPokemon(null)} className="p-2 text-slate-400 hover:text-red-600 transition-all"><X size={28} /></button>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 mb-8">
              <img src={capturingPokemon.image} alt={capturingPokemon.name} className="w-20 h-20 object-contain drop-shadow-md" />
              <div>
                <h4 className="text-xl font-black text-slate-800 capitalize">{capturingPokemon.name}</h4>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">ID #{String(capturingPokemon.id).padStart(3, '0')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {TEAMS.map(team => {
                const count = collection.filter(i => i.team === team).length;
                const isFull = count >= 6;
                return (
                  <button 
                    key={team}
                    disabled={isFull}
                    onClick={() => handleCapture(team)}
                    className={`w-full py-4 px-6 rounded-2xl font-black text-sm text-left transition-all flex justify-between items-center group border ${isFull ? 'bg-slate-100 text-slate-300 cursor-not-allowed border-slate-200' : 'bg-slate-50 hover:bg-red-600 text-slate-700 hover:text-white border-slate-100'}`}
                  >
                    <div className="flex flex-col">
                      <span>{team} Team</span>
                      <span className={`text-[10px] font-bold ${isFull ? 'text-slate-400' : 'text-slate-400 group-hover:text-red-200'}`}>{count}/6 slots</span>
                    </div>
                    {isFull ? <AlertCircle size={16} /> : <Plus size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;
