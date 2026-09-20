/**
 * Web Audio API synthesizer for realistic Indian Railways Locomotive Horn and Station Chime.
 * Zero external audio files required, works instantly in browser.
 */

class TrainAudioEngine {
  private ctx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    try {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  /**
   * Classic Indian Railways dual-tone diesel/electric locomotive horn (Tuuuuu-Tuuut)
   */
  public playTrainHorn() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Frequencies for authentic Indian Railways WAP-7 / WDM dual horn chord (D4 + F#4 approx 293Hz + 370Hz)
    const freqs = [293.66, 369.99, 440.0];

    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      // Natural acoustic filter
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);

      gain.gain.setValueAtTime(0, now);
      // First burst
      gain.gain.linearRampToValueAtTime(0.09, now + 0.08);
      gain.gain.setValueAtTime(0.09, now + 0.45);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.55);

      // Second burst
      gain.gain.setValueAtTime(0, now + 0.62);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.7);
      gain.gain.setValueAtTime(0.12, now + 1.25);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.65);
    });
  }

  public playHorn() {
    this.playTrainHorn();
  }

  public playWhistle() {
    this.playTrainHorn();
  }

  /**
   * Station announcement attention chime (Ting-Tong-Ting)
   */
  public playStationChime() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [587.33, 440.0, 659.25]; // D5, A4, E5

    notes.forEach((freq, idx) => {
      const noteTime = now + idx * 0.28;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.15, noteTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.52);
    });
  }

  public playCorrectChime() {
    this.playStationChime();
  }

  /**
   * Quick rail signal click for answer selection
   */
  public playSignalClick(correct: boolean) {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (correct) {
      // Upward chime
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    } else {
      // Low signal thump
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.28);
  }

  public playWrongBuzzer() {
    this.playSignalClick(false);
  }

  /**
   * Railway track rhythm / wheel clack sound
   */
  public playWheelClack() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [0, 0.12].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now + offset);
      osc.frequency.exponentialRampToValueAtTime(80, now + offset + 0.08);

      gain.gain.setValueAtTime(0.1, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.1);
    });
  }
}

export const trainAudio = new TrainAudioEngine();
