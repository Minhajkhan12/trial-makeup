import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Sparkles, MapPin, Star, Trash2, ArrowLeft, Loader2, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { Artist } from '../lib/artists';
import { trackEvent } from '../lib/analytics';

export default function Saved() {
  const [, navigate] = useLocation();
  const [savedArtists, setSavedArtists] = useState<Artist[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('savedArtists');
    if (raw) setSavedArtists(JSON.parse(raw));
  }, []);

  const selectedArtist = savedArtists.find(a => a.id === selectedId) ?? null;

  const removeArtist = (id: string) => {
    trackEvent('artist_removed_from_saved');
    const updated = savedArtists.filter(a => a.id !== id);
    setSavedArtists(updated);
    localStorage.setItem('savedArtists', JSON.stringify(updated));
    if (selectedId === id) setSelectedId(null);
  };

  const handleCheckout = async () => {
    if (!email) { setError('Please enter your email.'); return; }
    if (!selectedArtist) { setError('Please select an artist.'); return; }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          artistId: selectedArtist.id,
          artistName: selectedArtist.name,
          trialPrice: selectedArtist.trialPrice,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed.');
      if (data.url) {
        trackEvent('checkout_started', { source: 'saved_artists' });
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 py-4 border-b border-border bg-white/90 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="text-primary" size={20} />
            <h1 className="text-xl font-serif font-semibold text-foreground tracking-wide">Trial Makeup</h1>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            Back to browsing
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">
        <h2 className="text-3xl font-serif font-semibold mb-2">Your Saved Artists</h2>
        <p className="text-muted-foreground mb-8">
          Select the artist you'd like to book a trial with, then proceed to checkout.
        </p>

        {savedArtists.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <Sparkles className="text-primary" size={34} />
            </div>
            <h3 className="text-xl font-serif font-semibold mb-2">No artists saved yet</h3>
            <p className="text-muted-foreground mb-6">Tap Save for Later on artists you love to see them here.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-primary text-primary-foreground px-7 py-2.5 rounded-full text-sm font-medium hover:bg-primary/90 transition-all"
            >
              Browse Artists
            </button>
          </div>
        ) : (
          <>
            {/* Artist selection list */}
            <div className="space-y-3 mb-8">
              {savedArtists.map(artist => {
                const isSelected = selectedId === artist.id;
                return (
                  <div
                    key={artist.id}
                     onClick={() => {
                       if (selectedId !== artist.id) trackEvent('trial_artist_selected', { region: artist.region || 'other' });
                       setSelectedId(artist.id);
                     }}
                    className={`bg-white rounded-2xl border-2 p-4 flex gap-4 items-center shadow-sm cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary shadow-md ring-2 ring-primary/10'
                        : 'border-border hover:border-primary/40'
                    }`}
                    data-testid={`saved-artist-${artist.id}`}
                  >
                    {/* Selection indicator */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>

                    {artist.images?.[0] && (
                      <img
                        src={artist.images[0]}
                        alt={artist.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif font-semibold text-lg leading-tight">{artist.name}</h3>
                      <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-0.5">
                        <MapPin size={12} />
                        <span>{artist.location}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {(Array.isArray(artist.diversity) ? artist.diversity : []).slice(0, 2).map(tag => (
                          <span key={tag} className="text-xs text-muted-foreground border border-border rounded-full px-2.5 py-0.5">
                            {tag}
                          </span>
                        ))}
                        {artist.rating && (
                          <div className="flex items-center gap-1 text-xs">
                            <Star size={11} className="fill-amber-400 text-amber-400" />
                            <span className="font-medium">{artist.rating}</span>
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Trial: <span className="font-semibold text-foreground">${artist.trialPrice}</span>
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); removeArtist(artist.id); }}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                      data-testid={`button-remove-${artist.id}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Checkout section */}
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
              <h3 className="font-serif text-xl font-semibold mb-1">Book your trial</h3>
              <p className="text-sm text-muted-foreground mb-5">
                A $50 non-refundable booking fee holds your trial date. The artist will reach out to confirm timing.
              </p>

              <div className="mb-5">
                <label className="block text-sm font-medium mb-1.5" htmlFor="email">
                  Your email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                  data-testid="input-email"
                />
              </div>

              {/* Selected artist summary */}
              {selectedArtist && (
                <div className="flex items-center gap-2 bg-primary/8 border border-primary/20 rounded-xl px-4 py-3 mb-5">
                  <CheckCircle2 size={16} className="text-primary shrink-0" />
                  <p className="text-sm">
                    Booking trial with <span className="font-semibold">{selectedArtist.name}</span>
                  </p>
                </div>
              )}

              {error && (
                <p className="text-red-500 text-sm mb-4" data-testid="text-checkout-error">{error}</p>
              )}

              <button
                onClick={handleCheckout}
                disabled={loading || !selectedArtist}
                className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  selectedArtist
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-98'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
                data-testid="button-checkout"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Processing...</>
                ) : selectedArtist ? (
                  <><ShoppingBag size={18} /> Book trial with {selectedArtist.name} — $50</>
                ) : (
                  'Select an artist to continue'
                )}
              </button>

              <p className="text-xs text-muted-foreground text-center mt-3">
                Secured by Stripe. Your payment info is never stored on our servers.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
