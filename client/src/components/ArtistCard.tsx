import { useRef, useState, type PointerEvent } from 'react';
import { ChevronLeft, ChevronRight, Heart, MapPin, Star } from 'lucide-react';
import type { Artist } from '../lib/artists';

interface ArtistCardProps {
  artist: Artist;
  saved: boolean;
  onToggleSaved: () => void;
  onReserveTrial: () => void;
}

export function ArtistCard({ artist, saved, onToggleSaved, onReserveTrial }: ArtistCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const images = artist.images?.length ? artist.images : ['/placeholder.jpg'];
  const total = images.length;

  function changeImage(direction: number) {
    setCurrentImageIndex(index => (index + direction + total) % total);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    pointerStart.current = { x: event.clientX, y: event.clientY };
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!pointerStart.current || total < 2) return;
    const dx = event.clientX - pointerStart.current.x;
    const dy = event.clientY - pointerStart.current.y;
    pointerStart.current = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      changeImage(dx < 0 ? 1 : -1);
    }
  }

  const thumbnails = images
    .map((src, index) => ({ src, index }))
    .filter(({ index }) => index !== currentImageIndex)
    .slice(0, 4);

  return (
    <article
      className="w-full overflow-hidden rounded-3xl border border-border bg-white shadow-lg"
      data-testid={`card-artist-${artist.id}`}
    >
      <div
        className="relative aspect-[4/5] overflow-hidden bg-[#F5F3F2] touch-pan-y select-none"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => { pointerStart.current = null; }}
        role="group"
        aria-label={`Photos of ${artist.name}`}
      >
        <img
          src={images[currentImageIndex]}
          alt={`${artist.name} portfolio photo ${currentImageIndex + 1}`}
          className="h-full w-full object-contain pointer-events-none"
          draggable={false}
          data-testid="image-artist-hero"
        />
        {total > 1 && (
          <>
            <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white">
              {currentImageIndex + 1} / {total}
            </span>
            <button
              type="button"
              onClick={() => changeImage(-1)}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white hover:bg-black/70"
              data-testid="button-prev-image"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => changeImage(1)}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white hover:bg-black/70"
              data-testid="button-next-image"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {thumbnails.length > 0 && (
        <div className="flex gap-2 overflow-x-auto px-4 pt-3 pb-1" aria-label={`More photos of ${artist.name}`}>
          {thumbnails.map(({ src, index }) => (
            <button
              type="button"
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              aria-label={`View photo ${index + 1} of ${artist.name}`}
              className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border hover:border-[#5C2D4A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5C2D4A]"
              data-testid={`button-thumbnail-${index}`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" draggable={false} />
            </button>
          ))}
        </div>
      )}

      <div className="px-5 pb-5 pt-3">
        <h2 className="font-serif text-[1.85rem] font-semibold leading-tight text-foreground">{artist.name}</h2>
        <div className="mt-1 flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span className="flex min-w-0 items-center gap-1.5">
            <MapPin size={14} className="shrink-0" aria-hidden="true" />
            <span className="truncate">{artist.location}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1 text-foreground">
            <Star size={14} className="fill-amber-400 text-amber-400" aria-hidden="true" />
            <span className="font-semibold">{artist.rating}</span>
            <span className="text-muted-foreground">({artist.reviews})</span>
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 border-y border-border py-3">
          <div className="border-r border-border">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Trial</p>
            <p className="mt-0.5 font-semibold text-foreground">${artist.trialPrice}</p>
          </div>
          <div className="pl-5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Wedding Day</p>
            <p className="mt-0.5 font-semibold text-foreground">${artist.weddingPrice}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onReserveTrial}
          className="mt-4 w-full rounded-xl bg-[#5C2D4A] px-4 py-3 text-sm font-semibold text-white hover:bg-[#472038] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5C2D4A]"
          data-testid="button-reserve-trial"
        >
          Reserve Trial
        </button>
        <button
          type="button"
          onClick={onToggleSaved}
          aria-pressed={saved}
          className="mx-auto mt-3 flex items-center gap-2 rounded-lg px-3 py-1 text-sm font-medium text-[#5C2D4A] hover:bg-primary/10"
          data-testid="button-save-artist"
        >
          <Heart size={16} className={saved ? 'fill-current' : ''} />
          {saved ? 'Saved for Later' : 'Save for Later'}
        </button>
      </div>
    </article>
  );
}