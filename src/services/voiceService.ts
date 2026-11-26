/**
 * Humanized Realistic Voice Service for Chess Companion
 * Supports:
 * 1. ElevenLabs Neural Voice API (when API key is configured)
 * 2. OpenAI TTS-1 API (when API key is configured)
 * 3. Free StreamElements Neural TTS API (no key required, with automatic fallback)
 * 4. Humanized Browser Neural SpeechSynthesis (enhanced voices, emoji stripping, natural prosody)
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

const VOICE_SETTINGS_KEY = 'chessmate_voice_api_settings_v2';

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
  private currentAudio: HTMLAudioElement | null = null;
  private currentAudioUrl: string | null = null;
  private settings: VoiceApiSettings = DEFAULT_VOICE_SETTINGS;
  private streamElementsBlocked: boolean = false;
  private activeSpeakId: number = 0;
  private abortController: AbortController | null = null;
  private browserTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private activeOnEnd: (() => void) | null = null;

  constructor() {
    this.loadSettings();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadSettings() {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(VOICE_SETTINGS_KEY);
      if (saved) {
        this.settings = { ...DEFAULT_VOICE_SETTINGS, ...JSON.parse(saved) };
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

  public stop() {
    this.activeSpeakId++;
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    if (this.browserTimeoutId) {
      clearTimeout(this.browserTimeoutId);
      this.browserTimeoutId = null;
    }
    if (this.synth) {
      this.synth.cancel();
    }
    if (this.currentAudio) {
      this.currentAudio.onplay = null;
      this.currentAudio.onended = null;
      this.currentAudio.onerror = null;
      this.currentAudio.pause();
      this.currentAudio.src = '';
      this.currentAudio = null;
    }
    if (this.currentAudioUrl) {
      URL.revokeObjectURL(this.currentAudioUrl);
      this.currentAudioUrl = null;
    }
    if (this.activeOnEnd) {
      const endCb = this.activeOnEnd;
      this.activeOnEnd = null;
      endCb();
    }
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

    // Ensure no lingering audio element plays simultaneously
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.src = '';
      this.currentAudio = null;
    }
    if (this.currentAudioUrl) {
      URL.revokeObjectURL(this.currentAudioUrl);
      this.currentAudioUrl = null;
    }

    const url = URL.createObjectURL(blob);
    this.currentAudioUrl = url;
    const audio = new Audio(url);
    this.currentAudio = audio;
    this.activeOnEnd = onEnd || null;

    return new Promise((resolve) => {
      audio.onplay = () => {
        if (speakId !== this.activeSpeakId) {
          audio.pause();
          return;
        }
        onStart?.();
      };
      audio.onended = () => {
        if (speakId === this.activeSpeakId) {
          this.stop();
        }
        resolve(true);
      };
      audio.onerror = () => {
        if (speakId === this.activeSpeakId) {
          this.stop();
        }
        resolve(false);
      };
      audio.play().catch(() => {
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
    if (!key || speakId !== this.activeSpeakId) return false;

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
      let res = await callTts(voiceId);
      if (speakId !== this.activeSpeakId) return false;
      if (res.status === 402 && voiceId !== 'pNInz6obpgDQGcFmaJgB') {
        res = await callTts('pNInz6obpgDQGcFmaJgB');
        if (speakId !== this.activeSpeakId) return false;
      }
      if (!res.ok) return false;
      const blob = await res.blob();
      if (speakId !== this.activeSpeakId) return false;
      return await this.playBlobAudio(blob, speakId, onStart, onEnd);
    } catch {
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
    if (!key || speakId !== this.activeSpeakId) return false;

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
      if (!res.ok || speakId !== this.activeSpeakId) return false;
      const blob = await res.blob();
      if (speakId !== this.activeSpeakId) return false;
      return await this.playBlobAudio(blob, speakId, onStart, onEnd);
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
        if (!signal.aborted) this.streamElementsBlocked = true;
        return false;
      }
      const blob = await res.blob();
      if (blob.size < 200 || speakId !== this.activeSpeakId) {
        if (blob.size < 200) this.streamElementsBlocked = true;
        return false;
      }
      return await this.playBlobAudio(blob, speakId, onStart, onEnd);
    } catch {
      if (!signal.aborted) this.streamElementsBlocked = true;
      return false;
    }
  }

  private speakBrowserHumanized(
    text: string,
    speakId: number,
    personality: Personality,
    character?: CharacterBase,
    onStart?: () => void,
    onEnd?: () => void
  ) {
    if (!this.synth || this.isMuted || speakId !== this.activeSpeakId) {
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

    this.activeOnEnd = onEnd || null;
    utterance.onstart = () => {
      if (speakId === this.activeSpeakId) onStart?.();
    };
    utterance.onend = () => {
      if (speakId === this.activeSpeakId) {
        this.activeOnEnd = null;
        onEnd?.();
      }
    };
    utterance.onerror = () => {
      if (speakId === this.activeSpeakId) {
        this.activeOnEnd = null;
        onEnd?.();
      }
    };

    this.browserTimeoutId = setTimeout(() => {
      this.browserTimeoutId = null;
      if (this.synth && !this.isMuted && speakId === this.activeSpeakId) {
        this.synth.cancel();
        this.synth.speak(utterance);
      }
    }, 40);
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

    // Cancel any active or in-flight speech request cleanly before starting a new one
    this.stop();
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
    this.speakBrowserHumanized(text, speakId, personality, character, onStart, onEnd);
  }
}

export const companionVoice = new CompanionVoiceManager();
