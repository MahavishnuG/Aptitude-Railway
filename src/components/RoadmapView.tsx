import React from 'react';
import { UserProfile, Badge } from '../types';
import { RRB_BADGES } from '../data/badges';
import { Flame, Trophy, Calendar, Share2, Zap, CheckCircle2, ChevronRight } from 'lucide-react';

interface RoadmapViewProps {
  profile: UserProfile;
  isTamil: boolean;
  onOpenCalendar: () => void;
  onOpenShare: () => void;
  onSelectPractice: () => void;
}

interface Station {
  id: string;
  name: string;
  nameTa: string;
  exam: string;
  requiredQuestions: number;
  description: string;
  descriptionTa: string;
}

const STATIONS: Station[] = [
  {
    id: 'st-1',
    name: 'Guindy Junction',
    nameTa: 'கிண்டி சந்திப்பு',
    exam: 'Foundation',
    requiredQuestions: 0,
    description: 'Track inspector initiation. Starter train speed conversions.',
    descriptionTa: 'துவக்க நிலை. அடிப்படை ரயில் வேக மாற்றங்கள்.',
  },
  {
    id: 'st-2',
    name: 'Tambaram Yard',
    nameTa: 'தாம்பரம் யார்டு',
    exam: 'Group D',
    requiredQuestions: 3,
    description: 'Work & Time drills and rapid division speed tricks.',
    descriptionTa: 'வேலை மற்றும் காலம், வேகக் கணித உத்திகள்.',
  },
  {
    id: 'st-3',
    name: 'Arakkonam Express',
    nameTa: 'அரக்கோணம் எக்ஸ்பிரஸ்',
    exam: 'ALP Pilot',
    requiredQuestions: 8,
    description: 'Relative speeds, platform crossing, and mental arithmetic.',
    descriptionTa: 'ஒப்புமை வேகம், நடைமேடை கடக்கும் நேரம்.',
  },
  {
    id: 'st-4',
    name: 'Katpadi Junction',
    nameTa: 'காட்பாடி சந்திப்பு',
    exam: 'NTPC Mains',
    requiredQuestions: 15,
    description: 'Daily Fuel Goal achieved! Compound vs Simple interest differences.',
    descriptionTa: 'தினசரி இலக்கு நிறைவு! கூட்டு வட்டி & தனி வட்டி வேறுபாடு.',
  },
  {
    id: 'st-5',
    name: 'Chennai Central Terminus',
    nameTa: 'சென்னை சென்ட்ரல் முனையம்',
    exam: 'JE / SSE Master',
    requiredQuestions: 25,
    description: 'Grand Station Master rank. Exam ready aptitude proficiency!',
    descriptionTa: 'முதன்மை பொறியாளர் தகுதி! முழு தேர்வுக்கு தயார்.',
  },
];

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  profile,
  isTamil,
  onOpenCalendar,
  onOpenShare,
  onSelectPractice,
}) => {
  const solvedCount = profile.completedQuestions.length;
  const currentFuel = profile.dailyFuel;
  const dailyGoal = profile.dailyGoal || 15;
  const fuelPercent = Math.min(100, Math.round((currentFuel / dailyGoal) * 100));

  // Determine current station
  const currentStationIndex = STATIONS.reduce((acc, station, index) => {
    if (solvedCount >= station.requiredQuestions) return index;
    return acc;
  }, 0);

  const currentStation = STATIONS[currentStationIndex];

  return (
    <div className="space-y-6 pb-24 px-4 pt-3 max-w-2xl mx-auto">
      {/* Daily Streak & Fuel Header Card */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/80 border border-slate-800 p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              {isTamil ? 'தினசரி தொடர் பயிற்சி' : 'Daily Practice Streak'}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <Flame className="w-8 h-8 text-amber-500 fill-amber-500 animate-pulse" />
              <span className="text-3xl font-black text-white">{profile.streakCount}</span>
              <span className="text-xs font-semibold text-slate-400 mt-2">
                {isTamil ? 'நாட்கள் தொடர்ச்சி' : 'Days Active'}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              id="btn-open-calendar-roadmap"
              onClick={onOpenCalendar}
              title="Add to Calendar"
              className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95 transition"
            >
              <Calendar className="w-4 h-4 text-blue-400" />
            </button>
            <button
              id="btn-open-share-roadmap"
              onClick={onOpenShare}
              title="Share Streak on WhatsApp"
              className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95 transition"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* Daily Fuel Meter */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>{isTamil ? 'தினசரி எரிபொருள் அளவு (Daily Fuel Meter)' : 'Daily Engine Fuel'}</span>
            </div>
            <span className="font-mono font-bold text-amber-400">
              {currentFuel} / {dailyGoal} {isTamil ? 'கேள்விகள்' : 'Solved'} ({fuelPercent}%)
            </span>
          </div>

          {/* Progress Bar with Steam Loco head */}
          <div className="relative w-full h-3.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${fuelPercent}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
            <span>{fuelPercent >= 100 ? '🎉 Daily Goal Cleared!' : 'Goal: 15 Questions / Day'}</span>
            <span>+{profile.points} Total Fuel Points</span>
          </div>
        </div>
      </div>

      {/* Visual Journey Roadmap (Animated SVG Railway Track) */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>{isTamil ? 'ரயில் பாதை முன்னேற்ற வரைபடம்' : 'Railway Journey Track'}</span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-signal" />
            </h3>
            <p className="text-xs text-slate-400">
              {isTamil
                ? `தற்போதைய நிலையம்: ${currentStation.nameTa}`
                : `Current Station: ${currentStation.name}`}
            </p>
          </div>

          <button
            onClick={onSelectPractice}
            className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30 hover:bg-amber-500/20 active:scale-95 transition"
          >
            <span>{isTamil ? 'பயிற்சி செய்' : 'Practice Now'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* SVG Railway Track Visualizer */}
        <div className="relative p-2 bg-slate-950/70 rounded-2xl border border-slate-800/80 overflow-hidden">
          <svg
            viewBox="0 0 400 360"
            className="w-full h-auto drop-shadow-md"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="trackGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#3b82f6" />
                <stop offset="50%" stop-color="#f59e0b" />
                <stop offset="100%" stop-color="#10b981" />
              </linearGradient>
            </defs>

            {/* S-curve track path */}
            {/* Railroad Sleepers / Ties */}
            <path
              d="M 60 40 Q 340 90 340 160 T 60 280"
              fill="none"
              stroke="#334155"
              stroke-width="20"
              stroke-linecap="round"
              stroke-dasharray="2 12"
            />
            {/* Left rail */}
            <path
              d="M 52 40 Q 332 90 332 160 T 52 280"
              fill="none"
              stroke="#64748b"
              stroke-width="3"
            />
            {/* Right rail */}
            <path
              d="M 68 40 Q 348 90 348 160 T 68 280"
              fill="none"
              stroke="#64748b"
              stroke-width="3"
            />
            {/* High-speed glowing center power rail */}
            <path
              d="M 60 40 Q 340 90 340 160 T 60 280"
              fill="none"
              stroke="url(#trackGrad)"
              stroke-width="4"
              stroke-dasharray="6 6"
              opacity="0.8"
            />

            {/* Station 1: (60, 40) */}
            <g transform="translate(60, 40)">
              <circle
                r="14"
                fill={solvedCount >= 0 ? '#10b981' : '#1e293b'}
                stroke="#f59e0b"
                stroke-width="2"
              />
              <text x="24" y="5" fill="#f8fafc" font-size="11" font-weight="bold">
                1. Guindy Jxn
              </text>
              <circle r="6" fill="#ffffff" />
            </g>

            {/* Station 2: (280, 95) */}
            <g transform="translate(280, 95)">
              <circle
                r="14"
                fill={solvedCount >= 3 ? '#10b981' : '#1e293b'}
                stroke="#f59e0b"
                stroke-width="2"
              />
              <text x="-95" y="5" fill="#f8fafc" font-size="11" font-weight="bold">
                2. Tambaram Yard
              </text>
              <circle r="6" fill={solvedCount >= 3 ? '#ffffff' : '#64748b'} />
            </g>

            {/* Station 3: (320, 180) */}
            <g transform="translate(320, 180)">
              <circle
                r="14"
                fill={solvedCount >= 8 ? '#10b981' : '#1e293b'}
                stroke="#f59e0b"
                stroke-width="2"
              />
              <text x="-120" y="5" fill="#f8fafc" font-size="11" font-weight="bold">
                3. Arakkonam Express
              </text>
              <circle r="6" fill={solvedCount >= 8 ? '#ffffff' : '#64748b'} />
            </g>

            {/* Station 4: (180, 240) */}
            <g transform="translate(180, 240)">
              <circle
                r="16"
                fill={solvedCount >= 15 ? '#f59e0b' : '#1e293b'}
                stroke="#f59e0b"
                stroke-width="3"
              />
              <text x="26" y="5" fill="#f59e0b" font-size="11" font-weight="bold">
                4. Katpadi Jxn (Goal)
              </text>
              <circle r="7" fill={solvedCount >= 15 ? '#ffffff' : '#64748b'} />
            </g>

            {/* Station 5: (60, 280) */}
            <g transform="translate(60, 280)">
              <circle
                r="16"
                fill={solvedCount >= 25 ? '#10b981' : '#1e293b'}
                stroke="#38bdf8"
                stroke-width="3"
              />
              <text x="26" y="5" fill="#38bdf8" font-size="11" font-weight="bold">
                5. Chennai Central (Terminus)
              </text>
              <circle r="7" fill={solvedCount >= 25 ? '#ffffff' : '#64748b'} />
            </g>

            {/* Locomotive Icon positioned at current station */}
            {currentStationIndex === 0 && (
              <g transform="translate(60, 35)" className="animate-train-chug">
                <text font-size="24" text-anchor="middle" y="5">🚂</text>
              </g>
            )}
            {currentStationIndex === 1 && (
              <g transform="translate(280, 90)" className="animate-train-chug">
                <text font-size="24" text-anchor="middle" y="5">🚂</text>
              </g>
            )}
            {currentStationIndex === 2 && (
              <g transform="translate(320, 175)" className="animate-train-chug">
                <text font-size="24" text-anchor="middle" y="5">🚂</text>
              </g>
            )}
            {currentStationIndex === 3 && (
              <g transform="translate(180, 235)" className="animate-train-chug">
                <text font-size="24" text-anchor="middle" y="5">🚂</text>
              </g>
            )}
            {currentStationIndex >= 4 && (
              <g transform="translate(60, 275)" className="animate-train-chug">
                <text font-size="24" text-anchor="middle" y="5">🚂</text>
              </g>
            )}
          </svg>
        </div>

        {/* Station Milestones List */}
        <div className="mt-5 space-y-2.5">
          {STATIONS.map((st, idx) => {
            const isUnlocked = solvedCount >= st.requiredQuestions;
            const isCurrent = idx === currentStationIndex;

            return (
              <div
                key={st.id}
                className={`p-3.5 rounded-2xl flex items-center justify-between border transition ${
                  isCurrent
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-md'
                    : isUnlocked
                    ? 'bg-slate-950/40 border-slate-800'
                    : 'bg-slate-950/20 border-slate-800/40 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isUnlocked
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isUnlocked ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-100">
                        {isTamil ? st.nameTa : st.name}
                      </p>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {st.exam}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {isTamil ? st.descriptionTa : st.description}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-mono text-amber-400">
                    {st.requiredQuestions} Qs
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestone Badges Showcase */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              {isTamil ? 'மைல்ஸ்டோன் பதக்கங்கள் (Badges)' : 'Milestone Badges'}
            </h3>
          </div>
          <span className="text-xs font-bold text-amber-400">
            {RRB_BADGES.filter((b) => solvedCount >= b.requiredSolved).length} / {RRB_BADGES.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {RRB_BADGES.map((badge: Badge) => {
            const unlocked = solvedCount >= badge.requiredSolved;

            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-2xl border flex flex-col justify-between transition ${
                  unlocked
                    ? 'bg-slate-950/60 border-amber-500/30 shadow-sm'
                    : 'bg-slate-950/30 border-slate-800/60 opacity-50'
                }`}
              >
                <div>
                  <div className="text-2xl mb-1.5">{badge.icon}</div>
                  <h4 className="text-xs font-bold text-slate-100">
                    {isTamil ? badge.titleTa : badge.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                    {isTamil ? badge.descriptionTa : badge.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                  <span className={unlocked ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {unlocked ? '✓ Unlocked' : `${badge.requiredSolved} Qs needed`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
