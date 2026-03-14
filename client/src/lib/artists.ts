import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export type Artist = {
  id: string;
  name: string;
  style: string;
  location: string;
  trialPrice: number;
  weddingPrice: number;
  rating: number;
  reviews: number;
  bio: string;
  images: string[];
};

export async function fetchArtists(): Promise<Artist[]> {
  const artistsRef = collection(db, 'artists');
  const q = query(artistsRef, orderBy('name'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name ?? '',
    style: doc.data().style ?? '',
    location: doc.data().location ?? '',
    trialPrice: doc.data().trialPrice ?? 0,
    weddingPrice: doc.data().weddingPrice ?? 0,
    rating: doc.data().rating ?? 0,
    reviews: doc.data().reviews ?? 0,
    bio: doc.data().bio ?? '',
    images: doc.data().images ?? [],
  }));
}