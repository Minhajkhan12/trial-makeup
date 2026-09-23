# Trial Makeup

A Tinder-style swipeable web app for finding bridal makeup artists. Built with React, Firebase (Firestore + Storage), and Express.

## Architecture

- **Frontend**: React + Vite + Tailwind CSS + Framer Motion
- **Backend**: Express server (serves static files in production, Vite dev server in development)
- **Database**: Firebase Firestore (collection: `artists`)
- **Storage**: Firebase Storage (folder: `artists/`)
- **Routing**: Wouter (client-side)
- **Styling**: Tailwind CSS v4 with custom theme (Playfair Display + Lato fonts)

## Key Pages

- `/` — Main swipe interface where users browse makeup artists
- `/admin` — Password-protected admin panel to add/delete artists

## Data Model (Firestore `artists` collection)

Each document has: `name`, `style`, `location`, `trialPrice`, `weddingPrice`, `rating`, `reviews`, `bio`, `images` (array of Storage URLs)

## Key Files

- `client/src/lib/firebase.ts` — Firebase initialization
- `client/src/lib/artists.ts` — Firestore artist fetching
- `client/src/components/SwipeCard.tsx` — Swipeable card component
- `client/src/pages/Home.tsx` — Main swipe page
- `client/src/pages/Admin.tsx` — Admin login + artist upload form
- `server/static.ts` — Production static file serving with SPA fallback

## Environment Variables (all VITE_ prefixed, baked in at build time)

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_ADMIN_PASSWORD`

## Deployment

- Target: Autoscale
- Build: `npm run build`
- Run: `npm run start`
- Custom domain: trialmakeup.com
