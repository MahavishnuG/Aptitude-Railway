import React, { useState, useEffect, useRef } from 'react';
import { Question, MockTestResult, QuestionTopic } from '../types';
import { triggerSuccessHaptic, triggerWarningHaptic } from '../utils/haptics';
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Flag,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Trophy,
  Target,
  ArrowRight,
  Zap,
  BarChart3,
  Languages,
} from 'lucide-react';

interface MockTestViewProps {
  questions: Question[];
  isTamil: boolean;
  onToggleLanguage: () => void;
  onTestCompleted: (result: MockTestResult) => void;
  onDrillTopic?: (topic: string) => void;
}

type TestFormatType = 'mini' | 'sprint' | 'full';

interface TestFormat {
  type: TestFormatType;
  titleEn: string;
  titleTa: string;
  descEn: string;
  descTa: string;
  questions: number;
  minutes: number;
  badge: string;
}

const TEST_FORMATS: TestFormat[] = [
  {
    type: 'mini',
    titleEn: 'Daily Rapid Mini-Mock',
    titleTa: 'தினசரி வேக மாதிரித் தேர்வு',
    descEn: '10 Questions • 8 Minutes • Quick CBT warmup',
    descTa: '10 கேள்விகள் • 8 நிமிடங்கள் • வேக பயிற்சி',
    questions: 10,
    minutes: 8,
    badge: 'Quick 8m',
  },
  {
    type: 'sprint',
    titleEn: 'Topic Mastery Sprint',
    titleTa: 'பாடவாரியான சிறப்புத் தேர்வு',
    descEn: '20 Questions • 15 Minutes • Speed-accuracy test',
    descTa: '20 கேள்விகள் • 15 நிமிடங்கள் • துல்லிய தேர்வு',
    questions: 20,
    minutes: 15,
    badge: 'Sprint 15m',
  },
  {
    type: 'full',
    titleEn: 'Full-Length RRB Mock CBT',
    titleTa: 'முழுமையான RRB CBT தேர்வு மாதிரி',
    descEn: '30 Questions • 25 Minutes • Official Exam Simulation',
    descTa: '30 கேள்விகள் • 25 நிமிடங்கள் • அசல் தேர்வு வடிவம்',
    questions: 30,
    minutes: 25,
    badge: 'Full CBT',
  },
];

