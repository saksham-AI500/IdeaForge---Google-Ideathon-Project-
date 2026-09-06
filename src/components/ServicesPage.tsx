import React, { useState, useEffect, useRef } from 'react';
import {
  Lightbulb,
  Brain,
  GitBranch,
  ShieldAlert,
  Globe,
  Clock,
  Archive,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Search,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Filter,
  Layers,
  HelpCircle,
  Cpu,
  ArrowUpRight,
  AlertTriangle,
  FolderOpen,
  Send,
  Eye,
  PlusCircle,
  FileText,
  Workflow,
} from 'lucide-react';
import { ServicesScene3D, CapabilityId } from './ServicesScene3D';

interface ServicesPageProps {
  onLaunch: () => void;
  onNavigateHome?: () => void;
  onNavigateCreator?: () => void;
}

interface CapabilityDefinition {
  id: CapabilityId;
  label: string;
  shortLabel: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  tagline: string;
  whatItDoes: string;
  whyItMatters: string;
  workflowStep: string;
}

const CAPABILITIES: CapabilityDefinition[] = [
  {
    id: 'workspace',
    label: 'Idea Capture & Workspace',
    shortLabel: 'Capture & Workspace',
    badge: 'STAGE 01 // INGESTION',
    icon: Lightbulb,
    tagline: 'Capture raw sparks into isolated, persistent workspaces with full history.',
    whatItDoes:
      'Provides a dedicated, distraction-free environment to log ideas, define core hypotheses, and maintain multiple evolving projects simultaneously with private per-user isolation.',
    whyItMatters:
      'Raw sparks are fragile. Capturing the original premise before intellectual drift or second-guessing sets in creates a solid foundation for evolutionary refinement.',
    workflowStep: 'CAPTURE',
  },
  {
    id: 'mentor',
    label: 'AI Idea Mentor',
    shortLabel: 'AI Mentor',
    badge: 'STAGE 02 // INTELLECTUAL PARTNER',
    icon: Brain,
    tagline: 'Gemini Guide acts as a Socratic sparring partner challenging unexamined assumptions.',
    whatItDoes:
      'Interrogates ideas using full context from past iterations, pushes back on vanity complexity, asks diagnostic questions, and helps founders reason through pivots without cheerleading.',
    whyItMatters:
      'Most early-stage ideas fail from unaddressed blind spots. A rigorous AI thinking partner forces intellectual clarity before you spend months writing code.',
    workflowStep: 'CLARIFY & CHALLENGE',
  },
  {
    id: 'evolution',
    label: 'Idea Evolution & Version History',
    shortLabel: 'Evolution History',
    badge: 'STAGE 03 // IMMUTABLE LINEAGE',
    icon: GitBranch,
    tagline: 'Track not just what changed, but the exact strategic "why" behind every pivot.',
    whatItDoes:
      'Preserves an immutable chronological ledger of version milestones (V1 → V2 → V3), capturing the catalyst, diffs, avoided risks, and enabling natural-language retrospective queries.',
    whyItMatters:
      'Teams suffer from decision amnesia. When assumptions pivot, preserving the rationale prevents costly backward drift and gives investors clear proof of founder velocity.',
    workflowStep: 'REVISE & EVOLVE',
  },
  {
    id: 'risk',
    label: 'Risk & Assumption Detection',
    shortLabel: 'Risk Detection',
    badge: 'STAGE 04 // VULNERABILITY SCAN',
    icon: ShieldAlert,
    tagline: 'Gemini surfaces weak, unproven, and highly questionable assumptions.',
    whatItDoes:
      'Parses idea statements into discrete empirical hypotheses, categorizing them across 4 calibrated risk tiers: Plausible, Unproven, Risky, and Highly Questionable.',
    whyItMatters:
      'A startup rarely fails from execution—it fails because a foundational bet was fundamentally untrue. Isolating risky assumptions upfront directs energy to what actually matters.',
    workflowStep: 'CHALLENGE',
  },
  {
    id: 'evidence',
    label: 'Evidence & Reality Check',
    shortLabel: 'Reality Check',
    badge: 'STAGE 05 // LIVE VERIFICATION',
    icon: Globe,
    tagline: 'Tavily web search sweeps empirical signals so decisions are anchored in fact.',
    whatItDoes:
      'When an assumption requires empirical validation, Gemini triggers a targeted Tavily web sweep, synthesizes live market and technical signals, and presents findings for the founder’s sovereign decision.',
    whyItMatters:
      'Eliminates hallucination vacuums. Synthesized web reality protects founders from building for nonexistent markets while keeping the final judgment firmly in human hands.',
    workflowStep: 'EVIDENCE',
  },
  {
    id: 'timeline',
    label: 'Activity Timeline',
    shortLabel: 'Activity Timeline',
    badge: 'STAGE 06 // AUDIT STREAM',
    icon: Clock,
    tagline: 'Chronological log of every meaningful event that transpired around your idea.',
    whatItDoes:
      'Tracks operational events—from idea creation and challenge generation to web sweeps and version commits—distinct from internal idea evolution diffs.',
    whyItMatters:
      'Evolution History records how the concept transformed; Activity Timeline records who did what, when, and why across the entire product lifecycle.',
    workflowStep: 'AUDIT & TRACK',
  },
  {
    id: 'archive',
    label: 'Multiple Ideas / Archive / Search',
    shortLabel: 'Multi-Idea Portfolio',
    badge: 'STAGE 07 // PORTFOLIO MGMT',
    icon: Archive,
    tagline: 'Manage, search, filter, and archive multiple ideas without cognitive overload.',
    whatItDoes:
      'Offers instant idea switching, quick keyword search, active vs. archived toggling, and clean state preservation without turning into a bureaucratic ticket system.',
    whyItMatters:
      'Founders juggle multiple hypotheses at once. Archiving dead ends preserves their lessons, while fast search keeps your active workspace razor-focused.',
    workflowStep: 'PORTFOLIO',
  },
];

