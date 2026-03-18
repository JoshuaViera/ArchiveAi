"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// ─── QUESTIONNAIRE DATA ─────────────────────────────────────

const ARCHETYPES = [
  {
    id: "storyteller",
    icon: "📖",
    label: "The Storyteller",
    desc: "Personal anecdotes, vulnerability, narrative arcs",
    example: "\"I lost my biggest client last Tuesday. Not because of price...\"",
  },
  {
    id: "teacher",
    icon: "🧠",
    label: "The Teacher",
    desc: "Frameworks, how-tos, tactical breakdowns",
    example: "\"The framework that doubled my consulting rate in 6 months: 1. Track every hour...\"",
  },
  {
    id: "provocateur",
    icon: "🔥",
    label: "The Provocateur",
    desc: "Hot takes, contrarian views, bold claims",
    example: "\"Unpopular opinion: Most consultants don't have a lead gen problem.\"",
  },
  {
    id: "curator",
    icon: "📋",
    label: "The Curator",
    desc: "Lists, roundups, distilled insights",
    example: "\"5 things I wish I knew before going solo: →...\"",
  },
  {
    id: "connector",
    icon: "🤝",
    label: "The Connector",
    desc: "Questions, discussions, community-building",
    example: "\"What's the one thing you changed this year that had the biggest impact?\"",
  },
];

const QUESTIONS = [
  {
    id: "tone",
    question: "How do you want to come across?",
    type: "multi",
    options: [
      { id: "confident", label: "Confident" },
      { id: "conversational", label: "Conversational" },
      { id: "vulnerable", label: "Vulnerable" },
      { id: "authoritative", label: "Authoritative" },
      { id: "witty", label: "Witty" },
      { id: "empathetic", label: "Empathetic" },
    ],
  },
  {
    id: "vocabulary",
    question: "How technical is your language?",
    type: "single",
    options: [
      { id: "plain", label: "Plain language", desc: "Like explaining to a friend over coffee" },
      { id: "moderate", label: "Moderate", desc: "Some industry terms, but accessible" },
      { id: "technical", label: "Technical", desc: "Deep domain jargon, expert audience" },
    ],
  },
  {
    id: "structure",
    question: "What's your paragraph style?",
    type: "single",
    options: [
      { id: "punchy", label: "Short & punchy", desc: "1-2 sentence paragraphs, lots of white space" },
      { id: "mixed", label: "Mixed", desc: "Varying lengths, some short, some longer" },
      { id: "longform", label: "Long-form", desc: "Meaty paragraphs, detailed explanations" },
    ],
  },
  {
    id: "hooks",
    question: "How do you usually open a post?",
    type: "multi",
    options: [
      { id: "anecdote", label: "Personal anecdote" },
      { id: "contrarian", label: "Contrarian claim" },
      { id: "datapoint", label: "A specific data point" },
      { id: "question", label: "A question" },
      { id: "promise", label: "Promise of outcome" },
      { id: "observation", label: "An observation" },
    ],
  },
  {
    id: "topics",
    question: "What do you primarily write about?",
    type: "multi",
    options: [
      { id: "leadership", label: "Leadership" },
      { id: "entrepreneurship", label: "Entrepreneurship" },
      { id: "consulting", label: "Consulting / Freelancing" },
      { id: "marketing", label: "Marketing / Growth" },
      { id: "tech", label: "Technology / AI" },
      { id: "career", label: "Career Development" },
      { id: "productivity", label: "Productivity" },
      { id: "sales", label: "Sales" },
    ],
  },
  {
    id: "formatting",
    question: "Which formatting quirks fit your style?",
    type: "multi",
    options: [
      { id: "no-hashtags", label: "No hashtags" },
      { id: "no-emojis", label: "No emojis" },
      { id: "em-dashes", label: "Em-dashes (—)" },
      { id: "arrows", label: "Arrows (→)" },
      { id: "numbered-lists", label: "Numbered lists" },
      { id: "one-liners", label: "One-line paragraphs for emphasis" },
    ],
  },
];

const TOTAL_STEPS = 4; // archetype, questions, writing samples, generating

// ─── COMPONENTS ─────────────────────────────────────────────

function StepIndicator({ current, total }) {
  return (
    <div className="flex gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="h-1 rounded-full flex-1 transition-all duration-300"
          style={{
            background: i <= current
              ? "linear-gradient(90deg, #7C6AEF, #9B8DF5)"
              : "#262936",
          }}
        />
      ))}
    </div>
  );
}

