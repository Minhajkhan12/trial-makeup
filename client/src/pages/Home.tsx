import React, { useState } from 'react';
import { Sparkles, MapPin, Star, Heart, Search, SlidersHorizontal, UserCircle, Calendar } from 'lucide-react';
import { artists, Artist } from '../data/artists';
import { AnimatePresence, motion } from 'framer-motion';

export default function Home() {
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [savedArtists, setSavedArtists] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSave = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSavedArtists(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const filteredArtists = artists.filter(artist => 
    artist.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    artist.style.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      {/* Web App Header */}
      <header className="px-8 py-5 border-b border-border bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Sparkles className="text-primary" size={24} />
            </div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Bridal Beauty Match</h1>
          </div>
          
          <div className="flex-1 max-w-md mx-8 relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text" 
              placeholder="Search artists or styles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted rounded-full border-none focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="text-muted-foreground hover:text-foreground font-medium text-sm transition-colors">
              Saved ({savedArtists.length})
            </button>
            <button className="text-muted-foreground hover:text-foreground font-medium text-sm transition-colors">
              Messages
            </button>
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center cursor-pointer">
              <UserCircle className="text-secondary-foreground" size={24} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-8 flex gap-8">
        {/* Left Sidebar - Filters */}
        <aside className="w-64 hidden lg:block shrink-0">
          <div className="sticky top-28 space-y-8">
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <SlidersHorizontal size={18} /> Filters
              </h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Location</h4>
                  <div className="space-y-2">
                    {['New York, NY', 'Brooklyn, NY', 'Queens, NY', 'New Jersey'].map(loc => (
                      <label key={loc} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                        <span className="text-sm">{loc}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Style</h4>
                  <div className="space-y-2">
                    {['Soft Glam', 'Full Glam', 'Natural', 'Editorial'].map(style => (
                      <label key={style} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                        <span className="text-sm">{style}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Max Price (Wedding Day)</h4>
                  <input type="range" min="100" max="1000" className="w-full accent-primary" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>$100</span>
                    <span>$1000+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Content - Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-3xl font-serif font-bold mb-2">Featured Artists</h2>
              <p className="text-muted-foreground">Find the perfect match for your big day.</p>
            </div>
            
            <select className="bg-white border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option>Recommended</option>
              <option>Highest Rated</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredArtists.map(artist => (
              <motion.div 
                key={artist.id}
                layoutId={`card-${artist.id}`}
                onClick={() => setSelectedArtist(artist)}
                className="bg-white rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={artist.images[0]} 
                    alt={artist.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button 
                    onClick={(e) => toggleSave(e, artist.id)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
                  >
                    <Heart 
                      size={20} 
                      className={savedArtists.includes(artist.id) ? "fill-primary text-primary" : "text-gray-600"} 
                    />
                  </button>
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    {artist.rating} ({artist.reviews})
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-serif font-bold group-hover:text-primary transition-colors">{artist.name}</h3>
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <MapPin size={14} />
                    <span>{artist.location}</span>
                  </div>
                  
                  <span className="inline-block px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium self-start mb-4">
                    {artist.style}
                  </span>
                  
                  <div className="mt-auto pt-4 border-t border-border flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Starting from</p>
                      <p className="font-semibold">${artist.weddingPrice}</p>
                    </div>
                    <button className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors">
                      View Profile
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedArtist && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedArtist(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              layoutId={`card-${selectedArtist.id}`}
              className="fixed inset-y-4 right-4 w-full max-w-2xl bg-white rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col"
            >
              <div className="relative h-80 shrink-0">
                <img src={selectedArtist.images[0]} alt={selectedArtist.name} className="w-full h-full object-cover" />
                <button 
                  onClick={() => setSelectedArtist(null)}
                  className="absolute top-4 left-4 p-2 bg-white/80 backdrop-blur-md rounded-full hover:bg-white transition-colors"
                >
                  <MapPin className="hidden" /> {/* just to import map pin again if needed */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-4xl font-serif font-bold mb-2">{selectedArtist.name}</h2>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin size={16} /> {selectedArtist.location}</span>
                      <span className="flex items-center gap-1"><Star size={16} className="fill-yellow-400 text-yellow-400" /> {selectedArtist.rating} ({selectedArtist.reviews} Reviews)</span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => toggleSave(e, selectedArtist.id)}
                    className="p-3 bg-secondary rounded-full hover:bg-secondary/80 transition-colors"
                  >
                    <Heart 
                      size={24} 
                      className={savedArtists.includes(selectedArtist.id) ? "fill-primary text-primary" : "text-gray-600"} 
                    />
                  </button>
                </div>

                <div className="mb-8">
                  <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-semibold inline-block">
                    {selectedArtist.style}
                  </span>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-serif font-bold mb-3">About</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">{selectedArtist.bio}</p>
                </div>

                <div className="mb-8 grid grid-cols-2 gap-4">
                  <div className="p-5 bg-secondary/50 rounded-2xl border border-border">
                    <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Trial Session</p>
                    <p className="text-2xl font-semibold">${selectedArtist.trialPrice}</p>
                    <p className="text-sm text-gray-500 mt-2">Includes consultation and full practice run</p>
                  </div>
                  <div className="p-5 bg-primary/5 rounded-2xl border border-primary/20">
                    <p className="text-sm text-primary uppercase tracking-wider mb-1">Wedding Day</p>
                    <p className="text-2xl font-semibold text-primary">${selectedArtist.weddingPrice}</p>
                    <p className="text-sm text-primary/80 mt-2">On-location makeup for the bride</p>
                  </div>
                </div>

                {selectedArtist.images.length > 1 && (
                  <div>
                    <h3 className="text-xl font-serif font-bold mb-4">Portfolio</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedArtist.images.slice(1).map((img, i) => (
                        <img key={i} src={img} alt="Portfolio" className="w-full h-48 object-cover rounded-xl" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-border bg-white shrink-0">
                <button className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                  <Calendar size={20} /> Request Availability
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}