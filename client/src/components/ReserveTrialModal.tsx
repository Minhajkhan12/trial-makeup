import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { X } from 'lucide-react';
import type { Artist } from '../lib/artists';
import { db } from '../lib/firebase';
import { trackEvent } from '../lib/analytics';

interface ReserveTrialModalProps {
  artist: Artist;
  onClose: () => void;
  onConfirmed: (artistName: string) => void;
}

export function ReserveTrialModal({ artist, onClose, onConfirmed }: ReserveTrialModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [trialDate, setTrialDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting) onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose, submitting]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    if (!name.trim() || !phone.trim()) {
      setError('Please enter your name and phone number.');
      return;
    }
    if (weddingDate && trialDate && trialDate >= weddingDate) {
      setError('Please choose a trial date before your wedding date.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await addDoc(collection(db, 'trialRequests'), {
        artistId: artist.id,
        artistName: artist.name,
        region: artist.region,
        name: name.trim(),
        phone: phone.trim(),
        weddingDate: weddingDate || null,
        preferredTrialDate: trialDate || null,
        status: 'new',
        createdAt: serverTimestamp(),
      });
      trackEvent('trial_reservation_requested', { region: artist.region || 'other' });
      onConfirmed(artist.name);
    } catch (err) {
      console.error('Could not save trial request:', err);
      setError('Your request could not be sent. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4"
      onMouseDown={event => { if (event.target === event.currentTarget && !submitting) onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reserve-trial-title"
        className="w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
        data-testid="modal-reserve-trial"
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2 id="reserve-trial-title" className="text-3xl font-serif font-semibold text-foreground">Reserve a trial</h2>
            <p className="mt-1 text-sm text-muted-foreground">With {artist.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close reservation form"
            className="rounded-full p-2 text-muted-foreground hover:bg-muted disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium">
            Wedding date
            <input
              type="date"
              value={weddingDate}
              onChange={event => setWeddingDate(event.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-border bg-white px-4 py-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              data-testid="input-wedding-date"
            />
          </label>
          <label className="block text-sm font-medium">
            Preferred trial date
            <input
              type="date"
              value={trialDate}
              onChange={event => setTrialDate(event.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-border bg-white px-4 py-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              data-testid="input-trial-date"
            />
          </label>
          <label className="block text-sm font-medium">
            Phone number <span className="text-primary">*</span>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={event => setPhone(event.target.value)}
              placeholder="Your phone number"
              className="mt-1.5 block w-full rounded-xl border border-border bg-white px-4 py-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              data-testid="input-reserve-phone"
            />
          </label>
          <label className="block text-sm font-medium">
            Name <span className="text-primary">*</span>
            <input
              ref={nameRef}
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={event => setName(event.target.value)}
              placeholder="Your name"
              className="mt-1.5 block w-full rounded-xl border border-border bg-white px-4 py-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              data-testid="input-reserve-name"
            />
          </label>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[#5C2D4A] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#472038] disabled:opacity-60"
            data-testid="button-submit-reservation"
          >
            {submitting ? 'Sending request…' : 'Request trial'}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}