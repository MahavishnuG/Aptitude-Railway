let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speakText(
  text: string,
  lang: 'en' | 'ta' = 'en',
  onEnd?: () => void,
  onError?: (e: any) => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Web Speech API is not supported in this browser.');
    return false;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  currentUtterance = utterance;

  // Configure voice & pitch
  utterance.rate = 0.95; // Slightly measured pace for comprehension
  utterance.pitch = 1.0;

  // Attempt to find Tamil or Indian English voice
  const voices = window.speechSynthesis.getVoices();
  if (lang === 'ta') {
    const taVoice = voices.find((v) => v.lang.toLowerCase().includes('ta'));
    if (taVoice) {
      utterance.voice = taVoice;
      utterance.lang = taVoice.lang;
    } else {
      utterance.lang = 'ta-IN';
    }
  } else {
    // English with Indian accent preference if available
    const inEnVoice = voices.find((v) => v.lang.toLowerCase() === 'en-in');
    if (inEnVoice) {
      utterance.voice = inEnVoice;
      utterance.lang = 'en-IN';
    } else {
      utterance.lang = 'en-US';
    }
  }

  utterance.onend = () => {
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  utterance.onerror = (event) => {
    currentUtterance = null;
    if (onError) onError(event);
  };

  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

export function isSpeaking(): boolean {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
}
