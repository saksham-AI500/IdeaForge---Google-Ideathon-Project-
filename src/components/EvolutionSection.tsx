import React, { useState } from 'react';
import { GitCommit, ArrowRight, ShieldAlert, Sparkles, Database, CheckCircle2, History, MessageSquareQuote } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

interface VersionStep {
  id: string;
  version: string;
  title: string;
  stageBadge: string;
  coreIdea: string;
  triggerType: 'challenge' | 'evidence' | 'initial';
  triggerText: string;
  whatChanged: string;
  whyChanged: string;
  riskAvoided: string;
  groundedQueryDemo: {
    question: string;
    groundedAnswer: string;
  };
}

const evolutionHistory: VersionStep[] = [
  {
    id: 'v1',
    version: 'V1',
    title: 'Automated Meeting Intelligence',
    stageBadge: 'Raw Spark',
    coreIdea: 'An AI assistant that records meetings, provides full live audio transcription, and extracts action items into a task list.',
    triggerType: 'initial',
    triggerText: 'Initial hypothesis entered by user.',
    whatChanged: 'Baseline concept capture.',
    whyChanged: 'Starting point for idea development.',
    riskAvoided: 'None yet — unchallenged concept.',
    groundedQueryDemo: {
      question: 'What was our original premise in V1?',
      groundedAnswer: 'In V1, you conceived IdeaForge as a live meeting recording and transcription tool focusing purely on task extraction.',
    },
  },
  {
    id: 'v2',
    version: 'V2',
    title: 'Decision Rationale Tracker',
    stageBadge: 'Challenge Pivot',
    coreIdea: 'A workspace that tracks the strategic "why" behind engineering decisions during brainstorms, rather than disposable verbatim transcripts.',
    triggerType: 'challenge',
    triggerText: 'Gemini Challenge: "Weak assumption: Teams do not need another 50-page transcript nobody reads. The catastrophic failure in software projects is nobody remembering why an architecture was chosen 6 months later."',
    whatChanged: 'Stripped out real-time audio transcription; refocused core workflow on capturing high-leverage decision trees and assumption challenges.',
    whyChanged: 'Transcripts are low-signal noise; preserved reasoning prevents redundant debates and architectural drift.',
    riskAvoided: 'Building a commoditized recording tool that users abandon after meeting fatigue.',
    groundedQueryDemo: {
      question: 'Why did we drop audio recording between V1 and V2?',
      groundedAnswer: 'Gemini challenged the assumption that verbatim transcripts retain signal. You pivoted from recording words to preserving the structured rationale behind architectural pivots.',
    },
  },
  {
    id: 'v3',
    version: 'V3',
    title: 'IdeaForge — Evolutionary Knowledge Core',
    stageBadge: 'Grounded Reality',
    coreIdea: 'An AI-guided evolutionary workspace with version immutability, continuous web verification, and natural-language grounded retrospective Q&A.',
    triggerType: 'evidence',
    triggerText: 'Tavily Market Verification: "Developer surveys reveal 78% of architectural rework stems from lost rationale in disposable chat sessions, not lack of initial code generation."',
    whatChanged: 'Integrated real-time evidence loops (Tavily search verification) and an immutable parent-child version chain with "Ask My Idea" grounded retrospectives.',
    whyChanged: 'External validation proved that linking evidence directly to version diffs turns ephemeral chat into permanent institutional memory.',
    riskAvoided: 'Creating an echo chamber where ungrounded AI assumptions go unverified by real-world market signals.',
    groundedQueryDemo: {
      question: 'How did Tavily evidence shape V3?',
      groundedAnswer: 'Tavily retrieved market research showing 78% of rework is caused by forgotten "why" context. This confirmed your pivot and led to adding automated external evidence retrieval to each revision.',
    },
  },
];

