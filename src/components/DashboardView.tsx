import React, { useState, useMemo } from 'react';
import { UserProfile, Question, QuestionTopic } from '../types';
import { TOPIC_CATEGORIES } from '../data/topicData';
import {
  Flame,
  Zap,
  Play,
  Share2,
  Clock,
  Brain,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  MapPin,
  TrainTrack,
  Flag,
  Navigation,
  Compass,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  Filter,
} from 'lucide-react';

interface DashboardViewProps {
  profile: UserProfile;
  allQuestions: Question[];
  isTamil: boolean;
  onResumePractice: () => void;
  onOpenCalendar: () => void;
  onOpenShare: () => void;
  onOpenFormulaMatcher: () => void;
  onOpenMockTest: () => void;
  onSelectTopic: (topicName: string) => void;
  onOpenDailyChallenge?: () => void;
  isDailyChallengeCompletedToday?: boolean;
}

interface CareerMilestone {
  id: string;
  rank: string;
  rankTa: string;
  station: string;
  requiredQs: number;
  icon: string;
}

const CAREER_MILESTONES: CareerMilestone[] = [
  {
    id: 'm1',
    rank: 'Trackman / Gangman',
    rankTa: 'தண்டவாள பராமரிப்பாளர்',
    station: 'Guindy Junction',
    requiredQs: 0,
    icon: '🛤️',
  },
  {
    id: 'm2',
    rank: 'Assistant Loco Pilot (ALP)',
    rankTa: 'உதவி லோகோ பைலட்',
    station: 'Tambaram Yard',
    requiredQs: 5,
    icon: '🚆',
  },
  {
    id: 'm3',
    rank: 'Junior Engineer (JE)',
    rankTa: 'இளநிலைப் பொறியாளர்',
    station: 'Arakkonam Depot',
    requiredQs: 12,
    icon: '⚙️',
  },
  {
    id: 'm4',
    rank: 'Senior Section Engineer',
    rankTa: 'முதன்மை பிரிவு பொறியாளர்',
    station: 'Katpadi Junction',
    requiredQs: 20,
    icon: '📡',
  },
  {
    id: 'm5',
    rank: 'Chief Station Master',
    rankTa: 'தலைமை நிலைய அதிகாரி',
    station: 'Chennai Central Terminus',
    requiredQs: 30,
    icon: '👑',
  },
];

// Authentic Indian Railway Station Corridor mapping for all 28 RRB CBT Topics
export const TOPIC_STATION_MAP: Record<
  string,
  { code: string; name: string; nameTa: string; zone: string; km: number }
