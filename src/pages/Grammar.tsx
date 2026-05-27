import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, ChevronRight, CheckCircle2, AlertCircle, PlayCircle, GraduationCap, ArrowRight, X, Sparkles } from 'lucide-react';
import GrammarLesson from '../components/GrammarLesson';

interface GrammarQuiz {
  question: string;
  options: string[];
  correct: number;
}

interface GrammarTopic {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  explanation: string;
  formula: string;
  examples: {
    positive: string;
    negative: string;
    question: string;
  };
  commonMistakes: string[];
  quiz: GrammarQuiz[];
}

const grammarTopics: GrammarTopic[] = [
  // BEGINNER (A1-A2)
  {
    id: 'to-be',
    title: 'To Be (am/is/are)',
    level: 'Beginner',
    explanation: 'The verb "to be" is the most common verb in English. It is used to describe subjects.',
    formula: 'Subject + am/is/are + Complement',
    examples: {
      positive: 'I am a student. She is a teacher.',
      negative: 'They are not at home.',
      question: 'Are you hungry?'
    },
    commonMistakes: [
      'I is a student. (Correct: I am)',
      'They am happy. (Correct: They are)'
    ],
    quiz: [
      { question: 'She ___ my best friend.', options: ['am', 'is', 'are'], correct: 1 },
      { question: '___ they at school yesterday?', options: ['Are', 'Is', 'Were'], correct: 2 },
      { question: 'I ___ not a doctor.', options: ['am', 'is', 'are'], correct: 0 }
    ]
  },
  {
    id: 'present-simple',
    title: 'Present Simple',
    level: 'Beginner',
    explanation: 'Used for habits, facts, and general truths.',
    formula: 'Subject + Verb (s/es for 3rd person) + Object',
    examples: {
      positive: 'I play football every Saturday. He works in an office.',
      negative: 'I do not like chocolate. She does not play tennis.',
      question: 'Do you live in London? Does he speak English?'
    },
    commonMistakes: [
      'He work in a bank. (Correct: He works)',
      'She don\'t know. (Correct: She doesn\'t know)'
    ],
    quiz: [
      { question: 'He ___ to the gym regularly.', options: ['go', 'goes', 'going'], correct: 1 },
      { question: '___ you like pizza?', options: ['Do', 'Does', 'Are'], correct: 0 },
      { question: 'They ___ not live here.', options: ['do', 'does', 'are'], correct: 0 }
    ]
  },
  {
    id: 'past-simple',
    title: 'Past Simple',
    level: 'Beginner',
    explanation: 'Used for completed actions in the past.',
    formula: 'Subject + Verb-ed (or irregular) + Object',
    examples: {
      positive: 'I visited Paris last year. He went to the store.',
      negative: 'I did not see him. She didn\'t study.',
      question: 'Did you watch the movie? Where did they go?'
    },
    commonMistakes: [
      'I didn\'t went. (Correct: I didn\'t go)',
      'She seed him. (Correct: She saw him)'
    ],
    quiz: [
      { question: 'I ___ a movie last night.', options: ['watch', 'watched', 'watching'], correct: 1 },
      { question: 'Did you ___ your homework?', options: ['do', 'did', 'done'], correct: 0 },
      { question: 'They ___ to the park yesterday.', options: ['go', 'goed', 'went'], correct: 2 }
    ]
  },
  {
    id: 'articles',
    title: 'Articles (a/an/the)',
    level: 'Beginner',
    explanation: 'Used before nouns to specify or generalize.',
    formula: 'a/an (singular/general), the (specific)',
    examples: {
      positive: 'I have an apple. The apple is red.',
      negative: 'I don\'t have a car.',
      question: 'Is there a bank near here?'
    },
    commonMistakes: [
      'I have a apple. (Correct: an apple)',
      'I like the music. (General) (Correct: I like music)'
    ],
    quiz: [
      { question: 'I saw ___ elephant at the zoo.', options: ['a', 'an', 'the'], correct: 1 },
      { question: '___ sun rises in the east.', options: ['A', 'An', 'The'], correct: 2 },
      { question: 'Can you pass me ___ salt?', options: ['a', 'an', 'the'], correct: 2 }
    ]
  },

  // INTERMEDIATE (B1-B2)
  {
    id: 'present-continuous',
    title: 'Present Continuous',
    level: 'Intermediate',
    explanation: 'Used for actions happening right now or around this time.',
    formula: 'Subject + am/is/are + Verb-ing',
    examples: {
      positive: 'I am reading a book. They are watching a movie.',
      negative: 'She is not working today.',
      question: 'What are you doing?'
    },
    commonMistakes: [
      'I reading now. (Correct: I am reading)',
      'They are play. (Correct: They are playing)'
    ],
    quiz: [
      { question: 'Look! It ___ outside.', options: ['rains', 'is raining', 'raining'], correct: 1 },
      { question: 'What ___ she cooking?', options: ['is', 'are', 'does'], correct: 0 },
      { question: 'We ___ studying for the exam.', options: ['am', 'is', 'are'], correct: 2 }
    ]
  },
  {
    id: 'present-perfect',
    title: 'Present Perfect',
    level: 'Intermediate',
    explanation: 'Connects the past to the present (experience, change over time, or recent action).',
    formula: 'Subject + have/has + Past Participle',
    examples: {
      positive: 'I have been to London. She has finished her work.',
      negative: 'They haven\'t seen the movie yet.',
      question: 'Have you ever eaten sushi?'
    },
    commonMistakes: [
      'I have went there. (Correct: I have gone)',
      'She has finish. (Correct: She has finished)'
    ],
    quiz: [
      { question: 'I ___ my keys! I can\'t find them.', options: ['lose', 'lost', 'have lost'], correct: 2 },
      { question: '___ you ever visited Japan?', options: ['Have', 'Did', 'Has'], correct: 0 },
      { question: 'She ___ here for five years.', options: ['worked', 'is working', 'has worked'], correct: 2 }
    ]
  },
  {
    id: 'conditionals',
    title: 'Conditionals (0, 1st, 2nd)',
    level: 'Intermediate',
    explanation: 'Conditionals are used to talk about real or imaginary situations and their results.',
    formula: 'If + Condition, Result',
    examples: {
      positive: 'If it rains, I will stay home. If I were you, I would go.',
      negative: 'If you don\'t study, you won\'t pass.',
      question: 'If you won the lottery, what would you buy?'
    },
    commonMistakes: [
      'If I will see him, I\'ll tell him. (Correct: If I see him)',
      'If I am you, I would leave. (Correct: If I were you)'
    ],
    quiz: [
      { question: 'If you heat ice, it ___.', options: ['melts', 'will melt', 'melted'], correct: 0 },
      { question: 'If she ___ hard, she will pass.', options: ['study', 'studies', 'will study'], correct: 1 },
      { question: 'I would go if I ___ more time.', options: ['have', 'had', 'will have'], correct: 1 }
    ]
  },
  {
    id: 'passive-voice',
    title: 'Passive Voice',
    level: 'Intermediate',
    explanation: 'Used when the object of the action is more important than the subject.',
    formula: 'Object + be + Past Participle',
    examples: {
      positive: 'The house was built in 1990. English is spoken here.',
      negative: 'The letters weren\'t sent.',
      question: 'When was this book written?'
    },
    commonMistakes: [
      'The car was repair. (Correct: was repaired)',
      'The homework did by him. (Correct: was done by him)'
    ],
    quiz: [
      { question: 'The window ___ by the wind.', options: ['broke', 'is broken', 'was broken'], correct: 2 },
      { question: 'Millions of emails ___ every day.', options: ['send', 'is sent', 'are sent'], correct: 2 },
      { question: 'Our lunch ___ by a chef.', options: ['prepares', 'is being prepared', 'is preparing'], correct: 1 }
    ]
  },

  // ADVANCED (C1-C2)
  {
    id: 'mixed-conditionals',
    title: 'Mixed Conditionals',
    level: 'Advanced',
    explanation: 'Used to connect the past and the present (past result of a present condition or vice versa).',
    formula: 'If + Condition (Past Perfect), Result (Present Conditional)',
    examples: {
      positive: 'If I had studied harder (past), I would be a doctor now (present).',
      negative: 'If he weren\'t so lazy, he would have finished the project.',
      question: 'Would you be here if you hadn\'t missed the train?'
    },
    commonMistakes: [
      'If I would have studied, I am happy. (Correct: If I had studied, I would be happy)'
    ],
    quiz: [
      { question: 'If I ___ the map, we wouldn\'t be lost now.', options: ['didn\'t forget', 'hadn\'t forgotten', 'haven\'t forgotten'], correct: 1 },
      { question: 'He wouldn\'t be tired if he ___ to bed earlier.', options: ['went', 'had gone', 'has gone'], correct: 1 },
      { question: 'If they were rich, they ___ that house earlier.', options: ['would buy', 'would have bought', 'will buy'], correct: 1 }
    ]
  },
  {
    id: 'inversion',
    title: 'Inversion',
    level: 'Advanced',
    explanation: 'Reversing the subject and verb to add emphasis or in formal writing.',
    formula: 'Negative Adverb + Auxiliary Verb + Subject',
    examples: {
      positive: 'Never have I seen such a beautiful view. Rarely do we see him.',
      negative: 'Not only did he arrive late, but he also forgot his notes.',
      question: 'Under no circumstances should you open the door.'
    },
    commonMistakes: [
      'Never I have see. (Correct: Never have I seen)',
      'Rarely he comes. (Correct: Rarely does he come)'
    ],
    quiz: [
      { question: 'Rarely ___ such a good performance.', options: ['we see', 'do we see', 'we do see'], correct: 1 },
      { question: 'Under no circumstances ___ the room.', options: ['you should leave', 'should you leave', 'shall you leave'], correct: 1 },
      { question: 'Little ___ what was about to happen.', options: ['did he know', 'he knew', 'has he known'], correct: 0 }
    ]
  },
  {
    id: 'cleft-sentences',
    title: 'Cleft Sentences',
    level: 'Advanced',
    explanation: 'Used to focus on specific information in a sentence.',
    formula: 'It + is/was + [Focused Part] + that/who...',
    examples: {
      positive: 'It was my brother who told me. What I need is a coffee.',
      negative: 'It wasn\'t the money that mattered.',
      question: 'Was it you who called me?'
    },
    commonMistakes: [
      'What I need it is help. (Correct: What I need is help)',
    ],
    quiz: [
      { question: 'It was ___ who found the keys.', options: ['I', 'me', 'my'], correct: 1 },
      { question: 'What she loves ___ long walks on the beach.', options: ['is', 'are', 'it is'], correct: 0 },
      { question: 'All I wanted ___ a simple apology.', options: ['is', 'was', 'were'], correct: 1 }
    ]
  },
  {
    id: 'subjunctive-mood',
    title: 'Subjunctive Mood',
    level: 'Advanced',
    explanation: 'Used to express wishes, suggestions, or hypothetical situations.',
    formula: 'Verb (base form) for suggestions / were for hypotheticals',
    examples: {
      positive: 'I suggest that he be on time. If I were you, I would go.',
      negative: 'It is important that he not forget.',
      question: 'Would it be better if he were here?'
    },
    commonMistakes: [
      'I suggest that he is here. (Formal) (Correct: be here)',
      'If I was you... (Informal, but Subjunctive uses "were")'
    ],
    quiz: [
      { question: 'I suggest that he ___ the meeting.', options: ['attend', 'attends', 'attended'], correct: 0 },
      { question: 'It is vital that she ___ about the plan.', options: ['know', 'knows', 'knowing'], correct: 0 },
      { question: 'If she ___ more careful, she wouldn\'t have tripped.', options: ['is', 'was', 'were'], correct: 2 }
    ]
  }
];

