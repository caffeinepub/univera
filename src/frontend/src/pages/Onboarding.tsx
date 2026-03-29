import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { PERSONALITY_QUESTIONS, PERSONALITY_RESULTS } from "../data/mockData";

const OPTIONS = [
  "Strongly Disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly Agree",
];

export function Onboarding() {
  const navigate = useNavigate();
  const { setUser, user } = useApp();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [done, setDone] = useState(false);
  const [direction, setDirection] = useState(1);

  const q = PERSONALITY_QUESTIONS[current];
  const progress = ((current + 1) / PERSONALITY_QUESTIONS.length) * 100;

  const handleAnswer = (val: number) => {
    setAnswers((p) => ({ ...p, [q.id]: val }));
  };

  const handleNext = () => {
    if (current < PERSONALITY_QUESTIONS.length - 1) {
      setDirection(1);
      setCurrent((p) => p + 1);
    } else {
      const avgScore =
        Object.values(answers).reduce((a, b) => a + b, 0) /
        Object.values(answers).length;
      let key: keyof typeof PERSONALITY_RESULTS;
      if (avgScore >= 3.5) key = "high_extro";
      else if (avgScore <= 2.5) key = "high_intro";
      else key = "balanced";
      const result = PERSONALITY_RESULTS[key];
      if (user)
        setUser({
          ...user,
          personality: result.type,
          personalityTags: result.tags,
        });
      setDone(true);
    }
  };

  const handleBack = () => {
    if (current > 0) {
      setDirection(-1);
      setCurrent((p) => p - 1);
    }
  };

  if (done) {
    const avgScore =
      Object.values(answers).reduce((a, b) => a + b, 0) /
      (Object.values(answers).length || 1);
    let key: keyof typeof PERSONALITY_RESULTS;
    if (avgScore >= 3.5) key = "high_extro";
    else if (avgScore <= 2.5) key = "high_intro";
    else key = "balanced";
    const result = PERSONALITY_RESULTS[key];

    return (
      <div className="app-shell bg-app flex flex-col items-center justify-center px-6 text-center gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="space-y-6"
        >
          <div className="text-6xl">🌟</div>
          <div>
            <p className="text-sm text-primary font-semibold mb-2">
              Your Personality Type
            </p>
            <h2 className="font-display text-3xl font-black text-gradient-violet mb-3">
              {result.type}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {result.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {result.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-full text-sm font-semibold glass-dark text-primary neon-border-violet"
              >
                {tag}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={() => navigate({ to: "/app" })}
            className="w-full py-4 rounded-2xl font-bold text-lg text-white shadow-btn-violet"
            style={{ background: "linear-gradient(135deg, #7C3AED, #EC4899)" }}
            data-ocid="onboarding.submit_button"
          >
            Start Discovering 🚀
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="app-shell bg-app flex flex-col">
      {/* Header */}
      <header className="glass-dark px-6 py-4 flex items-center gap-4">
        <button
          type="button"
          onClick={handleBack}
          disabled={current === 0}
          className="text-muted-foreground disabled:opacity-30"
          data-ocid="onboarding.cancel_button"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>
              Question {current + 1} of {PERSONALITY_QUESTIONS.length}
            </span>
            <span>{q.category}</span>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <motion.div
              className="h-2 rounded-full"
              style={{ background: "linear-gradient(90deg, #7C3AED, #EC4899)" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center px-6 gap-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="font-display text-2xl font-bold text-foreground leading-snug mb-8">
              {q.text}
            </h2>
            <div className="flex flex-col gap-3" data-ocid="onboarding.panel">
              {OPTIONS.map((opt, i) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => handleAnswer(i + 1)}
                  className={`py-3.5 px-5 rounded-xl font-semibold text-sm text-left transition-all border ${
                    answers[q.id] === i + 1
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-border bg-input text-foreground hover:border-primary/50"
                  }`}
                  data-ocid={`onboarding.item.${i + 1}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="px-6 pb-8">
        <button
          type="button"
          onClick={handleNext}
          disabled={!answers[q.id]}
          className="w-full py-4 rounded-2xl font-bold text-lg text-white disabled:opacity-40 flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #7C3AED, #EC4899)" }}
          data-ocid="onboarding.submit_button"
        >
          {current < PERSONALITY_QUESTIONS.length - 1 ? (
            <>
              <span>Next</span>
              <ChevronRight size={20} />
            </>
          ) : (
            "See My Result ✨"
          )}
        </button>
      </div>
    </div>
  );
}
