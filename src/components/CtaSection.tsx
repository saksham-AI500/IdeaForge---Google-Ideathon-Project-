import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { LiquidLogo } from './LiquidLogo';
import { ScrollReveal } from './ScrollReveal';

interface CtaSectionProps {
  onLaunch: () => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ onLaunch }) => {
  return (
    <section className="relative py-28 px-4 sm:px-6 max-w-5xl mx-auto text-center z-10">
      <ScrollReveal delay={0} distance={24}>
        <div className="liquid-glass-surface rounded-3xl p-8 sm:p-16 border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Glow ambient background circles */}
          <div className="absolute -left-20 -top-20 w-72 h-72 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
          <div className="absolute -right-20 -bottom-20 w-72 h-72 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="flex justify-center mb-2">
              <LiquidLogo size="lg" showText={false} />
            </div>

            <ScrollReveal delay={100} distance={16}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill text-xs font-mono text-cyan-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>The Evolutionary Horizon</span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200} distance={20}>
              <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                Ready to Forge Your Breakthrough?
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={300} distance={20}>
              <p className="text-sm sm:text-base text-slate-400 font-normal leading-relaxed max-w-xl mx-auto">
                Begin with a rough instinct. Let Gemini challenge the fragility, let Tavily ground the
                market truth, and build an immutable ledger of why you evolved.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={400} distance={16}>
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={onLaunch}
                  id="btn-final-cta-launch"
                  className="w-full sm:w-auto px-8 py-4 rounded-full font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 transition-all duration-300 shadow-[0_10px_35px_rgba(99,102,241,0.5)] hover:shadow-[0_15px_45px_rgba(99,102,241,0.7)] flex items-center justify-center gap-2.5 text-base cursor-pointer active:scale-95"
                >
                  <span>Launch IdeaForge</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </ScrollReveal>

            <div className="pt-4 text-xs font-mono text-slate-500">
              Google Gen AI Academy Cohort 3 Submission · Powered by Gemini & Firebase
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
};
