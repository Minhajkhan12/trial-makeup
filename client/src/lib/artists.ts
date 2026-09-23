import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type RecurringPattern = Record<DayKey, boolean>;

export type Artist = {
  id: string;
  name: string;
  diversity: string[];
  location: string;
  city?: string;
  trialPrice: number;
  weddingPrice: number;
  rating: number;
  reviews: number;
  bio: string;
  style?: string;
  images: string[];
  region: string;
  hijabFriendly?: boolean;
  services?: 'makeup' | 'makeup_hair';
  makeupTrialMin?: number;
  makeupTrialMax?: number;
  makeupWeddingMin?: number;
  makeupWeddingMax?: number;
  hairTrialMin?: number;
  hairTrialMax?: number;
  hairWeddingMin?: number;
  hairWeddingMax?: number;
  recurringPattern?: RecurringPattern;
  dateOverrides?: Record<string, 'busy' | 'available'>;
  uid?: string;
};

export const DIVERSITY_OPTIONS = [
  'South Asian',
  'Caucasian',
  'Mixed',
  'Black',
  'East Asian',
] as const;

export type Region = 'all' | 'winnipeg' | 'toronto' | 'waterloo' | 'niagara';

export const REGIONS: { key: Region; label: string; collection: string }[] = [
  { key: 'all',      label: 'All Regions',              collection: '' },
  { key: 'winnipeg', label: 'Greater Winnipeg',          collection: 'artists' },
  { key: 'toronto',  label: 'Greater Toronto Area',      collection: 'Toronto Artists' },
  { key: 'waterloo', label: 'Greater Waterloo Region',   collection: 'Waterloo Artists' },
  { key: 'niagara',  label: 'Niagara Region',            collection: 'Niagara Artists' },
];

export function normalizeCity(city: string): string {
  return city.trim().toLowerCase();
}

export function cityToRegion(normalizedCity: string): string {
  if (
    normalizedCity.includes('winnipeg') ||
    normalizedCity.includes('steinbach') ||
    normalizedCity.includes('portage')
  ) return 'winnipeg';

  if (
    normalizedCity.includes('toronto') ||
    normalizedCity.includes('gta') ||
    normalizedCity.includes('mississauga') ||
    normalizedCity.includes('brampton') ||
    normalizedCity.includes('scarborough') ||
    normalizedCity.includes('etobicoke') ||
    normalizedCity.includes('markham') ||
    normalizedCity.includes('vaughan') ||
    normalizedCity.includes('richmond hill') ||
    normalizedCity.includes('oakville') ||
    normalizedCity.includes('burlington') ||
    normalizedCity.includes('ajax') ||
    normalizedCity.includes('oshawa') ||
    normalizedCity.includes('pickering') ||
    normalizedCity.includes('durham')
  ) return 'toronto';

  if (
    normalizedCity.includes('waterloo') ||
    normalizedCity.includes('kitchener') ||
    normalizedCity.includes('cambridge') ||
    normalizedCity.includes('guelph')
  ) return 'waterloo';

  if (
    normalizedCity.includes('niagara') ||
    normalizedCity.includes('st. catharines') ||
    normalizedCity.includes('st catharines') ||
    normalizedCity.includes('saint catharines') ||
    normalizedCity.includes('welland') ||
    normalizedCity.includes('fort erie') ||
    normalizedCity.includes('grimsby') ||
    normalizedCity.includes('thorold') ||
    normalizedCity.includes('port colborne') ||
    normalizedCity.includes('pelham') ||
    normalizedCity.includes('beamsville')
  ) return 'niagara';

  return 'other';
}

async function fetchFromCollection(collectionName: string, region: string): Promise<Artist[]> {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map(doc => {
      const data = doc.data();
      const derivedRegion = data.city ? cityToRegion(normalizeCity(data.city)) : region;
      return {
        id: doc.id,
        region: derivedRegion,
        ...data,
      };
    }) as Artist[];
  } catch (err) {
    console.warn(`[Firestore] Failed to fetch from "${collectionName}":`, err);
    return [];
  }
}

export async function fetchArtists(): Promise<Artist[]> {
  const [winnipeg, toronto, waterloo, niagara] = await Promise.all([
    fetchFromCollection('artists',          'winnipeg'),
    fetchFromCollection('Toronto Artists',  'toronto'),
    fetchFromCollection('Waterloo Artists', 'waterloo'),
    fetchFromCollection('Niagara Artists',  'niagara'),
  ]);

  const all = [...winnipeg, ...toronto, ...waterloo, ...niagara];
  console.log('[Firestore] total artists loaded:', all.length,
    `(Winnipeg: ${winnipeg.length}, Toronto: ${toronto.length}, Waterloo: ${waterloo.length}, Niagara: ${niagara.length})`);
  return all;
}