export const EvolutionSection: React.FC = () => {
  const [activeVersionIndex, setActiveVersionIndex] = useState<number>(2); // Default to V3
  const activeVersion = evolutionHistory[activeVersionIndex];

  return (
    <section id="evolution" className="relative py-24 px-4 sm:px-6 max-w-6xl mx-auto z-10">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <ScrollReveal delay={0} distance={16}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill text-xs font-mono text-cyan-300 mb-4">
            <GitCommit className="w-3.5 h-3.5" />
            <span>The Evolution Engine</span>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={120} distance={20}>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-3">
            The Anatomy of an Evolved Idea.
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={240} distance={20}>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Watch a raw spark transform through rigorous sparring, live evidence, and reasoned
            pivots — captured permanently in memory.
          </p>
        </ScrollReveal>
      </div>

      {/* Interactive Evolution Stepper Ribbon */}
      <ScrollReveal delay={300} distance={24}>
        <div className="mb-10 liquid-glass-surface rounded-2xl p-3 sm:p-4 border border-white/10 shadow-xl">
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {evolutionHistory.map((item, idx) => {
              const isSelected = activeVersionIndex === idx;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveVersionIndex(idx)}
                  id={`btn-version-select-${item.id}`}
                  className={`relative p-3 sm:p-4 rounded-xl text-left transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-br from-indigo-900/60 via-indigo-950/40 to-slate-900/80 border border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.25)]'
                      : 'hover:bg-white/5 border border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`font-mono text-xs sm:text-sm font-bold px-2 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-indigo-500 text-white shadow-sm'
                          : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {item.version}
                    </span>
                    <span className="text-[10px] sm:text-xs font-mono text-slate-400 hidden sm:inline">
                      {item.stageBadge}
                    </span>
                  </div>
                  <div className="font-semibold text-xs sm:text-base text-slate-200 truncate">
                    {item.title}
                  </div>
                  {isSelected && (
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </ScrollReveal>

      {/* Main Interactive Stage Display */}
      <ScrollReveal delay={380} distance={24}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left column: The Idea & The Transition Trigger */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Current Idea Card */}
            <div className="liquid-glass-surface rounded-2xl p-6 sm:p-8 border border-white/10 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                      Active Formulation State
                    </span>
                  </div>
                  <span className="font-mono text-xs text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                    Version {activeVersion.version}
                  </span>
                </div>

                <h3 className="font-display text-2xl font-bold text-white mb-3">
                  {activeVersion.title}
                </h3>
                <p className="text-slate-300 text-base leading-relaxed mb-6 font-normal">
                  "{activeVersion.coreIdea}"
                </p>
              </div>

              {/* Catalyst Trigger Banner */}
              {activeVersion.triggerType !== 'initial' && (
                <div className="rounded-xl p-4 sm:p-5 bg-gradient-to-r from-amber-950/30 via-slate-900/40 to-indigo-950/30 border border-amber-500/20">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-300 mb-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span>
                      Catalyst:{' '}
                      {activeVersion.triggerType === 'challenge' ? 'Gemini Challenge' : 'Tavily Market Evidence'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 italic font-mono leading-relaxed">
                    {activeVersion.triggerText}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right column: What Changed & Why It Changed */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Rationale Preservation Card */}
            <div className="liquid-glass-surface rounded-2xl p-6 sm:p-7 border border-white/10 flex-1 flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-indigo-300">
                  <History className="w-4 h-4 text-indigo-400" />
                  <span>The Preserved Rationale</span>
                </div>

                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    What Changed
                  </h4>
                  <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                    {activeVersion.whatChanged}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Why It Changed</span>
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed bg-cyan-950/20 p-3 rounded-lg border border-cyan-500/20">
                    {activeVersion.whyChanged}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Risk Mitigated</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                    {activeVersion.riskAvoided}
                  </p>
                </div>
              </div>

              {/* Ask My Idea Grounding Demo */}
              <div className="mt-6 pt-5 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-2">
                  <MessageSquareQuote className="w-3.5 h-3.5 text-indigo-400" />
                  <span>"Ask My Idea" Grounded Context</span>
                </div>
                <div className="text-xs font-mono text-indigo-200 bg-indigo-950/40 p-2.5 rounded-lg border border-indigo-500/20">
                  <span className="text-indigo-400">Q: </span>
                  {activeVersion.groundedQueryDemo.question}
                  <div className="mt-1.5 pt-1.5 border-t border-white/10 text-slate-300">
                    <span className="text-emerald-400">A: </span>
                    {activeVersion.groundedQueryDemo.groundedAnswer}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
};
