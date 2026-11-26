import { useState, useCallback, useRef, useEffect } from 'react';
import type { Move } from 'chess.js';

interface UseSoundsReturn {
  playMoveSound: (move: Move) => void;
  soundEnabled: boolean;
  toggleSounds: () => void;
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  gain: number = 0.3,
) {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  gainNode.gain.setValueAtTime(gain, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration / 1000);
}

function playMoveBeep(ctx: AudioContext) {
  // Short soft click — 200Hz, 50ms
  playTone(ctx, 200, 50, 'sine', 0.2);
}

function playCaptureBeep(ctx: AudioContext) {
  // Sharper thud — 150Hz, 100ms
  playTone(ctx, 150, 100, 'triangle', 0.4);
}

function playCheckBeep(ctx: AudioContext) {
  // Warning tone — 440Hz, 150ms
  playTone(ctx, 440, 150, 'square', 0.25);
}

function playCastleBeep(ctx: AudioContext) {
  // Two quick clicks
  playTone(ctx, 200, 40, 'sine', 0.2);
  setTimeout(() => {
    playTone(ctx, 250, 40, 'sine', 0.2);
  }, 60);
}

function playPromoteBeep(ctx: AudioContext) {
  // Rising tone
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(300, ctx.currentTime);
  oscillator.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.15);

  gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.2);
}

function playGameEndBeep(ctx: AudioContext) {
  // Chord — three notes together
  playTone(ctx, 262, 300, 'sine', 0.15); // C4
  playTone(ctx, 330, 300, 'sine', 0.15); // E4
  playTone(ctx, 392, 300, 'sine', 0.15); // G4
}

function playIllegalBeep(ctx: AudioContext) {
  // Low buzz
  playTone(ctx, 100, 150, 'sawtooth', 0.15);
}

export function useSounds(): UseSoundsReturn {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback((): AudioContext | null => {
    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new AudioContext();
      } catch {
        console.warn('Web Audio API is not supported in this browser.');
        return null;
      }
    }
    // Resume if suspended (browsers require user gesture)
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playMoveSound = useCallback(
    (move: Move) => {
      if (!soundEnabled) return;

      const ctx = getAudioContext();
      if (!ctx) return;

      // Determine which sound to play based on move flags
      // chess.js move flags: 'n' = normal, 'b' = pawn push, 'e' = en passant,
      // 'c' = capture, 'p' = promotion, 'k' = kingside castle, 'q' = queenside castle
      const flags = move.flags;

      if (flags.includes('k') || flags.includes('q')) {
        playCastleBeep(ctx);
      } else if (flags.includes('p')) {
        playPromoteBeep(ctx);
      } else if (move.captured) {
        playCaptureBeep(ctx);
      } else {
        playMoveBeep(ctx);
      }

      // If the move results in check, overlay the check sound
      // Note: chess.js Move object has 'san' which ends with '+' for check
      if (move.san?.includes('+') || move.san?.includes('#')) {
        setTimeout(() => playCheckBeep(ctx), 50);
      }
    },
    [soundEnabled, getAudioContext],
  );

  const toggleSounds = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioCtxRef.current?.close();
      audioCtxRef.current = null;
    };
  }, []);

  return {
    playMoveSound,
    soundEnabled,
    toggleSounds,
  };
}
