import React, { useState } from 'react';
import { MockTestResult, MockTestType, Question } from '../types';
import {
  History,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  AlertTriangle,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface MockHistoryViewProps {
  history: MockTestResult[];
  isTamil: boolean;
  onReattempt: (testType: MockTestType) => void;
  onStartNewMock: () => void;
}

export const MockHistoryView: React.FC<MockHistoryViewProps> = ({
  history,
  isTamil,
  onReattempt,
  onStartNewMock,
}) => {
  const [selectedReviewResult, setSelectedReviewResult] = useState<MockTestResult | null>(null);

  // Computed summary metrics
  const totalTests = history.length;
  const highestScore = history.reduce((max, h) => Math.max(max, h.score), 0);
  const avgAccuracy =
    totalTests > 0
      ? Math.round(history.reduce((acc, h) => acc + (h.accuracy || 0), 0) / totalTests)
      : 0;

  return (
    <div className="p-4 sm:p-6 max-w-xl mx-auto space-y-6 pt-2 pb-28 animate-in fade-in duration-150">
      {/* Overview Metric Banner */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isTamil ? 'CBT தேர்வு வரலாறு' : 'CBT Attempt Logbook'}
              </h2>
              <p className="text-xs text-slate-500">
                {isTamil ? 'அனைத்து மாதிரி தேர்வு முடிவுகள்' : 'Comprehensive scorecard & mistake tracker'}
              </p>
            </div>
          </div>

          <button
            onClick={onStartNewMock}
            className="px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs transition shadow-sm active:scale-95 flex items-center gap-1"
          >
            <span>{isTamil ? 'புதிய தேர்வு' : 'New Mock'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Metrics Cards */}
        <div className="grid grid-cols-3 gap-3 mt-4 text-center">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] text-slate-500 block font-medium">Tests Taken</span>
            <span className="text-lg font-bold text-slate-900">{totalTests}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100">
            <span className="text-[11px] text-blue-700 block font-medium">Best Score</span>
            <span className="text-lg font-bold text-blue-900">
              {highestScore > 0 ? highestScore.toFixed(1) : '0.0'}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <span className="text-[11px] text-emerald-700 block font-medium">Avg Accuracy</span>
            <span className="text-lg font-bold text-emerald-900">{avgAccuracy}%</span>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <span>{isTamil ? 'சமீபத்திய முயற்சிகள்' : 'Past Test Submissions'}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              {history.length}
            </span>
          </h3>
        </div>

        {history.length === 0 ? (
          <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">No mock tests completed yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Take a timed 5-minute Speed Drill or full CBT simulation to see your accuracy, speed, and negative mark diagnostics here.
            </p>
            <button
              onClick={onStartNewMock}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-sm transition active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch First Mock Test</span>
            </button>
          </div>
        ) : (
          history.map((item) => {
            const hasWrongQuestions = item.wrongQuestions && item.wrongQuestions.length > 0;
            const timeMinutes = Math.floor(item.timeSpentSeconds / 60);
            const timeSeconds = item.timeSpentSeconds % 60;

            return (
              <div
                key={item.id}
                className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{item.testTitle}</h4>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        {item.testType}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5 font-medium">
                      {new Date(item.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Big Clean Score Pill */}
                  <div className="text-right shrink-0">
                    <span className="text-xs text-slate-500 block">Score</span>
                    <span
                      className={`text-base font-extrabold font-mono ${
                        item.score > 0 ? 'text-blue-700' : 'text-slate-700'
                      }`}
                    >
                      {item.score.toFixed(2)}
                      <span className="text-xs font-normal text-slate-400">/{item.totalQuestions}</span>
                    </span>
                  </div>
                </div>

                {/* Score Breakdown Bar */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
                  <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
                    <span className="text-[10px] text-emerald-700 block font-medium">Correct</span>
                    <span className="font-bold text-emerald-800">+{item.correct}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-rose-50 border border-rose-100">
                    <span className="text-[10px] text-rose-700 block font-medium">Wrong (-⅓)</span>
                    <span className="font-bold text-rose-800">-{item.wrong}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 block font-medium">Accuracy</span>
                    <span className="font-bold text-slate-800">{item.accuracy}%</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 block font-medium">Avg Speed</span>
                    <span className="font-bold text-slate-800 font-mono">
                      {item.speedPerQuestionAvgSeconds}s/Q
                    </span>
                  </div>
                </div>

                {/* Diagnostics / Topic tags */}
                {item.weakTopics && item.weakTopics.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-600 pt-1">
                    <span className="text-rose-600 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Focus:
                    </span>
                    {item.weakTopics.slice(0, 2).map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-100 text-rose-700 text-[10px] font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions: Review Mistakes & Re-attempt */}
                <div className="flex items-center gap-2 pt-2">
                  {hasWrongQuestions ? (
                    <button
                      onClick={() => setSelectedReviewResult(item)}
                      className="flex-1 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Review {item.wrong} Mistakes</span>
                    </button>
                  ) : (
                    <div className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 text-emerald-800 font-medium text-xs text-center flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>100% Correct / No Mistakes!</span>
                    </div>
                  )}

                  <button
                    onClick={() => onReattempt(item.testType)}
                    className="py-2 px-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Re-attempt</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Review Mistakes Modal / Bottom Sheet */}
      {selectedReviewResult && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            {/* Drag Handle for mobile */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2.5 sm:hidden" />

            {/* Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Mistake Review: {selectedReviewResult.testTitle}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedReviewResult.wrongQuestions?.length || 0} questions to master
                </p>
              </div>

              <button
                onClick={() => setSelectedReviewResult(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Questions List */}
            <div className="p-4 overflow-y-auto space-y-4 divide-y divide-slate-100">
              {selectedReviewResult.wrongQuestions?.map((entry, idx) => {
                const q = entry.question;
                const userChoice = entry.userChoice;
                return (
                  <div key={q.id || idx} className="pt-3 first:pt-0 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                        Q{idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-600">{q.topic}</span>
                    </div>

                    <p className="text-sm font-semibold text-slate-900 question-text">
                      {isTamil ? q.questionTa : q.questionEn}
                    </p>

                    {/* Options with user choice vs correct choice */}
                    <div className="space-y-1.5 text-xs">
                      {(isTamil ? q.optionsTa : q.optionsEn).map((opt, optIdx) => {
                        const isCorrect = optIdx === q.correctIndex;
                        const isUserSelected = optIdx === userChoice;

                        let style = 'bg-slate-50 border-slate-200 text-slate-700';
                        if (isCorrect) {
                          style = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                        } else if (isUserSelected) {
                          style = 'bg-rose-50 border-rose-300 text-rose-900 font-semibold line-through';
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${style}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded flex items-center justify-center font-bold text-[11px] bg-white border border-slate-200 text-slate-700">
                                {['A', 'B', 'C', 'D'][optIdx]}
                              </span>
                              <span>{opt}</span>
                            </div>

                            {isCorrect && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                                Correct Answer
                              </span>
                            )}
                            {isUserSelected && !isCorrect && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-600 text-white">
                                Your Choice
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-950 space-y-1">
                      <span className="font-bold text-blue-900 block">Explanation:</span>
                      <p className="text-slate-700 leading-relaxed">
                        {isTamil ? q.explanationTa : q.explanationEn}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200">
              <button
                onClick={() => {
                  const testType = selectedReviewResult.testType;
                  setSelectedReviewResult(null);
                  onReattempt(testType);
                }}
                className="w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Re-attempt This Test Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
