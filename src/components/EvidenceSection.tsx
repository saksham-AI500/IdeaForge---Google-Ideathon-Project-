import React, { useState } from 'react';
import { Search, Globe, Cpu, UserCheck, ArrowDown, ExternalLink, Check, X, ShieldAlert } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

export const EvidenceSection: React.FC = () => {
  const [userDecision, setUserDecision] = useState<'pivot' | 'persist' | null>('pivot');

  return (
    <section id="evidence" className="relative py-24 px-4 sm:px-6 max-w-6xl mx-auto z-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <ScrollReveal delay={0} distance={16}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill text-xs font-mono text-cyan-300 mb-4">
            <Globe className="w-3.5 h-3.5" />
            <span>The Grounded Reality Check</span>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={120} distance={20}>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-3">
            Grounded in Live Reality.
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={240} distance={20}>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            No hallucination vacuums. Gemini identifies vulnerable claims, Tavily sweeps live web
            signals, and you make the sovereign call.
          </p>
        </ScrollReveal>
      </div>

      {/* The 4-Step Architecture Flow */}
      <ScrollReveal delay={300} distance={24}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {/* Step 1: Gemini Isolates */}
          <div className="liquid-glass-surface rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono text-xs font-bold mb-3 border border-indigo-500/30">
                01
              </div>
              <h3 className="font-display font-bold text-white text-base mb-1">
                Gemini Isolates Claim
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Detects an empirical hypothesis that cannot be validated by pure logic alone.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-indigo-300">
              Prompt Extraction
            </div>
          </div>

          {/* Step 2: Tavily Searches */}
          <div className="liquid-glass-surface rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono text-xs font-bold mb-3 border border-cyan-500/30">
                02
              </div>
              <h3 className="font-display font-bold text-white text-base mb-1">
                Tavily Web Search
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dispatches targeted queries across technical blogs, market surveys, and post-mortems.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-cyan-300">
              Real-Time Intelligence
            </div>
          </div>

          {/* Step 3: Gemini Synthesizes */}
          <div className="liquid-glass-surface rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-mono text-xs font-bold mb-3 border border-purple-500/30">
                03
              </div>
              <h3 className="font-display font-bold text-white text-base mb-1">
                Gemini Synthesizes
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Condenses evidence into supporting signals, contradictions, and risk factors.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-purple-300">
              Signal vs. Noise Analysis
            </div>
          </div>

          {/* Step 4: User Decides */}
          <div className="liquid-glass-surface rounded-2xl p-5 border border-emerald-500/30 bg-emerald-950/20 flex flex-col justify-between shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono text-xs font-bold mb-3 border border-emerald-500/30">
                04
              </div>
              <h3 className="font-display font-bold text-white text-base mb-1">
                You Decide
              </h3>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                You remain in total control. AI advises; you choose to pivot, persevere, or redefine.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-500/20 text-[11px] font-mono text-emerald-400 font-bold">
              Sovereign Human Decision
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Live Interactive Evidence Simulation Dashboard */}
      <ScrollReveal delay={380} distance={24}>
        <div className="liquid-glass-surface rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
            <div>
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest block mb-1">
                Interactive Evidence Loop Demo
              </span>
              <h3 className="font-display text-xl font-bold text-white">
                Hypothesis Test: "Teams only care about real-time transcripts."
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              Tavily Web Search + Gemini Synthesis
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6">
            {/* Left: Tavily Search Findings */}
            <div className="lg:col-span-6 space-y-3">
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-cyan-400" />
                <span>Retrieved External Evidence (Tavily)</span>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="text-xs text-slate-300">
                  <span className="text-emerald-400 font-semibold font-mono">[Finding 1]</span>{' '}
                  "A survey of 420 engineering leads found that 81% never re-read meeting recordings. However, 89% reported rework because architecture decisions made in past sprints were undocumented."
                  <div className="text-[10px] font-mono text-slate-500 mt-1 flex items-center gap-1">
                    <span>Source: Tech Leadership Survey 2025</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </div>
                </div>

                <div className="text-xs text-slate-300 pt-2 border-t border-white/5">
                  <span className="text-amber-400 font-semibold font-mono">[Finding 2]</span>{' '}
                  "Commercial transcription plugins suffer high churn after initial novelty due to lack of synthesis and high background noise in collaborative sessions."
                  <div className="text-[10px] font-mono text-slate-500 mt-1 flex items-center gap-1">
                    <span>Source: Product Benchmarks Q3</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Gemini Synthesis */}
            <div className="lg:col-span-6 space-y-3">
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>Gemini Synthesis Summary</span>
              </div>

              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-2.5">
                <div className="text-xs text-indigo-200 font-mono">
                  <span className="text-rose-400 font-bold">Refuting Signal:</span> Empirical data
                  contradicts your hypothesis. Verbatim recordings have low retention utility.
                </div>

                <div className="text-xs text-indigo-200 font-mono">
                  <span className="text-emerald-400 font-bold">Uncovered Opportunity:</span> The
                  unsolved market pain is preserving the structured "why" behind decisions for future
                  context.
                </div>

                <div className="text-xs text-slate-300 font-mono pt-2 border-t border-white/5">
                  <span className="text-indigo-400 font-bold">Recommendation:</span> Pivot from
                  passive transcription to deliberate Idea Evolution and Rationale Preservation.
                </div>
              </div>
            </div>
          </div>

          {/* User Decision Bar */}
          <div className="p-4 sm:p-5 rounded-xl liquid-glass-pill border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <div className="text-xs font-bold text-white uppercase tracking-wider">
                  Your Sovereign Decision
                </div>
                <div className="text-xs text-slate-400">
                  AI cannot make this choice for you. How do you respond to the evidence?
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => setUserDecision('pivot')}
                id="btn-evidence-pivot"
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  userDecision === 'pivot'
                    ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Pivot to Decision Memory</span>
              </button>

              <button
                onClick={() => setUserDecision('persist')}
                id="btn-evidence-persist"
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  userDecision === 'persist'
                    ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <X className="w-3.5 h-3.5" />
                <span>Persist With Counter-Theory</span>
              </button>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
};
