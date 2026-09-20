import React, { useState } from 'react';
import { getGoogleCalendarUrl, downloadIcsFile, requestWebNotifications, sendStreakNotification } from '../utils/calendar';
import { Calendar, Bell, Download, ExternalLink, X, Check, Clock } from 'lucide-react';

interface CalendarReminderModalProps {
  streak: number;
  onClose: () => void;
}

export const CalendarReminderModal: React.FC<CalendarReminderModalProps> = ({
  streak,
  onClose,
}) => {
  const [notificationEnabled, setNotificationEnabled] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );
  const [downloadedIcs, setDownloadedIcs] = useState(false);

  const handleToggleNotification = async () => {
    if (!notificationEnabled) {
      const granted = await requestWebNotifications();
      if (granted) {
        setNotificationEnabled(true);
        sendStreakNotification(streak);
      }
    } else {
      setNotificationEnabled(false);
    }
  };

  const handleDownloadIcs = () => {
    downloadIcsFile();
    setDownloadedIcs(true);
    setTimeout(() => setDownloadedIcs(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-xl p-6 text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Daily Study Reminders</h3>
              <p className="text-xs text-slate-500 font-medium">Schedule 30 mins daily practice</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {/* Practice Session Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">Suggested Schedule</p>
                <p className="text-xs text-slate-500 font-medium">Every morning 8:30 AM (30 Mins)</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              Daily Recurring
            </span>
          </div>

          {/* 1-Click Google Calendar */}
          <a
            id="btn-google-calendar"
            href={getGoogleCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full p-4 rounded-xl bg-blue-700 text-white font-bold text-sm shadow-xs hover:bg-blue-800 active:scale-95 transition"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5" />
              <span>Add to Google Calendar (1-Click)</span>
            </div>
            <ExternalLink className="w-4 h-4 opacity-90" />
          </a>

          {/* Download ICS File for Apple / Outlook */}
          <button
            id="btn-download-ics"
            onClick={handleDownloadIcs}
            className="flex items-center justify-between w-full p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-sm active:scale-95 transition"
          >
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-blue-700" />
              <span>Download .ics file (Apple / Outlook)</span>
            </div>
            {downloadedIcs ? (
              <span className="flex items-center gap-1 text-xs text-emerald-700 font-bold">
                <Check className="w-4 h-4" /> Downloaded
              </span>
            ) : (
              <span className="text-xs text-slate-500 font-mono font-medium">.ics</span>
            )}
          </button>

          {/* Web Notification Toggle */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">Web Streak Reminders</p>
                <p className="text-[11px] text-slate-500 font-medium">Browser alerts to protect streak</p>
              </div>
            </div>

            <button
              id="btn-toggle-notification"
              onClick={handleToggleNotification}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                notificationEnabled ? 'bg-blue-700' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  notificationEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200 active:scale-95 transition"
        >
          Done
        </button>
      </div>
    </div>
  );
};
