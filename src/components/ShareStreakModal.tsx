import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Share2, MessageCircle, Copy, Check, X, Flame, Trophy, Train } from 'lucide-react';

interface ShareStreakModalProps {
  profile: UserProfile;
  stationName: string;
  onClose: () => void;
}

export const ShareStreakModal: React.FC<ShareStreakModalProps> = ({
  profile,
  stationName,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const shareText = `🚂 *RRB Railway Exam Aptitude Preparation* 🇮🇳
🔥 Daily Streak: *${profile.streakCount} Days Active*
🚉 Current Station: *${stationName}*
⚡ Solved Problems: *${profile.completedQuestions.length} Questions*
🏆 Fuel Points: *${profile.points} Pts*

Practicing NTPC, Group D, ALP & JE with Socratic 3-tier hints and speed math tricks!
Prepare for your dream Indian Railways job here: ${window.location.origin}`;

  const handleShareWhatsApp = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: 'RRB Railway Exam Aptitude Streak',
          text: shareText,
          url: window.location.origin,
        });
        return;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          // Fall through to direct WhatsApp link
        } else {
          return;
        }
      }
    }

    // Direct WhatsApp web / mobile fallback
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-xl p-6 text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Share Aspirant Scorecard</h3>
              <p className="text-xs text-slate-500 font-medium">Celebrate your RRB practice streak</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Styled Scorecard Visual */}
        <div className="mt-5 p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs relative overflow-hidden">
          {/* Subtle watermark */}
          <Train className="absolute -right-6 -bottom-6 w-32 h-32 text-slate-200/50 pointer-events-none" />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                INDIAN RAILWAYS RECRUITMENT
              </span>
            </div>
            <div className="flex items-center gap-1 text-amber-600 text-xs font-bold">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-bounce" />
              <span>{profile.streakCount} D Streak</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 my-3">
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Station Milestone</span>
              <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                <Train className="w-3.5 h-3.5 text-blue-700" />
                <span className="truncate">{stationName}</span>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Solved Questions</span>
              <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                <span>{profile.completedQuestions.length} Done</span>
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Daily Fuel Points: <strong className="text-blue-700">{profile.points} pts</strong></span>
            <span>Target: <strong className="text-slate-800">RRB NTPC / ALP / JE</strong></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 space-y-2.5">
          <button
            id="btn-share-whatsapp"
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm shadow-xs active:scale-95 transition"
          >
            <MessageCircle className="w-5 h-5 fill-white" />
            <span>Share Streak on WhatsApp</span>
          </button>

          <button
            id="btn-copy-streak"
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 active:scale-95 transition"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copy Summary Text</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
