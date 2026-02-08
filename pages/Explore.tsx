
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, ChevronLeft, ChevronRight, X, Filter } from 'lucide-react';
import PokemonCard from '../components/PokemonCard';
import { PokemonSummary } from '../types';
import { apiService } from '../services/apiService';

const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 
  'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

const Explore: React.FC = () => {
  const [pokemon, setPokemon] = useState<PokemonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [collectionIds, setCollectionIds] = useState<number[]>([]);
  const LIMIT = 20;

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
        apiService.getPokemonList(LIMIT, page * LIMIT, debouncedSearch, selectedType),
        apiService.getCollection()
      ]);
      setPokemon(pokedata.results);
      setTotal(pokedata.count);
      setCollectionIds(collectionData.map((item: any) => item.pokemonId));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, selectedType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = async (summary: PokemonSummary) => {
    try {
      await apiService.addToCollection(summary.id, summary.name);
      setCollectionIds(prev => [...prev, summary.id]);
    } catch (err) {
      alert('Error adding to collection');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setPage(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 mb-20">
        <div className="max-w-xl">
          <div className="flex items-center gap-3 mb-4">
             <div className="h-1 w-12 bg-red-600 rounded-full"></div>
             <span className="text-red-600 font-black text-xs uppercase tracking-[0.4em]">Global Database</span>
          </div>
          <h1 className="text-6xl font-extrabold text-slate-900 tracking-tight leading-none mb-6">Explore the PokéDex.</h1>
          <p className="text-slate-400 font-medium text-lg">Harness cutting-edge data to track, analyze, and catch species from across the regions.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:max-w-2xl">
          <div className="relative flex-grow">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} strokeWidth={3} />
            <input 
              type="text" 
              placeholder="Search by name or serial ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-5 bg-white border border-slate-200 rounded-[2rem] focus:ring-4 focus:ring-red-100 focus:border-red-500 outline-none transition-all shadow-sm font-bold text-slate-800 placeholder:text-slate-300"
            />
          </div>
          
          <div className="relative min-w-[180px]">
            <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} strokeWidth={3} />
            <select 
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); setPage(0); }}
              className="w-full pl-14 pr-10 py-5 bg-white border border-slate-200 rounded-[2rem] focus:ring-4 focus:ring-red-100 outline-none transition-all shadow-sm font-black text-slate-700 appearance-none capitalize cursor-pointer tracking-wider text-sm"
            >
              <option value="">All Types</option>
              {POKEMON_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40">
          <div className="relative mb-8">
             <div className="absolute inset-0 bg-red-100 blur-2xl rounded-full scale-150 animate-pulse"></div>
             <Loader2 className="animate-spin text-red-600 relative z-10" size={64} strokeWidth={3} />
          </div>
          <p className="text-slate-300 font-black tracking-[0.5em] uppercase text-xs">Syncing Regions...</p>
        </div>
      ) : pokemon.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-10 mb-20">
            {pokemon.map(p => (
              <PokemonCard 
                key={p.id} 
                pokemon={p} 
                isCollected={collectionIds.includes(p.id)}
                onAdd={handleAdd}
              />
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 py-12 border-t border-slate-100">
            <button 
              disabled={page === 0}
              onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="w-14 h-14 rounded-[1.5rem] bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 disabled:opacity-20 transition-all flex items-center justify-center shadow-sm"
            >
              <ChevronLeft size={24} strokeWidth={3} />
            </button>
            
            <div className="px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm tracking-widest shadow-2xl shadow-slate-900/20">
              PAGE {page + 1}
            </div>

            <button 
              disabled={(page + 1) * LIMIT >= total}
              onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="w-14 h-14 rounded-[1.5rem] bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 disabled:opacity-20 transition-all flex items-center justify-center shadow-sm"
            >
              <ChevronRight size={24} strokeWidth={3} />
            </button>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-[4rem] py-32 text-center border border-slate-100 shadow-sm">
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Species Unknown</h2>
          <p className="text-slate-400 max-w-sm mx-auto font-medium">We couldn't find a match for that signature in our global database.</p>
          <button onClick={clearFilters} className="mt-10 px-8 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest text-xs">Reset Filters</button>
        </div>
      )}
    </div>
  );
};

export default Explore;
