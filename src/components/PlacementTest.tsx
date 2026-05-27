import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Brain,
  Award,
  X,
  BookOpen,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

interface Question {
  id: number;
  text: string;
  options: string[];
  correct: number;
  section: "Vocabulary" | "Grammar" | "Reading";
  level: string;
}

const questions: Question[] = [
  // Section 1: Vocabulary
  {
    id: 1,
    text: "I _____ to school every day.",
    options: ["go", "going", "went", "goes"],
    correct: 0,
    section: "Vocabulary",
    level: "A1",
  },
  {
    id: 2,
    text: "She _____ already finished her homework.",
    options: ["have", "has", "is", "was"],
    correct: 1,
    section: "Vocabulary",
    level: "A2",
  },
  {
    id: 3,
    text: "The meeting was _____ because we solved everything.",
    options: ["productive", "pretty", "big", "slow"],
    correct: 0,
    section: "Vocabulary",
    level: "B1",
  },
  {
    id: 4,
    text: "He tends to _____ the rules when no one is watching.",
    options: ["overlook", "oversee", "overview", "overdo"],
    correct: 0,
    section: "Vocabulary",
    level: "B2",
  },
  {
    id: 5,
    text: "The policy was met with widespread _____.",
    options: ["criticism", "criticize", "critical", "critic"],
    correct: 0,
    section: "Vocabulary",
    level: "C1",
  },
  {
    id: 6,
    text: "Choose the word meaning 'impossible to change':",
    options: ["immutable", "immense", "imminent", "immortal"],
    correct: 0,
    section: "Vocabulary",
    level: "C2",
  },
  {
    id: 7,
    text: "We _____ TV when the lights went out.",
    options: ["watched", "were watching", "have watched", "watch"],
    correct: 1,
    section: "Vocabulary",
    level: "B1",
  },
  {
    id: 8,
    text: "Choose the correct word: 'She gave a _____ speech.'",
    options: ["moving", "moved", "moves", "move"],
    correct: 0,
    section: "Vocabulary",
    level: "B2",
  },
  {
    id: 9,
    text: "Which is correct?",
    options: ["I am agree", "I agree", "I agreeing", "I am agreed"],
    correct: 1,
    section: "Vocabulary",
    level: "A2",
  },
  {
    id: 10,
    text: "'Notwithstanding' means:",
    options: ["despite", "therefore", "however", "because"],
    correct: 0,
    section: "Vocabulary",
    level: "C1",
  },

  // Section 2: Grammar
  {
    id: 11,
    text: "_____ is your name?",
    options: ["What", "Who", "Where", "How"],
    correct: 0,
    section: "Grammar",
    level: "A1",
  },
  {
    id: 12,
    text: "They _____ football yesterday.",
    options: ["played", "play", "plays", "playing"],
    correct: 0,
    section: "Grammar",
    level: "A1",
  },
  {
    id: 13,
    text: "If I _____ rich, I would travel the world.",
    options: ["am", "was", "were", "be"],
    correct: 2,
    section: "Grammar",
    level: "B2",
  },
  {
    id: 14,
    text: "She suggested _____ early.",
    options: ["leave", "leaving", "to leave", "left"],
    correct: 1,
    section: "Grammar",
    level: "B1",
  },
  {
    id: 15,
    text: "By next year, I _____ here for a decade.",
    options: ["work", "will work", "will have worked", "worked"],
    correct: 2,
    section: "Grammar",
    level: "C1",
  },
  {
    id: 16,
    text: "_____ having studied hard, she failed the exam.",
    options: ["Despite", "Although", "Because", "Since"],
    correct: 0,
    section: "Grammar",
    level: "B2",
  },
  {
    id: 17,
    text: "The report _____ by the team last week.",
    options: ["was written", "wrote", "has written", "is written"],
    correct: 0,
    section: "Grammar",
    level: "B1",
  },
  {
    id: 18,
    text: "I wish I _____ more time yesterday.",
    options: ["have", "had", "would have", "will have"],
    correct: 1,
    section: "Grammar",
    level: "B2",
  },
  {
    id: 19,
    text: "He asked me where _____ from.",
    options: ["I come", "do I come", "I came", "came I"],
    correct: 2,
    section: "Grammar",
    level: "B2",
  },
  {
    id: 20,
    text: "_____ the storm, the event continued.",
    options: ["In spite of", "Despite of", "Although", "Even"],
    correct: 0,
    section: "Grammar",
    level: "C1",
  },

  // Section 3: Reading
  {
    id: 21,
    text: "What is the main topic of the passage?",
    options: [
      "Remote work",
      "Office design",
      "Work uniforms",
      "Company profits",
    ],
    correct: 0,
    section: "Reading",
    level: "Comprehension",
  },
  {
    id: 22,
    text: "'Proponents' means:",
    options: ["supporters", "opponents", "managers", "workers"],
    correct: 0,
    section: "Reading",
    level: "B2",
  },
  {
    id: 23,
    text: "What do critics say?",
    options: [
      "It hurts teamwork",
      "It saves money",
      "It is popular",
      "It is cheap",
    ],
    correct: 0,
    section: "Reading",
    level: "Comprehension",
  },
  {
    id: 24,
    text: "'Blurs professional boundaries' means:",
    options: [
      "makes work-life separation unclear",
      "makes offices bigger",
      "improves salaries",
      "reduces travel",
    ],
    correct: 0,
    section: "Reading",
    level: "B2",
  },
  {
    id: 25,
    text: "What must companies maintain?",
    options: [
      "Corporate culture",
      "Office size",
      "Working hours",
      "Salary levels",
    ],
    correct: 0,
    section: "Reading",
    level: "Comprehension",
  },
];

