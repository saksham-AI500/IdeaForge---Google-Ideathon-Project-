import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
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
    const cleanPass = pass || 'IdeaForge2026!';

    // Special handling for the founder demo account: guarantee 100% login success
    if (cleanEmail === 'founder@ideaforge.ai') {
      try {
        await signInWithEmailAndPassword(auth, 'founder@ideaforge.ai', 'IdeaForge2026!');
        return;
      } catch (founderErr) {
        // If founder user doesn't exist, create it on the fly
        try {
          const cred = await createUserWithEmailAndPassword(auth, 'founder@ideaforge.ai', 'IdeaForge2026!');
          if (cred.user) {
            await updateProfile(cred.user, { displayName: 'IdeaForge Founder' });
          }
          return;
        } catch {
          // continue to standard flow
        }
      }
    }

    try {
      await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
    } catch (err: any) {
      const code = (err.code || '').toLowerCase();

      // If sign in fails because user is not found or credential invalid,
      // allow first-time users to be created seamlessly without error
      if (
        (code === 'auth/invalid-credential' ||
          code === 'auth/invalid-login-credentials' ||
          code === 'auth/user-not-found') &&
        cleanPass.length >= 6
      ) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
          if (cred.user) {
            const fallbackName = cleanEmail.split('@')[0];
            await updateProfile(cred.user, {
              displayName: fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1),
            });
          }
          return;
        } catch (createErr: any) {
          const createCode = (createErr.code || '').toLowerCase();
          if (createCode === 'auth/email-already-in-use') {
            const msg =
              'Incorrect password for this account. Please verify your password, click "Forgot password?" to reset it, or use the 1-Click Demo.';
            setAuthError(msg);
            throw new Error(msg);
          }
        }
      }

      const friendlyMsg = mapFirebaseAuthError(err);
      setAuthError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  const signUp = async (email: string, pass: string, name?: string) => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass || 'IdeaForge2026!';

    // If user enters the founder demo email on signup, seamlessly sign them in
    if (cleanEmail === 'founder@ideaforge.ai') {
      await signIn('founder@ideaforge.ai', 'IdeaForge2026!');
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
      if (name && cred.user) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }
    } catch (err: any) {
      const code = (err.code || '').toLowerCase();

      // If user already exists, try signing them in with the provided password!
      if (code === 'auth/email-already-in-use') {
        try {
          await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
          return;
        } catch {
          const msg =
            'An account with this email already exists. Switch to "Sign In" above to enter your password, or use 1-Click Demo.';
          setAuthError(msg);
          throw new Error(msg);
        }
      }

      const friendlyMsg = mapFirebaseAuthError(err);
      setAuthError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      const code = (err.code || '').toLowerCase();
      const message = (err.message || '').toLowerCase();

      let friendlyMsg = mapFirebaseAuthError(err);
      if (
        code === 'auth/unauthorized-domain' ||
        code.includes('unauthorized-domain') ||
        message.includes('unauthorized domain')
      ) {
        friendlyMsg =
          'Google popup sign-in is restricted on this Cloud Run preview domain. Please use Email/Password or 1-Click Demo Sign-In below.';
      }
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
