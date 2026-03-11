import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, X, Menu, Search, X as CloseIcon, MapPin, Check, Palette } from 'lucide-react';
import { SwipeCard } from '../components/SwipeCard';
import { artists, Artist } from '../data/artists';

export default function Home() {
  const [deck, setDeck] = useState(artists);
  const [savedArtists, setSavedArtists] = useState<string[]>([]);
  
  // Modals state
  const [activeDiversityArtist, setActiveDiversityArtist] = useState<Artist | null>(null);
  const [activeProfileArtist, setActiveProfileArtist] = useState<Artist | null>(null);
  const [currentProfileImageIndex, setCurrentProfileImageIndex] = useState(0);

  const handleSwipeLeft = () => {
    setDeck(prev => prev.slice(1));
  };

  const handleSwipeRight = () => {
    const currentArtist = deck[0];
    if (!savedArtists.includes(currentArtist.id)) {
      setSavedArtists(prev => [...prev, currentArtist.id]);
    }
    setDeck(prev => prev.slice(1));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col w-full relative overflow-hidden">
      {/* Navigation Bar */}
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-30 bg-background/80 backdrop-blur-md">
        <h1 className="text-xl font-serif font-bold tracking-wider text-foreground">BRIDAL MATCH</h1>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button className="text-foreground border-b-2 border-primary py-1">All</button>
          <button className="text-muted-foreground hover:text-foreground py-1">Toronto</button>
          <button className="text-muted-foreground hover:text-foreground py-1">Waterloo</button>
        </div>

        <button className="relative p-2 text-foreground hover:text-primary transition-colors">
          <Heart size={24} className={savedArtists.length > 0 ? "fill-primary text-primary" : ""} />
          {savedArtists.length > 0 && (
            <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {savedArtists.length}
            </span>
          )}
        </button>
      </header>

      {/* Main Swipe Area */}
      <main className="flex-1 w-full flex flex-col items-center justify-center p-4 md:p-8">
        <div className="relative w-full max-w-[480px] h-[65vh] min-h-[500px] flex flex-col">
          <div className="relative flex-1 w-full">
            <AnimatePresence>
              {deck.length > 0 ? (
                deck.map((artist, index) => (
                  <SwipeCard
                    key={artist.id}
                    artist={artist}
                    active={index === 0}
                    onSwipeLeft={handleSwipeLeft}
                    onSwipeRight={handleSwipeRight}
                    onViewDiversity={setActiveDiversityArtist}
                    onViewProfile={setActiveProfileArtist}
                  />
                )).reverse()
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 bg-white rounded-2xl shadow-sm border border-border">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <Heart className="text-primary fill-primary/20" size={32} />
                  </div>
                  <h2 className="text-3xl font-serif font-bold mb-3">You're caught up!</h2>
                  <p className="text-muted-foreground mb-8">We're looking for more artists that match your style.</p>
                  <button 
                    onClick={() => setDeck(artists)}
                    className="bg-primary text-white px-8 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors shadow-md"
                  >
                    Start Over
                  </button>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Swipe Controls */}
          {deck.length > 0 && (
            <div className="mt-8 flex justify-center gap-6 items-center z-10">
              <button 
                onClick={handleSwipeLeft}
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md border border-border hover:bg-gray-50 transition-transform active:scale-95"
              >
                <X size={32} className="text-gray-400" />
              </button>
              <button 
                onClick={handleSwipeRight}
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md border border-border hover:bg-gray-50 transition-transform active:scale-95"
              >
                <Heart size={32} className="text-primary fill-primary" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Diversity Bottom Sheet */}
      <AnimatePresence>
        {activeDiversityArtist && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveDiversityArtist(null)}
              className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white rounded-t-3xl z-50 p-6 shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
              
              <h3 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
                <Palette className="text-primary" />
                Diversity & Inclusion
              </h3>
              
              <div className="mb-8">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Skin Tones Worked With</h4>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6].map(tone => {
                    // Simple representation of Fitzpatrick scale
                    const colors = ['#FBE2D5', '#E6C6AC', '#D2A17E', '#A67153', '#72462F', '#3E2015'];
                    const isSupported = activeDiversityArtist.skinTones.includes(tone);
                    
                    return (
                      <div 
                        key={tone}
                        className={`flex-1 aspect-square rounded-full flex items-center justify-center border-2 transition-all ${isSupported ? 'border-primary shadow-sm scale-110' : 'border-transparent opacity-30 grayscale'}`}
                        style={{ backgroundColor: colors[tone - 1] }}
                      >
                        {isSupported && <Check size={14} className={tone > 3 ? 'text-white' : 'text-black'} />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Hair Types</h4>
                <div className="flex flex-wrap gap-2">
                  {activeDiversityArtist.hairTypes.map(type => (
                    <span key={type} className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm font-medium">
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                <p className="text-sm leading-relaxed text-foreground/80 italic">
                  "{activeDiversityArtist.diversityNote}"
                </p>
              </div>
              
              <button 
                onClick={() => setActiveDiversityArtist(null)}
                className="w-full mt-6 py-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
              >
                Close
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Full Profile Modal */}
      <AnimatePresence>
        {activeProfileArtist && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white z-50 overflow-y-auto max-w-[480px] mx-auto shadow-2xl"
            >
              <button 
                onClick={() => setActiveProfileArtist(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/40 transition-colors"
              >
                <CloseIcon size={20} />
              </button>

              {/* Carousel */}
              <div className="relative h-[60vh] bg-gray-100">
                <img 
                  src={activeProfileArtist.images[currentProfileImageIndex].url} 
                  alt="Portfolio" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                {activeProfileArtist.images.length > 1 && (
                  <div className="absolute top-4 left-4 right-16 flex gap-1 z-10">
                    {activeProfileArtist.images.map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-1 flex-1 rounded-full transition-colors ${i === currentProfileImageIndex ? 'bg-white' : 'bg-white/30'}`} 
                      />
                    ))}
                  </div>
                )}
                
                {/* Carousel invisible touch targets */}
                <div className="absolute inset-0 flex">
                  <div 
                    className="w-1/2 h-full" 
                    onClick={() => setCurrentProfileImageIndex(prev => prev > 0 ? prev - 1 : prev)} 
                  />
                  <div 
                    className="w-1/2 h-full" 
                    onClick={() => setCurrentProfileImageIndex(prev => prev < activeProfileArtist.images.length - 1 ? prev + 1 : prev)} 
                  />
                </div>
                
                <div className="absolute bottom-6 left-6 text-white">
                  <h2 className="text-4xl font-serif font-bold mb-1">{activeProfileArtist.name}</h2>
                  <p className="opacity-90">{activeProfileArtist.images[currentProfileImageIndex].caption}</p>
                </div>
              </div>

              {/* Profile Details */}
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6 text-muted-foreground text-sm">
                  <span className="flex items-center gap-1"><MapPin size={16} /> {activeProfileArtist.city}</span>
                  <span className="flex items-center gap-1">★ {activeProfileArtist.rating} ({activeProfileArtist.reviewCount})</span>
                  <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full text-xs font-medium">
                    {activeProfileArtist.style}
                  </span>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-serif font-bold mb-2">About</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {activeProfileArtist.bio}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 rounded-xl border border-border bg-gray-50/50">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Trial</p>
                    <p className="text-xl font-medium">${activeProfileArtist.trialPrice}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Wedding Day</p>
                    <p className="text-xl font-medium text-primary">${activeProfileArtist.weddingPrice}</p>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    if (!savedArtists.includes(activeProfileArtist.id)) {
                      setSavedArtists(prev => [...prev, activeProfileArtist.id]);
                    }
                    setActiveProfileArtist(null);
                    setDeck(prev => prev.filter(a => a.id !== activeProfileArtist.id));
                  }}
                  className="w-full bg-primary text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                  <Heart size={20} className="fill-white" />
                  Save Artist
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}