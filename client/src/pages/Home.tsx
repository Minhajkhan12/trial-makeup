import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { Sparkles, UserCircle, X, Heart, MessageCircle, Loader2, Quote, MapPin } from 'lucide-react';
import { SwipeCard } from '../components/SwipeCard';
import { fetchArtists, Artist, REGIONS, Region } from '../lib/artists';
import { trackEvent } from '../lib/analytics';

const NIAGARA_LAUNCH = new Date('2026-09-27T00:00:00-04:00').getTime();

export default function Home() {
  const [, navigate] = useLocation();
  const [allArtists, setAllArtists] = useState<Artist[]>([]);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [selectedRegion, setSelectedRegion] = useState<Region>('all');
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
      setSeenIds(new Set());
    } catch (err: any) {
      setError(err.message || 'Failed to load artists');
    } finally {
      setLoading(false);
    }
  }

  const deck = useMemo(() => {
    const filtered = selectedRegion === 'all'
      ? allArtists
      : allArtists.filter(a => a.region === selectedRegion);

    return filtered.filter(a => !seenIds.has(a.id));
  }, [allArtists, selectedRegion, seenIds]);
  const niagaraComingSoon = selectedRegion === 'niagara' && Date.now() < NIAGARA_LAUNCH;

  const handleSwipeLeft = () => {
    if (deck[0]) {
      trackEvent('artist_passed', { region: selectedRegion });
      setSeenIds(prev => new Set(Array.from(prev).concat(deck[0].id)));
    }
  };

  const handleSwipeRight = () => {
    const artist = deck[0];
    if (!artist) return;
    const existing: Artist[] = JSON.parse(localStorage.getItem('savedArtists') || '[]');
    if (!existing.find(a => a.id === artist.id)) {
      const updated = [...existing, artist];
      localStorage.setItem('savedArtists', JSON.stringify(updated));
      setSavedCount(updated.length);
      trackEvent('artist_saved', { region: artist.region || 'other', services: artist.services || 'makeup' });
    }
    setSeenIds(prev => new Set(Array.from(prev).concat(artist.id)));
  };

  const resetRegion = (region: Region) => {
    if (region !== selectedRegion) trackEvent('browse_filter_changed', { filter: 'region', value: region });
    setSelectedRegion(region);
    setSeenIds(new Set());
  };

  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      {/* Header */}
      <header className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-white/90 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="text-primary" size={20} />
            <h1 className="text-xl font-serif font-semibold text-foreground tracking-wide">Trial Makeup</h1>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <button
              onClick={() => { trackEvent('saved_list_opened', { source: 'home' }); navigate('/saved'); }}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors text-sm"
              data-testid="button-nav-saved"
            >
              <Heart size={17} className={savedCount > 0 ? 'fill-primary text-primary' : ''} />
              <span className="hidden sm:inline">Saved ({savedCount})</span>
            </button>
            <button className="hidden sm:flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors text-sm">
              <MessageCircle size={17} />
              <span>Messages</span>
            </button>
            <div className="hidden sm:flex w-9 h-9 bg-secondary rounded-full items-center justify-center cursor-pointer hover:bg-secondary/80 transition-colors">
              <UserCircle className="text-secondary-foreground" size={22} />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full flex items-start lg:items-center justify-center px-3 py-3 sm:px-6 sm:py-8 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">

        {/* Left panel — desktop only */}
        <div className="hidden lg:flex flex-col max-w-xs mr-14 shrink-0">
          <h2 className="text-4xl font-serif font-semibold mb-5 leading-snug text-foreground">
            Find your perfect<br />bridal look.
          </h2>

          <p className="text-[15px] text-muted-foreground leading-relaxed mb-7">
            Trial first, commitment later. Every artist on Trial Makeup is handpicked for responsiveness and quality — no endless inquiry forms. Just real conversations with artists you can trust.
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
            Join <span className="text-foreground font-semibold">200+ brides</span> who found their artist on Trial Makeup
          </p>
        </div>

        {/* Card stack + filters */}
        <div className="flex flex-col items-center gap-3 sm:gap-5 w-full max-w-[400px]">

          {/* Region filter */}
          <div className="w-full" data-testid="region-filters">
            <div className="relative">
              <MapPin size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none" aria-hidden="true" />
              <select
                aria-label="Filter by region"
                value={selectedRegion}
                onChange={e => resetRegion(e.target.value as Region)}
                className="w-full appearance-none rounded-xl border border-border bg-white py-2.5 pl-11 pr-9 text-sm font-medium text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                data-testid="select-region"
              >
                {REGIONS.filter(r => r.key !== 'waterloo').map(r => (
                  <option key={r.key} value={r.key}>{r.label}</option>
                ))}
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" aria-hidden="true">⌄</span>
            </div>
          </div>

          {/* Card area */}
          <div className="relative w-full h-[min(67svh,600px)] min-h-[420px] sm:h-[72vh] sm:min-h-[560px]">
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
            ) : niagaraComingSoon || (selectedRegion === 'niagara' && deck.length === 0) ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 bg-white rounded-3xl shadow-xl border border-border">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-5">
                  <Sparkles className="text-primary" size={34} />
                </div>
                <h2 className="text-2xl font-serif font-semibold mb-2">Niagara Region</h2>
                <p className="text-muted-foreground text-sm">
                  {niagaraComingSoon ? 'Version 1 launches Sunday, September 27. Stay tuned.' : 'Stay tuned for makeup artists.'}
                </p>
              </div>
            ) : allArtists.length === 0 ? (
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
                    <p className="text-muted-foreground text-sm mb-7">
                      {selectedRegion === 'all'
                        ? 'More artists coming soon.'
                        : 'No more artists in this region. Try another area or view all.'}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <button
                        onClick={() => setSeenIds(new Set())}
                        className="bg-primary text-primary-foreground px-7 py-2.5 rounded-full text-sm font-medium hover:bg-primary/90 transition-all shadow-md active:scale-95"
                        data-testid="button-reset-deck"
                      >
                        Start Over
                      </button>
                      {selectedRegion !== 'all' && (
                        <button
                          onClick={() => resetRegion('all')}
                          className="bg-white border border-border text-foreground px-7 py-2.5 rounded-full text-sm font-medium hover:border-primary/50 transition-all"
                          data-testid="button-view-all"
                        >
                          View All Regions
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