export const MockTestView: React.FC<MockTestViewProps> = ({
  questions,
  isTamil,
  onToggleLanguage,
  onTestCompleted,
  onDrillTopic,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<TestFormatType>('mini');
  const [testState, setTestState] = useState<'idle' | 'running' | 'completed'>('idle');

  // Running test state
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [visited, setVisited] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [initialTimeSec, setInitialTimeSec] = useState(0);
  const [questionTimeSeconds, setQuestionTimeSeconds] = useState<Record<string, number>>({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Completed test diagnostic state
  const [testResult, setTestResult] = useState<MockTestResult | null>(null);
  const [topicPerformanceMap, setTopicPerformanceMap] = useState<
    Record<string, { correct: number; total: number }>
  >({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start selected test
  const startTest = (fmt: TestFormatType) => {
    const config = TEST_FORMATS.find((f) => f.type === fmt) || TEST_FORMATS[0];

    // Pick randomized questions from questions pool
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(config.questions, questions.length));

    setTestQuestions(selected);
    setCurrentIdx(0);
    setAnswers({});
    setFlagged({});
    setVisited({ [selected[0]?.id]: true });
    setTimeLeft(config.minutes * 60);
    setInitialTimeSec(config.minutes * 60);
    setQuestionTimeSeconds({});
    setTestState('running');
  };

  // Timer tick
  useEffect(() => {
    if (testState !== 'running') return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          finishTest();
          return 0;
        }
        return prev - 1;
      });

      // Track time spent per active question
      const currentQId = testQuestions[currentIdx]?.id;
      if (currentQId) {
        setQuestionTimeSeconds((prev) => ({
          ...prev,
          [currentQId]: (prev[currentQId] || 0) + 1,
        }));
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testState, currentIdx, testQuestions]);

  // Mark visited questions
  useEffect(() => {
    if (testState === 'running' && testQuestions[currentIdx]) {
      setVisited((prev) => ({ ...prev, [testQuestions[currentIdx].id]: true }));
    }
  }, [currentIdx, testState, testQuestions]);

  // Finish and compute diagnostic score
  const finishTest = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    let correct = 0;
    let wrong = 0;
    const topicStats: Record<string, { correct: number; total: number }> = {};
    const wrongQuestionsList: { question: Question; userChoice: number }[] = [];

    testQuestions.forEach((q) => {
      if (!topicStats[q.topic]) {
        topicStats[q.topic] = { correct: 0, total: 0 };
      }
      topicStats[q.topic].total += 1;

      const userAns = answers[q.id];
      if (userAns !== undefined) {
        if (userAns === q.correctIndex) {
          correct += 1;
          topicStats[q.topic].correct += 1;
        } else {
          wrong += 1;
          wrongQuestionsList.push({ question: q, userChoice: userAns });
        }
      }
    });

    setTopicPerformanceMap(topicStats);

    const attempted = correct + wrong;
    // Official RRB Negative Marking Formula: +1 for correct, -1/3 (-0.33) for wrong
    const rawScore = correct * 1 - wrong * (1 / 3);
    const score = Math.max(0, Math.round(rawScore * 100) / 100);
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

    const weakTopics = Object.entries(topicStats)
      .filter(([_, stats]) => stats.total > 0 && stats.correct / stats.total < 0.6)
      .map(([topic]) => topic);

    const timeSpent = initialTimeSec - timeLeft;

    const strongTopics = Object.entries(topicStats)
      .filter(([_, stats]) => stats.total > 0 && stats.correct / stats.total >= 0.7)
      .map(([topic]) => topic);

    const testTypeMap: Record<TestFormatType, 'mini' | 'mastery' | 'full'> = {
      mini: 'mini',
      sprint: 'mastery',
      full: 'full',
    };

    const testTitleMap: Record<TestFormatType, string> = {
      mini: 'Daily Rapid Mini-Mock',
      sprint: 'Topic Mastery Sprint',
      full: 'Full-Length RRB Mock CBT',
    };

    const avgSpeed = Math.round(timeSpent / (attempted || 1));

    const result: MockTestResult = {
      id: `mock-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      testType: testTypeMap[selectedFormat],
      testTitle: testTitleMap[selectedFormat],
      totalQuestions: testQuestions.length,
      attempted,
      correct,
      wrong,
      unattempted: testQuestions.length - attempted,
      score,
      accuracy,
      timeSpentSeconds: timeSpent,
      weakTopics:
        weakTopics.length > 0 ? weakTopics : ['All Tested Topics > 60% Accuracy!'],
      strongTopics:
        strongTopics.length > 0 ? strongTopics : ['Practice more questions to discover strengths'],
      speedPerQuestionAvgSeconds: avgSpeed,
      wrongQuestions: wrongQuestionsList,
    };

    setTestResult(result);
    setTestState('completed');
    setShowSubmitModal(false);
    onTestCompleted(result);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  // 1. Idle Test Selection Screen
  if (testState === 'idle') {
    return (
      <div className="p-4 max-w-xl mx-auto space-y-5 pt-4 pb-28 animate-in fade-in duration-150">
        {/* Header Hero - Railway Examination Hall */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 text-center shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-700 mb-3 text-2xl">
            🚆
          </div>

          <h2 className="text-xl font-bold text-slate-900">
            {isTamil ? 'RRB CBT மாதிரித் தேர்வு மையம்' : 'RRB CBT Official Mock Examination'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
            {isTamil
              ? 'உண்மையான ரயில்வே தேர்வு விதிகள் (+1 / -⅓ நெகடிவ் மதிப்பெண்) கொண்ட மாதிரித் தேர்வுகள்.'
              : 'Official CBT examination formats with +1 / -⅓ negative marking and speed analytics.'}
          </p>

          {/* Format Selection Cards */}
          <div className="mt-5 space-y-2.5 text-left">
            {TEST_FORMATS.map((fmt) => {
              const isSelected = selectedFormat === fmt.type;
              return (
                <div
                  key={fmt.type}
                  onClick={() => setSelectedFormat(fmt.type)}
                  className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-600 shadow-xs ring-1 ring-blue-600'
                      : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {isTamil ? fmt.titleTa : fmt.titleEn}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {fmt.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {isTamil ? fmt.descTa : fmt.descEn}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold font-mono text-blue-700 block">
                      {fmt.minutes} Mins
                    </span>
                    <span className="text-[10px] text-slate-500 block font-mono">
                      {fmt.questions} Qs
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            id="btn-start-mock-test"
            onClick={() => startTest(selectedFormat)}
            className="mt-6 w-full py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm tracking-wide shadow-xs active:scale-95 transition flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-white text-white" />
            <span>{isTamil ? 'தேர்வை தொடங்கு (Start CBT Test)' : 'Launch CBT Simulation'}</span>
          </button>
        </div>

        {/* Examination Scheme Card */}
        <div className="rounded-2xl bg-white border border-slate-200 p-5 text-xs text-slate-700 space-y-2 shadow-xs">
          <h4 className="font-bold text-slate-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-blue-700" />
            <span>Official RRB CBT Examination Rules</span>
          </h4>
          <ul className="list-disc list-inside space-y-1 text-slate-600 font-medium">
            <li>
              Correct Answer: <strong className="text-emerald-700">+1.00 Mark</strong>
            </li>
            <li>
              Incorrect Answer:{' '}
              <strong className="text-rose-700">-0.33 Marks (-1/3 penalty)</strong>
            </li>
            <li>Unattempted Question: 0 Marks</li>
            <li>Speedometer Benchmark: 45 Seconds per Question</li>
          </ul>
        </div>
      </div>
    );
  }

  // 2. Completed / Scorecard Screen with Diagnostic Heatmap & Speedometer
  if (testState === 'completed' && testResult) {
    const avgSpeed = Math.round(testResult.timeSpentSeconds / (testResult.attempted || 1));
    const speedRating =
      avgSpeed <= 35
        ? { label: 'Lightning Fast ⚡', color: 'text-emerald-700', desc: 'Well ahead of 45s benchmark' }
        : avgSpeed <= 55
        ? { label: 'Optimal Speed ⏱️', color: 'text-blue-700', desc: 'Right on exam pace (45-50s)' }
        : { label: 'Pacing Needed ⚠️', color: 'text-amber-700', desc: 'Exceeding 55s per question' };

    return (
      <div className="p-4 max-w-xl mx-auto space-y-4 pt-4 pb-28 animate-in fade-in duration-200">
        {/* Scorecard Hero */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs text-center relative overflow-hidden">
          <div className="inline-flex p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 mb-2">
            <Trophy className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-slate-900">Mock Test Diagnostic Report</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Official RRB CBT evaluation with -1/3 penalty & speed calibration
          </p>

          <div className="my-5 flex items-center justify-center gap-4">
            <div className="text-center">
              <span className="text-4xl font-bold text-blue-700 font-mono">
                {testResult.score.toFixed(2)}
              </span>
              <span className="text-xs text-slate-500 block font-medium mt-0.5">
                Net Score / {testResult.totalQuestions} Marks
              </span>
            </div>
          </div>

          {/* Analytics Summary */}
          <div className="grid grid-cols-4 gap-2 my-4">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Accuracy</span>
              <p className="text-sm font-bold text-emerald-700 font-mono">
                {testResult.accuracy}%
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Correct</span>
              <p className="text-sm font-bold text-emerald-700 font-mono">
                +{testResult.correct}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Wrong</span>
              <p className="text-sm font-bold text-rose-700 font-mono">
                -{testResult.wrong}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Avg Speed</span>
              <p className="text-sm font-bold text-blue-700 font-mono">{avgSpeed}s/Q</p>
            </div>
          </div>

          {/* Speedometer Gauge Visual */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                  Speedometer Benchmark (45s Target)
                </span>
                <span className={`text-xs font-bold ${speedRating.color}`}>
                  {speedRating.label} — {avgSpeed}s per question
                </span>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 font-mono text-right font-medium">
              {speedRating.desc}
            </span>
          </div>

          {/* Weak Topic Heatmap & Action Links */}
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2">
            <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider block flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-blue-700" />
              Weak Topic Heatmap & Instant Drills
            </span>

            <div className="space-y-2 pt-1">
              {Object.entries(topicPerformanceMap).map(([topic, stats]) => {
                const acc = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                const isWeak = acc < 60;

                return (
                  <div
                    key={topic}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2 shadow-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-900 truncate">{topic}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              acc >= 75 ? 'bg-emerald-600' : acc >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${acc}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 font-medium">
                          {stats.correct}/{stats.total} ({acc}%)
                        </span>
                      </div>
                    </div>

                    {isWeak && onDrillTopic && (
                      <button
                        onClick={() => onDrillTopic(topic)}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-bold shrink-0 transition flex items-center gap-1"
                      >
                        <span>Drill Topic</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={() => setTestState('idle')}
              className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs active:scale-95 transition"
            >
              Choose Another Test
            </button>
            <button
              onClick={() => startTest(selectedFormat)}
              className="flex-1 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Test</span>
            </button>
          </div>
        </div>

        {/* Question by Question Review */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 px-1">
            <BarChart3 className="w-4 h-4 text-blue-700" />
            <span>Detailed Question Review & Speed-Per-Question</span>
          </h3>

          {testQuestions.map((q, idx) => {
            const userChoice = answers[q.id];
            const isCorrect = userChoice === q.correctIndex;
            const isSkipped = userChoice === undefined;
            const timeTaken = questionTimeSeconds[q.id] || 0;

            const speedBadge =
              timeTaken <= 35
                ? { label: 'Fast ⚡', color: 'text-emerald-700 bg-emerald-50 border border-emerald-200' }
                : timeTaken <= 60
                ? { label: 'Optimal ⏱️', color: 'text-blue-700 bg-blue-50 border border-blue-200' }
                : { label: 'Slow ⚠️', color: 'text-amber-800 bg-amber-50 border border-amber-200' };

            return (
              <div
                key={q.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 text-xs shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500 font-mono">Q{idx + 1}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                      {q.topic}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${speedBadge.color}`}>
                      {speedBadge.label} ({timeTaken}s)
                    </span>
                  </div>

                  {isSkipped ? (
                    <span className="text-slate-500 font-semibold">Skipped</span>
                  ) : isCorrect ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> +1.00
                    </span>
                  ) : (
                    <span className="text-rose-700 font-bold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> -0.33
                    </span>
                  )}
                </div>

                <p className="text-slate-900 font-semibold leading-relaxed question-text">
                  {isTamil ? q.questionTa : q.questionEn}
                </p>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="text-[11px] text-slate-600">
                    Your Choice:{' '}
                    <strong className={isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                      {userChoice !== undefined
                        ? isTamil
                          ? q.optionsTa[userChoice]
                          : q.optionsEn[userChoice]
                        : 'None'}
                    </strong>
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Correct Choice:{' '}
                    <strong className="text-emerald-700">
                      {isTamil ? q.optionsTa[q.correctIndex] : q.optionsEn[q.correctIndex]}
                    </strong>
                  </p>
                  <p className="text-[11px] text-slate-700 pt-1 border-t border-slate-200 mt-1 font-medium">
                    💡 <strong>Solution & Shortcut:</strong>{' '}
                    {isTamil ? q.explanationTa : q.explanationEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 3. Running CBT Test Interface
  const currentQ = testQuestions[currentIdx];
  const userAns = answers[currentQ?.id];
  const isFlagged = flagged[currentQ?.id];
  const isUrgent = timeLeft < 120; // Under 2 mins warning

  return (
    <div className="p-4 max-w-xl mx-auto flex flex-col min-h-[calc(100dvh-4.25rem)] justify-between pb-24">
      {/* Top Test Header Bar */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-600">
              Q{currentIdx + 1} of {testQuestions.length}
            </span>
            <button
              onClick={onToggleLanguage}
              className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700"
            >
              <Languages className="w-3 h-3" />
              <span>{isTamil ? 'தமிழ்' : 'English'}</span>
            </button>
          </div>

          {/* Countdown Clock with 2-Minute Alert */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono text-xs font-bold transition ${
              isUrgent
                ? 'bg-rose-50 border border-rose-300 text-rose-700 animate-pulse ring-2 ring-rose-200'
                : 'bg-white border border-slate-200 text-slate-800 shadow-xs'
            }`}
          >
            <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-rose-600 animate-bounce' : 'text-blue-700'}`} />
            <span>{formatTime(timeLeft)}</span>
            {isUrgent && <span className="text-[10px] uppercase font-mono font-bold ml-1 text-rose-700">Urgent!</span>}
          </div>
        </div>

        {/* Interactive Question Palette */}
        <div className="py-2.5">
          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1.5 px-1 font-semibold">
            <span>Palette:</span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-blue-600" /> Answered
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-amber-500" /> Review
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-slate-300" /> Unvisited
              </span>
            </div>
          </div>

          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {testQuestions.map((q, idx) => {
              const isAns = answers[q.id] !== undefined;
              const isFlg = flagged[q.id];
              const isCur = idx === currentIdx;
              const isVis = visited[q.id];

              let badgeClass = 'bg-white border-slate-200 text-slate-500'; // Unvisited
              if (isCur) badgeClass = 'border-blue-600 text-blue-700 ring-2 ring-blue-500/40 font-bold';
              else if (isFlg) badgeClass = 'bg-amber-50 border-amber-400 text-amber-900 font-bold';
              else if (isAns) badgeClass = 'bg-blue-600 border-blue-600 text-white font-bold';
              else if (isVis) badgeClass = 'bg-slate-100 border-slate-200 text-slate-700';

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`w-7 h-7 rounded-xl border text-xs font-mono shrink-0 transition ${badgeClass}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Card */}
        {currentQ && (
          <div className="mt-2 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-blue-700 font-mono block mb-1">
                  {currentQ.topic} • RRB {currentQ.rrbExam}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed question-text">
                  {isTamil ? currentQ.questionTa : currentQ.questionEn}
                </h3>
              </div>

              <button
                onClick={() =>
                  setFlagged((prev) => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }))
                }
                title="Mark for Review"
                className={`p-2 rounded-xl border transition shrink-0 ${
                  isFlagged
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-amber-600'
                }`}
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>

            {/* Options */}
            <div className="mt-4 space-y-2.5">
              {(isTamil ? currentQ.optionsTa : currentQ.optionsEn).map((opt, optIdx) => {
                const isSelected = userAns === optIdx;

                return (
                  <button
                    key={optIdx}
                    onClick={() => {
                      setAnswers((prev) => ({ ...prev, [currentQ.id]: optIdx }));
                      triggerSuccessHaptic();
                    }}
                    className={`w-full p-3.5 rounded-xl border text-left text-sm sm:text-base font-medium transition flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs ring-1 ring-blue-600 font-bold'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-6 h-6 rounded-lg border flex items-center justify-center text-[10px] font-mono font-bold ${
                        isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 border-slate-200 text-slate-600'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>

                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation & Controls */}
      <div className="pt-4 border-t border-slate-200 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
            className="flex items-center gap-1 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition active:scale-95 shadow-xs"
          >
            Submit Exam ({Object.keys(answers).length}/{testQuestions.length})
          </button>

          <button
            onClick={() => setCurrentIdx((prev) => Math.min(testQuestions.length - 1, prev + 1))}
            disabled={currentIdx === testQuestions.length - 1}
            className="flex items-center gap-1 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Confirmation Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-slate-200 p-6 space-y-4 text-center shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Submit RRB CBT Exam?</h3>
            <p className="text-xs text-slate-600">
              You have answered{' '}
              <strong className="text-blue-700 font-mono">
                {Object.keys(answers).length} of {testQuestions.length}
              </strong>{' '}
              questions. Time remaining: {formatTime(timeLeft)}.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                Continue Exam
              </button>
              <button
                onClick={finishTest}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
