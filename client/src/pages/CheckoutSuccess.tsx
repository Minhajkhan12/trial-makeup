import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { CheckCircle, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface BookingData {
  email: string;
  artistId: string;
  artistName: string;
  trialPrice: string;
  amountPaid: number;
}

export default function CheckoutSuccess() {
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<'loading' | 'confirmed' | 'error'>('loading');
  const [booking, setBooking] = useState<BookingData | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (!sessionId) { setStatus('error'); return; }

    fetch(`/api/verify-session?session_id=${sessionId}`)
      .then(r => r.json())
      .then(async data => {
        if (!data.paid) { setStatus('error'); return; }

        const bookingData: BookingData = {
          email: data.email || '',
          artistId: data.artistId || '',
          artistName: data.artistName || '',
          trialPrice: data.trialPrice || '50',
          amountPaid: data.amountPaid || 50,
        };

        setBooking(bookingData);

        try {
          await addDoc(collection(db, 'bookings'), {
            email: bookingData.email,
            artistId: bookingData.artistId,
            artistName: bookingData.artistName,
            trialPriceCharged: bookingData.amountPaid,
            paymentStatus: 'paid',
            sessionId,
            createdAt: serverTimestamp(),
          });
        } catch (e) {
          console.error('Failed to record booking in Firestore:', e);
        }

        localStorage.removeItem('savedArtists');
        setStatus('confirmed');
      })
      .catch(() => setStatus('error'));
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-primary mx-auto mb-4" size={44} />
          <p className="text-muted-foreground">Confirming your booking...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <Sparkles className="text-red-400" size={34} />
          </div>
          <h2 className="text-2xl font-serif font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6">We couldn't verify your payment. If you were charged, please contact us.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-primary-foreground px-7 py-2.5 rounded-full text-sm font-medium hover:bg-primary/90 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 py-4 border-b border-border bg-white/90 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <Sparkles className="text-primary" size={20} />
          <h1 className="text-xl font-serif font-semibold tracking-wide">BeautyBooked</h1>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-emerald-500" size={48} />
          </div>

          <h2 className="text-3xl font-serif font-semibold mb-3">You're booked!</h2>

          <p className="text-muted-foreground mb-2 leading-relaxed text-lg">
            Your trial with{' '}
            <span className="text-foreground font-semibold font-serif">
              {booking?.artistName || 'your selected artist'}
            </span>{' '}
            is confirmed.
          </p>

          <p className="text-muted-foreground mb-8 text-sm">
            {booking?.email
              ? `A receipt has been sent to ${booking.email}.`
              : ''}{' '}
            They will contact you shortly to confirm timing.
          </p>

          <div className="bg-white rounded-2xl border border-border p-5 text-left mb-8 shadow-sm">
            <h3 className="font-serif font-semibold text-lg mb-3">What happens next</h3>
            <ol className="space-y-3">
              {[
                `${booking?.artistName || 'Your artist'} reviews your booking and reaches out within 24 hours.`,
                'You confirm your trial date and location together.',
                'Attend your trial and share feedback.',
                'Book your wedding day with full confidence.',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium hover:bg-primary/90 transition-all"
            data-testid="button-back-home"
          >
            Browse more artists <ArrowRight size={16} />
          </button>
        </div>
      </main>
    </div>
  );
}
