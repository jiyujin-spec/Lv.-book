/**
 * Web Audio API-based procedural sound engine for Lv. Book.
 * No audio files required – all sounds are synthesized on the fly.
 */

type OscType = OscillatorType;

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private masterGain: GainNode | null = null;

  private getCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.6;
      this.masterGain.connect(this.ctx.destination);
    }
    // Resume if suspended (browser autoplay policy)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  private tone(
    freq: number,
    startTime: number,
    duration: number,
    type: OscType = 'sine',
    volume: number = 0.3,
    attack: number = 0.01,
    release: number = 0.1
  ) {
    const ctx = this.getCtx();
    if (!ctx || !this.masterGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + attack);
    gain.gain.setValueAtTime(volume, startTime + duration - release);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  private noise(startTime: number, duration: number, volume: number = 0.15, filterFreq: number = 800) {
    const ctx = this.getCtx();
    if (!ctx || !this.masterGain) return;

    const bufferSize = Math.ceil(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    filter.Q.value = 3;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    source.start(startTime);
  }

  // ── Writing Sound ─────────────────────────────────────────────────────────
  /** Short scratchy noise burst –羊皮紙にペンで書く音 */
  playWriting() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    this.noise(t, 0.06, 0.12, 1200);
    this.noise(t + 0.07, 0.05, 0.08, 1500);
    this.noise(t + 0.13, 0.04, 0.07, 1000);
  }

  // ── Quest Start ───────────────────────────────────────────────────────────
  /** Short ascending horn call – クエスト開始 */
  playQuestStart() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    // C4 - E4 - G4 on square (horn-like)
    this.tone(261.63, t,        0.18, 'square', 0.22, 0.01, 0.08);
    this.tone(329.63, t + 0.18, 0.18, 'square', 0.22, 0.01, 0.08);
    this.tone(392.00, t + 0.36, 0.30, 'square', 0.25, 0.01, 0.15);
  }

  // ── Quest Complete ────────────────────────────────────────────────────────
  /** Bell-like ascending chime – 試練完了 */
  playQuestComplete() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      this.tone(freq, t + i * 0.14, 0.7, 'sine', 0.28, 0.005, 0.5);
      // Subtle harmonic
      this.tone(freq * 2, t + i * 0.14, 0.4, 'sine', 0.06, 0.005, 0.3);
    });
  }

  // ── Level Up Fanfare ──────────────────────────────────────────────────────
  /** Triumphant fanfare – レベルアップ */
  playLevelUp() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const sequence = [
      // [freq, startOffset, duration, type, volume]
      [261.63, 0.00, 0.12, 'triangle', 0.30],
      [329.63, 0.12, 0.12, 'triangle', 0.30],
      [392.00, 0.24, 0.12, 'triangle', 0.30],
      [523.25, 0.36, 0.20, 'triangle', 0.35],
      [392.00, 0.56, 0.10, 'triangle', 0.25],
      [523.25, 0.66, 0.10, 'triangle', 0.25],
      [659.25, 0.76, 0.10, 'triangle', 0.28],
      [783.99, 0.86, 0.40, 'triangle', 0.32],
      [1046.50,1.00, 0.60, 'sine',     0.35],
    ] as const;

    sequence.forEach(([freq, offset, dur, type, vol]) => {
      this.tone(freq, t + offset, dur, type as OscType, vol, 0.01, 0.08);
    });

    // Chord underneath
    [261.63, 329.63, 392.00].forEach(freq => {
      this.tone(freq, t + 0.36, 0.80, 'sine', 0.10, 0.02, 0.4);
    });
  }

  // ── Click / Select ────────────────────────────────────────────────────────
  /** Soft click for UI interactions */
  playClick() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    this.tone(880, t, 0.06, 'sine', 0.15, 0.005, 0.04);
  }

  // ── Success Stamp ─────────────────────────────────────────────────────────
  /** Heavy stamp sound for SUCCESS overlay */
  playStamp() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    this.noise(t, 0.08, 0.35, 200);
    this.tone(80, t, 0.15, 'sine', 0.4, 0.001, 0.12);
    this.tone(120, t, 0.12, 'sine', 0.25, 0.001, 0.10);
  }
}

// Singleton instance
const soundEngine = new SoundEngine();
export default soundEngine;
