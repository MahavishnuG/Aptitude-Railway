export function triggerSuccessHaptic() {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      // Crisp double-tap celebratory vibration
      navigator.vibrate([40, 40, 60]);
    } catch {
      // Ignored if vibration is blocked by browser policy
    }
  }
}

export function triggerWarningHaptic() {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate(80);
    } catch {
      // Ignored
    }
  }
}
