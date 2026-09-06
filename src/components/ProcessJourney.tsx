import React, { useState } from 'react';
import { PenTool, HelpCircle, ShieldAlert, Globe, Edit3, Milestone, ArrowRight } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

interface Stage {
  id: string;
  name: string;
  subhead: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  borderColor: string;
  badge: string;
  inputDescription: string;
  outputSnapshot: {
    title: string;
    body: string;
    meta?: string;
  };
}

const stages: Stage[] = [
  {
    id: 'capture',
    name: 'CAPTURE',
    subhead: 'Dump the unrefined spark',
    icon: PenTool,
    accentColor: 'from-blue-500 to-indigo-500',
    borderColor: 'border-blue-500/40',
    badge: 'Stage 01',
    inputDescription: 'Begin with an unpolished thought. No formal slides or PRD required.',
    outputSnapshot: {
      title: 'Raw Thought Submission',
      body: '"I want to build a tool that records voice meetings and auto-creates Notion tasks, but with smart prioritization."',
      meta: 'Word count: 21 words · Status: Unstructured spark',
    },
  },
  {
    id: 'clarify',
    name: 'CLARIFY',
    subhead: 'Gemini probes the blindspots',
    icon: HelpCircle,
    accentColor: 'from-indigo-500 to-violet-500',
    borderColor: 'border-indigo-500/40',
    badge: 'Stage 02',
    inputDescription: 'Before validating, Gemini asks 2–3 sharp diagnostic questions to establish real boundaries.',
    outputSnapshot: {
      title: 'Gemini Targeted Inquiries',
      body: '1. Who is suffering most right now: the individual engineer or the project lead?\n2. What happens when meetings have conflicting statements?\n3. Is recording the bottleneck, or is knowledge retention the bottleneck?',
      meta: 'Targeted: Problem, user role, leverage point',
    },
  },
  {
    id: 'challenge',
    name: 'CHALLENGE',
    subhead: 'Stress-test the core assumption',
    icon: ShieldAlert,
    accentColor: 'from-amber-500 to-rose-500',
    borderColor: 'border-rose-500/40',
    badge: 'Stage 03',
    inputDescription: 'Gemini doesn\'t flatter you. It isolates the flimsiest premise and pushes back hard.',
    outputSnapshot: {
      title: 'Gemini Assumption Strike',
      body: '"Weak assumption: Transcripts solve communication debt. In reality, teams ignore transcripts. The failure is that nobody remembers why an architecture was chosen when onboarding new hires."',
      meta: 'Pushback severity: Critical pivot trigger',
    },
  },
  {
    id: 'evidence',
    name: 'EVIDENCE',
    subhead: 'Tavily checks reality',
    icon: Globe,
    accentColor: 'from-cyan-500 to-blue-500',
    borderColor: 'border-cyan-500/40',
    badge: 'Stage 04',
    inputDescription: 'Autonomous web verification retrieves actual developer surveys, GitHub benchmarks, and market friction.',
    outputSnapshot: {
      title: 'Tavily Intelligence Sweep',
      body: 'Retrieved 4 verified research sources:\n• 78% of architectural rework in tech orgs is caused by lost rationale context.\n• Audio transcription tools see 64% 30-day drop-off due to notification noise.',
      meta: 'Source grounded: Tavily live web retrieval',
    },
  },
  {
    id: 'revise',
    name: 'REVISE',
    subhead: 'You make the sovereign decision',
    icon: Edit3,
    accentColor: 'from-emerald-500 to-teal-500',
    borderColor: 'border-emerald-500/40',
    badge: 'Stage 05',
    inputDescription: 'You retain total agency. You update your premise based on verified signals and deliberate logic.',
    outputSnapshot: {
      title: 'User Sovereign Revision',
      body: '"We are cutting verbatim recording completely. IdeaForge will be an idea evolution workspace that captures decision rationale and version histories with grounded Q&A."',
      meta: 'Decision confirmed by user · Scope clarified',
    },
  },
  {
    id: 'evolve',
    name: 'EVOLVE',
    subhead: 'Immutable version minted',
    icon: Milestone,
    accentColor: 'from-purple-500 to-indigo-500',
    borderColor: 'border-purple-500/40',
    badge: 'Stage 06',
    inputDescription: 'The Evolution Engine detects a meaningful pivot, generates a permanent whyChanged summary, and links the ancestor version.',
    outputSnapshot: {
      title: 'Version 2.0 Minted',
      body: 'Parent: V1.0 → Current: V2.0\nwhyChanged: "Shifted value proposition from transient audio recording to permanent rationale memory based on 78% rework statistic."',
      meta: 'Preserved in Firestore · Ready for "Ask My Idea"',
    },
  },
];