> = {
  'Number System & Divisibility Rules': {
    code: 'MAS',
    name: 'Chennai Central Terminus',
    nameTa: 'சென்னை சென்ட்ரல் முனையம்',
    zone: 'SR',
    km: 0,
  },
  'BODMAS, Simplification, Fractions & Decimals': {
    code: 'AJJ',
    name: 'Arakkonam Junction',
    nameTa: 'அரக்கோணம் சந்திப்பு',
    zone: 'SR',
    km: 69,
  },
  'LCM & HCF': {
    code: 'KPD',
    name: 'Katpadi Junction',
    nameTa: 'காட்பாடி சந்திப்பு',
    zone: 'SR',
    km: 130,
  },
  'Ratio, Proportion & Partnership': {
    code: 'JTJ',
    name: 'Jolarpettai Junction',
    nameTa: 'ஜோலார்பேட்டை சந்திப்பு',
    zone: 'SR',
    km: 214,
  },
  'Percentages & Averages': {
    code: 'SA',
    name: 'Salem Junction',
    nameTa: 'சேலம் சந்திப்பு',
    zone: 'SR',
    km: 334,
  },
  'Profit, Loss & Discount': {
    code: 'ED',
    name: 'Erode Junction',
    nameTa: 'ஈரோடு சந்திப்பு',
    zone: 'SR',
    km: 394,
  },
  'Simple Interest & Compound Interest': {
    code: 'CBE',
    name: 'Coimbatore Main Junction',
    nameTa: 'கோயம்புத்தூர் சந்திப்பு',
    zone: 'SR',
    km: 494,
  },
  'Time & Work, Pipes & Cisterns': {
    code: 'TPJ',
    name: 'Tiruchirappalli Junction',
    nameTa: 'திருச்சிராப்பள்ளி சந்திப்பு',
    zone: 'SR',
    km: 590,
  },
  'Time, Speed & Distance (Trains, Boats)': {
    code: 'MDU',
    name: 'Madurai Junction',
    nameTa: 'மதுரை சந்திப்பு',
    zone: 'SR',
    km: 715,
  },
  'Mensuration & Geometry (2D/3D)': {
    code: 'TEN',
    name: 'Tirunelveli Junction',
    nameTa: 'திருநெல்வேலி சந்திப்பு',
    zone: 'SR',
    km: 872,
  },
  'Algebra, Linear & Quadratic Equations': {
    code: 'CAPE',
    name: 'Kanyakumari Southern Terminus',
    nameTa: 'கன்னியாகுமரி முனையம்',
    zone: 'SR',
    km: 955,
  },
  'Trigonometry, Heights & Distances': {
    code: 'RU',
    name: 'Renigunta Junction',
    nameTa: 'ரேணிகுண்டா சந்திப்பு',
    zone: 'SCR',
    km: 1090,
  },
  'Elementary Statistics, Mean, Median, Mode': {
    code: 'BZA',
    name: 'Vijayawada Grand Junction',
    nameTa: 'விஜயவாடா சந்திப்பு',
    zone: 'SCR',
    km: 1395,
  },
  'Data Interpretation: Bar, Pie & Line Graphs': {
    code: 'VSKP',
    name: 'Visakhapatnam Terminus',
    nameTa: 'விசாகப்பட்டினம் முனையம்',
    zone: 'ECoR',
    km: 1745,
  },
  'Probability & Permutation-Combination': {
    code: 'WL',
    name: 'Warangal Junction',
    nameTa: 'வாரங்கல் சந்திப்பு',
    zone: 'SCR',
    km: 1950,
  },
  'Analogies & Classification': {
    code: 'NGP',
    name: 'Nagpur Central Junction',
    nameTa: 'நாக்பூர் சந்திப்பு',
    zone: 'CR',
    km: 2185,
  },
  'Alphabetical & Number Series, Missing Terms': {
    code: 'BPL',
    name: 'Bhopal Junction',
    nameTa: 'போபால் சந்திப்பு',
    zone: 'WCR',
    km: 2475,
  },
  'Coding-Decoding & Mathematical Operations': {
    code: 'JHS',
    name: 'Veerangana Lakshmibai Jn (Jhansi)',
    nameTa: 'ஜான்சி சந்திப்பு',
    zone: 'NCR',
    km: 2767,
  },
  'Relationships & Blood Relations': {
    code: 'GWL',
    name: 'Gwalior Junction',
    nameTa: 'குவாலியர் சந்திப்பு',
    zone: 'NCR',
    km: 2864,
  },
  'Syllogism & Venn Diagrams': {
    code: 'AGC',
    name: 'Agra Cantt Junction',
    nameTa: 'ஆக்ரா சந்திப்பு',
    zone: 'NCR',
    km: 2982,
  },
  'Directions Sense & Distance Test': {
    code: 'NDLS',
    name: 'New Delhi Grand Terminus',
    nameTa: 'புதுதில்லி முனையம்',
    zone: 'NR',
    km: 3177,
  },
  'Analytical Reasoning, Seating & Ranking': {
    code: 'HWH',
    name: 'Howrah Terminus',
    nameTa: 'ஹவுரா முனையம்',
    zone: 'ER',
    km: 3420,
  },
  'Statement & Arguments, Assumptions, Conclusions': {
    code: 'PNBE',
    name: 'Patna Junction',
    nameTa: 'பாட்னா சந்திப்பு',
    zone: 'ECR',
    km: 3680,
  },
  'Puzzles, Matrices & Order Arrangement': {
    code: 'BSB',
    name: 'Varanasi Junction',
    nameTa: 'வாரணாசி சந்திப்பு',
    zone: 'NER',
    km: 3910,
  },
  'Non-Verbal Reasoning, Mirror & Water Images': {
    code: 'LKO',
    name: 'Lucknow Charbagh Terminus',
    nameTa: 'லக்னோ சார்பாக் முனையம்',
    zone: 'NR',
    km: 4120,
  },
  'Paper Folding, Cutting & Embedded Figures': {
    code: 'CNB',
    name: 'Kanpur Central',
    nameTa: 'கான்பூர் சந்திப்பு',
    zone: 'NCR',
    km: 4200,
  },
  'Data Sufficiency & Decision Making': {
    code: 'UMB',
    name: 'Ambala Cantt Junction',
    nameTa: 'அம்பாலா சந்திப்பு',
    zone: 'NR',
    km: 4410,
  },
  'Clock, Calendar & Time Sequencing': {
    code: 'ASR',
    name: 'Amritsar Northern Terminus',
    nameTa: 'அமிர்தசரஸ் முனையம்',
    zone: 'NR',
    km: 4660,
  },
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  allQuestions,
  isTamil,
  onResumePractice,
  onOpenCalendar,
  onOpenShare,
  onOpenFormulaMatcher,
  onOpenMockTest,
  onSelectTopic,
  onOpenDailyChallenge,
  isDailyChallengeCompletedToday = false,
}) => {
  const [stationFilter, setStationFilter] = useState<'all' | 'completed' | 'in_transit' | 'upcoming'>('all');
  const [selectedStationTopic, setSelectedStationTopic] = useState<string | null>(null);

  const solvedCount = profile.completedQuestions.length;
  const currentFuel = profile.dailyFuel || 0;
  const dailyGoal = profile.dailyGoal || 15;
  const fuelPercent = Math.min(100, Math.round((currentFuel / dailyGoal) * 100));

  // Determine current career milestone index
  const currentMilestoneIdx = CAREER_MILESTONES.reduce((acc, m, idx) => {
    if (solvedCount >= m.requiredQs) return idx;
    return acc;
  }, 0);

  const currentMilestone = CAREER_MILESTONES[currentMilestoneIdx];

  // Circular progress ring calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (fuelPercent / 100) * circumference;

  // Accuracy calculation from mock test history or overall
  const mockTests = profile.mockScores || [];
  const averageAccuracy =
    mockTests.length > 0
      ? Math.round(mockTests.reduce((acc, m) => acc + m.accuracy, 0) / mockTests.length)
      : 84;

  // Compute rich Station Marker information for each syllabus topic
  const topicStations = useMemo(() => {
    return TOPIC_CATEGORIES.flatMap((c) => c.topics).map((t, idx) => {
      const topicQuestions = allQuestions.filter((q) => q.topic === t.name);
      const solvedInTopic = topicQuestions.filter((q) => profile.completedQuestions.includes(q.id));
      const total = topicQuestions.length;
      const solved = solvedInTopic.length;
      const isCompleted = total > 0 ? solved >= total || solved >= 2 : false;
      const isInTransit = solved > 0 && !isCompleted;
      const stationMeta = TOPIC_STATION_MAP[t.name] || {
        code: `STN-${idx + 1}`,
        name: `${t.name} Junction`,
        nameTa: t.nameTa,
        zone: 'IR',
        km: (idx + 1) * 150,
      };

      return {
        index: idx + 1,
        topic: t.name,
        nameTa: t.nameTa,
        category: t.category,
        examWeightage: t.examWeightage,
        weightage: t.examWeightage,
        total,
        solved,
        percent: total > 0 ? Math.round((solved / total) * 100) : 0,
        isCompleted,
        isInTransit,
        isUpcoming: solved === 0,
        stationCode: stationMeta.code,
        stationName: stationMeta.name,
        stationNameTa: stationMeta.nameTa,
        zone: stationMeta.zone,
        km: stationMeta.km,
        formulas: t.keyFormulas || [],
      };
    });
  }, [allQuestions, profile.completedQuestions]);

  const completedStations = topicStations.filter((s) => s.isCompleted);
  const inTransitStations = topicStations.filter((s) => s.isInTransit);
  const upcomingStations = topicStations.filter((s) => s.isUpcoming);
  const nextHaltStation = topicStations.find((s) => !s.isCompleted) || topicStations[0];
  const overallStationProgressPercent = Math.round(
    (completedStations.length / Math.max(topicStations.length, 1)) * 100
  );

  // Filtered station list based on active pill
  const displayedStations = useMemo(() => {
    if (stationFilter === 'completed') return completedStations;
    if (stationFilter === 'in_transit') return inTransitStations;
    if (stationFilter === 'upcoming') return upcomingStations;
    return topicStations;
  }, [stationFilter, completedStations, inTransitStations, upcomingStations, topicStations]);

  // Topic-wise breakdown for analytics
  const topicStats = topicStations;

  return (
    <div className="space-y-4 pb-28 px-3 sm:px-4 pt-3 max-w-2xl mx-auto">
      {/* 1. Station Master Headboard */}
      <div className="rounded-2xl bg-white border border-slate-200 p-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-xl">
            🚉
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-blue-700 text-white px-2 py-0.5 rounded tracking-wider uppercase">
                {isTamil ? 'தெற்கு ரயில்வே' : 'Indian Railways RRB'}
              </span>
              <span className="text-xs text-slate-500 font-mono font-semibold">CEN CBT-01</span>
            </div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
              {isTamil ? 'அதிகாரப்பூர்வ தேர்வு பயிற்சி முனையம்' : 'Official CBT Examination Terminal'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-700 font-bold hidden sm:inline">
            {isTamil ? 'சிக்னல்: தயார்' : 'Signal: CLEAR'}
          </span>
        </div>
      </div>

      {/* 2. PROMINENT TRAIN THEMED DAILY RRB CHALLENGE BANNER */}
      <div className="rounded-2xl bg-white border-2 border-amber-300 p-4 shadow-sm relative overflow-hidden">
        {/* Subtle decorative rail track line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-100 border-b border-dashed border-amber-400" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white font-black text-2xl flex items-center justify-center shadow-xs flex-shrink-0">
              🚂
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-300 text-[10px] font-bold uppercase tracking-wider font-mono">
                  {isTamil ? 'தளம் 1 புறப்பாடு' : 'Platform 1 Departure'}
                </span>
                {isDailyChallengeCompletedToday && (
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                    ✓ {isTamil ? 'இன்று முடிந்தது' : 'Ticket Confirmed'}
                  </span>
                )}
              </div>

              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {isTamil ? 'தினசரி RRB 5-கேள்வி எக்ஸ்பிரஸ் சவால்' : 'Daily RRB 5-Question Express Challenge'}
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                {isTamil
                  ? '5 கலவையான ஆப்டிட்யூட் & ரீசனிங் கேள்விகள் • ஸ்ட்ரீக் +1 நாள் அதிகரிக்கும்!'
                  : '5 mixed speed-math & reasoning questions to punch your ticket & boost streak!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:self-center">
            <button
              id="btn-dashboard-daily-challenge"
              onClick={onOpenDailyChallenge}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-95 whitespace-nowrap ${
                isDailyChallengeCompletedToday
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                  : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
            >
              <Flame className="w-4 h-4 fill-current" />
              <span>
                {isDailyChallengeCompletedToday
                  ? (isTamil ? 'மீண்டும் பயிற்சி செய்' : 'Review / Replay')
                  : (isTamil ? 'இன்றைய சவாலைத் தொடங்கு ➔' : 'Start Daily Challenge ➔')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Train Themed Streak & Fuel Meter */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800">
              <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span>{isTamil ? 'ரயில்வே ஸ்ட்ரீக் & தினசரி வேகம்' : 'Daily Train Fuel & Streak'}</span>
            </div>
            <div className="flex items-center gap-2.5 mt-1">
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Flame className="w-6 h-6 fill-amber-500" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  {profile.streakCount} <span className="text-xs text-amber-700 font-bold">{isTamil ? 'நாட்கள்' : 'Days'}</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  {isTamil ? 'தொடர் தேர்வுப் பயிற்சி' : 'Consecutive Study Days'}
                </p>
              </div>
            </div>
          </div>

          {/* Circular Progress Ring */}
          <div className="relative flex items-center justify-center">
            <svg className="w-22 h-22 transform -rotate-90">
              <circle
                cx="44"
                cy="44"
                r={radius}
                stroke="#e2e8f0"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="44"
                cy="44"
                r={radius}
                stroke="#d97706"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-sm font-bold text-amber-900 font-mono">{fuelPercent}%</span>
              <span className="text-[9px] text-slate-500 uppercase font-semibold">Fuel</span>
            </div>
          </div>
        </div>

        {/* Daily Goal Status Info */}
        <div className="mt-3.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
            <span className="text-slate-700 font-medium">
              {isTamil ? 'இன்றைய தீர்வுகள்:' : 'Today Solved:'}{' '}
              <strong className="text-slate-900 font-bold">
                {currentFuel} / {dailyGoal} Qs
              </strong>
            </span>
          </div>
          <span className="text-emerald-700 font-bold">
            +{profile.points} XP
          </span>
        </div>
      </div>

      {/* 4. Quick Actions Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          id="btn-quick-resume"
          onClick={onResumePractice}
          className="p-3.5 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-xs active:scale-95 transition"
        >
          <Play className="w-5 h-5 fill-white text-white" />
          <span>{isTamil ? 'பயிற்சி தொடர்' : 'Speed Practice'}</span>
        </button>

        <button
          id="btn-quick-mock"
          onClick={onOpenMockTest}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 text-blue-700 font-bold text-xs flex flex-col items-center justify-center gap-1.5 active:scale-95 transition shadow-xs"
        >
          <Clock className="w-5 h-5 text-blue-700" />
          <span>{isTamil ? 'மாதிரித் தேர்வு' : 'CBT Mock Test'}</span>
        </button>

        <button
          id="btn-quick-mind-game"
          onClick={onOpenFormulaMatcher}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 hover:bg-amber-50/20 text-amber-800 font-bold text-xs flex flex-col items-center justify-center gap-1.5 active:scale-95 transition shadow-xs"
        >
          <Brain className="w-5 h-5 text-amber-600" />
          <span>{isTamil ? 'சூத்திரப் போட்டி' : 'Formula Speed'}</span>
        </button>

        <button
          id="btn-quick-share"
          onClick={onOpenShare}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 text-emerald-800 font-bold text-xs flex flex-col items-center justify-center gap-1.5 active:scale-95 transition shadow-xs"
        >
          <Share2 className="w-5 h-5 text-emerald-700" />
          <span>{isTamil ? 'டிக்கெட் பகிர்' : 'Share Ticket'}</span>
        </button>
      </div>

      {/* 5. Railway Journey Tracker & Station Marker Indicators along the Line */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Header & Corridor Status HUD */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                <TrainTrack className="w-4 h-4" />
              </span>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {isTamil ? 'ரயில்வே தேர்வுப் பயண வரைபடம் & நிலைய குறிகாட்டிகள்' : 'Railway Journey Tracker & Station Markers'}
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1.5 flex-wrap">
              <span className="font-mono text-blue-700 font-semibold">
                {isTamil ? 'முதன்மை ரயில் பாதை:' : 'Mainline Corridor:'}
              </span>
              <span>Southern Railway ➔ Northern Railway CBT Express</span>
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-mono font-bold">
              {completedStations.length} / {topicStations.length} {isTamil ? 'நிலையங்கள்' : 'Stations'} ({overallStationProgressPercent}%)
            </div>
          </div>
        </div>

        {/* Next Station on Track Spotlight Banner */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50/90 via-indigo-50/40 to-slate-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl flex-shrink-0 shadow-xs">
              🚂
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-1.5 py-0.5 rounded bg-amber-400 text-black font-mono font-bold text-[10px] border border-black shadow-xs">
                  {nextHaltStation.stationCode}
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {isTamil ? nextHaltStation.stationNameTa : nextHaltStation.stationName}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {nextHaltStation.zone} • {nextHaltStation.km} KM
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                {isTamil ? 'அடுத்த தேர்வு நிறுத்தம்:' : 'Next Target Station:'}{' '}
                <strong className="text-blue-900">{isTamil ? nextHaltStation.nameTa : nextHaltStation.topic}</strong>
                <span className="ml-1 text-[11px] text-amber-700 font-mono">({nextHaltStation.examWeightage})</span>
              </p>
            </div>
          </div>

          <button
            id="btn-depart-to-next-station"
            onClick={() => onSelectTopic(nextHaltStation.topic)}
            className="px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 whitespace-nowrap self-stretch sm:self-center"
          >
            <span>{isTamil ? 'நிலையத்திற்குப் புறப்படு' : 'Depart to Station'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Station Markers Visual Railway Track (Horizontal Scrollable Corridor) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              {isTamil ? 'தண்டவாள நிலைய குறிகாட்டிகள் (நேரலை)' : 'Live Railway Line Station Markers'}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              {isTamil ? '← உருட்டி பார்க்கவும் →' : 'Scroll along the line →'}
            </span>
          </div>

          <div className="relative p-4 bg-slate-50 rounded-xl border border-slate-200 overflow-x-auto scrollbar-thin">
            {/* Visual Railroad Tracks & Sleepers Backdrop */}
            <div className="min-w-[900px] relative py-6">
              {/* Upper Rail */}
              <div className="absolute top-1/2 -mt-3 left-0 right-0 h-1 bg-slate-400 z-0" />
              {/* Sleepers (Ties) pattern */}
              <div className="absolute top-1/2 -mt-5 left-0 right-0 h-10 flex justify-between z-0 pointer-events-none opacity-40">
                {Array.from({ length: 45 }).map((_, i) => (
                  <div key={i} className="w-1.5 h-full bg-slate-400 rounded-xs" />
                ))}
              </div>
              {/* Lower Rail */}
              <div className="absolute top-1/2 mt-3 left-0 right-0 h-1 bg-slate-400 z-0" />

              {/* Station Marker Posts along the Rail Line */}
              <div className="relative z-10 flex items-center justify-between gap-6 px-4">
                {topicStations.slice(0, 12).map((stn, idx) => {
                  const isCurrentLoco = stn.topic === nextHaltStation.topic;

                  return (
                    <button
                      key={stn.topic}
                      onClick={() => {
                        setSelectedStationTopic(stn.topic);
                        onSelectTopic(stn.topic);
                      }}
                      className="flex flex-col items-center group focus:outline-none transition transform hover:-translate-y-1"
                    >
                      {/* Locomotive Indicator if engine is at this station */}
                      <div className="h-7 flex items-center justify-center">
                        {isCurrentLoco ? (
                          <span className="text-2xl animate-bounce" title="Current Engine Position">
                            🚂
                          </span>
                        ) : stn.isCompleted ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                            ✓ Pass
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400">
                            {stn.km}km
                          </span>
                        )}
                      </div>

                      {/* Official Station Marker Board (Indian Railways Yellow & Black Board) */}
                      <div
                        className={`w-28 py-1.5 px-2 rounded-md text-center border-2 transition shadow-xs ${
                          stn.isCompleted
                            ? 'bg-amber-300 border-slate-900 text-slate-950 font-bold'
                            : isCurrentLoco
                            ? 'bg-amber-400 border-blue-700 ring-2 ring-blue-500 text-slate-950 font-bold'
                            : 'bg-amber-100/90 border-slate-400 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-black font-mono tracking-wider">
                            [{stn.stationCode}]
                          </span>
                          <span className="text-[9px] font-mono opacity-80">{stn.zone}</span>
                        </div>
                        <div className="text-[11px] font-bold truncate mt-0.5 leading-tight">
                          {stn.stationName.split(' ')[0]}
                        </div>
                      </div>

                      {/* Semaphore Signal Indicator Lamp */}
                      <div className="mt-2 flex flex-col items-center">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition ${
                            stn.isCompleted
                              ? 'bg-emerald-500 border-emerald-700 text-white shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                              : stn.isInTransit
                              ? 'bg-amber-500 border-amber-700 text-white shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse'
                              : 'bg-white border-slate-400 text-slate-400'
                          }`}
                        >
                          {stn.isCompleted ? (
                            <span className="text-[10px] font-black">✓</span>
                          ) : stn.isInTransit ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          ) : (
                            <span className="text-[9px] font-mono font-bold">{idx + 1}</span>
                          )}
                        </div>

                        {/* Status Label Pill */}
                        <span
                          className={`mt-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            stn.isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : stn.isInTransit
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {stn.isCompleted
                            ? (isTamil ? 'நிறைவு' : 'Cleared')
                            : stn.isInTransit
                            ? (isTamil ? 'பயணத்தில்' : 'In Transit')
                            : (isTamil ? 'அடுத்து' : 'Upcoming')}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Filter Navigation Tabs for Station Catalog */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setStationFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                stationFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {isTamil ? 'அனைத்து நிலையங்கள்' : 'All Stations'} ({topicStations.length})
            </button>
            <button
              onClick={() => setStationFilter('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 whitespace-nowrap ${
                stationFilter === 'completed'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isTamil ? 'நிறைவுற்றவை' : 'Cleared Stations'} ({completedStations.length})</span>
            </button>
            <button
              onClick={() => setStationFilter('in_transit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                stationFilter === 'in_transit'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              {isTamil ? 'பயணத்தில் உள்ளவை' : 'In Transit'} ({inTransitStations.length})
            </button>
            <button
              onClick={() => setStationFilter('upcoming')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                stationFilter === 'upcoming'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {isTamil ? 'வரவிருக்கும் நிறுத்தங்கள்' : 'Upcoming Halts'} ({upcomingStations.length})
            </button>
          </div>
        </div>

        {/* Station Markers Grid Catalog */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
          {displayedStations.map((stn) => {
            return (
              <div
                key={stn.topic}
                onClick={() => onSelectTopic(stn.topic)}
                className={`p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between gap-2.5 hover:shadow-xs active:scale-[0.99] ${
                  stn.isCompleted
                    ? 'bg-emerald-50/30 border-emerald-200 hover:border-emerald-300'
                    : stn.isInTransit
                    ? 'bg-amber-50/30 border-amber-200 hover:border-amber-300'
                    : 'bg-white border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    {/* Classic Yellow Station Code Plate */}
                    <div
                      className={`px-2 py-1 rounded font-mono font-black text-xs border border-black flex-shrink-0 shadow-2xs ${
                        stn.isCompleted
                          ? 'bg-amber-400 text-black'
                          : stn.isInTransit
                          ? 'bg-amber-300 text-black'
                          : 'bg-amber-100 text-slate-900'
                      }`}
                    >
                      {stn.stationCode}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        {isTamil ? stn.stationNameTa : stn.stationName}
                      </h4>
                      <p className="text-[11px] text-blue-700 font-medium line-clamp-1 mt-0.5">
                        {isTamil ? stn.nameTa : stn.topic}
                      </p>
                    </div>
                  </div>

                  {/* Signal Status Pill */}
                  <div className="flex-shrink-0 text-right">
                    {stn.isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {isTamil ? 'நிலையம் முடிந்தது' : 'Cleared'}
                      </span>
                    ) : stn.isInTransit ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        {isTamil ? 'பயணத்தில்' : 'In Transit'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {stn.examWeightage}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar & Questions Counter */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>
                      {isTamil ? 'தீர்க்கப்பட்ட கேள்விகள்:' : 'Questions Solved:'}{' '}
                      <strong className="text-slate-900">{stn.solved} / {stn.total}</strong>
                    </span>
                    <span className="font-bold text-blue-700">{stn.percent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        stn.isCompleted ? 'bg-emerald-500' : stn.isInTransit ? 'bg-amber-500' : 'bg-slate-300'
                      }`}
                      style={{ width: `${Math.max(stn.percent, stn.solved > 0 ? 15 : 0)}%` }}
                    />
                  </div>
                </div>

                {/* Direct Action Button */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100/80 text-xs">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {stn.zone} Division • {stn.km} KM
                  </span>
                  <span className="text-[11px] font-bold text-blue-700 flex items-center gap-1 hover:underline">
                    {isTamil ? 'பயிற்சி செய்' : 'Board Train'}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 5B. Railway Career Ranks Alignment */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-700" />
              {isTamil ? 'ரயில்வே பதவி பதவி உயர்வு வரிசை' : 'Indian Railways Official Career Ranks'}
            </h4>
            <span className="text-[11px] font-mono text-blue-700 font-bold">
              {currentMilestone.rank} ({solvedCount} Qs)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {CAREER_MILESTONES.map((m, idx) => {
              const isUnlocked = solvedCount >= m.requiredQs;
              const isCurrent = idx === currentMilestoneIdx;

              return (
                <div
                  key={m.id}
                  className={`p-2.5 rounded-xl border text-center transition ${
                    isCurrent
                      ? 'bg-blue-50 border-blue-400 shadow-xs ring-1 ring-blue-300'
                      : isUnlocked
                      ? 'bg-white border-slate-200'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <span className="text-xl block mb-1">{m.icon}</span>
                  <div className="text-[11px] font-bold text-slate-900 truncate">
                    {isTamil ? m.rankTa : m.rank}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                    {m.requiredQs} Qs
                  </div>
                  {isUnlocked && (
                    <span className="inline-block mt-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                      ✓ Promoted
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 6. Heatmap & Accuracy Analytics */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-700" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              {isTamil ? 'துல்லியத்தன்மை & தலைப்பு பகுப்பாய்வு' : 'Accuracy & Topic Heatmap'}
            </h3>
          </div>
          <span className="text-xs font-bold font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {averageAccuracy}% Avg Accuracy
          </span>
        </div>

        <div className="space-y-2.5">
          {topicStats.slice(0, 6).map((stat) => (
            <div
              key={stat.topic}
              onClick={() => onSelectTopic(stat.topic)}
              className="p-3 rounded-xl bg-slate-50/60 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 cursor-pointer transition active:scale-[0.99]"
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900">{stat.topic}</span>
                  <span className="text-[10px] font-mono text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    {stat.weightage}
                  </span>
                </div>
                <span className="font-mono text-xs text-slate-500 font-medium">
                  {stat.solved}/{stat.total} ({stat.percent}%)
                </span>
              </div>

              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${stat.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
