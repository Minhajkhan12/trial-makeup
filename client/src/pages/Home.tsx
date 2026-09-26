import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Sparkles, UserCircle, X, Heart, MessageCircle, Loader2, Quote, MapPin, Images } from 'lucide-react';
import { ArtistCard } from '../components/ArtistCard';
import { ReserveTrialModal } from '../components/ReserveTrialModal';
import { fetchArtists, Artist, REGIONS, Region } from '../lib/artists';
import { trackEvent } from '../lib/analytics';

const NIAGARA_LAUNCH = new Date('2026-09-27T00:00:00-04:00').getTime();

export default function Home() {
  const [, navigate] = useLocation();
  const [allArtists, setAllArtists] = useState<Artist[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [selectedRegion, setSelectedRegion] = useState<Region>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservingArtist, setReservingArtist] = useState<Artist | null>(null);
  const [confirmation, setConfirmation] = useState('');

  useEffect(() => {
    if (!confirmation) return;
    const timer = window.setTimeout(() => setConfirmation(''), 10000);
    return () => window.clearTimeout(timer);
  }, [confirmation]);

  useEffect(() => {
    loadArtists();
    const saved: Artist[] = JSON.parse(localStorage.getItem('savedArtists') || '[]');
    setSavedIds(new Set(saved.map(artist => artist.id)));
  }, []);

  async function loadArtists() {
    try {
      setLoading(true);
      setError(null);
      const artists = await fetchArtists();
      setAllArtists(artists);
    } catch (err: any) {
      setError(err.message || 'Failed to load artists');
    } finally {
      setLoading(false);
    }
  }

  const visibleArtists = selectedRegion === 'all'
    ? allArtists
    : allArtists.filter(artist => artist.region === selectedRegion);
  const niagaraComingSoon = selectedRegion === 'niagara' && Date.now() < NIAGARA_LAUNCH;

  const toggleSaved = (artist: Artist) => {
    const existing: Artist[] = JSON.parse(localStorage.getItem('savedArtists') || '[]');
    const wasSaved = existing.some(saved => saved.id === artist.id);
    const updated = wasSaved ? existing.filter(saved => saved.id !== artist.id) : [...existing, artist];
    localStorage.setItem('savedArtists', JSON.stringify(updated));
    setSavedIds(new Set(updated.map(saved => saved.id)));
    if (wasSaved) {
      trackEvent('artist_removed_from_saved');
    } else {
      trackEvent('artist_saved', { region: artist.region || 'other', services: artist.services || 'makeup' });
    }
  };

  const resetRegion = (region: Region) => {
    if (region !== selectedRegion) trackEvent('browse_filter_changed', { filter: 'region', value: region });
    setSelectedRegion(region);
  };

  return (
    <div className="h-dvh overflow-y-auto bg-background flex flex-col w-full">
      {confirmation && (
        <div
          role="status"
          className="fixed top-16 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl border border-primary/30 bg-white px-5 py-4 text-sm font-medium text-foreground shadow-2xl"
          data-testid="text-reservation-confirmation"
        >
          <button
            type="button"
            onClick={() => setConfirmation('')}
            aria-label="Dismiss confirmation"
            className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground hover:text-foreground"
          >
            <X size={14} />
          </button>
          <p className="pr-4">{confirmation}</p>
        </div>
      )}
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
              <Heart size={17} className={savedIds.size > 0 ? 'fill-primary text-primary' : ''} />
              <span className="hidden sm:inline">Saved ({savedIds.size})</span>
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

      <main className="flex-1 w-full flex items-start justify-center px-3 py-3 sm:px-6 sm:py-8 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">

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
                <p className="text-sm font-medium">Save your favorites</p>
                <p className="text-xs text-muted-foreground">Tap Save for Later to build your shortlist</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-border shadow-sm">
              <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                  <Images size={18} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Explore every portfolio</p>
                <p className="text-xs text-muted-foreground">Swipe photos, then scroll to more artists</p>
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

        {/* Artist list + region filter */}
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

          {/* Artist cards */}
          <div className="w-full space-y-5">
            {loading ? (
              <div className="min-h-[400px] flex flex-col items-center justify-center bg-white rounded-3xl shadow-xl border border-border">
                <Loader2 className="animate-spin text-primary mb-4" size={44} />
                <p className="text-muted-foreground">Loading artists...</p>
              </div>
            ) : error ? (
              <div className="min-h-[400px] flex flex-col items-center justify-center text-center px-8 bg-white rounded-3xl shadow-xl border border-border">
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
            ) : niagaraComingSoon || (selectedRegion === 'niagara' && visibleArtists.length === 0) ? (
              <div className="min-h-[400px] flex flex-col items-center justify-center text-center px-8 bg-white rounded-3xl shadow-xl border border-border">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-5">
                  <Sparkles className="text-primary" size={34} />
                </div>
                <h2 className="text-2xl font-serif font-semibold mb-2">Niagara Region</h2>
                <p className="text-muted-foreground text-sm">
                  {niagaraComingSoon ? 'Version 1 launches Sunday, September 27. Stay tuned.' : 'Stay tuned for makeup artists.'}
                </p>
              </div>
            ) : visibleArtists.length === 0 ? (
              <div className="min-h-[400px] flex flex-col items-center justify-center text-center px-8 bg-white rounded-3xl shadow-xl border border-border">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-5">
                  <Sparkles className="text-primary" size={34} />
                </div>
                <h2 className="text-2xl font-serif font-semibold mb-2">No artists yet</h2>
                <p className="text-muted-foreground text-sm">Check back soon — we're adding amazing makeup artists to your area.</p>
              </div>
            ) : (
              visibleArtists.map(artist => (
                <ArtistCard
                  key={artist.id}
                  artist={artist}
                  saved={savedIds.has(artist.id)}
                  onToggleSaved={() => toggleSaved(artist)}
                  onReserveTrial={() => {
                    trackEvent('trial_reservation_opened', { region: artist.region || 'other' });
                    setReservingArtist(artist);
                  }}
                />
              ))
            )}
          </div>
        </div>
      </main>
      {reservingArtist && (
        <ReserveTrialModal
          artist={reservingArtist}
          onClose={() => setReservingArtist(null)}
          onConfirmed={artistName => {
            setReservingArtist(null);
            setConfirmation(`Thanks! We'll text you within the hour to confirm your trial with ${artistName}.`);
          }}
        />
      )}
    </div>
  );
}
