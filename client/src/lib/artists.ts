import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export type Artist = {
  id: string;
  name: string;
  diversity: string[];
  location: string;
  trialPrice: number;
  weddingPrice: number;
  rating: number;
  reviews: number;
  bio: string;
  images: string[];
  region: string;
  hijabFriendly?: boolean;
};

export const DIVERSITY_OPTIONS = [
  'South Asian',
  'Caucasian',
  'Mixed',
  'Black',
  'East Asian',
] as const;

export type Region = 'all' | 'winnipeg' | 'toronto' | 'waterloo';

export const REGIONS: { key: Region; label: string; collection: string }[] = [
  { key: 'all',      label: 'All Regions',              collection: '' },
  { key: 'winnipeg', label: 'Greater Winnipeg',          collection: 'artists' },
  { key: 'toronto',  label: 'Greater Toronto Area',      collection: 'Toronto Artists' },
  { key: 'waterloo', label: 'Greater Waterloo Region',   collection: 'Waterloo Artists' },
];

async function fetchFromCollection(collectionName: string, region: string): Promise<Artist[]> {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      region,
      ...doc.data(),
    })) as Artist[];
  } catch (err) {
    console.warn(`[Firestore] Failed to fetch from "${collectionName}":`, err);
    return [];
  }
}

export async function fetchArtists(): Promise<Artist[]> {
  const [winnipeg, toronto, waterloo] = await Promise.all([
    fetchFromCollection('artists',          'winnipeg'),
    fetchFromCollection('Toronto Artists',  'toronto'),
    fetchFromCollection('Waterloo Artists', 'waterloo'),
  ]);

  const all = [...winnipeg, ...toronto, ...waterloo];
  console.log('[Firestore] total artists loaded:', all.length,
    `(Winnipeg: ${winnipeg.length}, Toronto: ${toronto.length}, Waterloo: ${waterloo.length})`);
  return all;
}
