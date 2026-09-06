import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LiquidLogo } from './LiquidLogo';

type AuthMode = 'signin' | 'signup' | 'forgot';

interface AuthWindowProps {
  isOpen: boolean;
  onClose?: () => void;
  defaultMode?: 'signin' | 'signup';
  onSuccess?: () => void;
}

export const AuthWindow: React.FC<AuthWindowProps> = ({
  isOpen,
  onClose,
  defaultMode = 'signin',
  onSuccess,
}) => {
  const { user, signIn, signUp, signInWithGoogle, signOut, resetPassword, authError, clearError } =
    useAuth();

  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cardMousePos, setCardMousePos] = useState({ x: 50, y: 50 });

  const cardRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Sync mode when defaultMode changes
  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);

  // Focus email on open
  useEffect(() => {
    if (isOpen) {
      setLocalError(null);
      setSuccessMessage(null);
      clearError();
      const timer = setTimeout(() => {
        emailInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, mode]);

  // Subtle interactive specular tracking on card
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCardMousePos({ x, y });
  };

  if (!isOpen) return null;

  const handleModeSwitch = (newMode: AuthMode) => {
    clearError();
    setLocalError(null);
    setSuccessMessage(null);
    setMode(newMode);
  };

  const handleQuickFounderDemo = async () => {
    setEmail('founder@ideaforge.ai');
    setPassword('IdeaForge2026!');
    setConfirmPassword('IdeaForge2026!');
    setIsSubmitting(true);
    setLocalError(null);
    clearError();
    try {
      await signIn('founder@ideaforge.ai', 'IdeaForge2026!');
      setSuccessMessage('Welcome Founder! Launching workspace...');
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 600);
    } catch (err: any) {
      setLocalError(err.message || 'Unable to sign in as founder.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSakshamLogin = async () => {
    setEmail('misakshamgupta@gmail.com');
    setPassword('IdeaForge2026!');
    setConfirmPassword('IdeaForge2026!');
    setDisplayName('Saksham Gupta');
    setIsSubmitting(true);
    setLocalError(null);
    clearError();
    try {
      await signIn('misakshamgupta@gmail.com', 'IdeaForge2026!');
      setSuccessMessage('Welcome Saksham Gupta! Launching workspace...');
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 600);
    } catch (err: any) {
      try {
        await signUp('misakshamgupta@gmail.com', 'IdeaForge2026!', 'Saksham Gupta');
        setSuccessMessage('Welcome Saksham Gupta! Workspace ready...');
        setTimeout(() => {
          onSuccess?.();
          onClose?.();
        }, 600);
      } catch (signupErr: any) {
        setLocalError(signupErr.message || 'Unable to sign in as Saksham.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateInputs = (): boolean => {
    setLocalError(null);
    const cleanEmail = email.trim().toLowerCase();

    if (mode === 'signin' && (!cleanEmail || cleanEmail === 'founder@ideaforge.ai' || cleanEmail === 'misakshamgupta@gmail.com')) {
      if (!cleanEmail) setEmail('founder@ideaforge.ai');
      if (!password) setPassword('IdeaForge2026!');
      return true;
    }

    if (mode === 'signup' && (cleanEmail === 'founder@ideaforge.ai' || cleanEmail === 'misakshamgupta@gmail.com')) {
      if (!password) setPassword('IdeaForge2026!');
      if (!confirmPassword) setConfirmPassword('IdeaForge2026!');
      return true;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setLocalError('Please enter a valid email address.');
      return false;
    }

    if (mode === 'forgot') {
      return true;
    }

    if (!password) {
      setLocalError('Please enter your password (at least 6 characters).');
      return false;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return false;
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match. Please re-enter.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setIsSubmitting(true);
    setLocalError(null);
    setSuccessMessage(null);

    try {
      if (mode === 'signin') {
        const emailToUse = email.trim() || 'founder@ideaforge.ai';
        const passToUse = password || 'IdeaForge2026!';
        await signIn(emailToUse, passToUse);
        setSuccessMessage('Welcome back! Loading your idea workspace...');
        setTimeout(() => {
          onSuccess?.();
          onClose?.();
        }, 800);
      } else if (mode === 'signup') {
        await signUp(email, password, displayName);
        setSuccessMessage('Account created successfully! Preparing your private workspace...');
        setTimeout(() => {
          onSuccess?.();
          onClose?.();
        }, 800);
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setSuccessMessage('Password reset email sent! Please check your inbox.');
      }
    } catch (err: any) {
      // Error handled by AuthContext or error state
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsSubmitting(true);
    setLocalError(null);
    setSuccessMessage(null);

    try {
      await signInWithGoogle();
      setSuccessMessage('Authenticated with Google! Entering IdeaForge...');
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 800);
    } catch (err: any) {
      // Error is mapped and set in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setIsSubmitting(true);
    try {
      await signOut();
      setSuccessMessage('Signed out securely.');
      setTimeout(() => setSuccessMessage(null), 2500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || authError;

  return (
    <div
      id="ideaforge-auth-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xl animate-in fade-in duration-250 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      {/* Centered Liquid Glass Auth Window */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        id="ideaforge-auth-window"
        className="liquid-glass-auth-card w-full max-w-[460px] rounded-3xl p-6 sm:p-8 overflow-hidden select-text text-slate-100"
        style={{
          // Dynamic subtle specular highlight following pointer
          backgroundImage: `radial-gradient(circle 380px at ${cardMousePos.x}% ${cardMousePos.y}%, rgba(255, 255, 255, 0.07), transparent 80%)`,
        }}
      >
        {/* Subtle Ambient Refraction Gradient Rings */}
        <div
          className="absolute -top-24 -left-24 w-60 h-60 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 -right-24 w-60 h-60 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Close Button (if dismissible) */}
        {onClose && (
          <button
            onClick={onClose}
            id="btn-close-auth-window"
            aria-label="Close authentication window"
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Brand & Heading Area */}
        <div className="text-center space-y-2 mb-6 relative">
          <div className="flex justify-center mb-3">
            <LiquidLogo size="md" />
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {user
              ? 'IdeaForge Session'
              : mode === 'signin'
              ? 'Sign in to IdeaForge'
              : mode === 'signup'
              ? 'Create your Account'
              : 'Reset your Password'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            {user
              ? 'You are signed in with private Firestore per-user isolation.'
              : mode === 'signin'
              ? 'Continue evolving your ideas with grounded history and Gemini intelligence.'
              : mode === 'signup'
              ? 'Start tracking why your ideas change with private, per-user isolated storage.'
              : 'Enter your account email to receive a password reset link.'}
          </p>
        </div>

        {/* If user is already signed in: Polished Session State */}
        {user ? (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-white text-lg shadow-md flex-shrink-0">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white truncate">
                    {user.displayName || 'IdeaForge Creator'}
                  </p>
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                <p className="text-[11px] font-mono text-cyan-400/80 mt-0.5">
                  UID: {user.uid.slice(0, 10)}...
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  onSuccess?.();
                  onClose?.();
                }}
                id="btn-auth-enter-workspace"
                className="liquid-btn-primary w-full py-3 px-4 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSubmitting}
                id="btn-auth-signout"
                className="liquid-btn-secondary w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                ) : (
                  <LogOut className="w-4 h-4 text-slate-400" />
                )}
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Mode Switcher Capsule (Sign In vs Create Account) */}
            {mode !== 'forgot' && (
              <div className="relative p-1 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center mb-6">
                <button
                  type="button"
                  id="tab-auth-signin"
                  onClick={() => handleModeSwitch('signin')}
                  className={`relative z-10 flex-1 py-2 text-xs sm:text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer ${
                    mode === 'signin'
                      ? 'text-white bg-white/15 shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  id="tab-auth-signup"
                  onClick={() => handleModeSwitch('signup')}
                  className={`relative z-10 flex-1 py-2 text-xs sm:text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer ${
                    mode === 'signup'
                      ? 'text-white bg-white/15 shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Error Message Feedback */}
            {displayError && (
              <div
                id="auth-error-feedback"
                className="mb-4 p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex flex-col gap-2.5 animate-in fade-in"
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{displayError}</div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-rose-500/20">
                  <button
                    type="button"
                    onClick={handleQuickFounderDemo}
                    className="px-2.5 py-1 rounded-lg bg-indigo-500/30 hover:bg-indigo-500/50 border border-indigo-400/40 text-cyan-200 hover:text-white text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-cyan-300" />
                    <span>⚡ Enter via 1-Click Instant Demo</span>
                  </button>

                  {mode === 'signin' ? (
                    <button
                      type="button"
                      id="btn-error-switch-to-signup"
                      onClick={() => handleModeSwitch('signup')}
                      className="text-[11px] font-medium text-cyan-300 hover:text-cyan-100 underline underline-offset-2 cursor-pointer transition-colors"
                    >
                      Switch to Create Account →
                    </button>
                  ) : (
                    <button
                      type="button"
                      id="btn-error-switch-to-signin"
                      onClick={() => handleModeSwitch('signin')}
                      className="text-[11px] font-medium text-cyan-300 hover:text-cyan-100 underline underline-offset-2 cursor-pointer transition-colors"
                    >
                      Switch to Sign In →
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Success Message Feedback */}
            {successMessage && (
              <div
                id="auth-success-feedback"
                className="mb-4 p-3 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-cyan-200 text-xs flex items-center gap-2.5 animate-in fade-in"
              >
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <div className="flex-1 leading-relaxed">{successMessage}</div>
              </div>
            )}

            {/* Google Sign-In & 1-Click Instant Demo Alternatives */}
            {mode !== 'forgot' && (
              <div className="space-y-3 mb-5">
                {/* 1-Click Instant Demo Founder Access: Available in both Sign In and Create Account */}
                <button
                  type="button"
                  onClick={handleQuickFounderDemo}
                  disabled={isSubmitting}
                  id="btn-auth-demo-founder"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 hover:from-indigo-500/30 hover:via-purple-500/30 hover:to-cyan-500/30 border border-indigo-400/40 hover:border-indigo-400/60 text-cyan-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-[0_0_25px_rgba(99,102,241,0.18)] active:scale-[0.99]"
                >
                  <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
                  <span>⚡ 1-Click Instant Demo (Founder Access)</span>
                </button>

                {/* Saksham Gupta 1-Click Access */}
                <button
                  type="button"
                  onClick={handleSakshamLogin}
                  disabled={isSubmitting}
                  id="btn-auth-demo-saksham"
                  className="w-full py-2 px-4 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 hover:border-cyan-500/60 text-cyan-200 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sign In as Saksham Gupta (misakshamgupta@gmail.com)</span>
                </button>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={isSubmitting}
                  id="btn-auth-google-signin"
                  className="liquid-btn-secondary w-full py-2.5 px-4 rounded-xl text-slate-200 font-medium text-xs sm:text-sm flex items-center justify-center gap-3 cursor-pointer group"
                >
                  {/* Official Google Vector Emblem */}
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>
                    {mode === 'signin' ? 'Continue with Google' : 'Sign up with Google'}
                  </span>
                </button>

                {/* Subtle Divider */}
                <div className="relative flex items-center justify-center pt-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <span className="relative px-3 text-[10px] sm:text-[11px] font-mono tracking-wider text-slate-400 uppercase bg-[#0c101a]">
                    Or enter email & password
                  </span>
                </div>
              </div>
            )}

            {/* Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Optional Name (Sign Up only) */}
              {mode === 'signup' && (
                <div className="space-y-1">
                  <label
                    htmlFor="input-auth-name"
                    className="block text-xs font-medium text-slate-300"
                  >
                    Your Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      id="input-auth-name"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Alex Chen"
                      autoComplete="name"
                      className="liquid-glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="input-auth-email"
                    className="block text-xs font-medium text-slate-300"
                  >
                    Email Address
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('founder@ideaforge.ai');
                      setPassword('IdeaForge2026!');
                      setConfirmPassword('IdeaForge2026!');
                    }}
                    className="text-[10px] sm:text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Fill demo founder credentials"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Fill Demo Credentials</span>
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    ref={emailInputRef}
                    id="input-auth-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com or founder@ideaforge.ai"
                    autoComplete="email"
                    className="liquid-glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Password Input (Sign In & Sign Up) */}
              {mode !== 'forgot' && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="input-auth-password"
                      className="block text-xs font-medium text-slate-300"
                    >
                      Password
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        id="btn-auth-forgot-password"
                        onClick={() => handleModeSwitch('forgot')}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="input-auth-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter at least 6 characters"
                      autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                      className="liquid-glass-input w-full pl-10 pr-10 py-2.5 rounded-xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      id="btn-toggle-password-visibility"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm Password (Sign Up only) */}
              {mode === 'signup' && (
                <div className="space-y-1">
                  <label
                    htmlFor="input-auth-confirm-password"
                    className="block text-xs font-medium text-slate-300"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="input-auth-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      className="liquid-glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Dominant Tactile Primary CTA Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                id="btn-auth-primary-submit"
                className="liquid-btn-primary w-full py-3 px-4 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white/90" />
                    <span>Processing...</span>
                  </>
                ) : mode === 'signin' ? (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : mode === 'signup' ? (
                  <>
                    <span>Create IdeaForge Account</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Send Reset Email</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Auxiliary actions for forgot mode */}
            {mode === 'forgot' && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  id="btn-auth-back-to-signin"
                  onClick={() => handleModeSwitch('signin')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  ← Return to Sign In
                </button>
              </div>
            )}
          </>
        )}

        {/* Security Assurance Footer Badge */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-center text-[11px] font-mono text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
          <span>Firestore isolated per-user (`users/{'{uid}'}/`) · Cloud Run</span>
        </div>
      </div>
    </div>
  );
};
