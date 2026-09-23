import React, { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, isPast, startOfDay,
} from 'date-fns';
import { auth, db, storage } from '../lib/firebase';
import { normalizeCity, cityToRegion, DayKey, RecurringPattern } from '../lib/artists';
import { trackEvent } from '../lib/analytics';
import { ChevronLeft, ChevronRight, Camera, X, CheckCircle2, Loader2, ArrowRight, Sparkles } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type Services = 'makeup' | 'makeup_hair';

interface PhotoItem {
  url: string;
  storagePath: string;
}

interface FormState {
  name: string;
  city: string;
  photos: PhotoItem[];
  services: Services;
  makeupTrialMin: string;
  makeupTrialMax: string;
  makeupWeddingMin: string;
  makeupWeddingMax: string;
  hairTrialMin: string;
  hairTrialMax: string;
  hairWeddingMin: string;
  hairWeddingMax: string;
  recurringPattern: RecurringPattern;
  dateOverrides: Record<string, 'busy' | 'available'>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DAY_KEYS: DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const WEEK_DAYS: { key: DayKey; label: string; short: string }[] = [
  { key: 'mon', label: 'Monday',    short: 'Mon' },
  { key: 'tue', label: 'Tuesday',   short: 'Tue' },
  { key: 'wed', label: 'Wednesday', short: 'Wed' },
  { key: 'thu', label: 'Thursday',  short: 'Thu' },
  { key: 'fri', label: 'Friday',    short: 'Fri' },
  { key: 'sat', label: 'Saturday',  short: 'Sat' },
  { key: 'sun', label: 'Sunday',    short: 'Sun' },
];

const STEP_TITLES = ['', 'About you', 'Services & Pricing', 'Availability'];

const PLUM = '#5C2D4A';
const PLUM_LIGHT = '#7D4469';
const CREAM = '#FAF7F0';

const defaultRecurring: RecurringPattern = {
  mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: true,
};

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ArtistOnboard() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [calMonth, setCalMonth] = useState(new Date());

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>({
    name: '',
    city: '',
    photos: [],
    services: 'makeup',
    makeupTrialMin: '',
    makeupTrialMax: '',
    makeupWeddingMin: '',
    makeupWeddingMax: '',
    hairTrialMin: '',
    hairTrialMax: '',
    hairWeddingMin: '',
    hairWeddingMax: '',
    recurringPattern: { ...defaultRecurring },
    dateOverrides: {},
  });