export default function Grammar() {
  const [selectedTopicId, setSelectedTopicId] = useState(grammarTopics[0].id);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  const selectedTopic = grammarTopics.find(t => t.id === selectedTopicId) || grammarTopics[0];

  const handleLevelChange = (topicId: string) => {
    setSelectedTopicId(topicId);
    setUserAnswers({});
    setShowQuizResults(false);
  };

  const handleQuizSubmit = () => {
    setShowQuizResults(true);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-zinc-100 hidden lg:flex flex-col pt-12">
        <div className="px-10 mb-10">
          <h2 className="text-3xl font-black italic font-serif flex items-center gap-3">
            <Book className="text-[#58007E]" size={28} /> Grammar
          </h2>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 pb-12 space-y-10 scrollbar-hide">
          {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
            <div key={lvl}>
               <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 mb-4">{lvl}</h3>
               <div className="space-y-1">
                 {grammarTopics.filter(t => t.level === lvl).map(topic => (
                   <button
                    key={topic.id}
                    onClick={() => handleLevelChange(topic.id)}
                    className={`w-full text-left px-5 py-4 rounded-2xl text-[11px] font-bold transition-all flex items-center justify-between group ${selectedTopicId === topic.id ? 'bg-[#58007E] text-white shadow-2xl shadow-[#58007E]/20' : 'text-zinc-600 hover:bg-zinc-50'}`}
                   >
                     {topic.title}
                     <ChevronRight size={14} className={`${selectedTopicId === topic.id ? 'text-white' : 'text-zinc-300 opacity-0 group-hover:opacity-100'}`} />
                   </button>
                 ))}
               </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pt-8 pb-24 px-4 md:px-16 scrollbar-hide">
        <div className="max-w-4xl mx-auto">
          
          {/* Mobile Topic Selector (visible only on lg:hidden) */}
          <div className="lg:hidden mb-8 bg-white p-5 rounded-3xl border border-zinc-100 shadow-md space-y-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="text-[#58007E]" size={20} />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Дүрмийн сэдэв сонгох (Grammar Topics)
              </h3>
            </div>
            
            <div className="relative">
              <select 
                value={selectedTopicId} 
                onChange={(e) => handleLevelChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 py-3 px-4 rounded-xl font-bold text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-purple-200 cursor-pointer"
              >
                {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                  <optgroup key={lvl} label={`${lvl === 'Beginner' ? '🟢 Beginner' : lvl === 'Intermediate' ? '🟡 Intermediate' : '🔴 Advanced'} хэсэг`}>
                    {grammarTopics.filter(t => t.level === lvl).map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.title}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                ▼
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTopic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <GrammarLesson 
                title={selectedTopic.title}
                explanation={selectedTopic.explanation}
                formula={selectedTopic.formula}
                examples={selectedTopic.examples}
                commonMistakes={selectedTopic.commonMistakes}
              />

              {/* Practice Quiz */}
              <div className="bg-white p-12 rounded-[48px] border border-zinc-100 shadow-sm">
                 <div className="flex justify-between items-center mb-10">
                    <h3 className="text-2xl font-black italic font-serif flex items-center gap-3">
                      <Sparkles className="text-amber-500" /> Mastery Check
                    </h3>
                    <div className="px-4 py-2 bg-zinc-50 rounded-xl text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      {selectedTopic.quiz.length} Interactive Tasks
                    </div>
                 </div>

                 <div className="space-y-10">
                    {selectedTopic.quiz.map((q, qIdx) => (
                      <div key={qIdx} className="space-y-5">
                         <div className="flex gap-4">
                            <span className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-black text-zinc-400 shrink-0">{qIdx + 1}</span>
                            <p className="text-sm font-black text-zinc-800 leading-relaxed pt-1.5">{q.question}</p>
                         </div>
                         <div className="grid sm:grid-cols-3 gap-4 pl-12">
                            {q.options.map((opt, oIdx) => (
                              <button
                                key={oIdx}
                                onClick={() => setUserAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                                disabled={showQuizResults}
                                className={`p-5 rounded-2xl text-[10px] font-black transition-all border-2 ${
                                  userAnswers[qIdx] === oIdx
                                    ? showQuizResults 
                                      ? oIdx === q.correct ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-red-50 border-red-500 text-red-600'
                                      : 'bg-[#58007E] border-[#58007E] text-white shadow-xl shadow-[#58007E]/10'
                                    : showQuizResults && oIdx === q.correct
                                      ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                                      : 'bg-zinc-50 border-transparent text-zinc-400 hover:border-zinc-200'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                         </div>
                      </div>
                    ))}
                 </div>

                 {!showQuizResults ? (
                   <button
                    onClick={handleQuizSubmit}
                    disabled={Object.keys(userAnswers).length < selectedTopic.quiz.length}
                    className="mt-12 w-full py-6 bg-[#141414] text-white rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-[#58007E] transition-all shadow-2xl disabled:opacity-30"
                   >
                     Validate Knowledge <ArrowRight size={18} />
                   </button>
                 ) : (
                   <button
                    onClick={() => {
                      setUserAnswers({});
                      setShowQuizResults(false);
                    }}
                    className="mt-12 w-full py-6 bg-zinc-100 text-zinc-400 rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all"
                   >
                     Retry Practice
                   </button>
                 )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
