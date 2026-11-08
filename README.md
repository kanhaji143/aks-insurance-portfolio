# Amit Kumar Shukla — Insurance Portfolio Website

A bilingual (English / Hindi) insurance portfolio website with a Firebase-backed
Admin Panel. The public site displays only owner-verified and published content
from Firestore; the Admin Panel is protected by Firebase Authentication and
Firestore Security Rules.

## Tech Stack

- **Frontend:** React 19 + Vite 7
- **Styling:** Tailwind CSS 4 (via `@tailwindcss/vite`)
- **Hosting:** Firebase Hosting (Spark plan)
- **Database:** Cloud Firestore (named database `default`)
- **Authentication:** Firebase Authentication (email/password, admin only)
- **Security:** Firestore Security Rules + Firestore composite indexes

## Features

### Public website (bilingual EN/HI)

- Hero, Experience & Service Area, Individual & Family, Corporate
- Insurance Categories
- Insurance Companies
- Insurance Plans
- Official Calculator Links
- Knowledge Centre (YouTube videos)
- FAQs and Contact / Enquiry
- English/Hindi language toggle with English fallback for missing Hindi content
- Loading, Empty and Error states for Firestore-backed sections
- Responsive mobile and desktop layout

### Admin Panel (`/admin`)

- Admin login (Firebase Authentication, approved admin UID only)
- Dashboard with content counts
- Companies — Create / Read / Update / Delete, publish & verify toggles
- Insurance Plans — Create / Read / Update / Delete, publish & verify toggles
- Calculator Links — Create / Read / Update / Delete
- YouTube Videos — Create / Read / Update / Delete
- Bilingual English/Hindi fields for Companies and Insurance Plans
- Modal error handling, confirmations and success feedback

### Content visibility

Only records with **both** `isPublished == true` **and** `isVerified == true`
are shown publicly. Calculator links and videos use the same rule. Firestore
Security Rules enforce the same restriction on the database side.

## Project Structure

- `src/components/layout/` — Header, Footer, Container
- `src/components/sections/` — public page sections
- `src/components/ui/` — shared public UI helpers
- `src/admin/` — Admin Panel (Dashboard, Companies, Plans, Calculators, Videos)
- `src/services/` — data and auth layer
  - `firebaseAdapter.js` — Firebase app / Firestore initialisation
  - `contentRepository.js` — public read repository (published + verified)
  - `adminRepository.js` — admin CRUD repository
  - `authService.js` — admin authentication and UID guard
  - `validation.js` — shared validation and error-message helpers
- `src/content/` — English/Hindi copy, site settings and local demo seed data
- `public/` — logo SVG, advisor photo placeholder, robots.txt
- `firestore.rules` — Firestore Security Rules (source-controlled)
- `firestore.indexes.json` — Firestore composite index declarations

## Firebase Setup

Public Firebase web configuration is read from environment variables at build
time. Use `.env.local` (git-ignored) with the values shown in `.env.example`:

```bash
VITE_FIREBASE_API_KEY=<your-web-api-key>
VITE_FIREBASE_AUTH_DOMAIN=<project-id>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<project-id>
VITE_FIREBASE_STORAGE_BUCKET=<project-id>.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=<sender-id>
VITE_FIREBASE_APP_ID=<app-id>
```

Firestore collections used:

- `companies`
- `insurancePlans`
- `calculatorLinks`
- `videos`
- `siteSettings`
- `admins` (internal only)

## Development

```bash
npm install
npm run dev        # local Vite dev server
npm run build      # production build -> dist/
npm run preview    # preview the production build locally
```

## Deployment

The production build is generated in `dist/` and deployed to Firebase Hosting:

```bash
npm run build
firebase deploy --only hosting --project aks-insurance-portfolio
```

## Data Rules

- Regulatory designations and insurer tie-ups are not published until verified.
- Public content is read-only and must be both published and verified.
- Calculator links and videos are shown only after verification.
- The advisor photo is a placeholder until an approved image is supplied.
- Contact details are placeholders until the owner verifies them.