function ArchetypeCard({ archetype, selected, onClick }) {
  const isSelected = selected === archetype.id;
  return (
    <motion.button
      onClick={() => onClick(archetype.id)}
      className={`w-full text-left p-5 rounded-xl border cursor-pointer transition-all ${
        isSelected
          ? "bg-accent/10 border-accent/25"
          : "bg-surface border-border hover:border-border-hi"
      }`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-start gap-4">
        <span className="text-2xl mt-0.5">{archetype.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-text-primary">{archetype.label}</span>
            {isSelected && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-accent/20 text-accent-light">
                SELECTED
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted m-0 mb-2">{archetype.desc}</p>
          <p className="text-xs text-text-dim m-0 italic">{archetype.example}</p>
        </div>
      </div>
    </motion.button>
  );
}

function QuestionCard({ question, answers, onAnswer }) {
  const current = answers[question.id] || (question.type === "multi" ? [] : null);

  const toggle = (optId) => {
    if (question.type === "single") {
      onAnswer(question.id, optId);
    } else {
      const arr = Array.isArray(current) ? current : [];
      onAnswer(
        question.id,
        arr.includes(optId) ? arr.filter((x) => x !== optId) : [...arr, optId]
      );
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-base font-semibold mb-1 text-text-primary">{question.question}</h3>
      <p className="text-xs text-text-dim mb-4 m-0">
        {question.type === "multi" ? "Select all that apply" : "Choose one"}
      </p>
      <div className="flex flex-wrap gap-2">
        {question.options.map((opt) => {
          const isActive = question.type === "single"
            ? current === opt.id
            : Array.isArray(current) && current.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => toggle(opt.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border cursor-pointer transition-all ${
                isActive
                  ? "bg-accent/10 text-accent-light border-accent/25"
                  : "bg-transparent text-text-muted border-border hover:border-border-hi"
              }`}
            >
              {opt.label}
              {opt.desc && (
                <span className="block text-[10px] text-text-dim mt-0.5 font-normal">{opt.desc}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ──────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [archetype, setArchetype] = useState(null);
  const [answers, setAnswers] = useState({});
  const [samples, setSamples] = useState([{ content: "", source_label: "" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleAnswer = (qId, value) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const addSample = () => {
    if (samples.length < 5) {
      setSamples([...samples, { content: "", source_label: "" }]);
    }
  };

  const updateSample = (idx, field, value) => {
    const updated = [...samples];
    updated[idx] = { ...updated[idx], [field]: value };
    setSamples(updated);
  };

  const removeSample = (idx) => {
    setSamples(samples.filter((_, i) => i !== idx));
  };

  const canProceed = () => {
    if (step === 0) return !!archetype;
    if (step === 1) {
      // At least tone and vocabulary answered
      return answers.tone?.length > 0 && !!answers.vocabulary;
    }
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setStep(3); // show generating state

    // Build flat responses array for the API
    const responses = QUESTIONS.map((q) => ({
      question: q.question,
      questionId: q.id,
      answer: answers[q.id] || (q.type === "multi" ? [] : null),
    }));

    const writingSamples = samples.filter((s) => s.content.trim());

    try {
      const res = await fetch("/api/voice-questionnaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responses,
          archetype,
          writingSamples: writingSamples.length > 0 ? writingSamples : undefined,
        }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setStep(2); // go back
      } else {
        setResult(data);
        // Brief pause to show success, then redirect
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    } catch (e) {
      setError("Something went wrong. Please try again.");
      setStep(2);
    }
    setLoading(false);
  };

  const inputClass =
    "w-full px-4 py-3 rounded-lg text-sm bg-bg border border-border text-text-primary outline-none focus:border-accent";

  return (
    <div className="max-w-[620px] mx-auto py-4">
      <StepIndicator current={step} total={TOTAL_STEPS} />

      <AnimatePresence mode="wait">
        {/* ── STEP 0: Archetype ── */}
        {step === 0 && (
          <motion.div
            key="archetype"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h1 className="text-2xl font-bold mb-1 tracking-tight">What kind of writer are you?</h1>
            <p className="text-text-muted text-sm mb-6">
              Pick the archetype that best matches your LinkedIn style. This helps us build your voice profile even without an archive.
            </p>

            <div className="flex flex-col gap-3 mb-8">
              {ARCHETYPES.map((a) => (
                <ArchetypeCard
                  key={a.id}
                  archetype={a}
                  selected={archetype}
                  onClick={setArchetype}
                />
              ))}
            </div>

            <button
              onClick={() => setStep(1)}
              disabled={!canProceed()}
              className="w-full py-3 rounded-xl text-[15px] font-bold text-white border-none cursor-pointer transition-all"
              style={{
                background: canProceed()
                  ? "linear-gradient(135deg, #7C6AEF, #9B8DF5)"
                  : "#262936",
                cursor: canProceed() ? "pointer" : "not-allowed",
              }}
            >
              Continue →
            </button>
          </motion.div>
        )}

        {/* ── STEP 1: Voice Questions ── */}
        {step === 1 && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h1 className="text-2xl font-bold mb-1 tracking-tight">Dial in your voice</h1>
            <p className="text-text-muted text-sm mb-6">
              These answers shape how we write for you. No wrong answers — just pick what feels right.
            </p>

            <div className="bg-surface border border-border rounded-xl p-6 mb-6">
              {QUESTIONS.map((q) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  answers={answers}
                  onAnswer={handleAnswer}
                />
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(0)}
                className="px-6 py-3 rounded-xl text-sm font-semibold bg-transparent text-text-muted border border-border cursor-pointer hover:text-text-primary"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!canProceed()}
                className="flex-1 py-3 rounded-xl text-[15px] font-bold text-white border-none cursor-pointer"
                style={{
                  background: canProceed()
                    ? "linear-gradient(135deg, #7C6AEF, #9B8DF5)"
                    : "#262936",
                  cursor: canProceed() ? "pointer" : "not-allowed",
                }}
              >
                Continue →
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: Writing Samples ── */}
        {step === 2 && (
          <motion.div
            key="samples"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h1 className="text-2xl font-bold mb-1 tracking-tight">Got any writing samples?</h1>
            <p className="text-text-muted text-sm mb-6">
              Optional but powerful. Paste any writing that sounds like you — blog posts, emails, tweets, anything.
              The more we have, the better we match your voice.
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/25 rounded-lg px-4 py-3 mb-4 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-4 mb-6">
              {samples.map((sample, i) => (
                <div key={i} className="bg-surface border border-border rounded-xl p-5">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[11px] font-bold text-text-dim uppercase tracking-wider">
                      Sample {i + 1}
                    </label>
                    {samples.length > 1 && (
                      <button
                        onClick={() => removeSample(i)}
                        className="text-xs text-text-dim bg-transparent border-none cursor-pointer hover:text-red-400"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    value={sample.source_label}
                    onChange={(e) => updateSample(i, "source_label", e.target.value)}
                    placeholder="Source (e.g. Blog post, Newsletter, Tweet)"
                    className={`${inputClass} mb-3`}
                  />
                  <textarea
                    value={sample.content}
                    onChange={(e) => updateSample(i, "content", e.target.value)}
                    placeholder="Paste your writing here..."
                    rows={5}
                    className={inputClass}
                    style={{ resize: "vertical", lineHeight: 1.6, fontFamily: "inherit" }}
                  />
                </div>
              ))}
            </div>

            {samples.length < 5 && (
              <button
                onClick={addSample}
                className="text-sm text-accent-light bg-transparent border border-accent/25 rounded-lg px-4 py-2 cursor-pointer mb-6 hover:bg-accent/5"
              >
                + Add another sample
              </button>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-xl text-sm font-semibold bg-transparent text-text-muted border border-border cursor-pointer hover:text-text-primary"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 rounded-xl text-[15px] font-bold text-white border-none cursor-pointer"
                style={{ background: "linear-gradient(135deg, #7C6AEF, #9B8DF5)" }}
              >
                Build My Voice Profile ✦
              </button>
            </div>

            <p className="text-xs text-text-dim text-center mt-4">
              No samples? No problem — skip this and we'll build from your questionnaire answers.
            </p>
          </motion.div>
        )}

        {/* ── STEP 3: Generating ── */}
        {step === 3 && (
          <motion.div
            key="generating"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center py-16"
          >
            {!result ? (
              <>
                <div
                  className="w-12 h-12 border-[3px] border-border rounded-full mx-auto mb-6"
                  style={{
                    borderTopColor: "#7C6AEF",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <h2 className="text-xl font-bold mb-2">Building your voice profile</h2>
                <p className="text-sm text-text-muted max-w-sm mx-auto">
                  Analyzing your archetype, style preferences, and writing samples to create a unique voice fingerprint...
                </p>
              </>
            ) : (
              <>
                <div className="text-5xl mb-4">✦</div>
                <h2 className="text-xl font-bold mb-2 text-emerald-400">Voice profile created</h2>
                <p className="text-sm text-text-muted mb-6 max-w-md mx-auto">
                  {result.profile?.summary || "Your bootstrap voice profile is ready."}
                </p>
                {result.profile?.traits?.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    {result.profile.traits.map((t, i) => (
                      <span
                        key={i}
                        className="text-xs px-3 py-1.5 rounded-full bg-accent/10 text-accent-light border border-accent/25"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-text-dim">
                  {result.confidenceLevel === "bootstrap-only"
                    ? "Confidence: Bootstrap — upload your LinkedIn archive to unlock full voice matching."
                    : `Confidence: ${result.confidenceLevel} — ${result.postCount} posts analyzed.`}
                </p>
                <p className="text-xs text-text-dim mt-2">Redirecting to dashboard...</p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
