import React, { useState, useEffect, useMemo } from 'react';
import { Question, QuestionTopic } from '../types';
import { trainAudio } from '../utils/trainAudio';
import confetti from 'canvas-confetti';
import {
  Flame,
  CheckCircle2,
  XCircle,
  Zap,
  Share2,
  Languages,
  X,
  Sparkles,
} from 'lucide-react';

interface DailyChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isTamil: boolean;
  onToggleLanguage: () => void;
  allQuestions: Question[];
  currentStreak: number;
  onCompleteChallenge: (score: number, total: number) => void;
  isAlreadyCompletedToday?: boolean;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  isOpen,
  onClose,
  isTamil,
  onToggleLanguage,
  allQuestions,
  currentStreak,
  onCompleteChallenge,
  isAlreadyCompletedToday = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [answers, setAnswers] = useState<{ selected: number; correct: boolean }[]>([]);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Curate 5 distinct mixed-topic questions deterministically for today
  const dailyQuestions = useMemo(() => {
    if (!allQuestions || allQuestions.length === 0) return [];

    // Target 3 Quant topics + 2 Reasoning topics
    const quantTopics: QuestionTopic[] = [
      'Speed, Time & Distance',
      'Time & Work',
      'Profit, Loss & Successive Discounts',
      'Simple Interest & Compound Interest',
      'Percentages & Population Logic',
      'Number System & Divisibility Rules',
      'LCM & HCF',
      'Mensuration 2D & 3D',
    ];

    const reasoningTopics: QuestionTopic[] = [
      'Syllogism',
      'Blood Relations & Coded Family Trees',
      'Direction Sense & Distance Calculations',
      'Coding-Decoding & Alphanumeric Series',
      'Seating Arrangement',
      'Mathematical Operations & Symbol Swapping',
    ];

    // Seed from today's date
    let seed = 0;
    for (let i = 0; i < todayStr.length; i++) {
      seed += todayStr.charCodeAt(i) * (i + 1);
    }

    const pseudoRandom = (offset: number) => {
      const x = Math.sin(seed + offset) * 10000;
      return x - Math.floor(x);
    };

    const quantPool = allQuestions.filter((q) =>
      quantTopics.some((t) => q.topic.toLowerCase().includes(t.toLowerCase()))
    );
    const reasoningPool = allQuestions.filter((q) =>
      reasoningTopics.some((t) => q.topic.toLowerCase().includes(t.toLowerCase()))
    );

    const safeQuant = quantPool.length >= 3 ? quantPool : allQuestions;
    const safeReasoning = reasoningPool.length >= 2 ? reasoningPool : allQuestions;

    const shuffledQuant = [...safeQuant].sort((a, b) => pseudoRandom(a.id.length + 1) - 0.5);
    const shuffledReasoning = [...safeReasoning].sort((a, b) => pseudoRandom(b.id.length + 2) - 0.5);

    const q1 = shuffledQuant[0] || allQuestions[0];
    const q2 = shuffledQuant[1] || allQuestions[1];
    const q3 = shuffledQuant[2] || allQuestions[2];
    const q4 = shuffledReasoning[0] || allQuestions[3];
    const q5 = shuffledReasoning[1] || allQuestions[4];

    return [q1, q2, q3, q4, q5].filter(Boolean);
  }, [allQuestions, todayStr]);

  // Current active question
  const currentQ = dailyQuestions[currentIndex] || dailyQuestions[0];

  // Play horn sound on open
  useEffect(() => {
    if (isOpen) {
      trainAudio.playHorn();
    }
  }, [isOpen]);

  if (!isOpen || !currentQ) return null;

  const handleSelectOption = (optIdx: number) => {
    if (isAnswered) return;

    setSelectedOption(optIdx);
    setIsAnswered(true);

    const isCorrect = optIdx === currentQ.correctIndex;
    const newAnswers = [...answers, { selected: optIdx, correct: isCorrect }];
    setAnswers(newAnswers);

    if (isCorrect) {
      trainAudio.playCorrectChime();
      trainAudio.playWhistle();
    } else {
      trainAudio.playWrongBuzzer();
    }
  };

  const handleNext = () => {
    if (currentIndex < dailyQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      trainAudio.playWheelClack();
    } else {
      // Finished all 5 questions
      setIsFinished(true);
      const score = answers.filter((a) => a.correct).length;
      onCompleteChallenge(score, dailyQuestions.length);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback if canvas not available
      }
    }
  };

  const correctAnswersCount = answers.filter((a) => a.correct).length;

  const handleShareWhatsApp = () => {
    const text = `🚂 *RRB Daily Express Challenge Cleared!* ⚡\n\n🎯 Score: ${correctAnswersCount}/5 Questions\n🔥 Streak: ${
      currentStreak + 1
    } Days Active\n🚆 Prepared with Indian Railways RRB Aptitude & Reasoning Prep (Bilingual Tamil & English)\n\nTry today's challenge: ${window.location.origin}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyTicket = () => {
    const text = `🎫 RRB DAILY CHALLENGE RESULT (${todayStr})\nScore: ${correctAnswersCount}/5\nStreak: ${
      currentStreak + 1
    } Days\nSpeed Math & Reasoning Mastery`;
    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  return (
    <div
      id="daily-rrb-challenge-modal"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden text-slate-800 flex flex-col max-h-[92vh]">
        {/* Train Platform Indicator Top Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-lg shadow-xs">
              🚂
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="bg-blue-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                  {isTamil ? 'தளம் 1 • தினசரி சவால்' : 'Platform 1 • Daily Express'}
                </span>
                <span className="text-[10px] text-blue-700 font-mono font-bold">
                  EXP-12623
                </span>
              </div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight mt-0.5">
                {isTamil ? 'தினசரி 5-கேள்வி ரயில்வே சவால்' : 'Daily RRB 5-Question Departure'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Language Switch */}
            <button
              onClick={onToggleLanguage}
              className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition flex items-center gap-1 shadow-xs"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{isTamil ? 'TA' : 'EN'}</span>
            </button>

            {/* Close / Skip */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-200 transition shadow-xs"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Train Tracks & Bogie Visual Indicator */}
        <div className="bg-slate-50/70 px-4 py-2.5 border-b border-slate-200">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mb-1.5">
            <span className="flex items-center gap-1 text-blue-700 font-bold">
              <span>{isTamil ? 'ரயில் வேகம்' : 'Coach'}</span> {currentIndex + 1} / 5
            </span>
            <span className="text-emerald-700 font-semibold">
              {answers.filter((a) => a.correct).length} {isTamil ? 'சரி' : 'Correct'}
            </span>
            <span className="text-slate-600">
              {isTamil ? 'ஸ்ட்ரீக் பூஸ்ட்:' : 'Streak Boost:'} <strong className="text-amber-600">+1 D</strong>
            </span>
          </div>

          {/* 5-Bogie Visual Train Line */}
          <div className="relative py-1 flex items-center justify-between">
            {/* Railway Track Double Line Behind */}
            <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-1 border-t border-b border-slate-300 pointer-events-none" />

            {dailyQuestions.map((_, idx) => {
              const answeredObj = answers[idx];
              const isCurrent = idx === currentIndex && !isFinished;
              const isDone = answeredObj !== undefined;

              let bogieBg = 'bg-white border-slate-300 text-slate-400';
              if (isDone) {
                bogieBg = answeredObj.correct
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                  : 'bg-rose-600 border-rose-600 text-white';
              } else if (isCurrent) {
                bogieBg = 'bg-blue-700 border-blue-700 text-white font-bold scale-110 shadow-xs';
              }

              return (
                <div key={idx} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-bold transition-all duration-200 ${bogieBg}`}
                  >
                    {isDone ? (
                      answeredObj.correct ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )
                    ) : isCurrent ? (
                      '🚂'
                    ) : (
                      `C${idx + 1}`
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Body: Active Question OR Completion Screen */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {!isFinished ? (
            <>
              {/* Question Railway Ticket Header */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                    {currentQ.topic}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                    RRB {currentQ.rrbExam}
                  </span>
                </div>

                <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed pt-1 question-text">
                  {isTamil ? currentQ.questionTa : currentQ.questionEn}
                </p>
              </div>

              {/* 4 Options Grid (Styled as Railway Berths) */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                  {isTamil ? 'சரியான விடையைத் தேர்ந்தெடுக்கவும்:' : 'Select Correct Option:'}
                </p>

                <div className="grid grid-cols-1 gap-2.5">
                  {(isTamil ? currentQ.optionsTa : currentQ.optionsEn).map((optText, optIdx) => {
                    const isSelected = selectedOption === optIdx;
                    const isTargetCorrect = optIdx === currentQ.correctIndex;

                    let btnStyle = 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800';

                    if (isAnswered) {
                      if (isTargetCorrect) {
                        btnStyle = 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold ring-1 ring-emerald-600';
                      } else if (isSelected) {
                        btnStyle = 'bg-rose-50 border-rose-600 text-rose-900 ring-1 ring-rose-600 font-bold';
                      } else {
                        btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={isAnswered}
                        onClick={() => handleSelectOption(optIdx)}
                        className={`w-full min-h-[48px] text-left p-3.5 rounded-xl border flex items-center justify-between transition active:scale-[0.99] text-sm sm:text-base font-medium ${btnStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold border font-mono ${
                              isAnswered && isTargetCorrect
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : isAnswered && isSelected
                                ? 'bg-rose-600 text-white border-rose-600'
                                : 'bg-slate-100 border-slate-200 text-slate-700'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="leading-snug">{optText}</span>
                        </div>

                        {isAnswered && (
                          <div>
                            {isTargetCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                            {isSelected && !isTargetCorrect && <XCircle className="w-5 h-5 text-rose-600" />}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Instant Speed Trick & Solution (Revealed on selection) */}
              {isAnswered && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 space-y-1.5 animate-fadeIn">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <Zap className="w-4 h-4 text-amber-600 fill-amber-600" />
                    <span>
                      {isTamil ? 'லோகோ பைலட் வேகக் கணித உத்தி (30 வினாடிகள்):' : "Loco Pilot's 30s Speed Trick:"}
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed font-mono">
                    {isTamil ? currentQ.speedTrickTa : currentQ.speedTrickEn}
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Challenge Completed Celebration View */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-3xl shadow-xs">
                🏆
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
                  {isTamil ? 'இன்றைய பயணம் முடிந்தது!' : 'Journey Completed On-Time!'}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
                  {isTamil ? 'தினசரி RRB சவால் வெற்றிகரமாக முடிந்தது!' : 'Daily RRB Challenge Cleared!'}
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto font-medium">
                  {isTamil
                    ? `5 வினாக்களில் ${correctAnswersCount} வினாக்களுக்கு சரியான விடையளித்துள்ளீர்கள்.`
                    : `You solved ${correctAnswersCount} out of 5 mixed-topic aptitude & reasoning questions.`}
                </p>
              </div>

              {/* Streak Boost Celebration Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-sm mx-auto flex items-center justify-around shadow-xs">
                <div className="flex items-center gap-2">
                  <Flame className="w-7 h-7 text-amber-500 fill-amber-500 animate-pulse" />
                  <div className="text-left">
                    <div className="text-[10px] text-slate-500 uppercase font-mono font-medium">
                      {isTamil ? 'ரயில்வே ஸ்ட்ரீக்' : 'Railway Streak'}
                    </div>
                    <div className="text-lg font-bold text-amber-700">
                      {currentStreak + (isAlreadyCompletedToday ? 0 : 1)} {isTamil ? 'நாட்கள்' : 'Days'}
                    </div>
                  </div>
                </div>

                <div className="h-8 w-px bg-slate-200" />

                <div className="flex items-center gap-2">
                  <Sparkles className="w-7 h-7 text-emerald-600" />
                  <div className="text-left">
                    <div className="text-[10px] text-slate-500 uppercase font-mono font-medium">
                      {isTamil ? 'எக்ஸ்பிரஸ் புள்ளிகள்' : 'Express Fuel'}
                    </div>
                    <div className="text-lg font-bold text-emerald-700">+50 Pts</div>
                  </div>
                </div>
              </div>

              {/* Share & Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                <button
                  id="btn-daily-whatsapp"
                  onClick={handleShareWhatsApp}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-95"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{isTamil ? 'வாட்ஸ்அப்பில் பகிரவும்' : 'Share on WhatsApp'}</span>
                </button>

                <button
                  id="btn-daily-copy-ticket"
                  onClick={handleCopyTicket}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs transition active:scale-95"
                >
                  {copiedShare
                    ? (isTamil ? '✓ டிக்கெட் நகலெடுக்கப்பட்டது' : '✓ Ticket Copied!')
                    : (isTamil ? 'டிக்கெட் நகலெடு' : 'Copy Ticket')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between">
          {!isFinished ? (
            <>
              <div className="text-[11px] text-slate-500 font-mono font-medium">
                {isAnswered ? (
                  <span className="text-blue-700 flex items-center gap-1 font-semibold">
                    <Zap className="w-3.5 h-3.5" />
                    {isTamil ? 'அடுத்த நிலையத்திற்கு புறப்படவும்' : 'Proceed to next station'}
                  </span>
                ) : (
                  <span>{isTamil ? 'ஒரு விடையைத் தொடவும்' : 'Select an answer to continue'}</span>
                )}
              </div>

              <button
                id="btn-daily-next"
                disabled={!isAnswered}
                onClick={handleNext}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  isAnswered
                    ? 'bg-blue-700 hover:bg-blue-800 text-white shadow-xs active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>
                  {currentIndex === dailyQuestions.length - 1
                    ? (isTamil ? 'பயணத்தை நிறைவு செய் ➔' : 'Complete Challenge ➔')
                    : (isTamil ? 'அடுத்த கேள்வி ➔' : 'Next Question ➔')}
                </span>
              </button>
            </>
          ) : (
            <button
              id="btn-daily-done"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition active:scale-95 shadow-xs"
            >
              {isTamil ? 'முக்கிய நிலையத்திற்கு செல்க (முகப்பு)' : 'Enter Main Station (Dashboard)'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
