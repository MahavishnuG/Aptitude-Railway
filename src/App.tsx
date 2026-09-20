import React, { useState, useEffect } from 'react';
import { Question, UserProfile, MockTestResult, QuestionTopic, NavigationTab } from './types';
import { STARTER_QUESTIONS } from './data/questionBank';
import { initDatabase, saveNewQuestions } from './utils/db';
import {
  subscribeToAuthChanges,
  getUserProfileFromFirestore,
  syncUserProfileToFirestore,
} from './firebase/config';
import { ReelsFeed } from './components/ReelsFeed';
import { DashboardView } from './components/DashboardView';
import { PracticeHubView } from './components/PracticeHubView';
import { MockTestView } from './components/MockTestView';
import { MockHistoryView } from './components/MockHistoryView';
import { SocraticHintModal } from './components/SocraticHintModal';
import { FormulaMatcherModal } from './components/FormulaMatcherModal';
import { CalendarReminderModal } from './components/CalendarReminderModal';
import { ShareStreakModal } from './components/ShareStreakModal';
import { ProfileAuthModal } from './components/ProfileAuthModal';
import { DailyChallengeModal } from './components/DailyChallengeModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import {
  Flame,
  Layers,
  LayoutDashboard,
  BookOpen,
  Clock,
  History,
  User,
  Languages,
  Brain,
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'rrb_aptitude_profile_v2';
const DAILY_CHALLENGE_COMPLETED_KEY = 'rrb_daily_challenge_completed_date';
const DAILY_CHALLENGE_SEEN_KEY = 'rrb_daily_challenge_seen_date';

