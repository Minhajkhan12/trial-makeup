import { collection, getDocs } from 'firebase/firestore';
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
  const snapshot = await getDocs(collection(db, 'artists'));
  console.log('[Firestore] snapshot.size:', snapshot.size);
  console.log('[Firestore] empty:', snapshot.empty);
  snapshot.forEach(doc => console.log('[Firestore] doc:', doc.id, doc.data()));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Artist[];
}
