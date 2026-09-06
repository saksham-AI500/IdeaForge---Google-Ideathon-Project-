import React from 'react';
import { LiquidLogo } from './LiquidLogo';
import { ArrowUpRight, Globe } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { smoothScrollTo } from '../utils/smoothScroll';

interface FooterProps {
  onLaunch: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onLaunch }) => {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    smoothScrollTo(id, { updateHash: true });
  };

  return (
    <footer id="creator" className="relative border-t border-white/10 bg-[#07090e]/90 pt-16 pb-12 px-4 sm:px-6 z-10">
      <div className="max-w-6xl mx-auto flex flex-col gap-12">
        <ScrollReveal delay={0} distance={16}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-white/5">
            {/* Brand */}
            <div className="space-y-2 max-w-sm">
              <LiquidLogo size="md" />
              <p className="text-xs text-slate-400 font-normal leading-relaxed">
                An AI-powered idea evolution workspace. Watch ideas get better and remember why.
              </p>
            </div>

            {/* Quick Navigation Links */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300">
              <a
                href="#hero"
                onClick={(e) => handleScroll(e, 'hero')}
                className="hover:text-white transition-colors"
              >
                Home
              </a>
              <a
                href="#evolution"
                onClick={(e) => handleScroll(e, 'evolution')}
                className="hover:text-white transition-colors"
              >
                Evolution
              </a>
              <a
                href="#how-it-works"
                onClick={(e) => handleScroll(e, 'how-it-works')}
                className="hover:text-white transition-colors"
              >
                How It Works
              </a>
              <a
                href="#mentor"
                onClick={(e) => handleScroll(e, 'mentor')}
                className="hover:text-white transition-colors"
              >
                About
              </a>
              <a
                href="#creator"
                onClick={(e) => handleScroll(e, 'creator')}
                className="hover:text-white transition-colors text-indigo-400"
              >
                Creator
              </a>
              <button
                onClick={onLaunch}
                id="footer-btn-launch"
                className="px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors cursor-pointer"
              >
                Launch IdeaForge
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* Creator & Portfolio Links */}
        <ScrollReveal delay={150} distance={16}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              <span>Built by Saksham Gupta</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-500">APAC Cohort 3 Submission</span>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              {/* Portfolio Link */}
              <a
                href="https://saksham-ai500.github.io/portfolio/"
                target="_blank"
                rel="noopener noreferrer"
                id="footer-link-portfolio"
                className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Portfolio</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>

              {/* LinkedIn Link */}
              <a
                href="https://www.linkedin.com/in/saksham-gupta-88933230b/"
                target="_blank"
                rel="noopener noreferrer"
                id="footer-link-linkedin"
                className="flex items-center gap-1 text-slate-400 hover:text-indigo-400 transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
                <span>LinkedIn</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>

              {/* GitHub Link */}
              <a
                href="https://github.com/saksham-AI500"
                target="_blank"
                rel="noopener noreferrer"
                id="footer-link-github"
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                </svg>
                <span>GitHub</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
};
