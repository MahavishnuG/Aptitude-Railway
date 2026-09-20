import React, { useState, useEffect } from 'react';
import { Question, QuestionTopic, RRBExamType } from '../types';
import { TOPIC_CATEGORIES } from '../data/topicData';
import { saveNewQuestions } from '../utils/db';
import {
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Play,
  Lightbulb,
  Zap,
  Volume2,
  VolumeX,
  BookOpen,
  Sparkles,
  Loader2,
  PlusCircle,
  ArrowLeft,
} from 'lucide-react';
import { speakText, stopSpeaking, isSpeaking } from '../utils/speech';

interface PracticeHubViewProps {
  questions: Question[];
  completedIds: string[];
  isTamil: boolean;
  onSelectQuestion: (question: Question) => void;
  onOpenSocraticHint: (question: Question) => void;
  onQuestionsAdded?: (newQuestions: Question[]) => void;
  initialTopicFilter?: QuestionTopic | null;
}

export const PracticeHubView: React.FC<PracticeHubViewProps> = ({
  questions,
  completedIds,
  isTamil,
  onSelectQuestion,
  onOpenSocraticHint,
  onQuestionsAdded,
  initialTopicFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [activeTopic, setActiveTopic] = useState<QuestionTopic | null>(initialTopicFilter || null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamSuccessMsg, setStreamSuccessMsg] = useState<string | null>(null);
  const [autoFetchedTopics, setAutoFetchedTopics] = useState<Record<string, boolean>>({});

  // Sync initial topic filter if passed
  useEffect(() => {
    if (initialTopicFilter) {
      setActiveTopic(initialTopicFilter);
    }
  }, [initialTopicFilter]);

  // Requirement 3: Only trigger background API fetching when the local pool drops below 5 questions
  // preventing unnecessary repeated API hits during peak server hours
  useEffect(() => {
    if (!activeTopic) return;
    const topicQs = questions.filter((q) => q.topic === activeTopic);
    const solvedCount = topicQs.filter((q) => completedIds.includes(q.id)).length;
    const remainingInPool = topicQs.length - solvedCount;

    if (remainingInPool < 5 && !autoFetchedTopics[activeTopic] && !isStreaming) {
      setAutoFetchedTopics((prev) => ({ ...prev, [activeTopic]: true }));
      handleStreamFreshBatch(activeTopic, true);
    }
  }, [activeTopic, completedIds, questions, autoFetchedTopics, isStreaming]);

  const toggleCategory = (catId: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const filteredCategories = TOPIC_CATEGORIES.map((cat) => {
    const matchingTopics = cat.topics.filter(
      (t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.nameTa.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...cat, topics: matchingTopics };
  }).filter((cat) => cat.topics.length > 0);

  const handleToggleSpeak = (q: Question) => {
    if (speakingId === q.id && isSpeaking()) {
      stopSpeaking();
      setSpeakingId(null);
    } else {
      setSpeakingId(q.id);
      speakText(
        isTamil ? q.questionTa : q.questionEn,
        isTamil ? 'ta' : 'en',
        () => setSpeakingId(null),
        () => setSpeakingId(null)
      );
    }
  };

  // Live Infinite Stream from Gemini API endpoint /api/generate-questions
  const handleStreamFreshBatch = async (topic: QuestionTopic, isAutoTrigger = false) => {
    setIsStreaming(true);
    if (!isAutoTrigger) setStreamSuccessMsg(null);

    try {
      const exams: RRBExamType[] = ['NTPC', 'Group D', 'ALP', 'JE'];
      const randomExam = exams[Math.floor(Math.random() * exams.length)];

      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          exam: randomExam,
          count: 10,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to stream questions from server');
      }

      const data = await res.json();
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        // Save to IndexedDB
        await saveNewQuestions(data.questions);

        // Update local app state
        if (onQuestionsAdded) {
          onQuestionsAdded(data.questions);
        }

        setStreamSuccessMsg(
          isTamil
            ? `⚡ 10 புதிய தேர்வுக் கேள்விகள் வெற்றிகரமாக சேர்க்கப்பட்டன!`
            : `⚡ 10 fresh RRB ${randomExam} questions added for ${topic}!`
        );
        setTimeout(() => setStreamSuccessMsg(null), 5000);
      }
    } catch (err) {
      console.warn('Live streaming notice:', err);
      if (!isAutoTrigger) {
        setStreamSuccessMsg(
          isTamil
            ? 'இணைப்பில் சிக்கல். சேமிக்கப்பட்ட கேள்விகள் தயாராக உள்ளன.'
            : 'Using verified question bank. Questions loaded.'
        );
        setTimeout(() => setStreamSuccessMsg(null), 4000);
      }
    } finally {
      setIsStreaming(false);
    }
  };

  // If a topic is selected, view its questions
  if (activeTopic) {
    const topicQuestions = questions.filter((q) => q.topic === activeTopic);
    const solvedCount = topicQuestions.filter((q) => completedIds.includes(q.id)).length;

    return (
      <div className="p-4 max-w-2xl mx-auto space-y-4 pb-28 animate-in fade-in duration-150">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <button
              onClick={() => setActiveTopic(null)}
              className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 mb-1 transition active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isTamil ? 'பாடத்திட்டத்திற்கு திரும்புக' : 'All Topics Directory'}</span>
            </button>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">{activeTopic}</h2>
          </div>

          <span className="text-xs font-mono font-bold text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            {solvedCount} / {topicQuestions.length} Solved
          </span>
        </div>

        {/* Live Question Stream Banner */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-xs">
          <div className="space-y-0.5">
            <span className="text-[11px] uppercase font-bold text-blue-700 tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>{isTamil ? 'நேரடி AI வினா ஊற்று' : 'Infinite Question Stream'}</span>
            </span>
            <p className="text-xs text-slate-600">
              {isTamil
                ? 'புதிய 10 RRB வினாக்களை உடனுக்குடன் பதிவிறக்கவும்.'
                : 'Auto-streams more questions as you solve, or fetch 10 more on demand.'}
            </p>
          </div>

          <button
            id="btn-stream-questions"
            onClick={() => handleStreamFreshBatch(activeTopic)}
            disabled={isStreaming}
            className="px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shrink-0 active:scale-95 transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            {isStreaming ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>+10 More</span>
              </>
            )}
          </button>
        </div>

        {/* Success / Alert Toast */}
        {streamSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{streamSuccessMsg}</span>
          </div>
        )}

        {/* Question Cards List for this topic */}
        <div className="space-y-3">
          {topicQuestions.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
              <p className="text-xs text-slate-500">
                No questions stored yet for this topic. Stream fresh questions via Gemini AI!
              </p>
              <button
                onClick={() => handleStreamFreshBatch(activeTopic)}
                className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs"
              >
                Stream 10 Questions Now
              </button>
            </div>
          ) : (
            topicQuestions.map((q, idx) => {
              const isSolved = completedIds.includes(q.id);
              const isPlayingThis = speakingId === q.id;

              return (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-500 font-mono">Q{idx + 1}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                        RRB {q.rrbExam}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 font-semibold">
                        {q.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isSolved && (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Solved
                        </span>
                      )}

                      <button
                        onClick={() => handleToggleSpeak(q)}
                        className={`p-1.5 rounded-lg border transition ${
                          isPlayingThis
                            ? 'bg-blue-700 text-white border-blue-700 animate-pulse'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isPlayingThis ? (
                          <VolumeX className="w-3.5 h-3.5" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5 text-blue-700" />
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-slate-900 leading-snug question-text">
                    {isTamil ? q.questionTa : q.questionEn}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onOpenSocraticHint(q)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200 transition"
                    >
                      <Lightbulb className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                      <span>3-Tier Hint</span>
                    </button>

                    <button
                      onClick={() => onSelectQuestion(q)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-white text-white" />
                      <span>Practice Card</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {/* Visible "Load 10 More Questions" Button at bottom of list */}
          <div className="pt-3 text-center">
            <button
              onClick={() => handleStreamFreshBatch(activeTopic)}
              disabled={isStreaming}
              className="w-full py-3 rounded-2xl bg-white border border-blue-200 hover:bg-blue-50/50 text-blue-700 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-98 disabled:opacity-50"
            >
              {isStreaming ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-700" />
                  <span>Streaming 10 More Questions...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4 text-blue-700" />
                  <span>Load 10 More Questions for {activeTopic}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-5 pb-28">
      {/* Search Header */}
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-700" />
            <span>{isTamil ? 'முழுமையான 28 பாடத்திட்ட பயிற்சி கூடம்' : 'Complete 28 RRB Topic Matrix'}</span>
          </h2>
          <p className="text-xs text-slate-500">
            {isTamil
              ? 'அனைத்து Quantitative Aptitude & Logical Reasoning தலைப்புகளும்'
              : 'Quantitative Aptitude, Logical Reasoning & Speed Math with real-time mastery tracking'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isTamil
                ? 'தலைப்பு அல்லது சூத்திரத்தை தேடுக...'
                : 'Search topics (e.g., Trains, Syllogism, Pipes, Clocks)...'
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition shadow-xs"
          />
        </div>
      </div>

      {/* Categories Accordions */}
      <div className="space-y-3.5">
        {filteredCategories.map((cat) => {
          const isCollapsed = collapsedCategories[cat.id];
          const totalInCat = cat.topics.reduce((acc, t) => {
            const count = questions.filter((q) => q.topic === t.name).length;
            return acc + count;
          }, 0);
          const solvedInCat = cat.topics.reduce((acc, t) => {
            const count = questions
              .filter((q) => q.topic === t.name)
              .filter((q) => completedIds.includes(q.id)).length;
            return acc + count;
          }, 0);

          return (
            <div
              key={cat.id}
              className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs"
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(cat.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                    {cat.badge}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {isTamil ? cat.titleTa : cat.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {cat.topics.length} Modules • {solvedInCat}/{totalInCat} Solved
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all"
                      style={{
                        width: `${totalInCat > 0 ? (solvedInCat / totalInCat) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  {isCollapsed ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Topics Grid */}
              {!isCollapsed && (
                <div className="p-3 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {cat.topics.map((topic) => {
                    const topicQs = questions.filter((q) => q.topic === topic.name);
                    const solved = topicQs.filter((q) => completedIds.includes(q.id)).length;
                    const percent = topicQs.length > 0 ? Math.round((solved / topicQs.length) * 100) : 0;

                    return (
                      <div
                        key={topic.name}
                        onClick={() => setActiveTopic(topic.name)}
                        className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 cursor-pointer transition flex flex-col justify-between gap-3 group"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition line-clamp-1">
                              {isTamil ? topic.nameTa : topic.name}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-slate-500 shrink-0">
                              {solved}/{topicQs.length}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {topic.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/70 text-[10px]">
                          <div className="flex items-center gap-1.5 flex-1">
                            <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <span className="font-mono text-blue-700 font-semibold">{percent}%</span>
                          </div>

                          <span className="font-bold text-blue-700 group-hover:translate-x-0.5 transition flex items-center gap-0.5">
                            Practice →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
