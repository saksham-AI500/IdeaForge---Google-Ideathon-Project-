import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
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
  mapFirebaseAuthError,
  User,
} from '../services/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authError: string | null;
  clearError: () => void;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const clearError = () => setAuthError(null);

  useEffect(() => {
    // 1. Process pending redirect authentication result (e.g. from signInWithRedirect)
    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          setUser(result.user);
          try {
            const idTokenResult = await result.user.getIdTokenResult();
            setIsAdmin(Boolean(idTokenResult.claims.admin));
          } catch {
            setIsAdmin(false);
          }
        }
      })
      .catch((err) => {
        console.error('Firebase redirect sign-in error:', err);
        const friendlyMsg = mapFirebaseAuthError(err);
        setAuthError(friendlyMsg);
      });

    // 2. Listen to ongoing authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const idTokenResult = await currentUser.getIdTokenResult();
          setIsAdmin(Boolean(idTokenResult.claims.admin));
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, pass: string) => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !pass) {
      const msg = 'Please enter both your email address and password.';
      setAuthError(msg);
      throw new Error(msg);
    }

    try {
      await signInWithEmailAndPassword(auth, cleanEmail, pass);
    } catch (err: any) {
      const friendlyMsg = mapFirebaseAuthError(err);
      setAuthError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  const signUp = async (email: string, pass: string, name?: string) => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !pass) {
      const msg = 'Please enter both your email address and password.';
      setAuthError(msg);
      throw new Error(msg);
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      if (name && cred.user) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }
    } catch (err: any) {
      const friendlyMsg = mapFirebaseAuthError(err);
      setAuthError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      // 1. Attempt standard Google popup sign-in
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      const code = (err.code || '').toLowerCase();

      // Detect popup-related and unsupported flow errors
      const isPopupIssue =
        code === 'auth/popup-blocked' ||
        code === 'auth/cancelled-popup-request' ||
        code === 'auth/operation-not-supported-in-this-environment';

      if (isPopupIssue) {
        // Gracefully fall back to redirect sign-in
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectErr: any) {
          const friendlyMsg = mapFirebaseAuthError(redirectErr);
          setAuthError(friendlyMsg);
          throw new Error(friendlyMsg);
        }
      }

      // Do NOT blindly fallback on configuration, domain, or credential errors
      const friendlyMsg = mapFirebaseAuthError(err);
      setAuthError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  const signOut = async () => {
    setAuthError(null);
    try {
      await fbSignOut(auth);
    } catch (err: any) {
      const friendlyMsg = mapFirebaseAuthError(err);
      setAuthError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  const resetPassword = async (email: string) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: any) {
      const friendlyMsg = mapFirebaseAuthError(err);
      setAuthError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        clearError,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPassword,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
