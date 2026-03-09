import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { X, Heart, Settings2, Sparkles, UserCircle } from 'lucide-react';
import { SwipeCard } from '../components/SwipeCard';
import { artists } from '../data/artists';

export default function Home() {
  const [deck, setDeck] = useState(artists);
  const [matches, setMatches] = useState<string[]>([]);

  const handleSwipeLeft = () => {
    setDeck(prev => prev.slice(1));
  };

  const handleSwipeRight = () => {
    const currentArtist = deck[0];
    setMatches(prev => [...prev, currentArtist.id]);
    setDeck(prev => prev.slice(1));
  };

  const activeArtist = deck[0];

  return (
    <div className="min-h-screen bg-background flex flex-col mx-auto max-w-md w-full shadow-2xl relative overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center z-10 bg-white/80 backdrop-blur-md sticky top-0 border-b border-border">
        <UserCircle className="text-muted-foreground" size={28} />
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary" size={24} />
          <h1 className="text-xl font-serif font-bold text-foreground tracking-wide">Bridal Match</h1>
        </div>
        <Settings2 className="text-muted-foreground" size={28} />
      </header>

      {/* Main Swipe Area */}
      <main className="flex-1 relative w-full p-4 flex flex-col">
        <div className="relative w-full h-[65vh] mt-4">
          <AnimatePresence>
            {deck.length > 0 ? (
              deck.map((artist, index) => (
                <SwipeCard
                  key={artist.id}
                  artist={artist}
                  active={index === 0}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
                />
              )).reverse() // Reverse so the first item is on top in DOM
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
                <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-6">
                  <Sparkles className="text-primary" size={40} />
                </div>
                <h2 className="text-2xl font-serif font-bold mb-2">You're all caught up!</h2>
                <p className="text-muted-foreground mb-8">We're searching for more makeup artists in your area.</p>
                <button 
                  onClick={() => setDeck(artists)}
                  className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors shadow-lg"
                  data-testid="button-reset-deck"
                >
                  Start Over
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Controls */}
        {deck.length > 0 && (
          <div className="mt-auto mb-8 flex justify-center gap-6 items-center px-8 z-10">
            <button 
              onClick={handleSwipeLeft}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border border-border hover:bg-gray-50 transition-colors transform active:scale-95"
              data-testid="button-swipe-left"
            >
              <X size={32} className="text-red-500" />
            </button>
            <button 
              onClick={handleSwipeRight}
              className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-xl hover:bg-primary/90 transition-colors transform active:scale-95"
              data-testid="button-swipe-right"
            >
              <Heart size={36} className="text-white fill-white" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}