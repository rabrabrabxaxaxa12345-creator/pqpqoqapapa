import type { EvType } from "@/game/sim";

const PHRASES: { bass: number; notes: number[]; step: number }[] = [
  { bass: 73.42, notes: [220, 261.6, 196, 246.9, 174.6, 220, 293.7, 196], step: 0.48 },
  { bass: 82.41, notes: [246.9, 196, 220, 293.7, 174.6, 246.9, 329.6, 196], step: 0.44 },
  { bass: 87.31, notes: [261.6, 196, 329.6, 246.9, 174.6, 220, 311.1, 196], step: 0.52 },
  { bass: 98.0, notes: [293.7, 349.2, 220, 261.6, 392, 329.6, 246.9, 293.7], step: 0.42 },
  { bass: 65.41, notes: [196, 246.9, 164.8, 220, 293.7, 174.6, 329.6, 246.9], step: 0.5 },
];

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private music: GainNode | null = null;
  private sfx: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private nextNote = 0;
  private step = 0;
  muted = false;

  unlock() {
    if (!this.ctx) {
      const ctx = new AudioContext({ latencyHint: "interactive" });
      const master = ctx.createGain();
      const music = ctx.createGain();
      const sfx = ctx.createGain();
      music.gain.value = 1;
      sfx.gain.value = 1;
      master.gain.value = this.muted ? 0 : 0.85;
      music.connect(master);
      sfx.connect(master);
      master.connect(ctx.destination);
      this.ctx = ctx;
      this.master = master;
      this.music = music;
      this.sfx = sfx;
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  resume() {
    if (this.ctx && this.ctx.state === "suspended") void this.ctx.resume();
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (!this.ctx || !this.master) return;
    this.master.gain.setTargetAtTime(m ? 0 : 0.85, this.ctx.currentTime, 0.03);
  }

  pump(mood = 0) {
    if (!this.ctx || !this.music || this.muted || this.ctx.state !== "running") return;
    const phrase = PHRASES[Math.abs(mood) % PHRASES.length]!;
    const t = this.ctx.currentTime;
    if (this.nextNote < t) this.nextNote = t + 0.02;
    while (this.nextNote < t + 0.4) {
      const note = phrase.notes[this.step % phrase.notes.length]!;
      this.tone(note, this.nextNote, 0.55, 0.022, "triangle", this.music);
      if (this.step % 8 === 0) {
        this.tone(phrase.bass, this.nextNote, 1.6, 0.034, "sine", this.music);
        this.tone(phrase.bass * 1.5, this.nextNote, 1.4, 0.012, "sine", this.music);
      } else if (this.step % 4 === 0) {
        this.tone(phrase.bass, this.nextNote, 0.7, 0.02, "sine", this.music);
      }
      if (this.step % 2 === 0) this.tone(note * 2, this.nextNote, 0.12, 0.007, "sine", this.music);
      this.step++;
      this.nextNote += phrase.step;
    }
  }

  play(ev: EvType) {
    if (!this.ctx || !this.sfx || this.muted) return;
    const now = this.ctx.currentTime;
    const rate = 0.94 + Math.random() * 0.12;
    if (ev === "pass") this.tone(620 * rate, now, 0.05, 0.03, "triangle", this.sfx);
    else if (ev === "near") this.tone(880 * rate, now, 0.09, 0.05, "square", this.sfx);
    else if (ev === "oil") {
      this.tone(420, now, 0.12, 0.06, "sine", this.sfx);
      this.tone(640, now + 0.05, 0.14, 0.05, "sine", this.sfx);
    } else if (ev === "spark") this.tone(980 * rate, now, 0.08, 0.04, "sine", this.sfx);
    else if (ev === "lantern") this.tone(520, now, 0.16, 0.05, "triangle", this.sfx);
    else if (ev === "perfect") {
      this.tone(660, now, 0.14, 0.06, "triangle", this.sfx);
      this.tone(990, now + 0.06, 0.18, 0.05, "sine", this.sfx);
    } else if (ev === "die") {
      this.noise(now, 0.28, 0.2);
      this.tone(140, now, 0.32, 0.12, "sine", this.sfx);
    } else if (ev === "sky") {
      this.tone(523, now, 0.22, 0.05, "sine", this.sfx);
      this.tone(784, now + 0.08, 0.28, 0.04, "triangle", this.sfx);
    } else if (ev === "boost") {
      this.tone(440, now, 0.08, 0.05, "square", this.sfx);
      this.tone(660, now + 0.06, 0.12, 0.04, "triangle", this.sfx);
    } else if (ev === "magnet") {
      this.tone(310, now, 0.16, 0.04, "sine", this.sfx);
      this.tone(466, now + 0.05, 0.14, 0.035, "sine", this.sfx);
    } else if (ev === "win") {
      this.tone(523, now, 0.16, 0.05, "triangle", this.sfx);
      this.tone(659, now + 0.1, 0.18, 0.05, "triangle", this.sfx);
      this.tone(784, now + 0.2, 0.28, 0.05, "sine", this.sfx);
    }
  }

  private tone(
    freq: number,
    when: number,
    dur: number,
    gain: number,
    type: OscillatorType,
    bus: GainNode,
  ) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, when);
    g.gain.setValueAtTime(gain, when);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(g);
    g.connect(bus);
    o.start(when);
    o.stop(when + dur + 0.02);
  }

  private noise(when: number, dur: number, gain: number) {
    if (!this.ctx || !this.sfx) return;
    if (!this.noiseBuf) {
      const buf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.4), this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      this.noiseBuf = buf;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(900, when);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, when);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(this.sfx);
    src.start(when);
    src.stop(when + dur);
  }
}
