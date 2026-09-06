import React, { useState } from 'react';
import { Brain, HelpCircle, ShieldAlert, BookOpen, Layers, Terminal, Sparkles, MessageCircle } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

interface MentorFacet {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  scenarioQuery: string;
  geminiCritique: string;
  mentorshipPrinciple: string;
}

const mentorFacets: MentorFacet[] = [
  {
    id: 'challenge',
    title: 'Assumption Pushback',
    subtitle: 'Destroys comfortable illusions before you write code',
    icon: ShieldAlert,
    scenarioQuery: '"We need real-time multi-agent orchestration for personal daily habits."',
    geminiCritique:
      'Pushback: Why multiple autonomous agents for a single person\'s routine? A user tracking water intake does not need consensus protocols. You are conflating system complexity with product utility. What is the single manual action users refuse to take today?',
    mentorshipPrinciple: 'Pushes back on premature over-engineering and vanity complexity.',
  },
  {
    id: 'clarify',
    title: 'Focused Socratic Inquiries',
    subtitle: 'Cuts through buzzwords to uncover the core pain',
    icon: HelpCircle,
    scenarioQuery: '"We are building an AI-powered operating system for creativity."',
    geminiCritique:
      'Diagnostic questions:\n1. Who is the actual user: an illustrator staring at a blank canvas or a marketing team trying to organize 400 assets?\n2. What is the breaking point in their current toolchain where they lose creative momentum?\n3. If AI only solved ONE painful 10-minute bottleneck, what would make them pay today?',
    mentorshipPrinciple: 'Replaces vague grandiosity with narrow, addressable problem definition.',
  },
  {
    id: 'history',
    title: 'Cognitive Memory & Retrospective',
    subtitle: 'Understands the trajectory of your thinking',
    icon: BookOpen,
    scenarioQuery: '"Why did we decide against building a mobile app three weeks ago?"',
    geminiCritique:
      'Historical context retrieval:\nOn August 14th in Version 2.1, you concluded that your primary users spend 85% of their revision cycles sitting with dual monitors during deep-work blocks. Mobile push notifications would add distraction rather than focus. That is why mobile was deferred to post-MVP roadmap.',
    mentorshipPrinciple: 'Preserves the strategic rationale behind every past decision.',
  },
];

export const MentorSection: React.FC = () => {
  const [selectedFacetId, setSelectedFacetId] = useState<string>('challenge');
  const activeFacet = mentorFacets.find((f) => f.id === selectedFacetId) || mentorFacets[0];

  return (
    <section id="mentor" className="relative py-24 px-4 sm:px-6 max-w-6xl mx-auto z-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <ScrollReveal delay={0} distance={16}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill text-xs font-mono text-cyan-300 mb-4">
            <Brain className="w-3.5 h-3.5" />
            <span>Intellectual Partnership</span>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={120} distance={20}>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-3">
            Your Intellectual Sparring Partner.
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={240} distance={20}>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Gemini doesn't flatter. It probes your core reasoning, exposes hidden risks, and
            preserves the trajectory of your thinking over time.
          </p>
        </ScrollReveal>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: The 3 Mentorship Pillars */}
        <ScrollReveal delay={300} distance={24} className="lg:col-span-5 flex flex-col gap-3">
          {mentorFacets.map((facet) => {
            const Icon = facet.icon;
            const isSelected = selectedFacetId === facet.id;
            return (
              <button
                key={facet.id}
                onClick={() => setSelectedFacetId(facet.id)}
                id={`btn-mentor-facet-${facet.id}`}
                className={`p-5 rounded-2xl text-left transition-all duration-300 cursor-pointer flex items-start gap-4 ${
                  isSelected
                    ? 'liquid-glass-surface bg-indigo-950/60 border-indigo-400/50 shadow-[0_0_25px_rgba(99,102,241,0.25)]'
                    : 'liquid-glass-pill hover:bg-white/5 border-white/5 opacity-70 hover:opacity-100'
                }`}
              >
                <div
                  className={`p-3 rounded-xl flex-shrink-0 ${
                    isSelected
                      ? 'bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-lg'
                      : 'bg-white/5 text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-white mb-1">
                    {facet.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {facet.subtitle}
                  </p>
                </div>
              </button>
            );
          })}

          <div className="mt-4 p-4 rounded-xl liquid-glass-pill border border-indigo-500/20 text-xs font-mono text-indigo-300 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>Multi-turn Gemini API with fallback resilience & contextual memory</span>
          </div>
        </ScrollReveal>

        {/* Right Column: Live Mentorship Sparring Chamber */}
        <ScrollReveal delay={380} distance={24} className="lg:col-span-7">
          <div className="liquid-glass-surface rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl h-full flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Dialogue: {activeFacet.title}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                  MENTOR CONVERSATION
                </span>
              </div>

              {/* User Thought */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  U
                </div>
                <div className="flex-1 bg-white/5 p-3.5 rounded-2xl rounded-tl-none border border-white/5 text-xs sm:text-sm text-slate-200">
                  <div className="text-[10px] font-mono text-slate-400 mb-1">USER HYPOTHESIS</div>
                  {activeFacet.scenarioQuery}
                </div>
              </div>

              {/* Gemini Mentor Response */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-md">
                  G
                </div>
                <div className="flex-1 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-cyan-950/30 p-4 rounded-2xl rounded-tl-none border border-indigo-500/30 text-xs sm:text-sm text-slate-200 leading-relaxed shadow-lg">
                  <div className="text-[10px] font-mono text-cyan-400 mb-1 flex items-center gap-1.5">
                    <Brain className="w-3 h-3" />
                    <span>GEMINI IDEA MENTOR</span>
                  </div>
                  <div className="whitespace-pre-line font-mono text-xs text-indigo-100">
                    {activeFacet.geminiCritique}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Mentorship Principle */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="text-cyan-400 font-bold">Principle:</span>
              <span>{activeFacet.mentorshipPrinciple}</span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