const READING_PASSAGE =
  "The rise of remote work has fundamentally altered the dynamics of modern employment. While proponents argue that it enhances productivity and work-life balance, critics contend that it undermines team cohesion and blurs professional boundaries. Companies must now navigate the challenge of maintaining corporate culture in a distributed environment.";

interface PlacementTestProps {
  onComplete: (level: string) => void;
  onCancel: () => void;
}

export default function PlacementTest({
  onComplete,
  onCancel,
}: PlacementTestProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const handleAnswer = (optionIndex: number) => {
    if (optionIndex === questions[currentStep].correct) {
      setScore((prev) => prev + 1);
    }

    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setFinished(true);
    }
  };

  const getLevelInfo = (finalScore: number) => {
    if (finalScore <= 5)
      return {
        level: "A1",
        name: "Beginner",
        desc: "You can understand and use basic everyday expressions and very simple phrases.",
        recommend: "A1 Starter Course",
      };
    if (finalScore <= 10)
      return {
        level: "A2",
        name: "Elementary",
        desc: "You can understand sentences and frequently used expressions related to areas of most immediate relevance.",
        recommend: "A2 Elementary Topics",
      };
    if (finalScore <= 15)
      return {
        level: "B1",
        name: "Intermediate",
        desc: "You can understand the main points of clear standard input on familiar matters regularly encountered.",
        recommend: "B1 Intermediate Path",
      };
    if (finalScore <= 19)
      return {
        level: "B2",
        name: "Upper Intermediate",
        desc: "You can understand the main ideas of complex text on both concrete and abstract topics.",
        recommend: "B2 Professional English",
      };
    if (finalScore <= 22)
      return {
        level: "C1",
        name: "Advanced",
        desc: "You can understand a wide range of demanding, longer texts, and recognize implicit meaning.",
        recommend: "C1 Academic English",
      };
    return {
      level: "C2",
      name: "Proficient",
      desc: "You can understand with ease virtually everything heard or read.",
      recommend: "C2 Mastery Program",
    };
  };

  const result = getLevelInfo(score);
  const currentQuestion = questions[currentStep];

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onCancel}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-2xl rounded-5xl shadow-2xl relative z-10 overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {!finished ? (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-10"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic font-serif text-slate-900">
                      Level Finder Test
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                      Section: {currentQuestion.section} • {currentStep + 1} of{" "}
                      {questions.length}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onCancel}
                  className="p-2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-8">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentStep + 1) / questions.length) * 100}%`,
                  }}
                  className="h-full bg-indigo-600 shadow-sm"
                />
              </div>

              {currentQuestion.section === "Reading" && (
                <div className="mb-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen size={14} className="text-indigo-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Reading Passage
                    </span>
                  </div>
                  <p className="text-slate-700 font-medium leading-relaxed italic">
                    "{READING_PASSAGE}"
                  </p>
                </div>
              )}

              <div className="mb-8">
                <h4 className="text-lg font-bold text-slate-800 leading-relaxed">
                  {currentQuestion.text}
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className="w-full p-4 bg-white border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50/50 rounded-2xl text-left font-bold text-slate-600 transition-all flex items-center justify-between group"
                  >
                    <span>{option}</span>
                    <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-indigo-600 group-hover:bg-indigo-600 transition-all" />
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 text-center"
            >
              <div className="w-24 h-24 bg-indigo-600 shadow-2xl shadow-indigo-200 rounded-4xl flex items-center justify-center text-white mx-auto mb-8 transform hover:rotate-3 transition-transform">
                <Award size={48} />
              </div>

              <h3 className="text-4xl font-black italic font-serif text-slate-900 mb-2">
                Diagnostic Complete
              </h3>
              <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto italic">
                Based on your performance in Vocabulary, Grammar, and Reading,
                here is your level:
              </p>

              <div className="bg-slate-900 px-12 py-10 rounded-6xl inline-block mb-12 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity" />
                <div className="relative z-10">
                  <div className="text-6xl font-black text-white italic tracking-tighter mb-1">
                    {result.level}
                  </div>
                  <div className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em]">
                    {result.name}
                  </div>
                </div>
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
              </div>

              <div className="max-w-md mx-auto mb-10 text-left bg-slate-50 p-8 rounded-3xl border border-slate-100">
                <p className="text-slate-700 font-medium leading-relaxed mb-4">
                  {result.desc}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                    Recommended Start:
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    {result.recommend}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onComplete(result.level)}
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl shadow-indigo-100 group"
              >
                Start Learning Now{" "}
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
