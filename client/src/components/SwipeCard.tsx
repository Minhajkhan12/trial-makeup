import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { MapPin, Star, ChevronUp, UserCircle } from 'lucide-react';
import { Artist } from '../data/artists';

interface SwipeCardProps {
  artist: Artist;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  active: boolean;
  onViewDiversity: (artist: Artist) => void;
  onViewProfile: (artist: Artist) => void;
}

export function SwipeCard({ artist, onSwipeLeft, onSwipeRight, active, onViewDiversity, onViewProfile }: SwipeCardProps) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  
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
      className="absolute inset-0 w-full h-full rounded-2xl bg-white shadow-xl overflow-hidden cursor-grab active:cursor-grabbing border border-border flex flex-col"
    >
      <motion.div 
        style={{ opacity: likeOpacity }} 
        className="absolute top-10 left-8 z-20 border-4 border-[#B5706A] rounded-lg px-4 py-2 rotate-[-15deg]"
      >
        <span className="text-[#B5706A] font-bold text-3xl tracking-widest uppercase">Save</span>
      </motion.div>
      
      <motion.div 
        style={{ opacity: nopeOpacity }} 
        className="absolute top-10 right-8 z-20 border-4 border-gray-400 rounded-lg px-4 py-2 rotate-[15deg]"
      >
        <span className="text-gray-400 font-bold text-3xl tracking-widest uppercase">Pass</span>
      </motion.div>

      <div className="relative flex-1 w-full bg-gray-100">
        <img 
          src={artist.profileImageUrl} 
          alt={`${artist.name} portfolio`}
          className="w-full h-full object-cover pointer-events-none"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white pointer-events-none">
          <div className="flex items-center gap-1 text-sm font-medium mb-1 drop-shadow">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            <span>{artist.rating}</span>
            <span className="text-white/80 font-normal">({artist.reviewCount} reviews)</span>
          </div>
          
          <h2 className="text-4xl font-serif font-semibold mb-1 drop-shadow-md">{artist.name}</h2>
          
          <div className="flex items-center gap-2 text-sm font-medium mb-3 text-white/90 drop-shadow">
            <MapPin size={14} />
            <span>{artist.city}</span>
          </div>
          
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-white/30">
            {artist.style}
          </span>

          <div className="flex gap-3 mt-2">
            <div className="flex-1 bg-black/40 backdrop-blur-md rounded-xl p-3 border border-white/20">
              <p className="text-[10px] text-white/70 uppercase tracking-widest mb-1">Trial</p>
              <p className="font-semibold text-lg">${artist.trialPrice}</p>
            </div>
            <div className="flex-1 bg-[#B5706A]/80 backdrop-blur-md rounded-xl p-3 border border-[#B5706A]">
              <p className="text-[10px] text-white/80 uppercase tracking-widest mb-1">Wedding</p>
              <p className="font-semibold text-lg">${artist.weddingPrice}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex border-t border-border shrink-0 z-10 bg-white">
        <button 
          onClick={(e) => { e.stopPropagation(); onViewDiversity(artist); }}
          className="flex-1 py-4 flex flex-col items-center justify-center gap-1 border-r border-border hover:bg-gray-50 transition-colors"
        >
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">View</span>
          <span className="text-sm font-medium text-foreground">Diversity</span>
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onViewProfile(artist); }}
          className="flex-1 py-4 flex flex-col items-center justify-center gap-1 hover:bg-gray-50 transition-colors"
        >
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">View</span>
          <span className="text-sm font-medium text-foreground">Profile</span>
        </button>
      </div>
    </motion.div>
  );
}