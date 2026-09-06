import React, { useState, useEffect } from 'react';
import { ShaderBackground } from './components/ShaderBackground';
import { CustomCursor } from './components/CustomCursor';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { EvolutionSection } from './components/EvolutionSection';
import { ProcessJourney } from './components/ProcessJourney';
import { MentorSection } from './components/MentorSection';
import { EvidenceSection } from './components/EvidenceSection';
import { CtaSection } from './components/CtaSection';
import { ServicesPage } from './components/ServicesPage';
import { WorkspaceView } from './components/WorkspaceView';
import { Footer } from './components/Footer';
import { AuthWindow } from './components/AuthWindow';
import { AuthProvider, useAuth } from './context/AuthContext';
import { smoothScrollTo } from './utils/smoothScroll';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [currentView, setCurrentView] = useState<'home' | 'services' | 'workspace'>('home');

  // Check URL hash and pathname for direct auth, workspace triggers, or services view
  useEffect(() => {
    const checkRoute = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;

      if (hash === '#workspace' || path === '/workspace' || path === '/app') {
        setCurrentView('workspace');
      } else if (hash.startsWith('#services') || path === '/services') {
        setCurrentView('services');
      } else {
        setCurrentView('home');
      }

      if (hash === '#signup' || path === '/signup') {
        setAuthMode('signup');
        setIsAuthOpen(true);
      } else if (
        hash === '#signin' ||
        hash === '#auth' ||
        hash === '#login' ||
        path === '/auth' ||
        path === '/login'
      ) {
        setAuthMode('signin');
        setIsAuthOpen(true);
      } else if (hash && hash !== '#' && !hash.startsWith('#services') && hash !== '#workspace') {
        const timer = setTimeout(() => {
          smoothScrollTo(hash, { updateHash: false });
        }, 200);
        return () => clearTimeout(timer);
      }
    };

    checkRoute();

    window.addEventListener('hashchange', checkRoute);
    window.addEventListener('popstate', checkRoute);
    return () => {
      window.removeEventListener('hashchange', checkRoute);
      window.removeEventListener('popstate', checkRoute);
    };
  }, []);

  const handleLaunch = () => {
    if (user) {
      setCurrentView('workspace');
      window.history.pushState(null, '', '#workspace');
    } else {
      setAuthMode('signin');
      setIsAuthOpen(true);
    }
  };

  const handleOpenAuth = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleCloseAuth = () => {
    setIsAuthOpen(false);
    if (
      window.location.hash === '#auth' ||
      window.location.hash === '#signin' ||
      window.location.hash === '#signup' ||
      window.location.hash === '#login'
    ) {
      history.pushState(null, '', window.location.pathname);
    }
  };

  const handleNavigateView = (view: 'home' | 'services' | 'workspace', targetSection?: string) => {
    if (view === 'workspace') {
      setCurrentView('workspace');
      window.history.pushState(null, '', '#workspace');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'services') {
      setCurrentView('services');
      window.history.pushState(null, '', '#services');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentView('home');
      if (targetSection && targetSection !== 'hero') {
        window.history.pushState(null, '', `#${targetSection}`);
        setTimeout(() => {
          smoothScrollTo(`#${targetSection}`, { updateHash: false });
        }, 100);
      } else {
        window.history.pushState(null, '', '#hero');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  if (currentView === 'workspace') {
    return (
      <div className="relative min-h-screen bg-[#07090e] text-slate-100 selection:bg-indigo-500 selection:text-white overflow-x-hidden">
        <CustomCursor />
        <WorkspaceView onBackToHome={() => handleNavigateView('home', 'hero')} />
        <AuthWindow
          isOpen={isAuthOpen}
          onClose={handleCloseAuth}
          defaultMode={authMode}
          onSuccess={() => {
            setCurrentView('workspace');
            setIsAuthOpen(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#07090e] text-slate-100 selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Precision Custom Cursor for Desktop */}
      <CustomCursor />

      {/* Atmospheric Shader Gradient Environment */}
      <ShaderBackground />

      {/* Selective Liquid Glass Floating Navigation with Auth state */}
      <Navbar
        onLaunch={handleLaunch}
        onSignIn={handleOpenAuth}
        currentView={currentView}
        onNavigateView={handleNavigateView}
      />

      {/* Main Narrative Structure */}
      <main className="relative z-10 flex flex-col gap-8 sm:gap-16">
        {currentView === 'services' ? (
          <ServicesPage
            onLaunch={handleLaunch}
            onNavigateHome={() => handleNavigateView('home', 'hero')}
            onNavigateCreator={() => handleNavigateView('home', 'creator')}
          />
        ) : (
          <>
            {/* 1. HERO with R3F Evolving Idea Scene */}
            <Hero onLaunch={handleLaunch} />

            {/* 2. IDEA EVOLUTION: V1 -> Challenge -> Revision -> V2 -> Evidence -> V3 */}
            <EvolutionSection />

            {/* 3. HOW IT WORKS: Continuous 6-Stage Progression */}
            <ProcessJourney />

            {/* 4. AI MENTOR: Gemini as Thinking Partner */}
            <MentorSection />

            {/* 5. EVIDENCE: The Reality Check (Gemini + Tavily + User Decision) */}
            <EvidenceSection />

            {/* 6. FINAL CLOSING CTA */}
            <CtaSection onLaunch={handleLaunch} />
          </>
        )}
      </main>

      {/* 7. FOOTER with Verified Creator Links */}
      <Footer onLaunch={handleLaunch} />

      {/* Apple-inspired Liquid Glass Firebase Authentication Window */}
      <AuthWindow
        isOpen={isAuthOpen}
        onClose={handleCloseAuth}
        defaultMode={authMode}
        onSuccess={() => {
          setCurrentView('workspace');
          setIsAuthOpen(false);
        }}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
