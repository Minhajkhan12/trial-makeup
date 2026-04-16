import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { Sparkles, UserCircle, X, Heart, MessageCircle, Loader2, Quote } from 'lucide-react';
import { SwipeCard } from '../components/SwipeCard';
import { fetchArtists, Artist } from '../lib/artists';

export default function Home() {
  const [, navigate] = useLocation();
  const [allArtists, setAllArtists] = useState<Artist[]>([]);
  const [deck, setDeck] = useState<Artist[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadArtists();
    const saved = JSON.parse(localStorage.getItem('savedArtists') || '[]');
    setSavedCount(saved.length);
  }, []);

  async function loadArtists() {
    try {
      setLoading(true);
      setError(null);
      const artists = await fetchArtists();
      setAllArtists(artists);
      setDeck(artists);
    } catch (err: any) {
      setError(err.message || 'Failed to load artists');
    } finally {
      setLoading(false);
    }
  }

  const handleSwipeLeft = () => setDeck(prev => prev.slice(1));

  const handleSwipeRight = () => {
    const artist = deck[0];
    const existing: Artist[] = JSON.parse(localStorage.getItem('savedArtists') || '[]');
    if (!existing.find(a => a.id === artist.id)) {
      const updated = [...existing, artist];
      localStorage.setItem('savedArtists', JSON.stringify(updated));
      setSavedCount(updated.length);
    }
    setDeck(prev => prev.slice(1));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border bg-white/90 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="text-primary" size={20} />
            <h1 className="text-xl font-serif font-semibold text-foreground tracking-wide">BeautyBooked</h1>
          </div>
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate('/saved')}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors text-sm"
              data-testid="button-nav-saved"
            >
              <Heart size={17} className={savedCount > 0 ? 'fill-primary text-primary' : ''} />
              <span>Saved ({savedCount})</span>
            </button>
            <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors text-sm">
              <MessageCircle size={17} />
              <span>Messages</span>
            </button>
            <div className="w-9 h-9 bg-secondary rounded-full flex items-center justify-center cursor-pointer hover:bg-secondary/80 transition-colors">
              <UserCircle className="text-secondary-foreground" size={22} />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full flex items-center justify-center px-6 py-8 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">

        {/* Left panel — desktop only */}
        <div className="hidden lg:flex flex-col max-w-xs mr-14 shrink-0">
          <h2 className="text-4xl font-serif font-semibold mb-5 leading-snug text-foreground">
            Find your perfect<br />bridal look.
          </h2>

          <p className="text-[15px] text-muted-foreground leading-relaxed mb-7">
            Trial first, commitment later. Every artist on BeautyBooked is handpicked for responsiveness and quality — no endless inquiry forms. Just real conversations with artists you can trust.
          </p>

          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-border shadow-sm">
              <div className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <Heart size={18} className="text-primary fill-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Swipe right to save</p>
                <p className="text-xs text-muted-foreground">Add to your shortlist</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-border shadow-sm">
              <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                <X size={18} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Swipe left to pass</p>
                <p className="text-xs text-muted-foreground">See the next artist</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border p-4 shadow-sm mb-4">
            <Quote size={16} className="text-primary mb-2 opacity-60" />
            <p className="text-sm text-foreground leading-relaxed italic font-serif">
              "I loved my trial so much that I booked Isha for my wedding."
            </p>
            <p className="text-xs text-muted-foreground mt-2">— September 2026 bride</p>
          </div>

          <p className="text-xs text-muted-foreground text-center tracking-wide">
            Join <span className="text-foreground font-semibold">200+ brides</span> who found their artist on BeautyBooked
          </p>
        </div>

        {/* Card stack */}
        <div className="relative w-full max-w-[400px] h-[78vh] min-h-[580px]">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-3xl shadow-xl border border-border">
              <Loader2 className="animate-spin text-primary mb-4" size={44} />
              <p className="text-muted-foreground">Loading artists...</p>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 bg-white rounded-3xl shadow-xl border border-border">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <X className="text-red-400" size={30} />
              </div>
              <h2 className="text-2xl font-serif font-semibold mb-2">Something went wrong</h2>
              <p className="text-muted-foreground text-sm mb-6">{error}</p>
              <button
                onClick={loadArtists}
                className="bg-primary text-primary-foreground px-7 py-2.5 rounded-full text-sm font-medium hover:bg-primary/90 transition-all shadow-md active:scale-95"
                data-testid="button-retry"
              >
                Try Again
              </button>
            </div>
          ) : deck.length === 0 && allArtists.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 bg-white rounded-3xl shadow-xl border border-border">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-5">
                <Sparkles className="text-primary" size={34} />
              </div>
              <h2 className="text-2xl font-serif font-semibold mb-2">No artists yet</h2>
              <p className="text-muted-foreground text-sm">Check back soon — we're adding amazing makeup artists to your area.</p>
            </div>
          ) : (
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
                )).reverse()
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 bg-white rounded-3xl shadow-xl border border-border">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-5">
                    <Sparkles className="text-primary" size={34} />
                  </div>
                  <h2 className="text-2xl font-serif font-semibold mb-2">You're all caught up!</h2>
                  <p className="text-muted-foreground text-sm mb-7">More artists coming soon.</p>
                  <button
                    onClick={() => setDeck(allArtists)}
                    className="bg-primary text-primary-foreground px-7 py-2.5 rounded-full text-sm font-medium hover:bg-primary/90 transition-all shadow-md active:scale-95"
                    data-testid="button-reset-deck"
                  >
                    Start Over
                  </button>
                </div>
              )}
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}
