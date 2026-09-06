import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'ideaforge-a62ba';
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCXGqh_22NLJEpTsETBYztK5Wq65Ag7XgA',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
  projectId: projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
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
      return 'No account found with this email. Switch to "Create Account" above to register.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please verify your credentials or reset your password.';
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'Incorrect email or password. Please verify your credentials or switch to "Create Account".';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in with your password.';
    case 'auth/credential-already-in-use':
      return 'This credential is already linked to an existing account.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using a different sign-in method.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters long.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was canceled before completing.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the sign-in window. Continuing with secure redirect sign-in...';
    case 'auth/unauthorized-domain': {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
      return `Domain unauthorized: "${currentHost}" is not in Firebase Authorized Domains. Add this domain in Firebase Console (Authentication > Settings > Authorized domains). On localhost, Google Sign-In is already authorized.`;
    }
    case 'auth/cancelled-popup-request':
      return 'Sign-in attempt was interrupted. Please retry.';
    case 'auth/network-request-failed':
      return 'Network connection issue. Please check your internet connection and retry.';
    case 'auth/too-many-requests':
      return 'Too many attempts. For security, please wait a moment before retrying.';
    case 'auth/operation-not-allowed':
      return 'Google Sign-In is currently unavailable. Please use email and password.';
    case 'auth/requires-recent-login':
      return 'Please sign in again before updating sensitive account settings.';
    case 'auth/internal-error':
      return 'Authentication service encountered a transient issue. Please retry.';
    default:
      if (code.includes('unauthorized-domain') || message.includes('unauthorized domain')) {
        const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
        return `Domain unauthorized: "${currentHost}" is not in Firebase Authorized Domains. Add this domain in Firebase Console (Authentication > Settings > Authorized domains). On localhost, Google Sign-In is already authorized.`;
      }
      if (code.includes('api-key') || message.includes('api-key') || message.includes('api key')) {
        return 'Firebase API key configuration issue. Please verify project credentials.';
      }
      return 'Unable to authenticate. Please check your credentials and try again.';
  }
}

export {
  app,
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  fbSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
};
export type { User };