const defaultProfile: UserProfile = {
  userId: 'guest-aspirant',
  displayName: 'Aspirant',
  streakCount: 3,
  lastActiveDate: new Date().toISOString().slice(0, 10),
  points: 240,
  dailyFuel: 7,
  dailyGoal: 15,
  targetExam: 'NTPC',
  completedQuestions: ['rrb-td-01', 'rrb-tw-01', 'rrb-sm-01'],
  mockScores: [],
};

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [isTamil, setIsTamil] = useState<boolean>(false);
  const [allQuestions, setAllQuestions] = useState<Question[]>(STARTER_QUESTIONS);
  const [selectedQuestionForReels, setSelectedQuestionForReels] = useState<string | null>(null);
  const [selectedTopicForHub, setSelectedTopicForHub] = useState<QuestionTopic | null>(null);

  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Ignored
    }
    return defaultProfile;
  });

  const [currentUser, setCurrentUser] = useState<any>(null);

  // Modals state
  const [showDailyChallenge, setShowDailyChallenge] = useState(false);
  const [activeHintQuestion, setActiveHintQuestion] = useState<Question | null>(null);
  const [showFormulaMatcher, setShowFormulaMatcher] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Auto-launch Daily RRB Challenge modal on first app launch each day
  useEffect(() => {
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const completedDate = localStorage.getItem(DAILY_CHALLENGE_COMPLETED_KEY);
      const seenDate = localStorage.getItem(DAILY_CHALLENGE_SEEN_KEY);

      if (completedDate !== todayStr && seenDate !== todayStr) {
        const timer = setTimeout(() => {
          setShowDailyChallenge(true);
          localStorage.setItem(DAILY_CHALLENGE_SEEN_KEY, todayStr);
        }, 600);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignored
    }
  }, []);

  // IndexedDB initialization & Daily RRB Challenge Pack fetch
  useEffect(() => {
    async function loadIndexedData() {
      try {
        const stored = await initDatabase(STARTER_QUESTIONS);
        if (stored && stored.length > 0) {
          setAllQuestions(stored);
        }

        // Check and fetch daily challenge pack
        try {
          const res = await fetch('/api/daily-challenge');
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.questions) && data.questions.length > 0) {
              await saveNewQuestions(data.questions);
              setAllQuestions((prev: Question[]) => {
                const existingIds = new Set(prev.map((q) => q.id));
                const fresh = data.questions.filter((q: Question) => !existingIds.has(q.id));
                return [...prev, ...fresh];
              });
            }
          }
        } catch {
          // Offline fallback
        }
      } catch (err) {
        console.error('Failed to init IndexedDB:', err);
      }
    }
    loadIndexedData();
  }, []);

  // Persist Profile locally on every change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Ignored
    }
  }, [profile]);

  // Auth State Listener & Firestore Sync
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const remoteProfile = await getUserProfileFromFirestore(user.uid);
          if (remoteProfile) {
            setProfile((prev) => ({
              ...prev,
              ...remoteProfile,
              displayName: user.displayName || remoteProfile.displayName || prev.displayName,
              email: user.email || remoteProfile.email,
              photoURL: user.photoURL || remoteProfile.photoURL,
              userId: user.uid,
            }));
          } else {
            // First time cloud setup
            const initialCloudProfile: UserProfile = {
              ...profile,
              userId: user.uid,
              displayName: user.displayName || 'Aspirant',
              email: user.email || '',
              photoURL: user.photoURL || '',
            };
            setProfile(initialCloudProfile);
            await syncUserProfileToFirestore(initialCloudProfile);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Check Daily Streak rollover
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (profile.lastActiveDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);

      setProfile((prev) => {
        const isContinuous = prev.lastActiveDate === yesterdayStr;
        const newStreak = isContinuous ? prev.streakCount : 1;
        const updated: UserProfile = {
          ...prev,
          lastActiveDate: today,
          streakCount: newStreak,
          dailyFuel: 0, // Reset daily fuel counter for the new morning
        };
        if (currentUser) {
          syncUserProfileToFirestore(updated).catch(() => {});
        }
        return updated;
      });
    }
  }, [profile.lastActiveDate, currentUser]);

  // Handle Question Solved
  const handleQuestionSolved = (questionId: string) => {
    setProfile((prev: UserProfile) => {
      if (prev.completedQuestions.includes(questionId)) return prev;

      const newCompleted = [...prev.completedQuestions, questionId];
      const newFuel = Math.min(prev.dailyGoal, prev.dailyFuel + 1);
      const newPoints = prev.points + 20;

      const updated: UserProfile = {
        ...prev,
        completedQuestions: newCompleted,
        dailyFuel: newFuel,
        points: newPoints,
      };

      if (currentUser) {
        syncUserProfileToFirestore(updated).catch(() => {});
      }
      return updated;
    });
  };

  // Handle Mock Test Completion
  const handleMockTestCompleted = async (result: MockTestResult) => {
    setProfile((prev: UserProfile) => {
      const updated: UserProfile = {
        ...prev,
        points: prev.points + Math.round(result.score * 15),
        dailyFuel: Math.min(prev.dailyGoal, prev.dailyFuel + 3),
        mockScores: [result, ...(prev.mockScores || []).slice(0, 19)],
      };

      if (currentUser) {
        syncUserProfileToFirestore(updated).catch(() => {});
      }

      return updated;
    });
  };

  const handleSelectQuestionFromPractice = (q: Question) => {
    setSelectedQuestionForReels(q.id);
    setActiveTab('reels');
  };

  const handleQuestionsAdded = (newQuestions: Question[]) => {
    setAllQuestions((prev: Question[]) => {
      const existingIds = new Set(prev.map((q) => q.id));
      const fresh = newQuestions.filter((q) => !existingIds.has(q.id));
      return [...prev, ...fresh];
    });
  };

  const handleDrillTopic = (topic: string) => {
    setSelectedTopicForHub(topic as QuestionTopic);
    setActiveTab('topics');
  };

  const handleCompleteDailyChallenge = (score: number, total: number) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    try {
      localStorage.setItem(DAILY_CHALLENGE_COMPLETED_KEY, todayStr);
    } catch {
      // Ignored
    }

    setProfile((prev: UserProfile) => {
      const isAlreadyBoostedToday = prev.lastActiveDate === todayStr && prev.lastDailyChallengeDate === todayStr;
      const newStreak = isAlreadyBoostedToday ? prev.streakCount : prev.streakCount + 1;
      const updated: UserProfile = {
        ...prev,
        streakCount: newStreak,
        lastActiveDate: todayStr,
        lastDailyChallengeDate: todayStr,
        points: prev.points + 50,
        dailyFuel: Math.min(prev.dailyGoal, (prev.dailyFuel || 0) + 5),
      };

      if (currentUser) {
        syncUserProfileToFirestore(updated).catch(() => {});
      }
      return updated;
    });
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const isDailyChallengeCompletedToday =
    (typeof window !== 'undefined' && localStorage.getItem(DAILY_CHALLENGE_COMPLETED_KEY) === todayStr) ||
    profile.lastDailyChallengeDate === todayStr;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans select-none antialiased">
      {/* Offline Status Alert */}
      <OfflineIndicator />

      {/* Train-Themed Official Station Header */}
      <header className="h-14 border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-4 flex items-center justify-between shadow-xs">
        {/* Brand & Train Emblem */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold shadow-xs text-sm">
            🚂
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
              <span>INDIAN RAILWAYS RRB</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                CEN CBT
              </span>
            </h1>
            <p className="text-[10px] text-slate-500 font-mono -mt-0.5 font-medium">
              NTPC • Group D • ALP • JE
            </p>
          </div>
        </div>

        {/* Top Right Train Utilities */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Daily RRB Challenge Quick Button */}
          <button
            id="btn-header-daily-challenge"
            onClick={() => setShowDailyChallenge(true)}
            title={isTamil ? 'தினசரி ரயில்வே சவால்' : 'Daily RRB Challenge (5 Questions)'}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border transition active:scale-95 shadow-xs ${
              isDailyChallengeCompletedToday
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
            }`}
          >
            <span>🚂</span>
            <span className="hidden sm:inline">
              {isDailyChallengeCompletedToday
                ? (isTamil ? 'சவால் முடிந்தது' : 'Daily Done')
                : (isTamil ? 'தினசரி சவால்' : 'Daily 5')}
            </span>
          </button>

          {/* Mind Game Formula Matcher Quick Button */}
          <button
            id="btn-header-formula-game"
            onClick={() => setShowFormulaMatcher(true)}
            title="Formula Matcher (60s)"
            className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-blue-700 active:scale-95 transition shadow-xs"
          >
            <Brain className="w-4 h-4" />
          </button>

          {/* Dual Language Switcher */}
          <button
            id="btn-global-lang-toggle"
            onClick={() => setIsTamil((prev) => !prev)}
            title="Toggle Language"
            className="flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 active:scale-95 transition shadow-xs"
          >
            <Languages className="w-3.5 h-3.5 text-blue-700" />
            <span>{isTamil ? 'தமிழ்' : 'English'}</span>
          </button>

          {/* Daily Streak Indicator */}
          <button
            id="btn-header-streak"
            onClick={() => setShowShareModal(true)}
            title="View & Share Streak"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold active:scale-95 transition shadow-xs"
          >
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{profile.streakCount} D</span>
          </button>

          {/* Minimal Install Button in Header */}
          <PWAInstallButton minimal />

          {/* Profile / Cloud Avatar */}
          <button
            id="btn-header-profile"
            onClick={() => setShowProfileModal(true)}
            title="Aspirant Profile & Cloud Sync"
            className="p-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 active:scale-95 transition shadow-xs"
          >
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="User"
                className="w-6 h-6 rounded-lg object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden relative">
        {activeTab === 'dashboard' && (
          <div className="h-[calc(100dvh-7.5rem)] overflow-y-auto no-scrollbar">
            <DashboardView
              profile={profile}
              allQuestions={allQuestions}
              isTamil={isTamil}
              onResumePractice={() => setActiveTab('reels')}
              onOpenCalendar={() => setShowCalendarModal(true)}
              onOpenShare={() => setShowShareModal(true)}
              onOpenFormulaMatcher={() => setShowFormulaMatcher(true)}
              onOpenMockTest={() => setActiveTab('mock')}
              onOpenDailyChallenge={() => setShowDailyChallenge(true)}
              isDailyChallengeCompletedToday={isDailyChallengeCompletedToday}
              onSelectTopic={(topicName) => {
                setSelectedTopicForHub(topicName as QuestionTopic);
                setActiveTab('topics');
              }}
            />
          </div>
        )}

        {activeTab === 'topics' && (
          <div className="h-[calc(100dvh-7.5rem)] overflow-y-auto no-scrollbar">
            <PracticeHubView
              questions={allQuestions}
              completedIds={profile.completedQuestions}
              isTamil={isTamil}
              onSelectQuestion={handleSelectQuestionFromPractice}
              onOpenSocraticHint={(q) => setActiveHintQuestion(q)}
              onQuestionsAdded={handleQuestionsAdded}
              initialTopicFilter={selectedTopicForHub}
            />
          </div>
        )}

        {activeTab === 'reels' && (
          <ReelsFeed
            questions={allQuestions}
            isTamil={isTamil}
            onToggleLanguage={() => setIsTamil((prev) => !prev)}
            completedIds={profile.completedQuestions}
            onQuestionSolved={handleQuestionSolved}
            onOpenSocraticHint={(q) => setActiveHintQuestion(q)}
            initialQuestionId={selectedQuestionForReels}
          />
        )}

        {activeTab === 'mock' && (
          <div className="h-[calc(100dvh-7.5rem)] overflow-y-auto no-scrollbar">
            <MockTestView
              questions={allQuestions}
              isTamil={isTamil}
              onToggleLanguage={() => setIsTamil((prev) => !prev)}
              onTestCompleted={handleMockTestCompleted}
              onDrillTopic={handleDrillTopic}
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="h-[calc(100dvh-7.5rem)] overflow-y-auto no-scrollbar">
            <MockHistoryView
              history={profile.mockScores || []}
              isTamil={isTamil}
              onReattempt={() => setActiveTab('mock')}
              onStartNewMock={() => setActiveTab('mock')}
            />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="h-[calc(100dvh-7.5rem)] overflow-y-auto no-scrollbar p-4 max-w-xl mx-auto space-y-4">
            <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-2xl font-bold text-blue-700">
                  {currentUser?.photoURL ? (
                    <img src={currentUser.photoURL} alt="Avatar" className="w-full h-full rounded-2xl object-cover" />
                  ) : (
                    '🚆'
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{profile.displayName}</h2>
                  <p className="text-xs text-blue-700 font-mono font-medium">
                    {profile.email || 'Guest Aspirant Mode'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">
                    Streak: {profile.streakCount} Days • Points: {profile.points} Pts
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition shadow-xs"
                >
                  Manage Cloud Sync & Auth
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
                >
                  Share Scorecard
                </button>
              </div>
            </div>

            {/* PWA Full Install Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <PWAInstallButton />
            </div>
          </div>
        )}
      </main>

      {/* Bottom Sticky Train-Themed Navigation Tabs (Elevated 5-Icon Bar) */}
      <nav className="h-16 border-t border-slate-200 bg-white/95 backdrop-blur-md sticky bottom-0 z-40 px-2 sm:px-6 flex items-center justify-around shadow-sm">
        {/* 1. Dashboard */}
        <button
          id="tab-dashboard"
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 transition px-2 py-1 rounded-xl ${
            activeTab === 'dashboard'
              ? 'text-blue-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 ${activeTab === 'dashboard' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] sm:text-[11px] font-semibold">
            {isTamil ? 'முகப்பு' : 'Dashboard'}
          </span>
        </button>

        {/* 2. Topics */}
        <button
          id="tab-topics"
          onClick={() => {
            setSelectedTopicForHub(null);
            setActiveTab('topics');
          }}
          className={`flex flex-col items-center gap-1 transition px-2 py-1 rounded-xl ${
            activeTab === 'topics'
              ? 'text-blue-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className={`w-5 h-5 ${activeTab === 'topics' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] sm:text-[11px] font-semibold">
            {isTamil ? 'பாடத்திட்டம்' : 'Topics'}
          </span>
        </button>

        {/* 3. Speed Shots */}
        <button
          id="tab-reels"
          onClick={() => setActiveTab('reels')}
          className={`flex flex-col items-center gap-1 transition px-2 py-1 rounded-xl ${
            activeTab === 'reels'
              ? 'text-blue-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className={`w-5 h-5 ${activeTab === 'reels' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] sm:text-[11px] font-semibold">
            {isTamil ? 'வேகம்' : 'Speed Shots'}
          </span>
        </button>

        {/* 4. Mock Tests */}
        <button
          id="tab-mock"
          onClick={() => setActiveTab('mock')}
          className={`flex flex-col items-center gap-1 transition px-2 py-1 rounded-xl ${
            activeTab === 'mock'
              ? 'text-blue-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className={`w-5 h-5 ${activeTab === 'mock' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] sm:text-[11px] font-semibold">
            {isTamil ? 'தேர்வுகள்' : 'Mock Tests'}
          </span>
        </button>

        {/* 5. History & Analytics */}
        <button
          id="tab-history"
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 transition px-2 py-1 rounded-xl ${
            activeTab === 'history'
              ? 'text-blue-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className={`w-5 h-5 ${activeTab === 'history' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] sm:text-[11px] font-semibold">
            {isTamil ? 'வரலாறு' : 'History'}
          </span>
        </button>
      </nav>

      {/* Daily RRB Challenge Modal (5 Mixed Questions on First Launch / On Demand) */}
      {showDailyChallenge && (
        <DailyChallengeModal
          isOpen={showDailyChallenge}
          onClose={() => setShowDailyChallenge(false)}
          isTamil={isTamil}
          onToggleLanguage={() => setIsTamil((prev) => !prev)}
          allQuestions={allQuestions}
          currentStreak={profile.streakCount}
          onCompleteChallenge={handleCompleteDailyChallenge}
          isAlreadyCompletedToday={isDailyChallengeCompletedToday}
        />
      )}

      {/* Socratic 3-Tier Hint Modal (Smooth Bottom Drawer) */}
      {activeHintQuestion && (
        <SocraticHintModal
          question={activeHintQuestion}
          isTamil={isTamil}
          onClose={() => setActiveHintQuestion(null)}
        />
      )}

      {/* Formula Matcher Game Modal */}
      {showFormulaMatcher && (
        <FormulaMatcherModal
          isTamil={isTamil}
          onClose={() => setShowFormulaMatcher(false)}
          onRewardPoints={(pts) => {
            setProfile((prev) => {
              const updated = {
                ...prev,
                points: prev.points + pts,
                dailyFuel: Math.min(prev.dailyGoal, prev.dailyFuel + 2),
              };
              if (currentUser) syncUserProfileToFirestore(updated).catch(() => {});
              return updated;
            });
          }}
        />
      )}

      {/* Calendar Study Reminder Modal */}
      {showCalendarModal && (
        <CalendarReminderModal
          streak={profile.streakCount}
          onClose={() => setShowCalendarModal(false)}
        />
      )}

      {/* Scorecard / Streak Share Modal */}
      {showShareModal && (
        <ShareStreakModal
          profile={profile}
          stationName="New Delhi Central (NDLS)"
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Profile & Google Auth Sync Modal */}
      {showProfileModal && (
        <ProfileAuthModal
          profile={profile}
          currentUser={currentUser}
          onProfileUpdated={(updated) => setProfile(updated)}
          onOpenCalendar={() => setShowCalendarModal(true)}
          onOpenShare={() => setShowShareModal(true)}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
}
