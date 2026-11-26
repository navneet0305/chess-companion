import type { PieceSymbol } from 'chess.js';

/**
 * Web Audio API synthesizer for unique per-piece elimination sound effects
 * (Sword slash, Pistol gunshot, Lance impact, Cannon boom, Royal blade, Lightning smite).
 */
class EliminationAudioSynthesizer {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playNoiseBurst(
    ctx: AudioContext,
    duration: number,
    filterType: BiquadFilterType,
    filterFreq: number,
    volume: number,
    delay: number = 0
  ) {
    const start = ctx.currentTime + delay;
    const sampleRate = ctx.sampleRate;
    const bufferSize = Math.max(1, Math.floor(sampleRate * duration));
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(filterFreq, start);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(start);
    noise.stop(start + duration);
  }

  playEliminationSound(pieceType: PieceSymbol) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    switch (pieceType) {
      case 'p': {
        // Pawn: Sharp metallic Sword Slash ("shing!" + slice)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(2400, now);
        osc.frequency.exponentialRampToValueAtTime(420, now + 0.16);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);

        this.playNoiseBurst(ctx, 0.14, 'highpass', 1800, 0.25, 0.01);
        break;
      }

      case 'b': {
        // Bishop: Crisp Pistol Gunshot (sharp crack + low punch + shell ping)
        this.playNoiseBurst(ctx, 0.18, 'bandpass', 1600, 0.45, 0);

        const punch = ctx.createOscillator();
        const pGain = ctx.createGain();
        punch.type = 'triangle';
        punch.frequency.setValueAtTime(220, now);
        punch.frequency.exponentialRampToValueAtTime(45, now + 0.14);
        pGain.gain.setValueAtTime(0.4, now);
        pGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        punch.connect(pGain);
        pGain.connect(ctx.destination);
        punch.start(now);
        punch.stop(now + 0.15);

        // Subtle brass shell casing ping
        const ping = ctx.createOscillator();
        const pingGain = ctx.createGain();
        ping.type = 'sine';
        ping.frequency.setValueAtTime(3400, now + 0.18);
        pingGain.gain.setValueAtTime(0.08, now + 0.18);
        pingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        ping.connect(pingGain);
        pingGain.connect(ctx.destination);
        ping.start(now + 0.18);
        ping.stop(now + 0.28);
        break;
      }

      case 'n': {
        // Knight: Cavalry Lance Impale (whoosh + heavy kinetic thud)
        this.playNoiseBurst(ctx, 0.12, 'bandpass', 900, 0.28, 0);

        const impact = ctx.createOscillator();
        const iGain = ctx.createGain();
        impact.type = 'sawtooth';
        impact.frequency.setValueAtTime(180, now + 0.08);
        impact.frequency.exponentialRampToValueAtTime(40, now + 0.28);
        iGain.gain.setValueAtTime(0.35, now + 0.08);
        iGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        impact.connect(iGain);
        iGain.connect(ctx.destination);
        impact.start(now + 0.08);
        impact.stop(now + 0.3);
        break;
      }

      case 'r': {
        // Rook: Heavy Artillery Cannon Blast (deep boom + explosion rumble)
        this.playNoiseBurst(ctx, 0.42, 'lowpass', 550, 0.48, 0.04);

        const boom = ctx.createOscillator();
        const bGain = ctx.createGain();
        boom.type = 'sine';
        boom.frequency.setValueAtTime(130, now);
        boom.frequency.exponentialRampToValueAtTime(28, now + 0.42);
        bGain.gain.setValueAtTime(0.55, now);
        bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        boom.connect(bGain);
        bGain.connect(ctx.destination);
        boom.start(now);
        boom.stop(now + 0.45);
        break;
      }

      case 'q': {
        // Queen: Royal Twin-Blade Execution (twin high-energy sweeps + resonant chord)
        [0, 0.09].forEach((offset, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(idx === 0 ? 1900 : 2300, now + offset);
          osc.frequency.exponentialRampToValueAtTime(320, now + offset + 0.18);
          gain.gain.setValueAtTime(0.22, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.2);
        });
        this.playNoiseBurst(ctx, 0.22, 'highpass', 1400, 0.2, 0.05);
        break;
      }

      case 'k': {
        // King: Golden Scepter Lightning Smite (crack + thunder)
        this.playNoiseBurst(ctx, 0.3, 'bandpass', 2200, 0.38, 0);

        const thunder = ctx.createOscillator();
        const tGain = ctx.createGain();
        thunder.type = 'triangle';
        thunder.frequency.setValueAtTime(160, now + 0.03);
        thunder.frequency.exponentialRampToValueAtTime(32, now + 0.38);
        tGain.gain.setValueAtTime(0.45, now + 0.03);
        tGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        thunder.connect(tGain);
        tGain.connect(ctx.destination);
        thunder.start(now + 0.03);
        thunder.stop(now + 0.4);
        break;
      }
    }
  }
}

export const eliminationAudio = new EliminationAudioSynthesizer();
