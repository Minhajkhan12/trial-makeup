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
  const artistsRef = collection(db, 'artists');
  const snapshot = await getDocs(artistsRef);

  console.log('[Firestore] snapshot.size:', snapshot.size);
  console.log('[Firestore] empty:', snapshot.empty);

  snapshot.docs.forEach((doc, i) => {
    console.log(`[Firestore] doc[${i}] id:`, doc.id);
    console.log(`[Firestore] doc[${i}] data:`, JSON.stringify(doc.data()));
  });

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
