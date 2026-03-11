import artist1_1 from '../assets/images/artist1-1.png';
import artist1_2 from '../assets/images/artist1-2.png';
import artist2_1 from '../assets/images/artist2-1.png';
import artist3_1 from '../assets/images/artist3-1.png';

export type Artist = {
  id: string;
  name: string;
  city: 'Toronto' | 'Waterloo' | string;
  style: string;
  trialPrice: number;
  weddingPrice: number;
  rating: number;
  reviewCount: number;
  skinTones: number[]; // 1-6 Fitzpatrick scale
  hairTypes: string[];
  diversityNote: string;
  profileImageUrl: string;
  active: boolean;
  images: { url: string; caption: string }[];
  bio: string;
};

export const artists: Artist[] = [
  {
    id: '1',
    name: 'Elena Rossi',
    city: 'Toronto',
    style: 'Soft Glam',
    trialPrice: 200,
    weddingPrice: 400,
    rating: 4.9,
    reviewCount: 128,
    skinTones: [1, 2, 3, 4],
    hairTypes: ['Fine', 'Wavy', 'Thick'],
    diversityNote: 'I specialize in enhancing natural features and work with a variety of light to medium skin tones. Currently expanding my kit for deeper tones.',
    profileImageUrl: artist1_1,
    active: true,
    bio: 'Specializing in soft glam that enhances your natural beauty. I believe every bride should look like the best version of themselves on their big day.',
    images: [
      { url: artist1_1, caption: 'Bridal Portrait' },
      { url: artist1_2, caption: 'Reception Look' }
    ]
  },
  {
    id: '2',
    name: 'Sarah Jenkins',
    city: 'Waterloo',
    style: 'Full Glam',
    trialPrice: 250,
    weddingPrice: 450,
    rating: 4.8,
    reviewCount: 94,
    skinTones: [3, 4, 5, 6],
    hairTypes: ['Coily', 'Thick', 'Textured'],
    diversityNote: 'Extensive experience with melanin-rich skin and textured hair. My kit is fully stocked for all skin depths.',
    profileImageUrl: artist2_1,
    active: true,
    bio: 'For the bride who wants to make a statement. Bold lashes, flawless contour, and makeup that lasts through tears and dancing.',
    images: [
      { url: artist2_1, caption: 'Full Glam Bride' }
    ]
  },
  {
    id: '3',
    name: 'Mia Chen',
    city: 'Toronto',
    style: 'Ultra Natural',
    trialPrice: 150,
    weddingPrice: 300,
    rating: 5.0,
    reviewCount: 215,
    skinTones: [1, 2, 3, 4, 5, 6],
    hairTypes: ['Fine', 'Straight', 'Wavy', 'Thick', 'Coily'],
    diversityNote: 'Inclusive beauty for everyone. My approach is skin-first, ensuring a perfect match and radiant finish for any complexion.',
    profileImageUrl: artist3_1,
    active: true,
    bio: 'Skin-first approach to bridal beauty. I focus on glowing, hydrated skin and minimal makeup that lets your true self shine through.',
    images: [
      { url: artist3_1, caption: 'Fresh Face' }
    ]
  }
];