
import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Check, ExternalLink } from 'lucide-react';
import { PokemonSummary } from '../types';

interface PokemonCardProps {
  pokemon: PokemonSummary;
  isCollected?: boolean;
  onAdd?: (pokemon: PokemonSummary) => void;
}

const TYPE_COLORS: Record<string, string> = {
  fire: 'from-orange-400 to-red-500',
  water: 'from-blue-400 to-blue-600',
  grass: 'from-emerald-400 to-green-600',
  electric: 'from-yellow-300 to-amber-500',
  ice: 'from-cyan-300 to-blue-400',
  fighting: 'from-red-600 to-rose-800',
  poison: 'from-purple-400 to-fuchsia-700',
  ground: 'from-amber-600 to-yellow-800',
  flying: 'from-indigo-300 to-blue-500',
  psychic: 'from-pink-400 to-rose-600',
  bug: 'from-lime-400 to-green-700',
  rock: 'from-stone-500 to-gray-700',
  ghost: 'from-violet-600 to-indigo-900',
  dragon: 'from-indigo-500 to-purple-800',
  dark: 'from-slate-700 to-slate-900',
  steel: 'from-gray-300 to-slate-500',
  fairy: 'from-rose-200 to-pink-400',
  normal: 'from-slate-300 to-slate-500'
};

const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon, isCollected, onAdd }) => {
  const typeGradient = TYPE_COLORS[pokemon.types[0]] || 'from-slate-300 to-slate-500';

  return (
    <div className="pokemon-card-glow bg-white rounded-[2.5rem] p-4 border border-slate-100 transition-all duration-500 hover:-translate-y-2 group flex flex-col">
      <div className={`relative aspect-[4/3] rounded-[2rem] bg-gradient-to-br ${typeGradient} overflow-hidden mb-5 flex items-center justify-center shadow-inner`}>
        {/* Subtle decorative background circle */}
        <div className="absolute w-40 h-40 bg-white/20 rounded-full blur-2xl -bottom-10 -right-10"></div>
        <div className="absolute w-20 h-20 bg-white/10 rounded-full blur-xl -top-5 -left-5"></div>
        
        <span className="absolute top-4 left-5 text-white/50 font-black text-xs tracking-widest">#{String(pokemon.id).padStart(3, '0')}</span>
        
        {isCollected && (
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white p-2 rounded-full shadow-lg">
            <Check size={16} strokeWidth={3} />
          </div>
        )}

        <img 
          src={pokemon.image} 
          alt={pokemon.name} 
          className="w-36 h-36 object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.3)] group-hover:scale-110 transition-transform duration-500 z-10"
        />
      </div>

      <div className="px-3 pb-2 flex-grow">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-xl font-extrabold text-slate-800 capitalize leading-tight group-hover:text-red-600 transition-colors">{pokemon.name}</h3>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {pokemon.types.map(type => (
            <span key={type} className="bg-slate-100 text-slate-500 text-[9px] uppercase font-black px-3 py-1 rounded-lg tracking-widest border border-slate-200/50">
              {type}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-2 p-1">
        <Link 
          to={`/pokemon/${pokemon.id}`}
          className="flex-grow flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-slate-200"
        >
          <ExternalLink size={14} /> Details
        </Link>
        
        {!isCollected && (
          <button 
            onClick={() => onAdd?.(pokemon)}
            className="flex items-center justify-center bg-red-50 text-red-600 p-4 rounded-2xl hover:bg-red-600 hover:text-white transition-all border border-red-100 group/btn"
          >
            <Plus size={20} strokeWidth={3} className="group-hover/btn:rotate-90 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
};

export default PokemonCard;
