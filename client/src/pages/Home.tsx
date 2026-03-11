import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Sparkles, UserCircle, Settings2, X, Heart, MessageCircle } from 'lucide-react';
import { SwipeCard } from '../components/SwipeCard';
import { artists } from '../data/artists';

export default function Home() {
  const [deck, setDeck] = useState(artists);
  const [matches, setMatches] = useState<string[]>([]);
  const [savedArtists, setSavedArtists] = useState<string[]>([]);

  const handleSwipeLeft = () => {
    setDeck(prev => prev.slice(1));
  };

  const handleSwipeRight = () => {
    const currentArtist = deck[0];
    setMatches(prev => [...prev, currentArtist.id]);
    setSavedArtists(prev => [...prev, currentArtist.id]);
    setDeck(prev => prev.slice(1));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      {/* Web App Header */}
      <header className="px-8 py-5 border-b border-border bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Sparkles className="text-primary" size={24} />
            </div>
            <h1 className="text-2xl font-serif font-bold text-foreground tracking-wide">Bridal Beauty Match</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium text-sm group">
              <Heart size={20} className={savedArtists.length > 0 ? "fill-primary text-primary" : ""} />
              <span>Saved Matches ({savedArtists.length})</span>
            </button>
            <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium text-sm">
              <MessageCircle size={20} />
              <span>Messages</span>
            </button>
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center cursor-pointer hover:bg-secondary/80 transition-colors">
              <UserCircle className="text-secondary-foreground" size={24} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area - Swipe UI Centered */}
      <main className="flex-1 w-full flex items-center justify-center p-8 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
        
        {/* Left column - Context/Empty State info (visible on larger screens) */}
        <div className="hidden lg:flex flex-col max-w-sm mr-16">
          <h2 className="text-4xl font-serif font-bold mb-4 leading-tight">Find your perfect bridal look.</h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Swipe right on artists you love to save them to your matches. 
            Swipe left to pass. We'll curate better recommendations as you go.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-border shadow-sm">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Heart size={24} className="text-primary fill-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Swipe Right to Save</h4>
                <p className="text-sm text-muted-foreground">Add to your favorites list</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-border shadow-sm">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <X size={24} className="text-red-500" />
              </div>
              <div>
                <h4 className="font-semibold">Swipe Left to Pass</h4>
                <p className="text-sm text-muted-foreground">See the next makeup artist</p>
              </div>
            </div>
          </div>
        </div>

        {/* Center - The Swipe Deck */}
        <div className="relative w-full max-w-md h-[70vh] min-h-[600px] flex flex-col">
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
                  />
                )).reverse() // Reverse so the first item is on top in DOM
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 bg-white rounded-3xl shadow-xl border border-border">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <Sparkles className="text-primary" size={40} />
                  </div>
                  <h2 className="text-3xl font-serif font-bold mb-3">You're all caught up!</h2>
                  <p className="text-lg text-muted-foreground mb-8">We're searching for more amazing makeup artists in your area.</p>
                  <button 
                    onClick={() => setDeck(artists)}
                    className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 active:scale-95"
                    data-testid="button-reset-deck"
                  >
                    Find More Artists
                  </button>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Web Bottom Controls */}
          {deck.length > 0 && (
            <div className="mt-8 flex justify-center gap-8 items-center z-10">
              <button 
                onClick={handleSwipeLeft}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg border border-border hover:bg-red-50 hover:border-red-200 transition-all transform active:scale-95 group"
                data-testid="button-swipe-left"
              >
                <X size={40} className="text-red-500 group-hover:scale-110 transition-transform" />
              </button>
              <button 
                onClick={handleSwipeRight}
                className="w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-xl hover:bg-primary/90 hover:shadow-primary/30 transition-all transform active:scale-95 group"
                data-testid="button-swipe-right"
              >
                <Heart size={48} className="text-white fill-white group-hover:scale-110 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}