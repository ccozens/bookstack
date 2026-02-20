# 📚 Bookshelf

A personal book library tracker built with SvelteKit, TypeScript, Firebase, and Tailwind CSS.

Scan or type an ISBN, look up the book via Google Books, review and save. Browse your library grouped by author (surname-first), with series ordered by number.

---

## Features

- ISBN barcode scanning via device camera (ZXing)
- Manual ISBN entry fallback
- Google Books API lookup → editable form before saving
- Books grouped by author (Surname, Forename order)
- Series grouped and ordered by series number
- Google Auth — your email only can make changes; guests can browse read-only
- Mobile-first responsive design

---

## Setup

### 1. Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project
2. Enable **Firestore Database** (start in production mode)
3. Enable **Authentication** → Sign-in method → **Google**
4. Register a **Web app** and copy the config values

### 2. Firestore security rules

In the Firebase Console → Firestore → Rules, paste the contents of `firestore.rules` and **replace `you@gmail.com` with your actual email address**.

### 3. Google Books API key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project (can be the same as Firebase)
3. Enable the **Books API**
4. Create an API key under APIs & Services → Credentials
5. Optionally restrict the key to the Books API and your domain

### 4. Environment variables

Copy `.env.example` to `.env` and fill in your values:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_GOOGLE_BOOKS_API_KEY=...
VITE_WHITELISTED_EMAIL=you@gmail.com
```

### 5. Install and run locally

```bash
npm install
npm run dev
```

---

## Deployment to Firebase Hosting

```bash
# Install Firebase CLI if you haven't already
npm install -g firebase-tools

# Log in
firebase login

# Set your project
firebase use your-project-id

# Build the app
npm run build

# Deploy
firebase deploy --only hosting
```

For Firestore rules:
```bash
firebase deploy --only firestore:rules
```

---

## Project structure

```
src/
  lib/
    firebase.ts              # Firebase app initialisation
    types.ts                 # Shared TypeScript types
    services/
      googleBooks.ts         # Google Books API calls
      scanner.ts             # ZXing barcode scanning (extend here for photo scanning)
      firestore.ts           # Firestore CRUD operations
    stores/
      auth.ts                # Auth state and sign in/out helpers
      books.ts               # Books store + groupedBooks derived store
    utils/
      authorSort.ts          # Author name normalisation and sort comparator
    components/
      AuthButton.svelte      # Sign in / sign out button
      AuthorGroup.svelte     # Collapsible author section with series subgroups
      BookCard.svelte        # Individual book row
      BookForm.svelte        # Add / edit form
      Modal.svelte           # Bottom-sheet modal (mobile) / centred (desktop)
      Scanner.svelte         # Camera viewfinder + manual ISBN input
  routes/
    +layout.svelte           # App shell — header, footer
    +page.svelte             # Main library page
```

---

## Adding photo scanning later

All barcode and image scanning logic is isolated in `src/lib/services/scanner.ts`.  
To add cover photo scanning, add a new exported function there (e.g. `scanFromImageFile(file: File)`).  
No other files need to change.
