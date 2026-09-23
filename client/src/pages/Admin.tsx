import React, { useState, useRef, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { Sparkles, Upload, X, Loader2, Trash2, LogOut, Image, Plus, Star, MapPin, Eye, EyeOff } from 'lucide-react';
import { Artist, Region } from '../lib/artists';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onLogin();
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-primary/10 p-3 rounded-xl inline-flex mb-4">
            <Sparkles className="text-primary" size={32} />
          </div>
          <h1 className="text-3xl font-serif font-bold mb-2">Trial Makeup</h1>
          <p className="text-muted-foreground">Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-border p-8">
          <h2 className="text-xl font-semibold mb-6">Sign In</h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-muted-foreground mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="w-full px-4 py-3 bg-muted rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all pr-12"
                placeholder="Enter admin password"
                data-testid="input-admin-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg"
            data-testid="button-admin-login"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

function ArtistForm({ onSaved }: { onSaved: () => void }) {
  const [region, setRegion] = useState<Exclude<Region, 'all'>>('winnipeg');
  const [name, setName] = useState('');
  const [style, setStyle] = useState('');
  const [location, setLocation] = useState('');
  const [trialPrice, setTrialPrice] = useState('');
  const [weddingPrice, setWeddingPrice] = useState('');
  const [rating, setRating] = useState('5.0');
  const [reviews, setReviews] = useState('0');
  const [bio, setBio] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreviews(prev => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !style || !location || !trialPrice || !weddingPrice || !bio) {
      setError('Please fill in all fields');
      return;
    }
    if (imageFiles.length === 0) {
      setError('Please upload at least one portfolio image');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const imageUrls: string[] = [];
      for (const file of imageFiles) {
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const storageRef = ref(storage, `artists/${timestamp}_${safeName}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        imageUrls.push(url);
      }

      await addDoc(collection(db, 'artists'), {
        name,
        style,
        location,
        region,
        trialPrice: Number(trialPrice),
        weddingPrice: Number(weddingPrice),
        rating: Number(rating),
        reviews: Number(reviews),
        bio,
        images: imageUrls,
      });

      setName('');
      setStyle('');
      setLocation('');
      setRegion('winnipeg');
      setTrialPrice('');
      setWeddingPrice('');
      setRating('5.0');
      setReviews('0');
      setBio('');
      setImageFiles([]);
      setImagePreviews([]);
      onSaved();
    } catch (err: any) {
      console.error('Error saving artist:', err);
      setError(err.message || 'Failed to save artist');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-border p-8">
      <h2 className="text-2xl font-serif font-bold mb-6">Add New Artist</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Artist Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-muted rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all"
            placeholder="e.g. Elena Rossi"
            data-testid="input-artist-name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Style</label>
          <input
            type="text"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full px-4 py-3 bg-muted rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all"
            placeholder="e.g. Soft Glam & Natural"
            data-testid="input-artist-style"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Location</label>
          <div className="relative">
            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-muted rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all"
              placeholder="e.g. New York, NY"
              data-testid="input-artist-location"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Region</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value as Exclude<Region, 'all'>)}
            className="w-full px-4 py-3 bg-muted rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all"
            data-testid="select-artist-region"
          >
            <option value="winnipeg">Greater Winnipeg</option>
            <option value="toronto">Greater Toronto Area</option>
            <option value="waterloo">Greater Waterloo Region</option>
            <option value="niagara">Niagara Region</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Trial Price ($)</label>
            <input
              type="number"
              value={trialPrice}
              onChange={(e) => setTrialPrice(e.target.value)}
              className="w-full px-4 py-3 bg-muted rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all"
              placeholder="150"
              data-testid="input-trial-price"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Wedding Price ($)</label>
            <input
              type="number"
              value={weddingPrice}
              onChange={(e) => setWeddingPrice(e.target.value)}
              className="w-full px-4 py-3 bg-muted rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all"
              placeholder="350"
              data-testid="input-wedding-price"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Rating</label>
          <div className="relative">
            <Star size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400 fill-yellow-400" />
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-muted rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all"
              data-testid="input-rating"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Number of Reviews</label>
          <input
            type="number"
            value={reviews}
            onChange={(e) => setReviews(e.target.value)}
            className="w-full px-4 py-3 bg-muted rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all"
            placeholder="0"
            data-testid="input-reviews"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-muted-foreground mb-2">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 bg-muted rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all resize-none"
          placeholder="Tell us about this artist's style and experience..."
          data-testid="input-bio"
        />
      </div>

      <div className="mb-8">
        <label className="block text-sm font-medium text-muted-foreground mb-2">Portfolio Images</label>
        <div className="flex flex-wrap gap-4">
          {imagePreviews.map((preview, i) => (
            <div key={i} className="relative w-28 h-28 rounded-xl overflow-hidden border border-border group">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-28 h-28 rounded-xl border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            data-testid="button-upload-images"
          >
            <Image size={24} />
            <span className="text-xs font-medium">Add Photo</span>
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          className="hidden"
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        data-testid="button-save-artist"
      >
        {saving ? (
          <>
            <Loader2 size={24} className="animate-spin" />
            Uploading & Saving...
          </>
        ) : (
          <>
            <Plus size={24} />
            Save Artist
          </>
        )}
      </button>
    </form>
  );
}

function ArtistList({ artists, onDelete }: { artists: Artist[]; onDelete: (id: string) => void }) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this artist?')) return;
    setDeleting(id);
    try {
      await deleteDoc(doc(db, 'artists', id));
      onDelete(id);
    } catch (err) {
      console.error('Error deleting:', err);
    } finally {
      setDeleting(null);
    }
  };

  if (artists.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-border p-8 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Image size={32} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Artists Yet</h3>
        <p className="text-muted-foreground">Use the form above to add your first makeup artist.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-border p-8">
      <h2 className="text-2xl font-serif font-bold mb-6">Existing Artists ({artists.length})</h2>
      <div className="space-y-4">
        {artists.map(artist => (
          <div key={artist.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl border border-border">
            {artist.images[0] ? (
              <img src={artist.images[0]} alt={artist.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <Image size={24} className="text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{artist.name}</h3>
              <p className="text-sm text-muted-foreground truncate">{artist.style} - {artist.location}</p>
              <p className="text-sm font-medium">Trial: ${artist.trialPrice} | Wedding: ${artist.weddingPrice}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              {artist.rating}
            </div>
            <button
              onClick={() => handleDelete(artist.id)}
              disabled={deleting === artist.id}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0 disabled:opacity-50"
              data-testid={`button-delete-artist-${artist.id}`}
            >
              {deleting === artist.id ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loadingArtists, setLoadingArtists] = useState(false);

  const loadArtists = async () => {
    setLoadingArtists(true);
    try {
      const snapshot = await getDocs(collection(db, 'artists'));
      const data = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
      })) as Artist[];
      setArtists(data);
    } catch (err) {
      console.error('Error loading artists:', err);
    } finally {
      setLoadingArtists(false);
    }
  };

  useEffect(() => {
    if (authenticated) {
      loadArtists();
    }
  }, [authenticated]);

  if (!authenticated) {
    return <AdminLogin onLogin={() => setAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="px-8 py-5 border-b border-border bg-white sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Sparkles className="text-primary" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground tracking-wide">Trial Makeup</h1>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={() => setAuthenticated(false)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
            data-testid="button-admin-logout"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-8 space-y-8">
        <ArtistForm onSaved={loadArtists} />
        <ArtistList
          artists={artists}
          onDelete={(id) => setArtists(prev => prev.filter(a => a.id !== id))}
        />
      </main>
    </div>
  );
}