/**
 * Admin Authentication Service (Phase 4).
 *
 * Firebase Email/Password only. No registration, no anonymous login.
 * Client-side UID check is an interface guard only; Firestore Security
 * Rules remain the real authorization layer.
 */
import { getDb, isFirebaseConfigured } from "./firebaseAdapter";

// Admin UID allowlist — MUST match firestore.rules ADMIN_UIDS().
// Firebase UIDs are public identifiers; this is a UI guard, not a secret.
const ADMIN_UIDS = ["ZZ6gcuPsGyRrCIPk1WbeMu0n4lI2"];

export function isAdminUid(uid) {
  return !!uid && ADMIN_UIDS.includes(uid);
}

let _auth = null;
let _authPromise = null;

export async function getAuthInstance() {
  if (!isFirebaseConfigured()) return null;
  if (_auth) return _auth;
  if (_authPromise) return _authPromise;
  _authPromise = (async () => {
    try {
      const { initializeApp, getApps } = await import("firebase/app");
      const { getAuth } = await import("firebase/auth");
      // Reuse the same config as the adapter.
      const cfg = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      };
      const app = getApps().length ? getApps()[0] : initializeApp(cfg);
      _auth = getAuth(app);
      return _auth;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("[authService] init failed:", err?.message);
      _authPromise = null;
      return null;
    }
  })();
  return _authPromise;
}

export async function signInAdmin(email, password) {
  const auth = await getAuthInstance();
  if (!auth) throw new Error("Firebase Auth is not configured.");
  const { signInWithEmailAndPassword } = await import("firebase/auth");
  const cred = await signInWithEmailAndPassword(auth, email, password);
  if (!isAdminUid(cred.user.uid)) {
    // Not an approved admin — sign out immediately.
    const { signOut } = await import("firebase/auth");
    await signOut(auth);
    throw new Error("This account is not an approved admin.");
  }
  return cred.user;
}

export async function signOutAdmin() {
  const auth = await getAuthInstance();
  if (!auth) return;
  const { signOut } = await import("firebase/auth");
  await signOut(auth);
}

export function onAuthChange(callback) {
  let unsubscribe = () => {};
  let hasFired = false;
  const done = (u) => { if (hasFired) return; hasFired = true; callback(u); };
  getAuthInstance()
    .then((auth) => {
      if (!auth) { done(null); return; }
      import("firebase/auth")
        .then(({ onAuthStateChanged }) => {
          unsubscribe = onAuthStateChanged(auth, (user) => {
            hasFired = true;
            if (user && !isAdminUid(user.uid)) {
              import("firebase/auth").then(({ signOut }) => signOut(auth).catch(() => {}));
              callback(null);
            } else {
              callback(user);
            }
          });
        })
        .catch(() => done(null));
    })
    .catch(() => done(null));
  setTimeout(() => { if (!hasFired) { hasFired = true; callback(null); } }, 5000);
  return () => unsubscribe();
}