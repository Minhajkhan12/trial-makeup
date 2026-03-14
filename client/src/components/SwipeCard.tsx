import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
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
  
  // Opacity decreases as card is swiped
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);
  
  // Rotation tied to x-axis
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  
  // Background colors for swipe indicators
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (event: any, info: any) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      onSwipeRight();
    } else if (info.offset.x < -threshold) {
      onSwipeLeft();
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentImageIndex < artist.images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  if (!active) return null;

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.2 } }}
      whileDrag={{ scale: 1.05 }}
      className="absolute inset-0 w-full h-full rounded-3xl bg-white shadow-xl overflow-hidden cursor-grab active:cursor-grabbing border border-border"
      data-testid={`card-artist-${artist.id}`}
    >
      {/* Swipe Indicators */}
      <motion.div 
        style={{ opacity: likeOpacity }} 
        className="absolute top-8 left-8 z-20 border-4 border-green-500 rounded-lg px-4 py-2 rotate-[-15deg]"
      >
        <span className="text-green-500 font-bold text-3xl tracking-widest uppercase">Love</span>
      </motion.div>
      
      <motion.div 
        style={{ opacity: nopeOpacity }} 
        className="absolute top-8 right-8 z-20 border-4 border-red-500 rounded-lg px-4 py-2 rotate-[15deg]"
      >
        <span className="text-red-500 font-bold text-3xl tracking-widest uppercase">Nope</span>
      </motion.div>

      {/* Image Gallery */}
      <div className="relative h-2/3 w-full bg-gray-100">
        <img 
          src={artist.images[currentImageIndex]} 
          alt={`${artist.name} portfolio`}
          className="w-full h-full object-cover pointer-events-none"
        />
        
        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60 pointer-events-none" />

        {/* Image Navigation */}
        {artist.images.length > 1 && (
          <>
            <div className="absolute top-0 w-full flex gap-1 p-2 z-10">
              {artist.images.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 flex-1 rounded-full ${i === currentImageIndex ? 'bg-white' : 'bg-white/40'}`} 
                />
              ))}
            </div>
            
            <div className="absolute inset-0 flex">
              <div className="w-1/2 h-full" onClick={prevImage} />
              <div className="w-1/2 h-full" onClick={nextImage} />
            </div>
          </>
        )}
        
        {/* Name and Basic Info floating over image */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h2 className="text-3xl font-serif font-bold mb-1 drop-shadow-md">{artist.name}</h2>
          <div className="flex items-center gap-2 text-sm font-medium drop-shadow-md">
            <MapPin size={14} />
            <span>{artist.location}</span>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="p-6 h-1/3 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-3">
            <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-semibold uppercase tracking-wider">
              {artist.style}
            </span>
            <div className="flex items-center gap-1 text-sm font-semibold">
              <Star size={16} className="fill-yellow-400 text-yellow-400" />
              <span>{artist.rating}</span>
              <span className="text-muted-foreground font-normal">({artist.reviews})</span>
            </div>
          </div>
          
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4 leading-relaxed">
            {artist.bio}
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Trial Run</p>
            <p className="font-semibold text-lg">${artist.trialPrice}</p>
          </div>
          <div className="w-px h-8 bg-border"></div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Wedding Day</p>
            <p className="font-semibold text-lg">${artist.weddingPrice}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}