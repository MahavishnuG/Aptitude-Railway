import React, { useState, useRef, useEffect } from 'react';
import { Question } from '../types';
import { triggerSuccessHaptic, triggerWarningHaptic } from '../utils/haptics';
import { speakText, stopSpeaking, isSpeaking } from '../utils/speech';
import { saveNewQuestions } from '../utils/db';
import confetti from 'canvas-confetti';
import {
  Lightbulb,
  Zap,
  Volume2,
  VolumeX,
  CheckCircle2,
  XCircle,
  Languages,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface ReelsFeedProps {
  questions: Question[];
  isTamil: boolean;
  onToggleLanguage: () => void;
  completedIds: string[];
  onQuestionSolved: (questionId: string, isCorrect: boolean) => void;
  onOpenSocraticHint: (question: Question) => void;
  onQuestionsAdded?: (newQuestions: Question[]) => void;
  initialQuestionId?: string | null;
}

export const ReelsFeed: React.FC<ReelsFeedProps> = ({
  questions,
  isTamil,
  onToggleLanguage,
  completedIds,
  onQuestionSolved,
  onOpenSocraticHint,
  onQuestionsAdded,
  initialQuestionId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showSpeedTrick, setShowSpeedTrick] = useState<Record<string, boolean>>({});
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [fetchedTopics, setFetchedTopics] = useState<Record<string, boolean>>({});

  // Jump to initial question if provided
  useEffect(() => {
    if (initialQuestionId && containerRef.current) {
      const idx = questions.findIndex((q) => q.id === initialQuestionId);
      if (idx !== -1) {
        containerRef.current.scrollTo({
          top: idx * containerRef.current.clientHeight,
          behavior: 'smooth',
        });
        setCurrentIndex(idx);
      }
    }
  }, [initialQuestionId, questions]);

  // Track active slide on scroll snap
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const height = container.clientHeight;
      if (height > 0) {
        const index = Math.round(container.scrollTop / height);
        if (index >= 0 && index < questions.length && index !== currentIndex) {
          setCurrentIndex(index);
          stopSpeaking();
          setSpeakingId(null);
        }
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentIndex, questions.length]);

  // Requirement 3: Only trigger background API fetching when the local pool drops below 5 questions
  useEffect(() => {
    const remainingInFeed = questions.length - (currentIndex + 1);
    if (remainingInFeed < 5 && !isFetchingMore && questions[currentIndex]) {
      const activeTopic = questions[currentIndex].topic;
      if (!fetchedTopics[activeTopic]) {
        fetchNextBatchForTopic(activeTopic);
      }
    }
  }, [currentIndex, isFetchingMore, questions, fetchedTopics]);

  // Background fetch for next 10 questions for a topic
  const fetchNextBatchForTopic = async (topic: string) => {
    if (isFetchingMore) return;
    setIsFetchingMore(true);
    setFetchedTopics((prev) => ({ ...prev, [topic]: true }));

    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, count: 10 }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.questions) && data.questions.length > 0) {
          await saveNewQuestions(data.questions);
          if (onQuestionsAdded) {
            onQuestionsAdded(data.questions);
          }
        }
      }
    } catch (err) {
      console.warn('Auto-append question stream notice:', err);
    } finally {
      setIsFetchingMore(false);
    }
  };

  const scrollToNext = () => {
    if (containerRef.current && currentIndex < questions.length - 1) {
      containerRef.current.scrollTo({
        top: (currentIndex + 1) * containerRef.current.clientHeight,
        behavior: 'smooth',
      });
    }
  };

  const scrollToPrev = () => {
    if (containerRef.current && currentIndex > 0) {
      containerRef.current.scrollTo({
        top: (currentIndex - 1) * containerRef.current.clientHeight,
        behavior: 'smooth',
      });
    }
  };

  const handleSelectOption = (question: Question, optionIndex: number) => {
    if (selectedAnswers[question.id] !== undefined) return; // already answered

    setSelectedAnswers((prev) => ({ ...prev, [question.id]: optionIndex }));
    const isCorrect = optionIndex === question.correctIndex;

    if (isCorrect) {
      triggerSuccessHaptic();
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#1d4ed8', '#059669', '#d97706'],
        });
      } catch {}
    } else {
      triggerWarningHaptic();
    }

    onQuestionSolved(question.id, isCorrect);

    // Only trigger background API fetching when the local pool drops below 5 questions
    const remainingInFeed = questions.length - (currentIndex + 1);
    if (remainingInFeed < 5 && !fetchedTopics[question.topic] && !isFetchingMore) {
      fetchNextBatchForTopic(question.topic);
    }
  };

  const handleToggleSpeak = (question: Question) => {
    if (speakingId === question.id && isSpeaking()) {
      stopSpeaking();
      setSpeakingId(null);
    } else {
      setSpeakingId(question.id);
      const textToRead = isTamil
        ? `${question.questionTa}. விருப்பங்கள்: ${question.optionsTa.join(', ')}. குறுக்குவழி: ${question.speedTrickTa || question.speedTrickEn}`
        : `${question.questionEn}. Options: ${question.optionsEn.join(', ')}. Shortcut: ${question.speedTrickEn}`;

      speakText(
        textToRead,
        isTamil ? 'ta' : 'en',
        () => setSpeakingId(null),
        () => setSpeakingId(null)
      );
    }
  };

  return (
    <div className="relative w-full h-[calc(100dvh-4.25rem)] max-w-xl mx-auto overflow-hidden bg-[#F8FAFC]">
      {/* Scroll-Snap Vertical Reels Container */}
      <div
        ref={containerRef}
        id="reels-scroll-container"
        className="w-full h-full overflow-y-auto snap-y snap-mandatory no-scrollbar scroll-smooth"
      >
        {questions.map((q, qIndex) => {
          const userAnswer = selectedAnswers[q.id];
          const isAnswered = userAnswer !== undefined;
          const isSolvedBefore = completedIds.includes(q.id);
          const isTrickOpen = !!showSpeedTrick[q.id];
          const isPlayingThis = speakingId === q.id;

          return (
            <section
              key={q.id}
              id={`question-card-${q.id}`}
              className="w-full h-full snap-start flex flex-col justify-between p-4 sm:p-5 bg-white border-b border-slate-200 relative select-none"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold tracking-wider px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                      RRB {q.rrbExam}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                      {q.topic}
                    </span>
                    {q.isSpeedTrickCard && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                        <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
                        Speed Trick
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Dual Language Toggle */}
                    <button
                      id={`btn-lang-toggle-${q.id}`}
                      onClick={onToggleLanguage}
                      title="Switch English / Tamil"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 active:scale-95 transition"
                    >
                      <Languages className="w-3.5 h-3.5 text-blue-700" />
                      <span>{isTamil ? 'தமிழ்' : 'English'}</span>
                    </button>

                    {/* Text to Speech Speaker */}
                    <button
                      id={`btn-tts-${q.id}`}
                      onClick={() => handleToggleSpeak(q)}
                      title="Read Question Aloud"
                      className={`p-2 rounded-xl border transition active:scale-95 ${
                        isPlayingThis
                          ? 'bg-blue-700 text-white border-blue-700 animate-pulse'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {isPlayingThis ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-blue-700" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Progress bar counter */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-medium">
                  <span>
                    Question {qIndex + 1} of {questions.length}
                  </span>
                  {isSolvedBefore && (
                    <span className="flex items-center gap-1 text-emerald-700 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                    </span>
                  )}
                </div>

                {/* Question Statement - 16px min, comfortable 1.6 line height */}
                <div className="mt-4 min-h-[5.5rem] flex items-center">
                  <h2 className="text-base sm:text-[1.1rem] font-bold text-slate-900 question-text whitespace-pre-line">
                    {isTamil ? q.questionTa : q.questionEn}
                  </h2>
                </div>
              </div>

              {/* Options Section - Touch-Optimized Large Pill Buttons (min 52px) */}
              <div className="my-2 space-y-2.5">
                {(isTamil ? q.optionsTa : q.optionsEn).map((optionText, optIdx) => {
                  const isSelected = userAnswer === optIdx;
                  const isCorrect = optIdx === q.correctIndex;

                  let btnStyle =
                    'bg-white border-slate-200 text-slate-800 hover:border-blue-400 hover:bg-blue-50/20';

                  if (isAnswered) {
                    if (isCorrect) {
                      btnStyle =
                        'bg-emerald-50 border-2 border-emerald-500 text-emerald-950 font-bold shadow-xs';
                    } else if (isSelected) {
                      btnStyle = 'bg-rose-50 border-2 border-rose-400 text-rose-950 font-semibold shadow-xs';
                    } else {
                      btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                    }
                  }

                  const optLabels = ['A', 'B', 'C', 'D'];

                  return (
                    <button
                      key={optIdx}
                      id={`btn-opt-${q.id}-${optIdx}`}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(q, optIdx)}
                      className={`touch-option-pill w-full p-3.5 sm:p-4 rounded-2xl border text-left flex items-center justify-between gap-3 text-sm sm:text-base transition active:scale-[0.98] ${btnStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isAnswered && isCorrect
                              ? 'bg-emerald-600 text-white'
                              : isAnswered && isSelected
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {optLabels[optIdx]}
                        </span>
                        <span className="font-medium">{optionText}</span>
                      </div>

                      {isAnswered && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      {isAnswered && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Speed Trick Tag (Collapsible) & Bottom Action Ribbon */}
              <div className="space-y-2.5">
                {isTrickOpen && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs animate-in slide-in-from-bottom-2 duration-200">
                    <div className="flex items-center gap-1.5 font-bold text-amber-800 mb-1">
                      <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                      <span>Speed Math Shortcut:</span>
                    </div>
                    <p className="leading-relaxed font-medium">
                      {isTamil ? q.speedTrickTa : q.speedTrickEn}
                    </p>
                  </div>
                )}

                {/* Bottom Action Ribbon */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* Socratic 3-Tier Hint Modal / Bottom Drawer Trigger */}
                  <button
                    id={`btn-socratic-hint-${q.id}`}
                    onClick={() => onOpenSocraticHint(q)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs border border-amber-200 active:scale-95 transition"
                  >
                    <Lightbulb className="w-4 h-4 fill-amber-500 text-amber-600" />
                    <span>3-Tier Socratic Coach</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Speed Trick Toggle */}
                    <button
                      id={`btn-speed-trick-${q.id}`}
                      onClick={() =>
                        setShowSpeedTrick((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
                      }
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs border transition active:scale-95 ${
                        isTrickOpen
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{isTrickOpen ? 'Hide Trick' : 'Speed Trick'}</span>
                    </button>

                    {/* Manual Load 10 More Questions Backup Button */}
                    <button
                      onClick={() => fetchNextBatchForTopic(q.topic)}
                      disabled={isFetchingMore}
                      title="Fetch next 10 questions for this topic"
                      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 transition active:scale-95 disabled:opacity-50"
                    >
                      {isFetchingMore ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <PlusCircle className="w-3.5 h-3.5" />
                      )}
                      <span>+10 More</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Vertical Reel Navigation Overlay Arrows for Desktop / Tablet */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-2 z-10">
                <button
                  onClick={scrollToPrev}
                  disabled={currentIndex === 0}
                  className="p-2 rounded-full bg-white/90 border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30 shadow-xs transition"
                  aria-label="Previous Question"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={scrollToNext}
                  disabled={currentIndex === questions.length - 1}
                  className="p-2 rounded-full bg-white/90 border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30 shadow-xs transition"
                  aria-label="Next Question"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
