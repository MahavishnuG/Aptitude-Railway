export function getGoogleCalendarUrl(): string {
  const title = encodeURIComponent('RRB Railway Exam Aptitude Daily Practice');
  const details = encodeURIComponent(
    'Daily 30-minute speed-math, time-distance train problems, and aptitude drill for RRB NTPC, Group D, ALP, and JE.\nKeep your streak alive!'
  );
  // Default reminder at 08:30 AM local time tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(8, 30, 0, 0);

  const startUtc = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000)
    .toISOString()
    .replace(/-|:|\.\d+/g, '')
    .slice(0, 15) + 'Z';

  const endUtc = new Date(tomorrow.getTime() + 30 * 60000 - tomorrow.getTimezoneOffset() * 60000)
    .toISOString()
    .replace(/-|:|\.\d+/g, '')
    .slice(0, 15) + 'Z';

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${startUtc}/${endUtc}&recur=RRULE:FREQ=DAILY`;
}

export function downloadIcsFile(): void {
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//RRB Exam Prep//Aptitude Coach PWA//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:rrb-daily-study-${Date.now()}@rrbprep.pwa`,
    `DTSTAMP:${new Date().toISOString().replace(/-|:|\.\d+/g, '').slice(0, 15)}Z`,
    'DTSTART;TZID=Asia/Kolkata:20260920T083000',
    'DTEND;TZID=Asia/Kolkata:20260920T090000',
    'RRULE:FREQ=DAILY',
    'SUMMARY:🚂 RRB Railway Aptitude Daily Practice (30 Mins)',
    'DESCRIPTION:Daily 30-minute speed-math and aptitude problem solving for RRB NTPC\\, Group D\\, ALP\\, and JE. Keep your Station Master streak active!',
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: 15 minutes until your RRB Aptitude Practice!',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'RRB_Daily_Aptitude_Practice.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export async function requestWebNotifications(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  const perm = await Notification.requestPermission();
  return perm === 'granted';
}

export function sendStreakNotification(streak: number): void {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification('🚂 RRB Aptitude: Keep Your Streak Alive!', {
        body: `You are on a 🔥 ${streak}-day streak! Solve your 15 questions today to fuel your train to the next station.`,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
      });
    } catch {
      // Ignored
    }
  }
}
