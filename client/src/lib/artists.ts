import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyCGZCdgcp1TP8uBa7o3_Y94MW-rWRdxYWs',
  authDomain: 'beautybooked-9b462.firebaseapp.com',
  projectId: 'beautybooked-9b462',
  storageBucket: 'beautybooked-9b462.firebasestorage.app',
  messagingSenderId: '112004751089',
  appId: '1:112004751089:web:021e0ae3a075a979c61350'
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

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

export async function fetchArtists() {
  const snapshot = await getDocs(collection(db, 'artists'));
  console.log('Direct test - size:', snapshot.size);
  snapshot.forEach(doc => console.log(doc.id, doc.data()));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Artist[];
}
