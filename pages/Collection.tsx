
import React, { useState, useEffect } from 'react';
import { Loader2, Trash2, Edit2, Check, X, Calendar, StickyNote, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { CollectionItem } from '../types';

const Collection: React.FC = () => {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNote, setEditNote] = useState('');

  useEffect(() => {
    fetchCollection();
  }, []);

  const fetchCollection = async () => {
    setLoading(true);
    try {
      const data = await apiService.getCollection();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to release this Pokémon?')) return;
    try {
      await apiService.deleteFromCollection(id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      await apiService.updateCollectionNote(id, editNote);
      setItems(prev => prev.map(item => item.id === id ? { ...item, note: editNote } : item));
      setEditingId(null);
    } catch (err) {
      alert('Failed to update note');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-red-600" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 mb-2">My Collection</h1>
        <p className="text-slate-500 font-medium">You have caught {items.length} Pokémon so far!</p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
          <div className="mx-auto w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <StickyNote className="text-slate-300" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Your PokéDex is empty</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">Go to the Explore page to start catching Pokémon and building your ultimate team.</p>
          <Link to="/explore" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-red-200">
            Go Catch 'Em All
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
              <div className="w-full md:w-48 aspect-square bg-slate-50 rounded-2xl flex items-center justify-center relative overflow-hidden group">
                {item.details?.image ? (
                   <img src={item.details.image} alt={item.pokemonName} className="w-32 h-32 object-contain drop-shadow-md z-10" />
                ) : (
                   <div className="text-slate-300 font-bold text-xl uppercase">{item.pokemonName[0]}</div>
                )}
                <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/5 transition-colors"></div>
              </div>

              <div className="flex-grow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-black text-slate-800 capitalize">{item.pokemonName}</h3>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Calendar size={14} />
                    <span className="text-xs font-bold">{new Date(item.capturedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <StickyNote size={14} />
                    <span className="text-xs font-bold uppercase tracking-wider">Trainer Note</span>
                  </div>
                  {editingId === item.id ? (
                    <div className="flex gap-2">
                      <input 
                        className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-red-100 outline-none"
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                        placeholder="Add a custom note..."
                        autoFocus
                      />
                      <button onClick={() => handleUpdate(item.id)} className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600"><Check size={18} /></button>
                      <button onClick={() => setEditingId(null)} className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200"><X size={18} /></button>
                    </div>
                  ) : (
                    <div className="group/note flex items-center justify-between bg-slate-50 rounded-xl p-3 border border-slate-100 min-h-[3rem]">
                      <p className="text-slate-600 text-sm italic">
                        {item.note || 'No trainer notes added yet.'}
                      </p>
                      <button 
                        onClick={() => { setEditingId(item.id); setEditNote(item.note || ''); }}
                        className="opacity-0 group-hover/note:opacity-100 p-1.5 text-slate-400 hover:text-red-600 transition-all"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-auto">
                  <Link 
                    to={`/pokemon/${item.pokemonId}`}
                    className="flex-grow flex items-center justify-center gap-2 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                  >
                    <Info size={16} /> Details
                  </Link>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="flex items-center justify-center p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="Release Pokémon"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Collection;
