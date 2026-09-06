import React from 'react';
import { HeroScene } from './HeroScene';
import { ArrowRight, ChevronDown, Sparkles, Compass, CheckCircle2 } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { smoothScrollTo } from '../utils/smoothScroll';

interface HeroProps {
  onLaunch: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onLaunch }) => {
  const handleScrollToEvolution = () => {
    smoothScrollTo('#evolution', { updateHash: true });
  };

  return (
    <section
      id="hero"
      className="relative min-h-[calc(100vh-2rem)] pt-24 pb-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-between overflow-hidden"
    >
      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col justify-center">
        {/* Main 2-Column Hero Grid: Short Crisp Copy on Left, Majestic 3D Animation on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Short, Crisp, Captivating Narrative */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-6 text-left z-10">
            {/* Subtle Tag */}
            <ScrollReveal delay={0} distance={16}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-pill text-xs font-medium text-indigo-300 border border-indigo-500/25 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Next-Gen Idea Evolution Workspace</span>
              </div>
            </ScrollReveal>

            {/* Crisp, Short, High-Impact Heading */}
            <ScrollReveal delay={100} distance={20}>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-[42px] xl:text-[48px] font-bold tracking-tight text-white leading-[1.16]">
                <span className="block">Where Fragile Ideas</span>
                <span className="block mt-1 liquid-chrome-text font-extrabold">
                  Become Ironclad.
                </span>
              </h1>
            </ScrollReveal>

            {/* Crisp Subtitle */}
            <ScrollReveal delay={200} distance={20}>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-xl">
                Most AI tools stop at generation. IdeaForge is your intellectual sparring partner —
                stress-testing assumptions with Gemini, grounding claims in live evidence, and
                preserving the immutable ledger of why you evolved.
              </p>
            </ScrollReveal>

            {/* Primary Actions */}
            <ScrollReveal delay={300} distance={20}>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <button
                  onClick={onLaunch}
                  id="btn-hero-launch"
                  className="px-7 py-3.5 rounded-full font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 transition-all duration-300 shadow-[0_10px_30px_rgba(99,102,241,0.4)] hover:shadow-[0_15px_40px_rgba(99,102,241,0.6)] flex items-center justify-center gap-2 cursor-pointer active:scale-95 text-sm sm:text-base"
                >
                  <span>Launch IdeaForge</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleScrollToEvolution}
                  id="btn-hero-explore"
                  className="px-6 py-3.5 rounded-full font-medium text-slate-300 hover:text-white liquid-glass-pill hover:border-white/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
                >
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span>Explore the evolution</span>
                </button>
              </div>
            </ScrollReveal>

            {/* Key Pillars Micro-Badge Row */}
            <ScrollReveal delay={400} distance={16}>
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-mono text-slate-400 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Gemini Sparring</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Live Web Grounding</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Decision Memory</span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: 3D Evolving Core Prominently on the First Page */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <ScrollReveal delay={150} distance={24} className="w-full">
              <HeroScene />
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* Downward Scroll Indicator */}
      <div className="w-full flex justify-center pt-4 z-10">
        <button
          onClick={handleScrollToEvolution}
          aria-label="Scroll down"
          className="text-slate-500 hover:text-slate-300 transition-colors flex flex-col items-center gap-1 cursor-pointer group"
        >
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 group-hover:text-slate-300 transition-colors">
            Scroll to explore
          </span>
          <ChevronDown className="w-3.5 h-3.5 animate-bounce text-slate-400" />
        </button>
      </div>
    </section>
  );
};
