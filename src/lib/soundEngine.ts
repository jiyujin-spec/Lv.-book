/**
 * Web Audio API procedural sound engine for Lv. Book.
 * All sounds synthesized — no audio files required.
 */

type OscType = OscillatorType;

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private masterGain: GainNode | null = null;

  private getCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      this.ctx = new (
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.55;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  setEnabled(v: boolean) { this.enabled = v; }
  isEnabled() { return this.enabled; }

  private tone(
    freq: number,
    startTime: number,
    duration: number,
    type: OscType = 'sine',
    volume: number = 0.3,
    attack: number = 0.01,
    release: number = 0.1,
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

  private noise(
    startTime: number,
    duration: number,
    volume: number = 0.15,
    filterFreq: number = 800,
  ) {
    const ctx = this.getCtx();
    if (!ctx || !this.masterGain) return;
    const bufferSize = Math.ceil(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
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

  // ── Writing noise ─────────────────────────────────────────────────────────
  playWriting() {
    if (!this.enabled) return;
    const ctx = this.getCtx(); if (!ctx) return;
    const t = ctx.currentTime;
    this.noise(t, 0.06, 0.12, 1200);
    this.noise(t + 0.07, 0.05, 0.08, 1500);
    this.noise(t + 0.13, 0.04, 0.07, 1000);
  }

  // ── Retro cursor/click ────────────────────────────────────────────────────
  /** Single soft click for UI buttons */
  playClick() {
    if (!this.enabled) return;
    const ctx = this.getCtx(); if (!ctx) return;
    const t = ctx.currentTime;
    this.tone(880, t, 0.05, 'sine', 0.12, 0.003, 0.04);
  }

  // ── DQ-style popo selection ───────────────────────────────────────────────
  /** Two-note retro selection blip for menu/card selection */
  playSelect() {
    if (!this.enabled) return;
    const ctx = this.getCtx(); if (!ctx) return;
    const t = ctx.currentTime;
    this.tone(880,  t,        0.045, 'square', 0.14, 0.002, 0.025);
    this.tone(1174, t + 0.06, 0.045, 'square', 0.14, 0.002, 0.025);
  }

  // ── Menu open ────────────────────────────────────────────────────────────
  playMenuOpen() {
    if (!this.enabled) return;
    const ctx = this.getCtx(); if (!ctx) return;
    const t = ctx.currentTime;
    this.tone(587, t,        0.07, 'square', 0.13, 0.003, 0.04);
    this.tone(784, t + 0.08, 0.07, 'square', 0.13, 0.003, 0.04);
  }

  // ── Adventure start jingle (heavier) ─────────────────────────────────────
  /** Full dramatic quest-start fanfare */
  playQuestStart() {
    if (!this.enabled) return;
    const ctx = this.getCtx(); if (!ctx) return;
    const t = ctx.currentTime;
    // Drum hit
    this.noise(t, 0.12, 0.35, 120);
    this.tone(80, t, 0.12, 'sine', 0.35, 0.001, 0.08);
    // Horn sequence: C4 E4 G4 C5
    this.tone(261.63, t + 0.15, 0.15, 'square', 0.20, 0.01, 0.06);
    this.tone(329.63, t + 0.31, 0.15, 'square', 0.20, 0.01, 0.06);
    this.tone(392.00, t + 0.47, 0.15, 'square', 0.22, 0.01, 0.06);
    this.tone(523.25, t + 0.63, 0.30, 'square', 0.25, 0.01, 0.12);
    // Harmony
    this.tone(196.00, t + 0.47, 0.46, 'triangle', 0.10, 0.02, 0.15);
    this.tone(261.63, t + 0.47, 0.46, 'triangle', 0.08, 0.02, 0.15);
  }

  // ── Quest complete chime ──────────────────────────────────────────────────
  playQuestComplete() {
    if (!this.enabled) return;
    const ctx = this.getCtx(); if (!ctx) return;
    const t = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      this.tone(freq, t + i * 0.14, 0.7, 'sine', 0.27, 0.005, 0.5);
      this.tone(freq * 2, t + i * 0.14, 0.4, 'sine', 0.06, 0.005, 0.3);
    });
  }

  // ── Level-up fanfare ──────────────────────────────────────────────────────
  playLevelUp() {
    if (!this.enabled) return;
    const ctx = this.getCtx(); if (!ctx) return;
    const t = ctx.currentTime;
    const seq = [
      [261.63, 0.00, 0.11, 'triangle', 0.28],
      [329.63, 0.11, 0.11, 'triangle', 0.28],
      [392.00, 0.22, 0.11, 'triangle', 0.28],
      [523.25, 0.33, 0.18, 'triangle', 0.32],
      [392.00, 0.51, 0.09, 'triangle', 0.24],
      [523.25, 0.60, 0.09, 'triangle', 0.24],
      [659.25, 0.69, 0.09, 'triangle', 0.27],
      [783.99, 0.78, 0.36, 'triangle', 0.30],
      [1046.50,0.90, 0.60, 'sine',     0.33],
    ] as const;
    seq.forEach(([freq, offset, dur, type, vol]) =>
      this.tone(freq, t + offset, dur, type as OscType, vol, 0.01, 0.08)
    );
    [261.63, 329.63, 392.00].forEach(f =>
      this.tone(f, t + 0.33, 0.80, 'sine', 0.09, 0.02, 0.4)
    );
  }

  // ── Stamp thud ───────────────────────────────────────────────────────────
  playStamp() {
    if (!this.enabled) return;
    const ctx = this.getCtx(); if (!ctx) return;
    const t = ctx.currentTime;
    this.noise(t, 0.08, 0.35, 200);
    this.tone(80, t, 0.15, 'sine', 0.4, 0.001, 0.12);
    this.tone(120, t, 0.12, 'sine', 0.25, 0.001, 0.10);
  }
}

const soundEngine = new SoundEngine();
export default soundEngine;