  // ── Auth ────────────────────────────────────────────────────────────────────

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setSigningIn(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      setForm(f => ({ ...f, name: result.user.displayName || '' }));
      setStep(1);
      trackEvent('artist_registration_signed_in');
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in was cancelled. Please try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setAuthError('Popups are blocked by your browser. Please allow popups for this site and try again.');
      } else {
        setAuthError('Sign-in failed. Please try again.');
      }
    } finally {
      setSigningIn(false);
    }
  };

  // ── Photo upload ─────────────────────────────────────────────────────────────

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !user) return;

    const remaining = 5 - form.photos.length;
    if (remaining <= 0) return;
    const toUpload = files.slice(0, remaining);

    setUploading(true);
    setUploadError(null);

    const newPhotos: PhotoItem[] = [];
    for (const file of toUpload) {
      try {
        const path = `artists/${user.uid}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const sRef = storageRef(storage, path);
        await uploadBytes(sRef, file);
        const url = await getDownloadURL(sRef);
        newPhotos.push({ url, storagePath: path });
      } catch (err: any) {
        setUploadError('One or more photos failed to upload. Please check your connection and try again.');
      }
    }

    setForm(f => ({ ...f, photos: [...f.photos, ...newPhotos] }));
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (idx: number) => {
    setForm(f => ({ ...f, photos: f.photos.filter((_, i) => i !== idx) }));
  };

  // ── Validation ───────────────────────────────────────────────────────────────

  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Your name is required.';
    if (!form.city.trim()) errs.city = 'Your city is required.';
    if (form.photos.length < 3) errs.photos = 'Please upload at least 3 portfolio photos.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};

    const checkRange = (minKey: keyof FormState, maxKey: keyof FormState, label: string) => {
      const minVal = parseFloat(form[minKey] as string);
      const maxVal = parseFloat(form[maxKey] as string);
      if (!form[minKey] || isNaN(minVal) || minVal <= 0) errs[minKey as string] = `Enter a ${label} minimum.`;
      if (!form[maxKey] || isNaN(maxVal) || maxVal <= 0) errs[maxKey as string] = `Enter a ${label} maximum.`;
      if (!isNaN(minVal) && !isNaN(maxVal) && maxVal <= minVal) {
        errs[maxKey as string] = `Maximum must be greater than minimum.`;
      }
    };

    checkRange('makeupTrialMin', 'makeupTrialMax', 'makeup trial');
    checkRange('makeupWeddingMin', 'makeupWeddingMax', 'makeup wedding-day');
    if (form.services === 'makeup_hair') {
      checkRange('hairTrialMin', 'hairTrialMax', 'hair trial');
      checkRange('hairWeddingMin', 'hairWeddingMax', 'hair wedding-day');
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Navigation ───────────────────────────────────────────────────────────────

  const goNext = async () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setErrors({});
    if (step === 3) {
      await handleSubmit();
    } else {
      trackEvent('artist_registration_step_completed', { step });
      setStep(s => s + 1);
    }
  };

  const goBack = () => {
    setErrors({});
    if (step === 1) {
      setStep(0);
    } else {
      setStep(s => s - 1);
    }
  };

  // ── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const city = normalizeCity(form.city);
      const region = cityToRegion(city);

      const artistData = {
        uid: user.uid,
        name: form.name.trim(),
        city,
        location: form.city.trim(),
        region,
        images: form.photos.map(p => p.url),
        services: form.services,
        makeupTrialMin: parseFloat(form.makeupTrialMin),
        makeupTrialMax: parseFloat(form.makeupTrialMax),
        makeupWeddingMin: parseFloat(form.makeupWeddingMin),
        makeupWeddingMax: parseFloat(form.makeupWeddingMax),
        trialPrice: parseFloat(form.makeupTrialMin),
        weddingPrice: parseFloat(form.makeupWeddingMin),
        ...(form.services === 'makeup_hair' && {
          hairTrialMin: parseFloat(form.hairTrialMin),
          hairTrialMax: parseFloat(form.hairTrialMax),
          hairWeddingMin: parseFloat(form.hairWeddingMin),
          hairWeddingMax: parseFloat(form.hairWeddingMax),
        }),
        recurringPattern: form.recurringPattern,
        dateOverrides: form.dateOverrides,
        rating: 0,
        reviews: 0,
        bio: '',
        diversity: [],
        hijabFriendly: false,
        active: true,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'artists'), artistData);
      trackEvent('artist_profile_published', { region, services: form.services });
      setStep(4);
    } catch (err: any) {
      setSubmitError('Something went wrong saving your profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Calendar helpers ─────────────────────────────────────────────────────────

  const getEffectiveState = (date: Date): 'available' | 'busy' => {
    const key = format(date, 'yyyy-MM-dd');
    if (form.dateOverrides[key]) return form.dateOverrides[key];
    const dayKey = DAY_KEYS[date.getDay()];
    return form.recurringPattern[dayKey] ? 'available' : 'busy';
  };

  const hasOverride = (date: Date): boolean => {
    return !!form.dateOverrides[format(date, 'yyyy-MM-dd')];
  };

  const handleDayTap = (date: Date) => {
    if (isPast(startOfDay(date)) && !isToday(date)) return;
    const key = format(date, 'yyyy-MM-dd');
    if (form.dateOverrides[key]) {
      const updated = { ...form.dateOverrides };
      delete updated[key];
      setForm(f => ({ ...f, dateOverrides: updated }));
    } else {
      const dayKey = DAY_KEYS[date.getDay()];
      const normallyAvailable = form.recurringPattern[dayKey];
      setForm(f => ({
        ...f,
        dateOverrides: { ...f.dateOverrides, [key]: normallyAvailable ? 'busy' : 'available' },
      }));
    }
  };

  // ─── Render steps ─────────────────────────────────────────────────────────────

  const renderCalendar = () => {
    const monthStart = startOfMonth(calMonth);
    const monthEnd = endOfMonth(calMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: calStart, end: calEnd });

    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setCalMonth(m => subMonths(m, 1))}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="font-semibold text-[#2D1B1B] text-sm">
            {format(calMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setCalMonth(m => addMonths(m, 1))}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="text-center text-[10px] font-medium text-[#9B7B8A] py-1 tracking-widest uppercase">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map(date => {
            const inMonth = isSameMonth(date, calMonth);
            const past = isPast(startOfDay(date)) && !isToday(date);
            const state = getEffectiveState(date);
            const overrideSet = hasOverride(date);
            const today = isToday(date);
            const busy = state === 'busy';

            return (
              <button
                key={date.toISOString()}
                onClick={() => inMonth && !past && handleDayTap(date)}
                disabled={!inMonth || past}
                className={cn(
                  'aspect-square flex items-center justify-center rounded-full text-xs transition-all',
                  !inMonth && 'opacity-0 pointer-events-none',
                  inMonth && past && 'opacity-25 cursor-default',
                  inMonth && !past && 'cursor-pointer hover:opacity-80 active:scale-95',
                  busy && inMonth && 'text-white',
                  !busy && inMonth && 'text-[#2D1B1B]',
                  overrideSet && 'font-bold ring-2 ring-offset-1',
                )}
                style={
                  !inMonth ? undefined
                  : busy
                    ? { backgroundColor: PLUM, ...(overrideSet && { ringColor: PLUM }) }
                    : { backgroundColor: '#F0EBE5', ...(overrideSet && { ringColor: '#4caf50' }) }
                }
                aria-label={`${format(date, 'MMM d')} — ${busy ? 'busy' : 'available'}${overrideSet ? ' (overridden)' : ''}`}
              >
                <span className={today ? 'underline underline-offset-2' : ''}>
                  {format(date, 'd')}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F0EBE5', border: '1px solid #ccc' }} />
            <span className="text-[10px] text-[#9B7B8A]">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PLUM }} />
            <span className="text-[10px] text-[#9B7B8A]">Busy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: PLUM }} />
            <span className="text-[10px] text-[#9B7B8A]">Overridden</span>
          </div>
        </div>
      </div>
    );
  };

  // ─── Step 0 — Sign in ─────────────────────────────────────────────────────────

  const renderStep0 = () => (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12" style={{ background: CREAM }}>
      <div className="w-full max-w-sm text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Sparkles size={22} style={{ color: PLUM }} />
          <span className="font-serif text-2xl font-semibold text-[#2D1B1B] tracking-wide">BeautyBooked</span>
        </div>

        <h1 className="font-serif text-4xl font-semibold text-[#2D1B1B] mb-3 leading-tight">
          Join as an artist.
        </h1>
        <p className="text-[#6B5B5B] text-base leading-relaxed mb-10">
          Set up your profile and start connecting with brides in your area — no approval wait, no middleman.
        </p>

        <button
          onClick={handleGoogleSignIn}
          disabled={signingIn}
          data-testid="button-google-signin"
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white border border-[#E5DDD8] text-[#2D1B1B] font-medium text-base shadow-sm hover:shadow-md hover:border-[#C9A8B2] transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {signingIn ? (
            <Loader2 size={20} className="animate-spin text-[#9B7B8A]" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          {signingIn ? 'Signing in…' : 'Continue with Google'}
        </button>

        {authError && (
          <p className="mt-4 text-sm text-red-600 text-center" data-testid="text-auth-error">{authError}</p>
        )}

        <p className="mt-8 text-xs text-[#9B7B8A] leading-relaxed">
          By continuing, you agree to allow BeautyBooked to display your profile to brides searching in your area.
        </p>

        <button
          onClick={() => navigate('/')}
          className="mt-6 text-sm text-[#9B7B8A] hover:text-[#2D1B1B] transition-colors underline-offset-2 hover:underline"
        >
          Back to browsing
        </button>
      </div>
    </div>
  );

  // ─── Step 1 — Basics ──────────────────────────────────────────────────────────

  const renderStep1 = () => (
    <div className="space-y-7">
      {/* Name */}
      <div>
        <label className="block text-sm font-semibold text-[#2D1B1B] mb-2" htmlFor="input-name">
          Your name
        </label>
        <input
          id="input-name"
          type="text"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Sarah Chen"
          data-testid="input-name"
          className={cn(
            'w-full px-4 py-3.5 rounded-xl border bg-white text-[#2D1B1B] text-base placeholder:text-[#C9B8C2] focus:outline-none focus:ring-2 transition-all',
            errors.name ? 'border-red-400 focus:ring-red-200' : 'border-[#E5DDD8] focus:ring-[#D4A8BB]'
          )}
        />
        {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>}
      </div>

      {/* City */}
      <div>
        <label className="block text-sm font-semibold text-[#2D1B1B] mb-2" htmlFor="input-city">
          Your city
        </label>
        <input
          id="input-city"
          type="text"
          value={form.city}
          onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
          placeholder="e.g. Toronto, Calgary, Vancouver…"
          data-testid="input-city"
          className={cn(
            'w-full px-4 py-3.5 rounded-xl border bg-white text-[#2D1B1B] text-base placeholder:text-[#C9B8C2] focus:outline-none focus:ring-2 transition-all',
            errors.city ? 'border-red-400 focus:ring-red-200' : 'border-[#E5DDD8] focus:ring-[#D4A8BB]'
          )}
        />
        <p className="mt-1.5 text-xs text-[#9B7B8A]">Used to help brides in your area find you.</p>
        {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
      </div>

      {/* Photos */}
      <div>
        <label className="block text-sm font-semibold text-[#2D1B1B] mb-1">
          Portfolio photos
          <span className="ml-2 text-xs font-normal text-[#9B7B8A]">{form.photos.length} / 5 — minimum 3</span>
        </label>
        <p className="text-xs text-[#9B7B8A] mb-3">
          These are the first thing brides see. Choose your best work — clear, well-lit, and true to your style.
        </p>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {form.photos.map((photo, idx) => (
            <div
              key={photo.storagePath}
              className="relative aspect-square rounded-xl overflow-hidden bg-[#F0EBE5] group"
              data-testid={`img-photo-${idx}`}
            >
              <img
                src={photo.url}
                alt={`Portfolio photo ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removePhoto(idx)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                data-testid={`button-remove-photo-${idx}`}
                aria-label="Remove photo"
              >
                <X size={12} className="text-white" />
              </button>
            </div>
          ))}

          {form.photos.length < 5 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              data-testid="button-add-photo"
              className={cn(
                'aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all',
                uploading
                  ? 'border-[#D4A8BB] bg-[#F9F3F6] cursor-wait'
                  : 'border-[#D4A8BB] bg-[#FDF8FB] hover:border-[#5C2D4A] hover:bg-[#F5EDF2] cursor-pointer active:scale-95'
              )}
            >
              {uploading ? (
                <Loader2 size={20} className="animate-spin text-[#9B7B8A]" />
              ) : (
                <>
                  <Camera size={20} className="text-[#9B7B8A] mb-1" />
                  <span className="text-[10px] text-[#9B7B8A] font-medium">Add</span>
                </>
              )}
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handlePhotoSelect}
          data-testid="input-file-photos"
        />

        {uploadError && (
          <p className="mt-2 text-xs text-red-500">{uploadError}</p>
        )}
        {errors.photos && (
          <p className="mt-2 text-xs text-red-500">{errors.photos}</p>
        )}
        {!errors.photos && form.photos.length > 0 && form.photos.length < 3 && (
          <p className="mt-2 text-xs text-amber-600">
            {3 - form.photos.length} more photo{3 - form.photos.length !== 1 ? 's' : ''} needed to continue.
          </p>
        )}
      </div>
    </div>
  );

  // ─── Step 2 — Services & Pricing ──────────────────────────────────────────────

  const PriceField = ({
    id, label, fieldKey, placeholder,
  }: { id: string; label: string; fieldKey: keyof FormState; placeholder: string }) => (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-[#6B5B5B] mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B7B8A] text-sm font-medium">$</span>
        <input
          id={id}
          type="number"
          min="1"
          value={form[fieldKey] as string}
          onChange={e => setForm(f => ({ ...f, [fieldKey]: e.target.value }))}
          placeholder={placeholder}
          data-testid={`input-${fieldKey}`}
          className={cn(
            'w-full pl-8 pr-4 py-3 rounded-xl border bg-white text-[#2D1B1B] text-sm focus:outline-none focus:ring-2 transition-all',
            errors[fieldKey as string]
              ? 'border-red-400 focus:ring-red-200'
              : 'border-[#E5DDD8] focus:ring-[#D4A8BB]'
          )}
        />
      </div>
      {errors[fieldKey as string] && (
        <p className="mt-1 text-xs text-red-500">{errors[fieldKey as string]}</p>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-7">
      {/* Services toggle */}
      <div>
        <p className="text-sm font-semibold text-[#2D1B1B] mb-3">What services do you offer?</p>
        <div className="grid grid-cols-2 gap-3">
          {([ 
            { value: 'makeup',      label: 'Makeup only',    sub: 'Bridal & editorial' },
            { value: 'makeup_hair', label: 'Makeup + hair',  sub: 'Full bridal suite' },
          ] as const).map(opt => (
            <button
              key={opt.value}
              onClick={() => setForm(f => ({ ...f, services: opt.value }))}
              data-testid={`button-services-${opt.value}`}
              className={cn(
                'p-4 rounded-2xl border-2 text-left transition-all',
                form.services === opt.value
                  ? 'border-[#5C2D4A] bg-[#F9F0F5]'
                  : 'border-[#E5DDD8] bg-white hover:border-[#C9A8B2]'
              )}
            >
              <p className={cn('font-semibold text-sm', form.services === opt.value ? 'text-[#5C2D4A]' : 'text-[#2D1B1B]')}>
                {opt.label}
              </p>
              <p className="text-xs text-[#9B7B8A] mt-0.5">{opt.sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Makeup pricing */}
      <div className="bg-white rounded-2xl border border-[#E5DDD8] p-5">
        <p className="text-sm font-semibold text-[#2D1B1B] mb-4">Makeup pricing</p>
        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold text-[#9B7B8A] uppercase tracking-widest mb-3">Trial appointment</p>
            <div className="grid grid-cols-2 gap-3">
              <PriceField id="makeupTrialMin" label="From" fieldKey="makeupTrialMin" placeholder="150" />
              <PriceField id="makeupTrialMax" label="Up to" fieldKey="makeupTrialMax" placeholder="250" />
            </div>
          </div>
          <div className="border-t border-[#F0EBE5]" />
          <div>
            <p className="text-xs font-semibold text-[#9B7B8A] uppercase tracking-widest mb-3">Wedding day</p>
            <div className="grid grid-cols-2 gap-3">
              <PriceField id="makeupWeddingMin" label="From" fieldKey="makeupWeddingMin" placeholder="350" />
              <PriceField id="makeupWeddingMax" label="Up to" fieldKey="makeupWeddingMax" placeholder="600" />
            </div>
          </div>
        </div>
      </div>

      {/* Hair pricing — only shown when makeup_hair is selected */}
      {form.services === 'makeup_hair' && (
        <div className="bg-white rounded-2xl border border-[#E5DDD8] p-5">
          <p className="text-sm font-semibold text-[#2D1B1B] mb-4">Hair pricing</p>
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold text-[#9B7B8A] uppercase tracking-widest mb-3">Trial appointment</p>
              <div className="grid grid-cols-2 gap-3">
                <PriceField id="hairTrialMin" label="From" fieldKey="hairTrialMin" placeholder="120" />
                <PriceField id="hairTrialMax" label="Up to" fieldKey="hairTrialMax" placeholder="200" />
              </div>
            </div>
            <div className="border-t border-[#F0EBE5]" />
            <div>
              <p className="text-xs font-semibold text-[#9B7B8A] uppercase tracking-widest mb-3">Wedding day</p>
              <div className="grid grid-cols-2 gap-3">
                <PriceField id="hairWeddingMin" label="From" fieldKey="hairWeddingMin" placeholder="280" />
                <PriceField id="hairWeddingMax" label="Up to" fieldKey="hairWeddingMax" placeholder="500" />
              </div>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-[#9B7B8A]">
        These are shown to brides as a starting range. You discuss final pricing directly with each client.
      </p>
    </div>
  );

  // ─── Step 3 — Availability ────────────────────────────────────────────────────

  const renderStep3 = () => (
    <div className="space-y-7">
      {/* Recurring pattern */}
      <div>
        <p className="text-sm font-semibold text-[#2D1B1B] mb-1">Your typical weekly schedule</p>
        <p className="text-xs text-[#9B7B8A] mb-4">
          Toggle off the days you're usually unavailable. You can always override individual dates below.
        </p>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {WEEK_DAYS.map(({ key, short }) => {
            const available = form.recurringPattern[key];
            return (
              <button
                key={key}
                onClick={() => setForm(f => ({
                  ...f,
                  recurringPattern: { ...f.recurringPattern, [key]: !f.recurringPattern[key] },
                }))}
                data-testid={`button-day-${key}`}
                className={cn(
                  'py-3 rounded-xl text-sm font-semibold border-2 transition-all active:scale-95',
                  available
                    ? 'border-[#5C2D4A] text-[#5C2D4A] bg-[#F9F0F5]'
                    : 'border-[#E5DDD8] text-[#C9B8C2] bg-white'
                )}
              >
                {short}
              </button>
            );
          })}
        </div>
        <p className="mt-2.5 text-xs text-[#9B7B8A]">
          <span className="font-medium text-[#5C2D4A]">Filled = available.</span>{' '}
          <span className="text-[#C9B8C2]">Empty = usually off.</span>
        </p>
      </div>

      <div className="border-t border-[#EAE3DC]" />

      {/* Date overrides */}
      <div>
        <p className="text-sm font-semibold text-[#2D1B1B] mb-1">Block or open specific dates</p>
        <p className="text-xs text-[#9B7B8A] mb-4">
          Tap any upcoming date to mark it busy or override a day off. Tap again to clear the override.
        </p>
        <div className="bg-white rounded-2xl border border-[#E5DDD8] p-4">
          {renderCalendar()}
        </div>
        {Object.keys(form.dateOverrides).length > 0 && (
          <p className="mt-2.5 text-xs text-[#9B7B8A]">
            {Object.keys(form.dateOverrides).length} date override{Object.keys(form.dateOverrides).length !== 1 ? 's' : ''} set.{' '}
            <button
              onClick={() => setForm(f => ({ ...f, dateOverrides: {} }))}
              className="underline hover:text-[#5C2D4A] transition-colors"
              data-testid="button-clear-overrides"
            >
              Clear all
            </button>
          </p>
        )}
      </div>

      <p className="text-xs text-[#9B7B8A]">
        You can update your availability at any time from your profile settings.
      </p>
    </div>
  );

  // ─── Step 4 — Success ─────────────────────────────────────────────────────────

  const renderStep4 = () => (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center" style={{ background: CREAM }}>
      <div className="w-full max-w-sm">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
          style={{ backgroundColor: PLUM }}
        >
          <CheckCircle2 size={40} className="text-white" />
        </div>
        <h1 className="font-serif text-4xl font-semibold text-[#2D1B1B] mb-3 leading-tight">
          You're live.
        </h1>
        <p className="text-[#6B5B5B] text-base leading-relaxed mb-3">
          Your profile is now visible to brides searching in{' '}
          <span className="font-semibold text-[#2D1B1B]">{form.city}</span>.
        </p>
        <p className="text-sm text-[#9B7B8A] leading-relaxed mb-10">
          Brides can save your profile and send you a message directly. Check back soon for your first inquiry.
        </p>
        <button
          onClick={() => navigate('/')}
          data-testid="button-go-home"
          className="w-full py-4 rounded-2xl text-white font-semibold text-base transition-all active:scale-95 shadow-lg hover:shadow-xl"
          style={{ backgroundColor: PLUM }}
        >
          Browse BeautyBooked
        </button>
      </div>
    </div>
  );

  // ─── Main render ──────────────────────────────────────────────────────────────

  if (step === 0) return renderStep0();
  if (step === 4) return renderStep4();

  const progress = (step - 1) / 3;

  return (
    <div className="h-screen overflow-y-auto flex flex-col" style={{ background: CREAM }}>

      {/* Header */}
      <header
        className="shrink-0 sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-[#EAE3DC] px-4 py-3"
        data-testid="onboard-header"
      >
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <button
            onClick={goBack}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#F0EBE5] transition-colors shrink-0"
            data-testid="button-back"
            aria-label="Go back"
          >
            <ChevronLeft size={20} className="text-[#2D1B1B]" />
          </button>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm font-semibold text-[#2D1B1B]">{STEP_TITLES[step]}</p>
              <p className="text-xs text-[#9B7B8A]">Step {step} of 3</p>
            </div>
            <div className="h-1.5 bg-[#EAE3DC] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.round(progress * 100)}%`, backgroundColor: PLUM }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-lg mx-auto">
          <h1 className="font-serif text-3xl font-semibold text-[#2D1B1B] mb-1 leading-tight">
            {step === 1 && 'Tell brides about yourself.'}
            {step === 2 && 'Your services & pricing.'}
            {step === 3 && 'When are you available?'}
          </h1>
          <p className="text-sm text-[#9B7B8A] mb-8">
            {step === 1 && 'This is your first impression — make it count.'}
            {step === 2 && 'Brides use this to filter artists that fit their budget.'}
            {step === 3 && 'Optional — you can skip this and update it later.'}
          </p>

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>
      </main>

      {/* Footer CTA */}
      <footer className="shrink-0 sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-[#EAE3DC] px-4 py-4">
        <div className="max-w-lg mx-auto">
          {submitError && (
            <p className="text-xs text-red-500 mb-3 text-center">{submitError}</p>
          )}
          <button
            onClick={goNext}
            disabled={submitting || uploading}
            data-testid="button-continue"
            className="w-full py-4 rounded-2xl text-white font-semibold text-base flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: PLUM }}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Publishing your profile…
              </>
            ) : step === 3 ? (
              <>
                <Sparkles size={18} />
                Go live
              </>
            ) : (
              <>
                Continue
                <ArrowRight size={18} />
              </>
            )}
          </button>
          {step === 3 && (
            <p className="text-center text-xs text-[#9B7B8A] mt-2">
              Your profile goes live immediately — no review required.
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}
