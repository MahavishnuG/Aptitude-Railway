import React, { useState } from 'react';
import { Question } from '../types';
import { speakText, stopSpeaking } from '../utils/speech';
import { X, Volume2, VolumeX, Lightbulb, Compass, BrainCircuit, Sparkles, ChevronRight, Check } from 'lucide-react';

interface SocraticHintModalProps {
  question: Question;
  isTamil: boolean;
  onClose: () => void;
}

export const SocraticHintModal: React.FC<SocraticHintModalProps> = ({
  question,
  isTamil,
  onClose,
}) => {
  const [activeTier, setActiveTier] = useState<1 | 2 | 3>(1);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const { hints } = question;

  const handleSpeak = (text: string) => {
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      speakText(
        text,
        'ta',
        () => setIsPlayingAudio(false),
        () => setIsPlayingAudio(false)
      );
    }
  };

  const handleClose = () => {
    stopSpeaking();
    setIsPlayingAudio(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden max-h-[88vh] flex flex-col animate-in slide-in-from-bottom duration-200">
        {/* Mobile Pull-Down Handle */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600">
              <Lightbulb className="w-5 h-5 fill-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Socratic 3-Tier Coach</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  RRB {question.rrbExam}
                </span>
              </div>
              <p className="text-xs text-slate-500">Guides your step-by-step mathematical deduction</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tier Step Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white p-2 gap-2">
          <button
            onClick={() => {
              setActiveTier(1);
              stopSpeaking();
              setIsPlayingAudio(false);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-bold rounded-xl transition ${
              activeTier === 1
                ? 'bg-amber-50 text-amber-800 border border-amber-300 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-amber-600" />
            <span>Tier 1: Formula</span>
          </button>

          <button
            onClick={() => {
              setActiveTier(2);
              stopSpeaking();
              setIsPlayingAudio(false);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-bold rounded-xl transition ${
              activeTier === 2
                ? 'bg-blue-50 text-blue-800 border border-blue-300 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5 text-blue-600" />
            <span>Tier 2: Variables</span>
          </button>

          <button
            onClick={() => {
              setActiveTier(3);
              stopSpeaking();
              setIsPlayingAudio(false);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-bold rounded-xl transition ${
              activeTier === 3
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tier 3: Tanglish</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTier === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                <span className="text-[11px] uppercase tracking-wider font-bold text-amber-800 block mb-1">
                  Master Formula
                </span>
                <p className="font-mono text-sm sm:text-base text-slate-900 font-bold bg-white p-3 rounded-xl border border-amber-200 shadow-xs select-all">
                  {hints.level1.formula}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 block mb-1">
                  Core Concept
                </span>
                <p className="text-sm text-slate-800 leading-relaxed font-medium">
                  {isTamil ? hints.level1.conceptTa : hints.level1.concept}
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveTier(2)}
                  className="flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800"
                >
                  <span>Need more help? Advance to Tier 2</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {activeTier === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
                <span className="text-[11px] uppercase tracking-wider font-bold text-blue-800 block mb-1">
                  Identified Variables & Values
                </span>
                <p className="font-mono text-xs sm:text-sm text-slate-900 font-semibold bg-white p-3 rounded-xl border border-blue-200 shadow-xs select-all">
                  {hints.level2.variables}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 block mb-1">
                  Calculation Direction & Clue
                </span>
                <p className="text-sm text-slate-800 leading-relaxed font-medium">
                  {isTamil ? hints.level2.calculationClueTa : hints.level2.calculationClue}
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveTier(3)}
                  className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                >
                  <span>Still stuck? Get Tanglish breakdown in Tier 3</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {activeTier === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-800 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Tanglish Step-by-Step Logic
                  </span>

                  {/* Audio Readout in Tanglish */}
                  <button
                    onClick={() => handleSpeak(hints.level3Tanglish.speechText)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
                      isPlayingAudio
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                    }`}
                  >
                    {isPlayingAudio ? (
                      <>
                        <VolumeX className="w-4 h-4" />
                        <span>Stop Voice</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4" />
                        <span>Listen Aloud</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-sm text-slate-800 leading-relaxed bg-white p-3.5 rounded-xl border border-emerald-200 shadow-xs font-medium">
                  {hints.level3Tanglish.stepByStep}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                💡 <strong className="text-slate-800">Exam Strategy:</strong> In RRB CBT exams, remember that question reading + calculation must be completed in under 45-60 seconds.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Tier {activeTier} of 3 active
          </span>
          <button
            onClick={handleClose}
            className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs active:scale-95 transition shadow-sm flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>I’m Ready to Solve</span>
          </button>
        </div>
      </div>
    </div>
  );
};
