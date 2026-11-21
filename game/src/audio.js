// All sound is synthesized with WebAudio — no audio files, no network.
// A short two-note chime for a find, a low buzz for a miss, a soft blip for
// a hint, and a little arpeggio when a scene is finished.
export class Sfx {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  tone(freq, startAt, dur, type = 'sine', vol = 0.12) {
    const ctx = this.ensure();
    if (!ctx || !this.enabled) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime + startAt);
    gain.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + startAt);
    osc.stop(ctx.currentTime + startAt + dur + 0.05);
  }

  found() {
    this.tone(660, 0, 0.14, 'sine', 0.14);
    this.tone(990, 0.09, 0.22, 'sine', 0.14);
  }

  wrong() {
    this.tone(140, 0, 0.22, 'sawtooth', 0.07);
  }

  hint() {
    this.tone(520, 0, 0.1, 'triangle', 0.1);
    this.tone(780, 0.08, 0.14, 'triangle', 0.1);
  }

  win() {
    [523, 659, 784, 1047].forEach((f, i) => this.tone(f, i * 0.12, 0.3, 'sine', 0.13));
  }

  lose() {
    [392, 330, 262].forEach((f, i) => this.tone(f, i * 0.16, 0.28, 'triangle', 0.1));
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}
