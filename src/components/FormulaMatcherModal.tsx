import React, { useState, useEffect } from 'react';
import { FORMULA_MATCH_ITEMS } from '../data/formulaData';
import { FormulaMatchItem } from '../types';
import { triggerSuccessHaptic, triggerWarningHaptic } from '../utils/haptics';
import confetti from 'canvas-confetti';
import { Brain, Clock, Zap, RotateCcw, X, Check, Award } from 'lucide-react';

interface FormulaMatcherModalProps {
  isTamil: boolean;
  onClose: () => void;
  onRewardPoints: (pts: number) => void;
}

export const FormulaMatcherModal: React.FC<FormulaMatcherModalProps> = ({
  isTamil,
  onClose,
  onRewardPoints,
}) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [items, setItems] = useState<FormulaMatchItem[]>([]);
  const [shuffledFormulas, setShuffledFormulas] = useState<{ id: string; formula: string }[]>([]);

  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);
  const [selectedFormulaId, setSelectedFormulaId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [wrongShake, setWrongShake] = useState(false);

  // Initialize round
  const startRound = () => {
    // Pick 5 random formula items
    const shuffledPool = [...FORMULA_MATCH_ITEMS].sort(() => Math.random() - 0.5).slice(0, 5);
    setItems(shuffledPool);

    const formulas = shuffledPool
      .map((item) => ({ id: item.id, formula: item.formula }))
      .sort(() => Math.random() - 0.5);
    setShuffledFormulas(formulas);

    setMatchedIds([]);
    setSelectedConceptId(null);
    setSelectedFormulaId(null);
    setTimeLeft(60);
    setScore(0);
    setCombo(1);
    setIsFinished(false);
    setIsPlaying(true);
  };

  useEffect(() => {
    startRound();
  }, []);

  // Timer
  useEffect(() => {
    if (!isPlaying || isFinished) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, isFinished]);

  const finishGame = () => {
    setIsFinished(true);
    setIsPlaying(false);
    onRewardPoints(score + 50);
  };

  // Check matching pair
  const handleSelectConcept = (id: string) => {
    if (matchedIds.includes(id)) return;
    setSelectedConceptId(id);

    if (selectedFormulaId) {
      verifyPair(id, selectedFormulaId);
    }
  };

  const handleSelectFormula = (id: string) => {
    if (matchedIds.includes(id)) return;
    setSelectedFormulaId(id);

    if (selectedConceptId) {
      verifyPair(selectedConceptId, id);
    }
  };

  const verifyPair = (cId: string, fId: string) => {
    if (cId === fId) {
      // MATCH!
      triggerSuccessHaptic();
      const newMatched = [...matchedIds, cId];
      setMatchedIds(newMatched);
      setScore((prev) => prev + 20 * combo);
      setCombo((prev) => prev + 1);

      setSelectedConceptId(null);
      setSelectedFormulaId(null);

      // Check if all matched
      if (newMatched.length === items.length) {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
        finishGame();
      }
    } else {
      // WRONG PAIR
      triggerWarningHaptic();
      setWrongShake(true);
      setCombo(1);
      setTimeout(() => {
        setWrongShake(false);
        setSelectedConceptId(null);
        setSelectedFormulaId(null);
      }, 400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {isTamil ? 'வேக சூத்திரப் பொருத்தம்' : 'Formula Speed Matcher'}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                  60s DRILL
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Match the RRB concept with its master formula</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Bar */}
        <div className="px-4 py-2.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-blue-700 font-mono font-bold">
            <Clock className="w-4 h-4" />
            <span className={timeLeft < 15 ? 'text-rose-600 animate-pulse font-bold' : ''}>
              {timeLeft}s Left
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-amber-600 font-bold">
              <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              {score} Pts
            </span>
            {combo > 1 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {combo}x Combo!
              </span>
            )}
          </div>

          <span className="text-slate-500 font-mono font-medium">
            {matchedIds.length} / {items.length} Pairs
          </span>
        </div>

        {/* Game Area */}
        {!isFinished ? (
          <div className={`p-4 overflow-y-auto space-y-4 flex-1 ${wrongShake ? 'animate-shake' : ''}`}>
            <p className="text-xs text-slate-600 text-center font-medium">
              💡 Tap a <strong>Concept</strong> on the left, then tap its matching <strong>Formula</strong> on the right:
            </p>

            <div className="grid grid-cols-2 gap-3">
              {/* Left: Concepts */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block px-1">
                  Concepts (கோட்பாடுகள்)
                </span>
                {items.map((item) => {
                  const isMatched = matchedIds.includes(item.id);
                  const isSelected = selectedConceptId === item.id;

                  return (
                    <button
                      key={`concept-${item.id}`}
                      disabled={isMatched}
                      onClick={() => handleSelectConcept(item.id)}
                      className={`w-full min-h-[4.5rem] p-3 rounded-xl border text-left text-xs font-semibold transition active:scale-95 flex flex-col justify-between shadow-xs ${
                        isMatched
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-800 opacity-60'
                          : isSelected
                          ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-500/40'
                          : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <span className="line-clamp-2">{isTamil ? item.conceptTa : item.concept}</span>
                      <span className="text-[9px] text-slate-500 uppercase font-mono mt-1">
                        {item.topic}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right: Formulas */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block px-1">
                  Formulas (சூத்திரங்கள்)
                </span>
                {shuffledFormulas.map((form) => {
                  const isMatched = matchedIds.includes(form.id);
                  const isSelected = selectedFormulaId === form.id;

                  return (
                    <button
                      key={`formula-${form.id}`}
                      disabled={isMatched}
                      onClick={() => handleSelectFormula(form.id)}
                      className={`w-full min-h-[4.5rem] p-3 rounded-xl border text-left text-xs font-mono font-bold transition active:scale-95 flex items-center justify-between shadow-xs ${
                        isMatched
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-800 opacity-60'
                          : isSelected
                          ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-500/40'
                          : 'bg-white border-slate-200 text-blue-800 hover:border-slate-300'
                      }`}
                    >
                      <span className="leading-snug">{form.formula}</span>
                      {isMatched && <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Finished Screen */
          <div className="p-6 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-700">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {matchedIds.length === items.length ? '🎉 Rapid Mastery Achieved!' : '⏱️ Time’s Up!'}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                You matched {matchedIds.length} of {items.length} formulas with high speed.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-xs mx-auto">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Fuel Points Earned</span>
              <p className="text-3xl font-bold text-blue-700 font-mono mt-0.5">+{score + 50} pts</p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={startRound}
                className="flex-1 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition shadow-xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs active:scale-95 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
