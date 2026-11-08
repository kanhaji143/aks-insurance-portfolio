/**
 * Firebase Adapter — public, read-only Firestore access.
 *
 * Phase 3 final: SDK is now integrated for PUBLIC reads only.
 *   - Reads VITE_FIREBASE_* from .env.local (never hardcoded).
 *   - Initialises the Firebase app lazily and only when all required
 *     config values are present (so the site keeps working from the
 *     JSON seed when Firebase is not configured).
 *   - Firebase modules are loaded via dynamic import() so the SDK does
 *     not bloat the initial bundle when unused.
 *   - Exposes a Firestore instance (async) for the Content Service Layer.
 *   - NO Auth, NO writes, NO admin operations here (those belong to
 *     Phase 4, separately approved).
 *
 * UI components must never import this module directly — only the
 * content repository (src/services/contentRepository.js) may.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const FIREBASE_PROJECT_ID = firebaseConfig.projectId || "aks-insurance-portfolio";

/**
 * True only when every required public config value is present.
 * When false the site runs entirely from the JSON seed (Phase 2 mode).
 */
export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  );
}

let _dbPromise = null;

/**
 * Returns a Promise resolving to the shared Firestore instance, or null
 * when Firebase is not configured / init failed. Never throws.
 */
export function getDb() {
  if (!isFirebaseConfigured()) return Promise.resolve(null);
  if (_dbPromise) return _dbPromise;
  _dbPromise = (async () => {
    try {
      const { initializeApp, getApps } = await import("firebase/app");
      const { getFirestore } = await import("firebase/firestore");
      const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
      return getFirestore(app, "default");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("[Firebase adapter] init failed, falling back to JSON seed:", err?.message);
      _dbPromise = null;
      return null;
    }
  })();
  return _dbPromise;
}