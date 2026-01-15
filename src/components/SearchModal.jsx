import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2, Star, ArrowRight, User, Wrench, MapPin } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await axios.post(`${API_URL}/api/search/technicians`, {
          searchTerm: query,
          limit: 5
        });
        setResults(response.data.technicians || []);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="bg-zinc-900 w-full max-w-2xl rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-top-4 duration-300 relative z-[101]">
        {/* Search Input */}
        <div className="p-6 border-b border-zinc-800 flex items-center gap-4">
          <Search className="h-6 w-6 text-zinc-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search technicians, services, or brands..."
            className="flex-1 bg-transparent text-xl font-['Inter'] text-white placeholder-zinc-500 outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-4 py-2 mt-2">
                Technicians Found ({results.length})
              </p>
              {results.map((tech) => (
                <button
                  key={tech.id}
                  onClick={() => {
                    navigate(`/technicians`);
                    onClose();
                  }}
                  className="w-full flex items-center gap-4 p-4 hover:bg-zinc-800/50 rounded-2xl transition-all group"
                >
                  <div className="h-12 w-12 rounded-xl bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-700">
                    {tech.profile_image ? (
                      <img src={tech.profile_image} alt={tech.name} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-6 w-6 text-zinc-500" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{tech.name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center text-xs text-zinc-400">
                        <Star className="h-3 w-3 text-yellow-500 mr-1 fill-yellow-500" />
                        {tech.rating || 'N/A'}
                      </span>
                      <span className="flex items-center text-xs text-zinc-400">
                        <MapPin className="h-3 w-3 mr-1" />
                        {tech.district || 'Location N/A'}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-zinc-600 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="py-12 text-center">
              <div className="h-16 w-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-zinc-600" />
              </div>
              <h3 className="text-lg font-bold text-white">No results found</h3>
              <p className="text-zinc-500 text-sm mt-1">Try a different keyword or check spelling</p>
            </div>
          ) : (
            <div className="p-4 space-y-6">
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Popular Categories</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Screen Repair', path: '/mobile-repair' },
                    { label: 'Laptop Diagnosis', path: '/pc-repair' },
                    { label: 'Battery Swap', path: '/mobile-repair' },
                    { label: 'OS Recovery', path: '/pc-repair' }
                  ].map((cat, idx) => (
                    <button
                      key={idx}
                      onClick={() => { navigate(cat.path); onClose(); }}
                      className="flex items-center gap-3 p-3 bg-zinc-800/30 hover:bg-zinc-800 rounded-xl text-sm text-zinc-300 transition-colors border border-zinc-800"
                    >
                      <Wrench className="h-4 w-4 text-emerald-500" />
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950/50 border-t border-zinc-800 flex justify-between items-center">
          <p className="text-[10px] text-zinc-500 font-medium">
            Search techniques, services and verified technicians across Sri Lanka.
          </p>
          <div className="flex gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-400">ESC</kbd>
            <span className="text-[10px] text-zinc-600">to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
