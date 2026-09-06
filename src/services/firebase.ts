import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  User,
  Auth,
} from 'firebase/auth';

/**
 * Firebase Client Configuration
 * Prioritizes environment variables; provides safe default project fallback.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCXGqh_22NLJEpTsETBYztK5Wq65Ag7XgA',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'saksham-genai-academy-track-3.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'saksham-genai-academy-track-3',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'saksham-genai-academy-track-3.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '121971590014',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:121971590014:web:35a8ef3df2b5c4ad6d292f',
};

// Singleton Firebase App and Auth instances
let app: FirebaseApp;
let auth: Auth;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (err) {
  console.warn('Firebase initialization note:', err);
  // Re-attempt with default getApp if already initialized
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Translates raw Firebase error codes into clear, calm, user-friendly messages.
 * Never exposes raw internal error strings to the user.
 */
export function mapFirebaseAuthError(error: any): string {
  if (!error) return 'An unexpected error occurred. Please try again.';

  const code = (error.code || '').toLowerCase();
  const message = (error.message || '').toLowerCase();

  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/missing-email':
      return 'Please enter your email address.';
    case 'auth/missing-password':
      return 'Please enter your password.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact IdeaForge support.';
    case 'auth/user-not-found':
      return 'No account found with this email. Switch to "Create Account" above to register, or use 1-Click Demo.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please verify your credentials, reset your password, or use 1-Click Demo.';
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'Incorrect email or password. If you do not have an account yet, switch to "Create Account", or use 1-Click Demo.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in with your password, or use 1-Click Demo.';
    case 'auth/credential-already-in-use':
      return 'This credential is already linked to an existing account.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using a different sign-in method.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters long.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was canceled before completing.';
    case 'auth/popup-blocked':
      return 'The Google sign-in popup was blocked by your browser or iframe security. Please allow popups or use Email/1-Click Demo below.';
    case 'auth/unauthorized-domain':
      return 'Google popup sign-in is restricted on this Cloud Run preview domain. Please use Email/Password or 1-Click Demo Sign-In below.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in attempt was interrupted. Please retry.';
    case 'auth/network-request-failed':
      return 'Network connection issue. Please check your internet connection and retry.';
    case 'auth/too-many-requests':
      return 'Too many attempts. For security, please wait a moment or use 1-Click Demo.';
    case 'auth/operation-not-allowed':
      return 'This authentication method is currently not enabled in Firebase configuration.';
    case 'auth/requires-recent-login':
      return 'Please sign in again before updating sensitive account settings.';
    case 'auth/internal-error':
      return 'Authentication service encountered a transient issue. Please retry or use 1-Click Demo.';
    default:
      if (code.includes('unauthorized-domain') || message.includes('unauthorized domain')) {
        return 'Google popup sign-in is restricted on this Cloud Run preview domain. Please use Email/Password or 1-Click Demo Sign-In below.';
      }
      if (code.includes('api-key') || message.includes('api-key') || message.includes('api key')) {
        return 'Firebase API key configuration issue. Reconnecting to project...';
      }
      return 'Unable to authenticate. Please check your credentials or click "1-Click Instant Demo" below to enter immediately.';
  }
}

export {
  app,
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  fbSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
};
export type { User };
