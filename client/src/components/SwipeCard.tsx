import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { MapPin, Star, Heart, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Artist } from '../lib/artists';

interface SwipeCardProps {
  artist: Artist;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  active: boolean;
}

export function SwipeCard({ artist, onSwipeLeft, onSwipeRight, active }: SwipeCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 250], [-12, 12]);
  const likeOpacity = useTransform(x, [0, 80], [0, 1]);
  const nopeOpacity = useTransform(x, [-80, 0], [1, 0]);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) onSwipeRight();
    else if (info.offset.x < -100) onSwipeLeft();
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => Math.min(prev + 1, images.length - 1));
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => Math.max(prev - 1, 0));
  };

  if (!active) return null;

  const images = artist.images?.length ? artist.images : ['/placeholder.jpg'];
  const total = images.length;

  return (
    <motion.div
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0, transition: { duration: 0.2 } }}
      whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
      className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden cursor-grab shadow-2xl"
      data-testid={`card-artist-${artist.id}`}
    >
      {/* Full-screen image */}
      <img
        src={images[currentImageIndex]}
        alt={`${artist.name} portfolio`}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        draggable={false}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/20 pointer-events-none" />

      {/* Image counter — top right */}
      {total > 1 && (
        <div className="absolute top-4 right-4 z-20 bg-black/35 backdrop-blur-sm rounded-full px-3 py-1 pointer-events-none">
          <span className="text-white text-xs font-medium tracking-wide">
            {currentImageIndex + 1} / {total}
          </span>
        </div>
      )}

      {/* LOVE stamp */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute top-10 left-6 z-20 border-[3px] border-emerald-400 rounded-xl px-4 py-1.5 rotate-[-12deg] pointer-events-none"
      >
        <span className="text-emerald-400 font-bold text-2xl tracking-widest uppercase">Love</span>
      </motion.div>

      {/* NOPE stamp */}
      <motion.div
        style={{ opacity: nopeOpacity }}
        className="absolute top-10 right-6 z-20 border-[3px] border-rose-400 rounded-xl px-4 py-1.5 rotate-[12deg] pointer-events-none"
      >
        <span className="text-rose-400 font-bold text-2xl tracking-widest uppercase">Nope</span>
      </motion.div>

      {/* Left image nav chevron */}
      {total > 1 && currentImageIndex > 0 && (
        <button
          onClick={prevImage}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-14 h-14 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-all shadow-lg"
          data-testid="button-prev-image"
        >
          <ChevronLeft size={34} strokeWidth={2.5} />
        </button>
      )}

      {/* Right image nav chevron */}
      {total > 1 && currentImageIndex < total - 1 && (
        <button
          onClick={nextImage}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-14 h-14 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-all shadow-lg"
          data-testid="button-next-image"
        >
          <ChevronRight size={34} strokeWidth={2.5} />
        </button>
      )}

      {/* Bottom info overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-5 pt-6 pb-[72px]">

        {/* Dot indicators */}
        {total > 1 && (
          <div className="flex gap-1.5 mb-4">
            {images.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentImageIndex ? 'bg-white w-6' : 'bg-white/35 w-1.5'
                }`}
              />
            ))}
          </div>
        )}

        {/* Name */}
        <h2 className="text-[2rem] font-serif font-semibold text-white leading-tight mb-1 drop-shadow-sm">
          {artist.name}
        </h2>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-white/75 text-sm mb-3">
          <MapPin size={13} />
          <span>{artist.location}</span>
        </div>

        {/* Style + Rating */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] uppercase tracking-widest text-white/65 border border-white/25 rounded-full px-3 py-1">
            {artist.style}
          </span>
          <div className="flex items-center gap-1 text-sm text-white">
            <Star size={13} className="fill-amber-400 text-amber-400" />
            <span className="font-semibold">{artist.rating}</span>
            <span className="text-white/55 text-xs">({artist.reviews})</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-center gap-5">
          <div>
            <p className="text-white/45 text-[10px] uppercase tracking-widest mb-0.5">Trial</p>
            <p className="text-white font-semibold">${artist.trialPrice}</p>
          </div>
          <div className="w-px h-6 bg-white/20" />
          <div>
            <p className="text-white/45 text-[10px] uppercase tracking-widest mb-0.5">Wedding Day</p>
            <p className="text-white font-semibold">${artist.weddingPrice}</p>
          </div>
        </div>
      </div>

      {/* X and Heart buttons — bottom corners */}
      <div className="absolute bottom-5 left-5 right-5 z-20 flex justify-between pointer-events-none">
        <button
          onClick={(e) => { e.stopPropagation(); onSwipeLeft(); }}
          className="pointer-events-auto w-11 h-11 rounded-full bg-black/25 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-red-500/70 transition-all active:scale-90"
          data-testid="button-swipe-left"
        >
          <X size={18} className="text-white" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onSwipeRight(); }}
          className="pointer-events-auto w-11 h-11 rounded-full bg-black/25 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-rose-400/70 transition-all active:scale-90"
          data-testid="button-swipe-right"
        >
          <Heart size={16} className="text-white fill-white" />
        </button>
      </div>
    </motion.div>
  );
}
