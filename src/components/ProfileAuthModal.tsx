import React, { useState } from 'react';
import { UserProfile } from '../types';
import { signInWithGooglePopup, logoutUser, syncUserProfileToFirestore } from '../firebase/config';
import { PWAInstallButton } from './PWAInstallButton';
import {
  User as UserIcon,
  LogOut,
  Cloud,
  Calendar,
  Share2,
  X,
  Flame,
  Trophy,
  Check,
} from 'lucide-react';

interface ProfileAuthModalProps {
  profile: UserProfile;
  currentUser: any;
  onProfileUpdated: (updated: UserProfile) => void;
  onOpenCalendar: () => void;
  onOpenShare: () => void;
  onClose: () => void;
}

export const ProfileAuthModal: React.FC<ProfileAuthModalProps> = ({
  profile,
  currentUser,
  onProfileUpdated,
  onOpenCalendar,
  onOpenShare,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await signInWithGooglePopup();
      if (res && res.user) {
        const u = res.user;
        const updated: UserProfile = {
          ...profile,
          userId: u.uid,
          displayName: u.displayName || 'Aspirant',
          email: u.email || '',
          photoURL: u.photoURL || '',
        };
        onProfileUpdated(updated);
        await syncUserProfileToFirestore(updated);
        setSyncSuccess(true);
        setTimeout(() => setSyncSuccess(false), 3000);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await logoutUser();
      const updated: UserProfile = {
        ...profile,
        userId: 'guest-aspirant',
        displayName: 'Aspirant (Offline)',
        email: undefined,
        photoURL: undefined,
      };
      onProfileUpdated(updated);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Sign out failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    if (!currentUser) return;
    setSyncing(true);
    try {
      await syncUserProfileToFirestore(profile);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg('Failed to sync to Firestore.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 text-slate-800 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Aspirant Profile & Sync</h3>
              <p className="text-xs text-slate-500 font-medium">Google Auth & Firestore Database</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}

        {/* User Card */}
        <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="Avatar"
                className="w-12 h-12 rounded-full border-2 border-blue-700 object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-lg">
                {profile.displayName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <h4 className="text-sm font-bold text-slate-900">{profile.displayName}</h4>
              <p className="text-xs text-slate-500 font-medium">
                {currentUser?.email ? currentUser.email : 'Local Guest Account (Offline)'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {profile.streakCount} D Streak
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                  <Trophy className="w-3.5 h-3.5" />
                  {profile.points} Pts
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Action */}
        <div className="mt-4 space-y-3">
          {!currentUser ? (
            <button
              id="btn-google-signin"
              onClick={handleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-xs active:scale-95 transition disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                />
              </svg>
              <span>{loading ? 'Connecting...' : 'Sign in with Google to Sync Cloud'}</span>
            </button>
          ) : (
            <div className="space-y-2">
              <button
                onClick={handleManualSync}
                disabled={syncing}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition"
              >
                <Cloud className="w-4 h-4" />
                <span>{syncing ? 'Syncing with Firestore...' : 'Sync Progress to Cloud'}</span>
                {syncSuccess && <Check className="w-4 h-4 text-emerald-600" />}
              </button>

              <button
                onClick={handleSignOut}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-rose-600 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Utilities List */}
        <div className="mt-5 pt-4 border-t border-slate-200 space-y-2">
          <button
            onClick={() => {
              onClose();
              onOpenCalendar();
            }}
            className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 flex items-center justify-between text-xs text-slate-800 transition"
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-blue-700" />
              <span>Calendar Study Reminders</span>
            </div>
            <span className="text-[11px] text-blue-700 font-bold">Setup</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenShare();
            }}
            className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 flex items-center justify-between text-xs text-slate-800 transition"
          >
            <div className="flex items-center gap-2.5">
              <Share2 className="w-4 h-4 text-emerald-700" />
              <span>Share Streak on WhatsApp</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-bold">Share</span>
          </button>

          <div className="pt-2">
            <PWAInstallButton />
          </div>
        </div>
      </div>
    </div>
  );
};
