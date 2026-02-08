
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { 
  Search, 
  Library, 
  LogOut, 
  Menu,
  X,
  Aperture,
  Zap
} from 'lucide-react';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Explore from './pages/Explore';
import Collection from './pages/Collection';
import PokemonDetailPage from './pages/PokemonDetail';

// Types
import { User } from './types';

const Logo = () => (
  <div className="flex items-center gap-2 group">
    <div className="relative">
      <div className="absolute inset-0 bg-red-500 blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
      <div className="relative bg-gradient-to-br from-red-500 to-rose-600 p-2 rounded-xl text-white shadow-lg shadow-red-200 group-hover:rotate-12 transition-transform duration-500">
        <Aperture size={22} strokeWidth={2.5} />
      </div>
    </div>
    <div className="flex flex-col leading-none">
      <span className="text-slate-900 font-extrabold tracking-tight text-lg">PokéDex</span>
      <span className="text-red-500 font-bold text-[10px] uppercase tracking-[0.2em]">Manager Pro</span>
    </div>
  </div>
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('pokedex_user');
    const token = localStorage.getItem('pokedex_token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('pokedex_token');
    localStorage.removeItem('pokedex_user');
    setUser(null);
    setIsMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="relative">
          <div className="absolute inset-0 bg-red-500 blur-2xl opacity-20 animate-pulse"></div>
          <Aperture size={64} className="animate-spin text-red-500 relative z-10" />
        </div>
      </div>
    );
  }

  const ProtectedRoute: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    if (!user) return <Navigate to="/login" />;
    return <>{children}</>;
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {user && (
          <nav className="glass-nav border-b border-slate-200/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-20">
                <div className="flex items-center">
                  <Link to="/" className="no-underline">
                    <Logo />
                  </Link>
                </div>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/explore" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50 font-bold transition-all">
                    <Search size={18} strokeWidth={2.5} />
                    Explore
                  </Link>
                  <Link to="/collection" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50 font-bold transition-all">
                    <Library size={18} strokeWidth={2.5} />
                    Collection
                  </Link>
                  <div className="h-6 w-px bg-slate-200 mx-4"></div>
                  <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 flex items-center justify-center font-bold text-slate-600 text-xs">
                      {user.name?.[0].toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-bold text-slate-700">{user.name || user.email}</span>
                    <button 
                      onClick={handleLogout}
                      className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <LogOut size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center">
                  <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-600">
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Nav */}
            {isMenuOpen && (
              <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-2">
                <Link to="/explore" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-slate-600 font-bold p-4 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all">
                  <Search size={22} /> Explore
                </Link>
                <Link to="/collection" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-slate-600 font-bold p-4 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all">
                  <Library size={22} /> Collection
                </Link>
                <div className="pt-2 border-t border-slate-100">
                   <button onClick={handleLogout} className="w-full flex items-center gap-3 text-red-600 font-bold p-4 hover:bg-red-50 rounded-2xl transition-all">
                    <LogOut size={22} /> Logout
                  </button>
                </div>
              </div>
            )}
          </nav>
        )}

        <main className="flex-grow">
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/explore" /> : <Login onAuth={setUser} />} />
            <Route path="/register" element={user ? <Navigate to="/explore" /> : <Register onAuth={setUser} />} />
            <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
            <Route path="/collection" element={<ProtectedRoute><Collection /></ProtectedRoute>} />
            <Route path="/pokemon/:nameOrId" element={<ProtectedRoute><PokemonDetailPage /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to={user ? "/explore" : "/login"} />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-slate-200 py-12 text-center">
          <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
            <Logo />
            <p className="mt-6 text-slate-400 font-medium text-sm">
              © 2024 PokéDex Pro. Crafted for serious trainers.
            </p>
            <div className="flex gap-6 mt-6">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