export const ServicesPage: React.FC<ServicesPageProps> = ({
  onLaunch,
  onNavigateHome,
  onNavigateCreator,
}) => {
  // Deep link hash support: #services/{id}
  const [activeTab, setActiveTab] = useState<CapabilityId>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      const match = hash.match(/#services\/([a-z0-9-]+)/);
      if (match && match[1]) {
        const found = CAPABILITIES.find((c) => c.id === match[1]);
        if (found) return found.id;
      }
    }
    return 'workspace';
  });

  const tabListRef = useRef<HTMLDivElement>(null);

  // Sync hash when activeTab changes
  const handleTabSelect = (id: CapabilityId) => {
    setActiveTab(id);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#services/${id}`);
    }
  };

  // Keyboard navigation for accessible tablist
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let nextIndex = currentIndex;
    if (e.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % CAPABILITIES.length;
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + CAPABILITIES.length) % CAPABILITIES.length;
      e.preventDefault();
    } else if (e.key === 'Home') {
      nextIndex = 0;
      e.preventDefault();
    } else if (e.key === 'End') {
      nextIndex = CAPABILITIES.length - 1;
      e.preventDefault();
    }

    if (nextIndex !== currentIndex) {
      const nextCapability = CAPABILITIES[nextIndex];
      handleTabSelect(nextCapability.id);
      const nextBtn = document.getElementById(`capability-tab-${nextCapability.id}`);
      nextBtn?.focus();
    }
  };

  const currentCapability = CAPABILITIES.find((c) => c.id === activeTab) || CAPABILITIES[0];

  // --------------------------------------------------------------------------
  // Tab 1 State: Idea Capture & Workspace
  // --------------------------------------------------------------------------
  const [mockWorkspaceIdeas, setMockWorkspaceIdeas] = useState([
    {
      id: 'idea-1',
      title: 'IdeaForge — Evolutionary Knowledge Core',
      status: 'active',
      versions: 3,
      spark: 'An AI-guided evolutionary workspace where decisions are versioned with immutable rationale.',
      lastUpdated: 'Just now',
    },
    {
      id: 'idea-2',
      title: 'Real-Time Voice Meeting Notetaker',
      status: 'archived',
      versions: 2,
      spark: 'Record full meeting audio and produce transcripts automatically.',
      lastUpdated: '3 weeks ago',
    },
    {
      id: 'idea-3',
      title: 'Local-First Vector Code Search',
      status: 'active',
      versions: 1,
      spark: 'Semantic grep running in-browser using WebAssembly and local embeddings.',
      lastUpdated: '2 days ago',
    },
  ]);
  const [activeWorkspaceIdeaId, setActiveWorkspaceIdeaId] = useState('idea-1');
  const [sparkInput, setSparkInput] = useState('');
  const [sparkAddedNotice, setSparkAddedNotice] = useState(false);

  const selectedWorkspaceIdea =
    mockWorkspaceIdeas.find((i) => i.id === activeWorkspaceIdeaId) || mockWorkspaceIdeas[0];

  const handleCreateMockSpark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sparkInput.trim()) return;
    const newIdea = {
      id: `idea-${Date.now()}`,
      title: sparkInput.trim(),
      status: 'active' as const,
      versions: 1,
      spark: sparkInput.trim(),
      lastUpdated: 'Just now',
    };
    setMockWorkspaceIdeas([newIdea, ...mockWorkspaceIdeas]);
    setActiveWorkspaceIdeaId(newIdea.id);
    setSparkInput('');
    setSparkAddedNotice(true);
    setTimeout(() => setSparkAddedNotice(false), 3000);
  };

  // --------------------------------------------------------------------------
  // Tab 2 State: AI Idea Mentor
  // --------------------------------------------------------------------------
  const mentorScenarios = [
    {
      id: 's1',
      label: 'Challenge Over-Engineering',
      founderQuery: 'Should we build real-time voice agents into our MVP?',
      geminiResponse:
        'Pushback: Why voice agents in V1? A user capturing a core strategic thesis does not need high-latency audio synthesis. You are adding infrastructure overhead before validating if founders will log decisions in text. What is the single manual friction point they experience today?',
      lens: 'Scope Discipline & Feasibility',
    },
    {
      id: 's2',
      label: 'Diagnose Value Proposition',
      founderQuery: 'Everyone says they like the idea, but will they actually pay for it?',
      geminiResponse:
        'Diagnostic questions:\n1. What exact catastrophic mistake does this prevent? (e.g. 6 months wasted building the wrong product)\n2. If IdeaForge costs $49/mo, does it save them at least $5,000 in redundant developer hours?\n3. Do not ask "would you buy this"—ask "when was the last time you lost track of a key decision?"',
      lens: 'Empirical Pain Validation',
    },
    {
      id: 's3',
      label: 'Recall Historical Rationale',
      founderQuery: 'Why did we drop verbatim meeting transcription two weeks ago?',
      geminiResponse:
        'Historical Context Retrieval [V1 → V2]:\nOn your initial hypothesis, you realized verbatim audio transcription generates 40 pages of noisy chitchat nobody ever reviews. You shifted from capturing words to tracking structured decision trees and assumption challenges.',
      lens: 'Cognitive Memory Retrieval',
    },
  ];
  const [selectedMentorScenario, setSelectedMentorScenario] = useState(mentorScenarios[0]);
  const [customMentorQuestion, setCustomMentorQuestion] = useState('');
  const [simulatedAnswer, setSimulatedAnswer] = useState<string | null>(null);

  const handleAskMentor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMentorQuestion.trim()) return;
    setSimulatedAnswer(
      `Gemini Guide Analysis:\n"${customMentorQuestion.trim()}" raises an assumption around product-market fit. Rather than adding speculative capabilities, test this hypothesis with 3 target users manually this week. How does this advance your core evolution loop?`
    );
  };

  // --------------------------------------------------------------------------
  // Tab 3 State: Idea Evolution & Version History (Flagship)
  // --------------------------------------------------------------------------
  const evolutionSteps = [
    {
      version: 'V1',
      badge: 'RAW SPARK',
      title: 'Automated Meeting Intelligence',
      corePremise: 'An AI assistant that records meetings, provides full transcription, and extracts action items.',
      whatChanged: 'Baseline concept capture. High-friction audio transcription and task lists.',
      whyChanged: 'Starting point for idea development; broad initial hypothesis.',
      riskAvoided: 'None yet — unchallenged assumption.',
      groundedQuery: 'What was our original premise in V1?',
      groundedAnswer:
        'In V1, you conceived IdeaForge as a live meeting recording and transcription tool focusing purely on task extraction.',
    },
    {
      version: 'V2',
      badge: 'CHALLENGE PIVOT',
      title: 'Decision Rationale Tracker',
      corePremise: 'A workspace that tracks the strategic "why" behind engineering choices, rather than disposable verbatim transcripts.',
      whatChanged: 'Stripped out real-time audio; refocused core workflow on capturing high-leverage decision trees.',
      whyChanged: 'Transcripts are low-signal noise; preserved reasoning prevents redundant debates and architectural drift.',
      riskAvoided: 'Building a commoditized recording tool that users abandon after meeting fatigue.',
      groundedQuery: 'Why did we drop audio recording between V1 and V2?',
      groundedAnswer:
        'Gemini challenged the assumption that verbatim transcripts retain signal. You pivoted from recording words to preserving the structured rationale behind architectural pivots.',
    },
    {
      version: 'V3',
      badge: 'GROUNDED REALITY',
      title: 'IdeaForge — Evolutionary Knowledge Core',
      corePremise: 'An AI-guided evolutionary workspace with version immutability, continuous web verification, and retrospective Q&A.',
      whatChanged: 'Integrated Tavily web verification for external reality checks, private per-user Firestore isolation, and live Socratic mentoring.',
      whyChanged: 'Empirical signals prevent internal echo chambers; versioned immutable snapshots give founders proof of iteration velocity.',
      riskAvoided: 'Founder hallucination vacuum and lack of historical institutional memory.',
      groundedQuery: 'What makes V3 the battle-tested architecture?',
      groundedAnswer:
        'V3 pairs generative reasoning with Tavily web reality, ensuring that assumptions are continuously verified before code is written.',
    },
  ];
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(2);
  const currentVersion = evolutionSteps[selectedVersionIndex];

  // --------------------------------------------------------------------------
  // Tab 4 State: Risk & Assumption Detection
  // --------------------------------------------------------------------------
  const riskAssumptions = [
    {
      id: 'r1',
      assumption: 'Developers will read 40-page meeting transcripts to find why an architectural choice was made.',
      tier: 'HIGHLY QUESTIONABLE' as const,
      tierColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      reasoning: 'Transcripts contain 95% conversational chitchat. Developers search commit messages or ask colleagues; they do not read meeting transcripts.',
      recommendedAction: 'Pivot focus from recording verbatim dialogue to extracting structured decision rationales.',
    },
    {
      id: 'r2',
      assumption: 'Founders will abandon their favorite note app (Notion/Obsidian) for a generic note-taking tool.',
      tier: 'RISKY' as const,
      tierColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      reasoning: 'Switching costs for text editors are very high unless the new platform provides a unique, specialized outcome.',
      recommendedAction: 'Position IdeaForge strictly as an evolutionary sparring & verification engine, not a generic markdown editor.',
    },
    {
      id: 'r3',
      assumption: 'Enterprise teams need live web evidence checks for every single internal product decision.',
      tier: 'UNPROVEN' as const,
      tierColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      reasoning: 'Internal logic or customer interviews often suffice; external web searches should be triggered only for empirical market/tech claims.',
      recommendedAction: 'Apply Tavily verification on-demand when empirical verification is flagged, rather than on every keystroke.',
    },
    {
      id: 'r4',
      assumption: 'Version immutability (V1 → V2 → V3) helps founders pitch their evolution velocity to investors.',
      tier: 'PLAUSIBLE' as const,
      tierColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      reasoning: 'Investors consistently evaluate founder adaptability and learning rate over static business plans.',
      recommendedAction: 'Provide exportable decision lineage summaries for investor updates and team retrospectives.',
    },
  ];
  const [selectedRiskId, setSelectedRiskId] = useState('r1');
  const activeRisk = riskAssumptions.find((r) => r.id === selectedRiskId) || riskAssumptions[0];

  // --------------------------------------------------------------------------
  // Tab 5 State: Evidence & Reality Check (Tavily + Gemini)
  // --------------------------------------------------------------------------
  const [evidenceStep, setEvidenceStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [userRealityDecision, setUserRealityDecision] = useState<'pivot' | 'persist' | null>(null);

  // --------------------------------------------------------------------------
  // Tab 6 State: Activity Timeline
  // --------------------------------------------------------------------------
  const mockTimelineEvents = [
    {
      id: 'e1',
      type: 'creation',
      badge: 'IDEA CREATED',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      title: 'Hypothesis spark captured',
      timestamp: 'Today, 09:14 AM',
      author: 'Founder',
      detail: 'Created idea: "Automated Meeting Intelligence" with initial focus on live audio transcription.',
    },
    {
      id: 'e2',
      type: 'edit',
      badge: 'IDEA EDITED',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      title: 'Target persona clarified',
      timestamp: 'Today, 10:02 AM',
      author: 'Founder',
      detail: 'Narrowed target persona from "all corporate workers" to "software architects and technical leads".',
    },
    {
      id: 'e3',
      type: 'challenge',
      badge: 'CHALLENGE GENERATED',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      title: 'Gemini Socratic pushback',
      timestamp: 'Today, 10:15 AM',
      author: 'Gemini Guide',
      detail: 'Interrogated assumption: "Why would engineers read transcripts when commit history already exists?"',
    },
    {
      id: 'e4',
      type: 'risk',
      badge: 'RISK IDENTIFIED',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      title: 'High vulnerability detected',
      timestamp: 'Today, 10:20 AM',
      author: 'Gemini Guide',
      detail: 'Flagged transcript reliance as "HIGHLY QUESTIONABLE" due to high drop-off in user engagement.',
    },
    {
      id: 'e5',
      type: 'evidence',
      badge: 'EVIDENCE CHECKED',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      title: 'Tavily web search executed',
      timestamp: 'Today, 11:30 AM',
      author: 'Tavily + Gemini',
      detail: 'Swept developer survey data. Synthesized: 78% of teams cite decision amnesia as primary pain over lack of notes.',
    },
    {
      id: 'e6',
      type: 'version',
      badge: 'VERSION CREATED',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      title: 'Milestone V2 committed',
      timestamp: 'Today, 01:45 PM',
      author: 'Founder',
      detail: 'Pivoted concept to "Decision Rationale Tracker", capturing immutable strategic milestones.',
    },
    {
      id: 'e7',
      type: 'archive',
      badge: 'IDEA ARCHIVED',
      badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
      title: 'Dead-end hypothesis archived',
      timestamp: 'Yesterday',
      author: 'Founder',
      detail: 'Archived side idea "Autonomous Daily Habit Bot" to maintain focus on IdeaForge core.',
    },
    {
      id: 'e8',
      type: 'restore',
      badge: 'IDEA RESTORED',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      title: 'Idea unarchived for review',
      timestamp: '2 days ago',
      author: 'Founder',
      detail: 'Restored "Local First Vector Cache" for secondary architecture exploration.',
    },
  ];
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'founder' | 'gemini' | 'system'>('all');
  const filteredTimelineEvents = mockTimelineEvents.filter((ev) => {
    if (timelineFilter === 'founder') return ev.author === 'Founder';
    if (timelineFilter === 'gemini') return ev.author.includes('Gemini');
    if (timelineFilter === 'system') return ev.type === 'version' || ev.type === 'archive' || ev.type === 'restore';
    return true;
  });

  // --------------------------------------------------------------------------
  // Tab 7 State: Multiple Ideas / Archive / Search
  // --------------------------------------------------------------------------
  const [portfolioSearch, setPortfolioSearch] = useState('');
  const [portfolioTab, setPortfolioTab] = useState<'all' | 'active' | 'archived'>('all');
  const [portfolioIdeas, setPortfolioIdeas] = useState([
    {
      id: 'p1',
      title: 'IdeaForge — Evolutionary Knowledge Core',
      status: 'active',
      tag: 'Flagship Core',
      versions: 3,
      risksEvaluated: 4,
      confidenceScore: '94%',
      summary: 'Tracks the immutable "why" behind product evolution with Gemini mentoring & Tavily checks.',
    },
    {
      id: 'p2',
      title: 'Local-First Vector Code Search',
      status: 'active',
      tag: 'Developer Tool',
      versions: 1,
      risksEvaluated: 2,
      confidenceScore: '78%',
      summary: 'Client-side WASM semantic search across large codebases without uploading source code.',
    },
    {
      id: 'p3',
      title: 'Continuous Compliance Guardian',
      status: 'active',
      tag: 'Enterprise Infra',
      versions: 2,
      risksEvaluated: 5,
      confidenceScore: '85%',
      summary: 'Audits cloud architecture decisions against SOC2 standards automatically.',
    },
    {
      id: 'p4',
      title: 'Autonomous Daily Habit Orchestrator',
      status: 'archived',
      tag: 'Consumer AI',
      versions: 2,
      risksEvaluated: 3,
      confidenceScore: '42%',
      summary: 'Over-engineered habit tracking system; archived after Gemini challenge on vanity complexity.',
    },
  ]);

  const toggleArchiveIdea = (id: string) => {
    setPortfolioIdeas((prev) =>
      prev.map((idea) => {
        if (idea.id === id) {
          return {
            ...idea,
            status: idea.status === 'active' ? 'archived' : 'active',
          };
        }
        return idea;
      })
    );
  };

  const filteredPortfolioIdeas = portfolioIdeas.filter((idea) => {
    const matchesSearch =
      idea.title.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
      idea.summary.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
      idea.tag.toLowerCase().includes(portfolioSearch.toLowerCase());
    const matchesStatus =
      portfolioTab === 'all' ? true : idea.status === portfolioTab;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 text-slate-100">
      {/* 1. Page Header & Introductions */}
      <header className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill text-xs font-mono text-indigo-300 border border-indigo-400/20 mb-4 shadow-sm">
          <Workflow className="w-3.5 h-3.5 text-cyan-300" />
          <span>IdeaForge Architectural Engine</span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
          Capabilities Designed for <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-300 via-cyan-200 to-teal-300 bg-clip-text text-transparent">
            Continuous Idea Evolution
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
          IdeaForge is not another generic note-taking tool. It is an intelligent evolutionary engine
          built to interrogate assumptions, verify claims against live reality, and preserve the
          immutable rationale behind every strategic pivot.
        </p>
      </header>

      {/* 2. Capability Tabs Navigation */}
      <div className="mb-10 sm:mb-12">
        <div
          ref={tabListRef}
          role="tablist"
          aria-label="IdeaForge Services & Capabilities"
          className="liquid-glass-surface p-1.5 sm:p-2 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth"
        >
          {CAPABILITIES.map((capability, idx) => {
            const Icon = capability.icon;
            const isSelected = activeTab === capability.id;

            return (
              <button
                key={capability.id}
                id={`capability-tab-${capability.id}`}
                role="tab"
                aria-selected={isSelected}
                aria-controls={`capability-panel-${capability.id}`}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => handleTabSelect(capability.id)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className={`relative flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                  isSelected
                    ? 'text-white bg-white/15 shadow-[0_4px_16px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.25)] font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isSelected ? 'text-cyan-300' : 'text-slate-400'
                  }`}
                />
                <span className="hidden md:inline">{capability.label}</span>
                <span className="md:hidden">{capability.shortLabel}</span>

                {isSelected && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-cyan-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Interactive Capability Stage */}
      <section
        id={`capability-panel-${currentCapability.id}`}
        role="tabpanel"
        aria-labelledby={`capability-tab-${currentCapability.id}`}
        className="mb-16 focus:outline-none"
      >
        {/* Capability Overview Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch mb-8">
          {/* Left: Capability Narrative & Rationale */}
          <div className="lg:col-span-6 flex flex-col justify-between p-6 sm:p-8 rounded-3xl liquid-glass-surface border border-white/10 shadow-xl">
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono tracking-wider text-cyan-300 bg-cyan-500/10 border border-cyan-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  {currentCapability.badge}
                </span>

                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Loop Phase: <strong className="text-indigo-300">{currentCapability.workflowStep}</strong>
                </span>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
                {currentCapability.label}
              </h2>

              <p className="text-sm sm:text-base text-cyan-200/90 font-medium mb-5 leading-relaxed">
                {currentCapability.tagline}
              </p>

              <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/10 pt-4">
                <div>
                  <h3 className="font-semibold text-white uppercase text-[11px] font-mono tracking-wider text-slate-400 mb-1">
                    What This Capability Does:
                  </h3>
                  <p>{currentCapability.whatItDoes}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-white uppercase text-[11px] font-mono tracking-wider text-slate-400 mb-1">
                    Why It Matters To Founders:
                  </h3>
                  <p>{currentCapability.whyItMatters}</p>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                Interactive demonstration below
              </span>
              <button
                onClick={onLaunch}
                id="btn-capability-launch-workspace"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors cursor-pointer shadow-md"
              >
                <span>Try in Live Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right: R3F Interactive 3D Representation */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <ServicesScene3D activeCapability={activeTab} />
          </div>
        </div>

        {/* 4. Dedicated Interactive Sandbox for Selected Tab */}
        <div className="rounded-3xl liquid-glass-surface border border-white/10 p-6 sm:p-8 shadow-2xl">
          {/* ---------------- TAB 1: WORKSPACE ---------------- */}
          {activeTab === 'workspace' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-cyan-300" />
                    <span>Active Idea Repositories</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Switch between ideas to see isolated workspace state, version status, and capture flow.
                  </p>
                </div>
                <span className="text-xs font-mono text-indigo-300 bg-indigo-500/15 px-3 py-1 rounded-full border border-indigo-500/25">
                  Firestore User Isolation Active
                </span>
              </div>

              {/* Idea Switcher Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {mockWorkspaceIdeas.map((idea) => {
                  const isCur = idea.id === activeWorkspaceIdeaId;
                  return (
                    <button
                      key={idea.id}
                      onClick={() => setActiveWorkspaceIdeaId(idea.id)}
                      id={`btn-workspace-idea-${idea.id}`}
                      className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                        isCur
                          ? 'bg-white/10 border-cyan-400/40 shadow-lg'
                          : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                            idea.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                          }`}
                        >
                          {idea.status.toUpperCase()}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {idea.versions} Version{idea.versions > 1 ? 's' : ''}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-white truncate mb-1">
                        {idea.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {idea.spark}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Active Workspace View Detail */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono text-slate-300 uppercase tracking-wide">
                      Currently Active in Workspace:
                    </span>
                    <strong className="text-sm text-white font-medium">
                      {selectedWorkspaceIdea.title}
                    </strong>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    Last modified: {selectedWorkspaceIdea.lastUpdated}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-xs sm:text-sm text-slate-300 leading-relaxed font-mono">
                  <span className="text-indigo-400 font-semibold">// Core Premise & Spark:</span>
                  <p className="mt-1 text-slate-200">{selectedWorkspaceIdea.spark}</p>
                </div>

                {/* Quick Capture Input Test */}
                <form onSubmit={handleCreateMockSpark} className="pt-2">
                  <label htmlFor="spark-input" className="block text-xs font-mono text-slate-400 mb-2">
                    Test Quick Spark Ingestion:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="spark-input"
                      type="text"
                      value={sparkInput}
                      onChange={(e) => setSparkInput(e.target.value)}
                      placeholder="e.g. AI-powered local vector database for legal contracts..."
                      className="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm liquid-glass-input text-white placeholder:text-slate-500"
                    />
                    <button
                      type="submit"
                      id="btn-add-mock-spark"
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Capture</span>
                    </button>
                  </div>
                  {sparkAddedNotice && (
                    <p className="text-xs text-emerald-300 font-mono mt-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Idea spark captured into private repository!
                    </p>
                  )}
                </form>
              </div>
            </div>
          )}

          {/* ---------------- TAB 2: AI MENTOR ---------------- */}
          {activeTab === 'mentor' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Brain className="w-5 h-5 text-indigo-400" />
                    <span>Gemini Socratic Sparring Simulation</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    See how Gemini Guide uses historical version context to challenge weak hypotheses.
                  </p>
                </div>
                <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                  Grounded in Historical Lineage
                </span>
              </div>

              {/* Inquiry Scenarios */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-400">Select a real founder inquiry:</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {mentorScenarios.map((sc) => {
                    const isSel = selectedMentorScenario.id === sc.id;
                    return (
                      <button
                        key={sc.id}
                        onClick={() => {
                          setSelectedMentorScenario(sc);
                          setSimulatedAnswer(null);
                        }}
                        id={`btn-mentor-scenario-${sc.id}`}
                        className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isSel
                            ? 'bg-indigo-500/20 border-indigo-400/50 text-white shadow-md'
                            : 'bg-white/[0.03] border-white/5 text-slate-300 hover:bg-white/[0.06]'
                        }`}
                      >
                        <div className="text-[10px] font-mono text-indigo-300 mb-1">
                          {sc.lens}
                        </div>
                        <div className="text-xs font-semibold">{sc.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chat Simulation Sandbox */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4">
                {/* User Bubble */}
                <div className="flex items-start gap-3 justify-end">
                  <div className="max-w-md p-3.5 rounded-2xl bg-indigo-600/30 border border-indigo-500/30 text-xs sm:text-sm text-indigo-100">
                    <span className="text-[10px] font-mono text-indigo-300 block mb-1">
                      Founder Question:
                    </span>
                    {selectedMentorScenario.founderQuery}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-indigo-500/40 flex items-center justify-center font-bold text-xs text-white">
                    You
                  </div>
                </div>

                {/* Gemini Guide Bubble */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-xs text-white shadow-md flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 p-4 rounded-2xl bg-white/[0.05] border border-white/10 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-cyan-300 font-semibold">
                        Gemini Guide Response
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Reasoning Lens: {selectedMentorScenario.lens}
                      </span>
                    </div>
                    {simulatedAnswer || selectedMentorScenario.geminiResponse}
                  </div>
                </div>

                {/* Interactive Custom Question Bar */}
                <form onSubmit={handleAskMentor} className="pt-3 border-t border-white/10 flex items-center gap-2">
                  <input
                    type="text"
                    value={customMentorQuestion}
                    onChange={(e) => setCustomMentorQuestion(e.target.value)}
                    placeholder="Ask a custom question to see Socratic analysis..."
                    className="flex-1 py-2 px-3.5 rounded-xl text-xs liquid-glass-input text-white placeholder:text-slate-500"
                  />
                  <button
                    type="submit"
                    id="btn-mentor-ask-submit"
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Inquire</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ---------------- TAB 3: EVOLUTION HISTORY (FLAGSHIP) ---------------- */}
          {activeTab === 'evolution' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-teal-400" />
                    <span>Flagship: Interactive Version Lineage (V1 → V2 → V3)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Select a version to inspect how the concept transformed and why the pivot occurred.
                  </p>
                </div>
                <span className="text-xs font-mono text-teal-300 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
                  Zero Architectural Amnesia
                </span>
              </div>

              {/* Version Stepper */}
              <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-2">
                {evolutionSteps.map((step, idx) => {
                  const isSelected = selectedVersionIndex === idx;
                  return (
                    <button
                      key={step.version}
                      onClick={() => setSelectedVersionIndex(idx)}
                      id={`btn-version-step-${step.version}`}
                      className={`flex-1 min-w-[140px] p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-teal-500/15 border-teal-400/50 shadow-lg scale-102'
                          : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-display font-bold text-base text-white">
                          {step.version}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-cyan-300">
                          {step.badge}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-slate-300 truncate">
                        {step.title}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Version Detail Card */}
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-5 animate-in fade-in">
                <div>
                  <span className="text-[10px] font-mono text-teal-300 uppercase tracking-widest block mb-1">
                    {currentVersion.version} Strategic Hypothesis
                  </span>
                  <h4 className="font-display text-xl font-bold text-white mb-2">
                    {currentVersion.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-mono bg-black/40 p-3.5 rounded-xl border border-white/5">
                    {currentVersion.corePremise}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-[11px] font-mono text-indigo-300 uppercase block mb-1">
                      What Changed:
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {currentVersion.whatChanged}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-[11px] font-mono text-cyan-300 uppercase block mb-1">
                      Why It Changed (Catalyst):
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {currentVersion.whyChanged}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20">
                    <span className="text-[11px] font-mono text-rose-300 uppercase block mb-1">
                      Risk Avoided:
                    </span>
                    <p className="text-xs text-rose-200/90 leading-relaxed">
                      {currentVersion.riskAvoided}
                    </p>
                  </div>
                </div>

                {/* Plain English Retrospective Query Simulation */}
                <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-indigo-300 block">
                      Natural Language Retrospective Query:
                    </span>
                    <span className="text-xs font-semibold text-white">
                      "{currentVersion.groundedQuery}"
                    </span>
                    <p className="text-xs text-slate-300 mt-1">
                      {currentVersion.groundedAnswer}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/15 px-2.5 py-1 rounded-full self-start sm:self-center border border-emerald-500/30">
                    Grounded Query Ready
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- TAB 4: RISK & ASSUMPTION DETECTION ---------------- */}
          {activeTab === 'risk' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-400" />
                    <span>Calibrated Assumption Scanner</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Gemini breaks ideas into discrete hypotheses across four rigorous project risk categories.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['PLAUSIBLE', 'UNPROVEN', 'RISKY', 'HIGHLY QUESTIONABLE'].map((tier) => (
                    <span
                      key={tier}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300"
                    >
                      {tier}
                    </span>
                  ))}
                </div>
              </div>

              {/* Assumption List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {riskAssumptions.map((r) => {
                  const isSel = selectedRiskId === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRiskId(r.id)}
                      id={`btn-risk-item-${r.id}`}
                      className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSel
                          ? 'bg-white/10 border-white/25 shadow-lg'
                          : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${r.tierColor}`}
                        >
                          {r.tier}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {isSel ? 'Selected' : 'Click to inspect'}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-white font-medium line-clamp-2 leading-relaxed">
                        "{r.assumption}"
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Selected Assumption Vulnerability Breakdown */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono px-3 py-1 rounded-full border ${activeRisk.tierColor}`}>
                    {activeRisk.tier}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Vulnerability Rationale Breakdown
                  </span>
                </div>

                <div className="text-sm font-semibold text-white">
                  "{activeRisk.assumption}"
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-[10px] font-mono text-rose-300 uppercase block mb-1">
                      Why This Is Fragile:
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {activeRisk.reasoning}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20">
                    <span className="text-[10px] font-mono text-indigo-300 uppercase block mb-1">
                      Prescribed Validation Action:
                    </span>
                    <p className="text-xs text-indigo-200 leading-relaxed">
                      {activeRisk.recommendedAction}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <button
                    onClick={() => handleTabSelect('evidence')}
                    id="btn-trigger-evidence-from-risk"
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-300 hover:text-cyan-200 transition-colors cursor-pointer"
                  >
                    <span>Run Tavily Reality Check on this assumption →</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- TAB 5: EVIDENCE & REALITY CHECK ---------------- */}
          {activeTab === 'evidence' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-cyan-400" />
                    <span>The Tavily + Gemini Reality Check Workflow</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Step through the empirical verification loop from claim extraction to founder decision.
                  </p>
                </div>
                <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                  Targeted Verification On Demand
                </span>
              </div>

              {/* 5-Step Progress Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { num: 1, label: 'Claim / Hypothesis' },
                  { num: 2, label: 'Gemini Trigger' },
                  { num: 3, label: 'Tavily Search' },
                  { num: 4, label: 'Gemini Synthesis' },
                  { num: 5, label: 'Founder Decision' },
                ].map((st) => {
                  const isActive = evidenceStep === st.num;
                  const isCompleted = evidenceStep > st.num;
                  return (
                    <button
                      key={st.num}
                      onClick={() => setEvidenceStep(st.num as any)}
                      id={`btn-evidence-step-${st.num}`}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-cyan-500/20 border-cyan-400/50 shadow-md'
                          : isCompleted
                          ? 'bg-white/10 border-white/20 text-slate-300'
                          : 'bg-white/[0.02] border-white/5 text-slate-500'
                      }`}
                    >
                      <span className="text-[10px] font-mono block mb-0.5 text-cyan-400">
                        STEP 0{st.num}
                      </span>
                      <span className="text-xs font-semibold block truncate">
                        {st.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Step Content Showcase */}
              <div className="p-6 rounded-2xl bg-black/40 border border-white/10 space-y-4">
                {evidenceStep === 1 && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase">Step 01 // Isolating Empirical Claim</span>
                    <h4 className="text-base font-semibold text-white">
                      "Enterprise engineering teams prefer verbatim meeting transcripts over decision summaries."
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Gemini detects this as an external empirical claim about user behavior, not an internal technical assumption. It cannot be resolved through pure debate.
                    </p>
                    <button
                      onClick={() => setEvidenceStep(2)}
                      className="mt-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white cursor-pointer"
                    >
                      Next: Trigger Gemini Verification →
                    </button>
                  </div>
                )}

                {evidenceStep === 2 && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono text-indigo-400 uppercase">Step 02 // Gemini Identifies Need for Evidence</span>
                    <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 font-mono text-xs text-indigo-200">
                      <code>
                        TARGET_CLAIM = "Enterprise engineer sentiment regarding meeting transcripts vs rationale summaries"<br />
                        ACTION = Trigger Tavily Search API with focused queries.
                      </code>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Rather than executing a search on every prompt, Gemini selectively triggers Tavily when an empirical vulnerability could make or break product strategy.
                    </p>
                    <button
                      onClick={() => setEvidenceStep(3)}
                      className="mt-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white cursor-pointer"
                    >
                      Next: Execute Tavily Web Sweep →
                    </button>
                  </div>
                )}

                {evidenceStep === 3 && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase">Step 03 // Tavily Web Signal Sweep</span>
                    <div className="space-y-2">
                      <div className="p-3 rounded-lg bg-white/[0.04] border border-white/10 text-xs">
                        <span className="text-cyan-300 font-mono text-[10px] block">Source 1 // DevSurvey 2025</span>
                        <strong className="text-white">"82% of developers ignore full meeting transcripts; primary friction is architectural amnesia."</strong>
                      </div>
                      <div className="p-3 rounded-lg bg-white/[0.04] border border-white/10 text-xs">
                        <span className="text-cyan-300 font-mono text-[10px] block">Source 2 // Engineering Org Retrospectives</span>
                        <strong className="text-white">"Teams spend an average of 4.2 hours per week re-litigating decisions whose rationale was forgotten."</strong>
                      </div>
                    </div>
                    <button
                      onClick={() => setEvidenceStep(4)}
                      className="mt-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white cursor-pointer"
                    >
                      Next: Synthesize Signals →
                    </button>
                  </div>
                )}

                {evidenceStep === 4 && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono text-teal-400 uppercase">Step 04 // Gemini Evidence Synthesis</span>
                    <div className="p-4 rounded-xl bg-teal-950/20 border border-teal-500/30 text-xs sm:text-sm text-teal-100 leading-relaxed">
                      "Evidence contradicts the original premise. Developers do not want transcription tools; they want structured decision memory. Retaining verbatim transcription as the primary value proposition carries a high risk of abandonment."
                    </div>
                    <button
                      onClick={() => setEvidenceStep(5)}
                      className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white cursor-pointer"
                    >
                      Next: Present Founder Sovereign Choice →
                    </button>
                  </div>
                )}

                {evidenceStep === 5 && (
                  <div className="space-y-4">
                    <span className="text-[10px] font-mono text-purple-400 uppercase">Step 05 // Founder Sovereign Decision</span>
                    <p className="text-xs sm:text-sm text-slate-200">
                      IdeaForge never makes autonomous product decisions for you. Based on the evidence synthesized, what is your strategic choice?
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <button
                        onClick={() => setUserRealityDecision('pivot')}
                        id="btn-evidence-decision-pivot"
                        className={`w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                          userRealityDecision === 'pivot'
                            ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg'
                            : 'bg-white/10 border-white/20 text-slate-200 hover:bg-white/15'
                        }`}
                      >
                        [Pivot Concept] → Commit Milestone V2 as Decision Tracker
                      </button>

                      <button
                        onClick={() => setUserRealityDecision('persist')}
                        id="btn-evidence-decision-persist"
                        className={`w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                          userRealityDecision === 'persist'
                            ? 'bg-amber-600 border-amber-400 text-white shadow-lg'
                            : 'bg-white/10 border-white/20 text-slate-200 hover:bg-white/15'
                        }`}
                      >
                        [Persist with Caveats] → Keep V1 with targeted developer warning
                      </button>
                    </div>

                    {userRealityDecision && (
                      <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200 font-mono">
                        ✓ Decision recorded: Founder selected [{userRealityDecision.toUpperCase()}]. Catalyst logged into Evolution History.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ---------------- TAB 6: ACTIVITY TIMELINE ---------------- */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <span>Operational Activity Stream</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Chronological audit of what happened around the idea (distinct from internal version diffs).
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5">
                  {(['all', 'founder', 'gemini', 'system'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setTimelineFilter(f)}
                      id={`btn-timeline-filter-${f}`}
                      className={`px-3 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
                        timelineFilter === f
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'bg-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Timeline Stream */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                {filteredTimelineEvents.map((ev) => (
                  <div key={ev.id} className="relative group">
                    {/* Node Dot */}
                    <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-slate-900 border-2 border-indigo-400 group-hover:border-cyan-300 transition-colors" />

                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 group-hover:border-white/20 transition-all">
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${ev.badgeColor}`}
                          >
                            {ev.badge}
                          </span>
                          <span className="text-xs font-semibold text-white">
                            {ev.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                          <span>By {ev.author}</span>
                          <span>·</span>
                          <span>{ev.timestamp}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {ev.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---------------- TAB 7: MULTI-IDEA ARCHIVE & SEARCH ---------------- */}
          {activeTab === 'archive' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Archive className="w-5 h-5 text-slate-300" />
                    <span>Multi-Idea Portfolio, Archive & Filter</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Search and filter across your active and archived hypotheses without toolchain bloat.
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {(['all', 'active', 'archived'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setPortfolioTab(tab)}
                      id={`btn-portfolio-tab-${tab}`}
                      className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                        portfolioTab === tab
                          ? 'bg-white/20 text-white font-semibold'
                          : 'bg-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tab.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-time Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={portfolioSearch}
                  onChange={(e) => setPortfolioSearch(e.target.value)}
                  placeholder="Search hypotheses by title, summary, or domain..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm liquid-glass-input text-white placeholder:text-slate-500"
                />
              </div>

              {/* Portfolio Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPortfolioIdeas.map((idea) => {
                  const isArchived = idea.status === 'archived';
                  return (
                    <div
                      key={idea.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isArchived
                          ? 'bg-white/[0.02] border-white/5 opacity-70'
                          : 'bg-white/[0.04] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                          {idea.tag}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                              isArchived
                                ? 'bg-slate-500/20 text-slate-300'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {idea.status.toUpperCase()}
                          </span>
                          <button
                            onClick={() => toggleArchiveIdea(idea.id)}
                            id={`btn-toggle-archive-${idea.id}`}
                            className="text-[11px] font-mono text-slate-400 hover:text-white underline cursor-pointer"
                          >
                            {isArchived ? 'Restore' : 'Archive'}
                          </button>
                        </div>
                      </div>

                      <h4 className="font-bold text-sm text-white mb-1.5">
                        {idea.title}
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed mb-4">
                        {idea.summary}
                      </p>

                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-3 border-t border-white/10">
                        <span>{idea.versions} Version Milestones</span>
                        <span>Confidence: {idea.confidenceScore}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. The IdeaForge Continuous Evolution Loop Connection */}
      <section className="mb-16 p-6 sm:p-8 rounded-3xl liquid-glass-surface border border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-mono text-indigo-300 uppercase tracking-widest block mb-2">
            The Holistic Workflow Connection
          </span>
          <h2 className="font-display text-2xl font-bold text-white mb-2">
            How Every Capability Unites in the Evolution Loop
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            IdeaForge is not an assortment of isolated widgets. Each capability directly feeds the next
            stage of hypothesis refinement.
          </p>
        </div>

        {/* 6-Stage Loop Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { step: '01', title: 'CAPTURE', desc: 'Raw spark ingested into private workspace', tab: 'workspace' as CapabilityId },
            { step: '02', title: 'CLARIFY', desc: 'Gemini questions narrow core value', tab: 'mentor' as CapabilityId },
            { step: '03', title: 'CHALLENGE', desc: 'Hidden assumptions isolated & ranked', tab: 'risk' as CapabilityId },
            { step: '04', title: 'EVIDENCE', desc: 'Tavily sweeps empirical web reality', tab: 'evidence' as CapabilityId },
            { step: '05', title: 'REVISE', desc: 'Founder makes sovereign strategic choice', tab: 'evolution' as CapabilityId },
            { step: '06', title: 'EVOLVE', desc: 'Immutable version committed to lineage', tab: 'timeline' as CapabilityId },
          ].map((st) => (
            <button
              key={st.step}
              onClick={() => handleTabSelect(st.tab)}
              id={`btn-loop-step-${st.step}`}
              className="text-left p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-400/40 transition-all cursor-pointer group"
            >
              <span className="text-[10px] font-mono text-indigo-400 block mb-1 group-hover:text-cyan-300">
                STAGE {st.step}
              </span>
              <strong className="text-xs font-display font-bold text-white block mb-1">
                {st.title}
              </strong>
              <p className="text-[11px] text-slate-400 leading-tight">
                {st.desc}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* 6. Page Closing Single Primary CTA */}
      <section className="text-center p-8 sm:p-12 rounded-3xl liquid-glass-surface border border-white/10 relative overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div
          className="absolute inset-0 pointer-events-none bg-radial from-indigo-500/10 via-transparent to-transparent"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready To Stop Forgetting Why Decisions Were Made?</span>
          </span>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Launch Your Private IdeaForge Workspace
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Begin evolving ideas with grounded history, Socratic Gemini intelligence, and private
            per-user Firestore storage.
          </p>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onLaunch}
              id="btn-services-cta-launch"
              className="w-full sm:w-auto px-7 py-3 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:shadow-[0_0_30px_rgba(99,102,241,0.55)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Launch IdeaForge</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                id="btn-services-cta-home"
                className="w-full sm:w-auto px-6 py-3 rounded-full text-sm font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
              >
                <span>Back to Overview</span>
              </button>
            )}

            {onNavigateCreator && (
              <button
                onClick={onNavigateCreator}
                id="btn-services-cta-creator"
                className="w-full sm:w-auto px-6 py-3 rounded-full text-sm font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
              >
                <span>Meet the Creator</span>
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
