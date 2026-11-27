/**
 * Humanized Realistic Voice Service for Chess Companion
 * Supports:
 * 1. ElevenLabs Neural Voice API (when API key is configured)
 * 2. OpenAI TTS-1 API (when API key is configured)
 * 3. Free StreamElements Neural TTS API (no key required, with automatic fallback)
 * 4. Humanized Browser Neural SpeechSynthesis (enhanced voices, emoji stripping, natural prosody)
 *
 * Includes persistent mobile HTMLAudioElement & SpeechSynthesis unlocking so async
 * network TTS responses and Stockfish move callbacks play cleanly on iOS Safari & Android Chrome.
 */

import type { Personality } from '../types/companion';
import type { CharacterBase } from '../contexts/CompanionContext';

export type VoiceApiProvider = 'auto' | 'elevenlabs' | 'openai' | 'streamelements' | 'browser';

export interface VoiceApiSettings {
  provider: VoiceApiProvider;
  elevenLabsApiKey: string;
  elevenLabsVoiceId: string;
  openAiApiKey: string;
  openAiVoice: 'onyx' | 'echo' | 'fable' | 'alloy' | 'nova' | 'shimmer';
  streamElementsVoice: string;
}

export interface VoiceStatus {
  ok: boolean;
  provider: string;
  message: string;
}

const VOICE_SETTINGS_KEY = 'chessmate_voice_api_settings_v2';
const SILENT_WAV_DATA_URI =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

