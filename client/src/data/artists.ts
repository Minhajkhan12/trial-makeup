import artist1_1 from '../assets/images/artist1-1.png';
import artist1_2 from '../assets/images/artist1-2.png';
import artist2_1 from '../assets/images/artist2-1.png';
import artist3_1 from '../assets/images/artist3-1.png';

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

export const artists: Artist[] = [
  {
    id: '1',
    name: 'Elena Rossi',
    style: 'Soft Glam & Natural',
    location: 'New York, NY',
    trialPrice: 150,
    weddingPrice: 350,
    rating: 4.9,
    reviews: 128,
    bio: 'Specializing in soft glam that enhances your natural beauty. I believe every bride should look like the best version of themselves on their big day.',
    images: [artist1_1, artist1_2],
  },
  {
    id: '2',
    name: 'Sarah Jenkins',
    style: 'Full Glam & Editorial',
    location: 'Brooklyn, NY',
    trialPrice: 200,
    weddingPrice: 450,
    rating: 4.8,
    reviews: 94,
    bio: 'For the bride who wants to make a statement. Bold lashes, flawless contour, and makeup that lasts through tears and dancing.',
    images: [artist2_1],
  },
  {
    id: '3',
    name: 'Mia Chen',
    style: 'Ultra Natural & Fresh',
    location: 'Queens, NY',
    trialPrice: 120,
    weddingPrice: 280,
    rating: 5.0,
    reviews: 215,
    bio: 'Skin-first approach to bridal beauty. I focus on glowing, hydrated skin and minimal makeup that lets your true self shine through.',
    images: [artist3_1],
  },
];