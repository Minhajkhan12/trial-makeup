import React, { useState } from 'react';
import { Heart, MapPin, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { artists } from '../data/artists';

export default function Saved() {
  // In a real app, we'd fetch the saved IDs from context or backend
  // For the mockup, let's just show all artists as "saved" for demonstration
  // or use local storage. Since we just have state in Home, we'll pretend all are saved here.
  const savedArtists = artists; 

  return (
    <div className="min-h-screen bg-background flex flex-col w-full relative">
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <Link href="/">
          <button className="p-2 -ml-2 text-foreground hover:text-primary transition-colors">
            <ArrowLeft size={24} />
          </button>
        </Link>
        <h1 className="text-xl font-serif font-bold tracking-wider text-foreground">SAVED ARTISTS</h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto p-4 md:p-8">
        <div className="space-y-4">
          {savedArtists.map(artist => (
            <div key={artist.id} className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm border border-border hover:shadow-md transition-shadow cursor-pointer">
              <img 
                src={artist.profileImageUrl} 
                alt={artist.name} 
                className="w-24 h-24 rounded-xl object-cover"
              />
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-serif font-bold text-lg">{artist.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin size={14} /> {artist.city}
                    </div>
                  </div>
                  <button className="text-primary p-2">
                    <Heart size={20} className="fill-primary" />
                  </button>
                </div>
                <div className="flex gap-2 mt-2">
                  <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full text-xs font-medium">
                    {artist.style}
                  </span>
                </div>
                <div className="flex gap-4 mt-3 text-sm">
                  <p><span className="text-muted-foreground">Trial:</span> ${artist.trialPrice}</p>
                  <p><span className="text-primary font-medium">Wedding:</span> ${artist.weddingPrice}</p>
                </div>
              </div>
            </div>
          ))}

          {savedArtists.length === 0 && (
            <div className="text-center py-20">
              <Heart size={48} className="mx-auto text-muted-foreground mb-4 opacity-20" />
              <p className="text-lg text-muted-foreground">No saved artists yet.</p>
              <Link href="/">
                <button className="mt-4 text-primary font-medium hover:underline">
                  Start Swiping
                </button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}