export const ELEVENLABS_VOICES = [
  { id: 'YOq2y2Up4RgXP2HyXjE5', name: 'Xavier (Library — Requires Paid Plan)' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam (Deep & Charismatic — Free Tier Ready)' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh (Energetic Male — Free Tier Ready)' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni (Warm & Expressive — Free Tier Ready)' },
  { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum (Witty Maestro — Free Tier Ready)' },
];

const ENV_ELEVENLABS_KEY = (import.meta.env.VITE_ELEVENLABS_API_KEY || '').trim();

export const DEFAULT_VOICE_SETTINGS: VoiceApiSettings = {
  provider: ENV_ELEVENLABS_KEY ? 'elevenlabs' : 'auto',
  elevenLabsApiKey: ENV_ELEVENLABS_KEY,
  elevenLabsVoiceId: 'YOq2y2Up4RgXP2HyXjE5', // Xavier (with automatic premade fallback on 402)
  openAiApiKey: '',
  openAiVoice: 'echo',
  streamElementsVoice: 'Brian',
};

interface VoiceConfig {
  pitch: number;
  rate: number;
  voiceNames: string[];
}

const PERSONALITY_VOICE_CONFIGS: Record<Personality, VoiceConfig> = {
  roaster: {
    pitch: 0.98,
    rate: 1.02,
    voiceNames: [
      'Daniel (Enhanced)',
      'Microsoft Ryan Online (Natural)',
      'Microsoft Christopher Online (Natural)',
      'Google UK English Male',
      'Daniel',
      'Oliver',
      'Arthur',
      'Alex',
    ],
  },
  supportive: {
    pitch: 1.02,
    rate: 0.98,
    voiceNames: [
      'Microsoft Guy Online (Natural)',
      'Google US English',
      'Daniel (Enhanced)',
      'Daniel',
      'Oliver',
      'Alex',
    ],
  },
  competitive: {
    pitch: 1.0,
    rate: 1.04,
    voiceNames: [
      'Microsoft Christopher Online (Natural)',
      'Microsoft Guy Online (Natural)',
      'Google UK English Male',
      'Daniel (Enhanced)',
      'Daniel',
      'Alex',
    ],
  },
  coach: {
    pitch: 0.95,
    rate: 0.95,
    voiceNames: [
      'Daniel (Enhanced)',
      'Arthur',
      'Google UK English Male',
      'Microsoft Christopher Online (Natural)',
      'Daniel',
      'Alex',
    ],
  },
  chaotic: {
    pitch: 1.06,
    rate: 1.08,
    voiceNames: [
      'Microsoft Ryan Online (Natural)',
      'Google US English',
      'Daniel (Enhanced)',
      'Daniel',
      'Alex',
    ],
  },
};

const CHARACTER_VOICE_DEFAULTS: Partial<Record<CharacterBase, {
  openAiVoice: VoiceApiSettings['openAiVoice'];
  streamElementsVoice: string;
  pitchOffset: number;
}>> = {
  bruno: { openAiVoice: 'fable', streamElementsVoice: 'Brian', pitchOffset: -0.03 },
  crowned: { openAiVoice: 'fable', streamElementsVoice: 'Brian', pitchOffset: 0.04 },
  luffy: { openAiVoice: 'echo', streamElementsVoice: 'Joey', pitchOffset: 0.05 },
  zoro: { openAiVoice: 'onyx', streamElementsVoice: 'Matthew', pitchOffset: -0.08 },
  gojo: { openAiVoice: 'fable', streamElementsVoice: 'Brian', pitchOffset: 0.0 },
};

/**
 * Strip emojis and markdown symbols so TTS speaks cleanly like a human.
 */
function sanitizeForSpeech(raw: string): string {
  return raw
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

class CompanionVoiceManager {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isMuted: boolean = false;
  private sharedAudio: HTMLAudioElement | null = null;
  private isPlayingAudio: boolean = false;
  private audioUnlocked: boolean = false;
  private speechPrimed: boolean = false;
  private audioContext: AudioContext | null = null;
  private currentAudioUrl: string | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private settings: VoiceApiSettings = DEFAULT_VOICE_SETTINGS;
  private streamElementsBlocked: boolean = false;
  private activeSpeakId: number = 0;
  private abortController: AbortController | null = null;
  private browserTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private activeOnEnd: (() => void) | null = null;
  private statusListeners = new Set<(status: VoiceStatus) => void>();
  private lastStatus: VoiceStatus = {
    ok: true,
    provider: 'ready',
    message: ENV_ELEVENLABS_KEY
      ? 'ElevenLabs Xavier ready'
      : 'Auto mode ready (paste API key for ElevenLabs/OpenAI)',
  };

  constructor() {
    this.loadSettings();
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.loadVoices();
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.loadVoices();
        }
      }

      const handleFirstGesture = () => {
        this.unlockAudio(true);
        if (this.audioUnlocked && this.speechPrimed) {
          window.removeEventListener('pointerdown', handleFirstGesture, true);
          window.removeEventListener('touchstart', handleFirstGesture, true);
          window.removeEventListener('keydown', handleFirstGesture, true);
        }
      };

      window.addEventListener('pointerdown', handleFirstGesture, { capture: true, passive: true });
      window.addEventListener('touchstart', handleFirstGesture, { capture: true, passive: true });
      window.addEventListener('keydown', handleFirstGesture, { capture: true, passive: true });
    }
  }

  private getOrCreateSharedAudio(): HTMLAudioElement | null {
    if (typeof Audio === 'undefined') return null;
    if (!this.sharedAudio) {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.setAttribute('playsinline', '');
      audio.setAttribute('webkit-playsinline', '');
      this.sharedAudio = audio;
    }
    return this.sharedAudio;
  }

  /**
   * Unlocks a single persistent HTMLAudioElement + Web Audio context + mobile SpeechSynthesis
   * inside user gestures so async fetch audio plays on iOS Safari & Android Chrome.
   */
  public unlockAudio(primeSynth: boolean = false) {
    if (typeof window === 'undefined') return;

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        if (!this.audioContext) {
          this.audioContext = new AudioCtx();
        }
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume().catch(() => {});
        }
      }
    } catch {
      // Ignore AudioContext restrictions
    }

    const audio = this.getOrCreateSharedAudio();
    if (audio && !this.audioUnlocked && !this.isPlayingAudio) {
      this.audioUnlocked = true;
      audio.muted = true;
      audio.volume = 0;
      audio.src = SILENT_WAV_DATA_URI;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(() => {
            if (!this.isPlayingAudio && this.sharedAudio) {
              this.sharedAudio.pause();
              this.sharedAudio.currentTime = 0;
              this.sharedAudio.muted = false;
              this.sharedAudio.volume = 1;
            }
          })
          .catch(() => {
            this.audioUnlocked = false;
            if (this.sharedAudio) {
              this.sharedAudio.muted = false;
              this.sharedAudio.volume = 1;
            }
          });
      } else {
        audio.muted = false;
        audio.volume = 1;
      }
    }

    if (primeSynth && !this.speechPrimed && this.synth) {
      this.speechPrimed = true;
      try {
        if (!this.synth.speaking && !this.synth.pending) {
          const primer = new SpeechSynthesisUtterance('');
          primer.volume = 0;
          this.synth.speak(primer);
        }
      } catch {
        this.speechPrimed = false;
      }
    }
  }

  private setStatus(status: VoiceStatus) {
    this.lastStatus = status;
    this.statusListeners.forEach((cb) => cb(status));
  }

  public getStatus(): VoiceStatus {
    return this.lastStatus;
  }

  public subscribeStatus(listener: (status: VoiceStatus) => void): () => void {
    this.statusListeners.add(listener);
    listener(this.lastStatus);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  private loadSettings() {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(VOICE_SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.settings = {
          ...DEFAULT_VOICE_SETTINGS,
          ...parsed,
          elevenLabsApiKey: parsed.elevenLabsApiKey || DEFAULT_VOICE_SETTINGS.elevenLabsApiKey,
        };
      }
    } catch {
      this.settings = DEFAULT_VOICE_SETTINGS;
    }
  }

  public getSettings(): VoiceApiSettings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<VoiceApiSettings>) {
    this.settings = { ...this.settings, ...partial };
    if (partial.provider && partial.provider !== 'streamelements') {
      this.streamElementsBlocked = false;
    }
    try {
      localStorage.setItem(VOICE_SETTINGS_KEY, JSON.stringify(this.settings));
    } catch {
      // Ignore storage errors
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
  }

  /**
   * Stops active playback and cancels any pending speech. Returns true if Web Speech was busy.
   */
  public stop(): boolean {
    this.activeSpeakId++;
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    if (this.browserTimeoutId) {
      clearTimeout(this.browserTimeoutId);
      this.browserTimeoutId = null;
    }

    let synthWasBusy = false;
    if (this.synth && (this.synth.speaking || this.synth.pending)) {
      synthWasBusy = true;
      this.synth.cancel();
    }
    this.currentUtterance = null;

    if (this.sharedAudio) {
      this.sharedAudio.onplay = null;
      this.sharedAudio.onended = null;
      this.sharedAudio.onerror = null;
      this.sharedAudio.pause();
      this.sharedAudio.muted = false;
      this.sharedAudio.volume = 1;
    }
    this.isPlayingAudio = false;

    if (this.currentAudioUrl) {
      URL.revokeObjectURL(this.currentAudioUrl);
      this.currentAudioUrl = null;
    }
    if (this.activeOnEnd) {
      const endCb = this.activeOnEnd;
      this.activeOnEnd = null;
      endCb();
    }
    return synthWasBusy;
  }

  private findBestVoice(preferredNames: string[]): SpeechSynthesisVoice | null {
    if (!this.voices.length && this.synth) {
      this.voices = this.synth.getVoices();
    }

    for (const name of preferredNames) {
      const match = this.voices.find(
        (v) => v.name.toLowerCase().includes(name.toLowerCase()) || v.name === name
      );
      if (match) return match;
    }

    const naturalVoice = this.voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') ||
          v.name.includes('Neural') ||
          v.name.includes('Enhanced') ||
          v.name.includes('Premium') ||
          v.name.includes('Google'))
    );
    if (naturalVoice) return naturalVoice;

    const maleVoiceNames = ['daniel', 'oliver', 'alex', 'arthur', 'george', 'thomas', 'ryan', 'guy'];
    for (const name of maleVoiceNames) {
      const match = this.voices.find(
        (v) => v.lang.startsWith('en') && v.name.toLowerCase().includes(name)
      );
      if (match) return match;
    }

    return this.voices.find((v) => v.lang.startsWith('en')) || this.voices[0] || null;
  }

  private async playBlobAudio(
    blob: Blob,
    speakId: number,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<boolean> {
    if (this.isMuted || speakId !== this.activeSpeakId) return false;

    const audio = this.getOrCreateSharedAudio();
    if (!audio) return false;

    audio.onplay = null;
    audio.onended = null;
    audio.onerror = null;
    audio.pause();
    audio.muted = false;
    audio.volume = 1;

    if (this.currentAudioUrl) {
      URL.revokeObjectURL(this.currentAudioUrl);
      this.currentAudioUrl = null;
    }

    const url = URL.createObjectURL(blob);
    this.currentAudioUrl = url;
    this.isPlayingAudio = true;
    this.activeOnEnd = onEnd || null;
    audio.src = url;

    return new Promise((resolve) => {
      audio.onplay = () => {
        if (speakId !== this.activeSpeakId) {
          audio.pause();
          this.isPlayingAudio = false;
          return;
        }
        onStart?.();
      };
      audio.onended = () => {
        this.isPlayingAudio = false;
        if (speakId === this.activeSpeakId) {
          this.stop();
        }
        resolve(true);
      };
      audio.onerror = () => {
        this.isPlayingAudio = false;
        if (speakId === this.activeSpeakId) {
          this.stop();
        }
        resolve(false);
      };
      audio.play().catch((err: unknown) => {
        this.isPlayingAudio = false;
        const name = err instanceof Error ? err.name : '';
        if (name === 'NotAllowedError') {
          this.audioUnlocked = false;
          this.setStatus({
            ok: false,
            provider: 'blocked',
            message: 'Mobile browser paused audio — tap board or Test Voice to unlock',
          });
        }
        if (speakId === this.activeSpeakId) {
          this.stop();
        }
        resolve(false);
      });
    });
  }

  private async tryElevenLabs(
    text: string,
    speakId: number,
    signal: AbortSignal,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<boolean> {
    const key = this.settings.elevenLabsApiKey.trim();
    const voiceId = this.settings.elevenLabsVoiceId.trim() || 'pNInz6obpgDQGcFmaJgB';
    if (!key) {
      this.setStatus({
        ok: false,
        provider: 'elevenlabs',
        message: 'No ElevenLabs API key saved on this device — using fallback',
      });
      return false;
    }
    if (speakId !== this.activeSpeakId) return false;

    this.setStatus({
      ok: true,
      provider: 'elevenlabs',
      message: 'Generating ElevenLabs voice...',
    });

    const callTts = async (vid: string) =>
      fetch(`https://api.elevenlabs.io/v1/text-to-speech/${vid}`, {
        method: 'POST',
        signal,
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': key,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.78,
            style: 0.35,
            use_speaker_boost: true,
          },
        }),
      });

    try {
      let usedVoiceId = voiceId;
      let res = await callTts(usedVoiceId);
      if (speakId !== this.activeSpeakId) return false;
      if ((res.status === 402 || res.status === 404) && usedVoiceId !== 'pNInz6obpgDQGcFmaJgB') {
        usedVoiceId = 'pNInz6obpgDQGcFmaJgB';
        res = await callTts(usedVoiceId);
        if (speakId !== this.activeSpeakId) return false;
      }
      if (!res.ok) {
        this.setStatus({
          ok: false,
          provider: 'elevenlabs',
          message:
            res.status === 401
              ? 'ElevenLabs API key invalid or expired (HTTP 401)'
              : `ElevenLabs unavailable (HTTP ${res.status}) — using fallback`,
        });
        return false;
      }
      const blob = await res.blob();
      if (speakId !== this.activeSpeakId) return false;
      const played = await this.playBlobAudio(blob, speakId, onStart, onEnd);
      if (played) {
        this.setStatus({
          ok: true,
          provider: 'elevenlabs',
          message:
            usedVoiceId === 'YOq2y2Up4RgXP2HyXjE5'
              ? 'Playing ElevenLabs (Xavier)'
              : 'Playing ElevenLabs (Adam fallback)',
        });
      }
      return played;
    } catch {
      if (!signal.aborted) {
        this.setStatus({
          ok: false,
          provider: 'elevenlabs',
          message: 'Network error reaching ElevenLabs — using fallback',
        });
      }
      return false;
    }
  }

  private async tryOpenAiTts(
    text: string,
    speakId: number,
    signal: AbortSignal,
    character?: CharacterBase,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<boolean> {
    const key = this.settings.openAiApiKey.trim();
    if (!key) {
      this.setStatus({
        ok: false,
        provider: 'openai',
        message: 'No OpenAI API key saved on this device — using fallback',
      });
      return false;
    }
    if (speakId !== this.activeSpeakId) return false;

    const charVoice = character ? CHARACTER_VOICE_DEFAULTS[character]?.openAiVoice : undefined;
    const voice = this.settings.openAiVoice || charVoice || 'echo';

    try {
      const res = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice,
          response_format: 'mp3',
        }),
      });
      if (!res.ok || speakId !== this.activeSpeakId) {
        if (!signal.aborted) {
          this.setStatus({
            ok: false,
            provider: 'openai',
            message: `OpenAI TTS failed (HTTP ${res.status}) — using fallback`,
          });
        }
        return false;
      }
      const blob = await res.blob();
      if (speakId !== this.activeSpeakId) return false;
      const played = await this.playBlobAudio(blob, speakId, onStart, onEnd);
      if (played) {
        this.setStatus({ ok: true, provider: 'openai', message: `Playing OpenAI (${voice})` });
      }
      return played;
    } catch {
      return false;
    }
  }

  private async tryStreamElements(
    text: string,
    speakId: number,
    signal: AbortSignal,
    character?: CharacterBase,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<boolean> {
    if (this.streamElementsBlocked || speakId !== this.activeSpeakId) return false;
    const charVoice = character ? CHARACTER_VOICE_DEFAULTS[character]?.streamElementsVoice : undefined;
    const voice = this.settings.streamElementsVoice || charVoice || 'Brian';

    try {
      const url = `https://api.streamelements.com/kappa/v2/speech?voice=${encodeURIComponent(
        voice
      )}&text=${encodeURIComponent(text)}`;
      const res = await fetch(url, { signal });
      if (!res.ok || speakId !== this.activeSpeakId) {
        if (!signal.aborted && (res.status === 401 || res.status === 403 || res.status === 404)) {
          this.streamElementsBlocked = true;
        }
        return false;
      }
      const blob = await res.blob();
      if (blob.size < 200 || speakId !== this.activeSpeakId) {
        return false;
      }
      const played = await this.playBlobAudio(blob, speakId, onStart, onEnd);
      if (played) {
        this.setStatus({
          ok: true,
          provider: 'streamelements',
          message: `Playing Free Neural Voice (${voice})`,
        });
      }
      return played;
    } catch {
      return false;
    }
  }

  private speakBrowserHumanized(
    text: string,
    speakId: number,
    personality: Personality,
    character?: CharacterBase,
    onStart?: () => void,
    onEnd?: () => void,
    deferForCancel: boolean = false
  ) {
    if (!this.synth || this.isMuted || speakId !== this.activeSpeakId) {
      if (!this.synth) {
        this.setStatus({
          ok: false,
          provider: 'browser',
          message: 'Speech synthesis unavailable on this browser',
        });
      }
      onEnd?.();
      return;
    }

    const config = PERSONALITY_VOICE_CONFIGS[personality] || PERSONALITY_VOICE_CONFIGS.supportive;
    const utterance = new SpeechSynthesisUtterance(text);
    const chosenVoice = this.findBestVoice(config.voiceNames);

    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    const charOffset = character ? CHARACTER_VOICE_DEFAULTS[character]?.pitchOffset ?? 0 : 0;
    const pitchJitter = (Math.random() - 0.5) * 0.06;
    const rateJitter = (Math.random() - 0.5) * 0.05;

    utterance.pitch = Math.max(0.75, Math.min(1.35, config.pitch + charOffset + pitchJitter));
    utterance.rate = Math.max(0.82, Math.min(1.22, config.rate + rateJitter));
    utterance.volume = 1.0;

    this.currentUtterance = utterance;
    this.activeOnEnd = onEnd || null;

    utterance.onstart = () => {
      if (speakId === this.activeSpeakId) onStart?.();
    };
    utterance.onend = () => {
      if (speakId === this.activeSpeakId) {
        this.currentUtterance = null;
        this.activeOnEnd = null;
        onEnd?.();
      }
    };
    utterance.onerror = () => {
      if (speakId === this.activeSpeakId) {
        this.currentUtterance = null;
        this.activeOnEnd = null;
        onEnd?.();
      }
    };

    const runSpeak = () => {
      if (this.synth && !this.isMuted && speakId === this.activeSpeakId) {
        this.speechPrimed = true;
        this.synth.speak(utterance);
        if (!this.lastStatus.ok || this.lastStatus.provider === 'ready') {
          this.setStatus({
            ok: true,
            provider: 'browser',
            message: this.settings.elevenLabsApiKey.trim()
              ? 'Playing via Browser Neural fallback'
              : 'Playing via Browser Voice (paste ElevenLabs key for AI voice)',
          });
        }
      }
    };

    // Call synchronously on fresh taps so iOS Safari & Android Chrome preserve user gesture!
    if (deferForCancel) {
      this.browserTimeoutId = setTimeout(() => {
        this.browserTimeoutId = null;
        runSpeak();
      }, 60);
    } else {
      runSpeak();
    }
  }

  public async speak(
    rawText: string,
    personality: Personality = 'supportive',
    onStart?: () => void,
    onEnd?: () => void,
    character?: CharacterBase
  ) {
    const text = sanitizeForSpeech(rawText);
    if (this.isMuted || !text) {
      return;
    }

    // Unlock shared HTMLAudioElement synchronously inside any triggering gesture
    this.unlockAudio(false);

    // Cancel any active or in-flight speech request cleanly before starting a new one
    const synthWasBusy = this.stop();
    const speakId = this.activeSpeakId;
    const controller = new AbortController();
    this.abortController = controller;

    const { provider } = this.settings;

    if (provider === 'elevenlabs') {
      const ok = await this.tryElevenLabs(text, speakId, controller.signal, onStart, onEnd);
      if (ok || speakId !== this.activeSpeakId) return;
    } else if (provider === 'openai') {
      const ok = await this.tryOpenAiTts(text, speakId, controller.signal, character, onStart, onEnd);
      if (ok || speakId !== this.activeSpeakId) return;
    } else if (provider === 'streamelements') {
      const ok = await this.tryStreamElements(text, speakId, controller.signal, character, onStart, onEnd);
      if (ok || speakId !== this.activeSpeakId) return;
    } else if (provider === 'auto') {
      if (this.settings.elevenLabsApiKey.trim()) {
        const ok = await this.tryElevenLabs(text, speakId, controller.signal, onStart, onEnd);
        if (ok || speakId !== this.activeSpeakId) return;
      }
      if (this.settings.openAiApiKey.trim()) {
        const ok = await this.tryOpenAiTts(text, speakId, controller.signal, character, onStart, onEnd);
        if (ok || speakId !== this.activeSpeakId) return;
      }
      const seOk = await this.tryStreamElements(text, speakId, controller.signal, character, onStart, onEnd);
      if (seOk || speakId !== this.activeSpeakId) return;
    }

    if (speakId !== this.activeSpeakId || this.isMuted) return;
    this.speakBrowserHumanized(
      text,
      speakId,
      personality,
      character,
      onStart,
      onEnd,
      synthWasBusy
    );
  }
}

export const companionVoice = new CompanionVoiceManager();