export const ProcessJourney: React.FC = () => {
  const [activeStageId, setActiveStageId] = useState<string>('challenge');
  const activeStage = stages.find((s) => s.id === activeStageId) || stages[0];

  return (
    <section id="how-it-works" className="relative py-24 px-4 sm:px-6 max-w-6xl mx-auto z-10">
      {/* Section Title */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <ScrollReveal delay={0} distance={16}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill text-xs font-mono text-indigo-300 mb-4">
            <Milestone className="w-3.5 h-3.5" />
            <span>The Continuous Journey</span>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={120} distance={20}>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-3">
            The 6-Stage Evolution Protocol.
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={240} distance={20}>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Not disjointed prompts. One interconnected lifecycle designed to challenge, verify,
            and permanently document intellectual progress.
          </p>
        </ScrollReveal>
      </div>

      {/* The Continuous Progression Bar */}
      <ScrollReveal delay={300} distance={24}>
        <div className="relative mb-12">
          {/* Connecting track line */}
          <div className="hidden lg:block absolute top-1/2 left-4 right-4 h-0.5 bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-purple-500/30 -translate-y-1/2 z-0" />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 relative z-10">
            {stages.map((stg) => {
              const Icon = stg.icon;
              const isSelected = activeStageId === stg.id;
              return (
                <button
                  key={stg.id}
                  onClick={() => setActiveStageId(stg.id)}
                  id={`btn-journey-step-${stg.id}`}
                  className={`p-3.5 sm:p-4 rounded-xl text-left transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'liquid-glass-surface bg-indigo-950/50 border-indigo-400/60 shadow-[0_0_20px_rgba(99,102,241,0.3)] scale-102'
                      : 'liquid-glass-pill hover:bg-white/5 border-white/5 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isSelected
                          ? 'bg-gradient-to-br ' + stg.accentColor + ' text-white shadow-md'
                          : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{stg.badge}</span>
                  </div>
                  <div>
                    <div className="font-display font-bold text-xs sm:text-sm text-white tracking-wide">
                      {stg.name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">{stg.subhead}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </ScrollReveal>

      {/* Deep-Dive Stage Experience Box */}
      <ScrollReveal delay={380} distance={24}>
        <div className="liquid-glass-surface rounded-2xl p-6 sm:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Dynamic ambient color flash according to stage */}
          <div
            className={`absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none bg-gradient-to-br ${activeStage.accentColor}`}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Stage Explanation */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-white/5 border border-white/10 text-cyan-300">
                <activeStage.icon className="w-3.5 h-3.5" />
                <span>{activeStage.badge} IN DEPTH</span>
              </div>

              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight">
                {activeStage.name}: {activeStage.subhead}
              </h3>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {activeStage.inputDescription}
              </p>

              <div className="pt-2">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-2">
                  Workflow Interaction
                </span>
                <div className="flex items-center gap-2 text-xs font-mono text-indigo-300">
                  <span>Autonomous trigger</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span>Grounded feedback</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span>Permanent ledger</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Context Simulation Terminal */}
            <div className="lg:col-span-7">
              <div className="rounded-xl bg-[#0b0e14] border border-white/10 overflow-hidden shadow-xl">
                {/* Window Header */}
                <div className="px-4 py-2.5 bg-white/5 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 text-[11px] font-mono text-slate-400">
                      ideaforge-terminal // {activeStage.id}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                    REAL-TIME PIPELINE
                  </span>
                </div>

                {/* Terminal Content */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="text-xs font-mono text-indigo-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span>{activeStage.outputSnapshot.title}</span>
                  </div>

                  <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5 font-mono text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                    {activeStage.outputSnapshot.body}
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-white/5">
                    <span>{activeStage.outputSnapshot.meta}</span>
                    <span className="text-emerald-400">STATUS: VERIFIED</span>
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
