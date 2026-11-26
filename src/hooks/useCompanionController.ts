import { useState, useEffect, useRef, useCallback } from 'react';
import {
  companionVoice,
  type VoiceApiSettings,
  type VoiceStatus,
} from '../services/voiceService';
import type { ChessEvent } from '../lib/dialogueLibrary';
import {
  getContextualDialogue,
  getSilentGesture,
  shouldSpeakForEvent,
  getInteractiveActionDialogue,
  type DialogueContext,
} from '../lib/companionDialogueEngine';
import type { Personality, AnimationState } from '../types/companion';
import { useSettings } from '../contexts/SettingsContext';
import { useCompanion } from '../contexts/CompanionContext';
import { CHARACTER_PROFILES } from '../components/companion/character/CompanionAvatar';
import {
  MATCH_BETS,
  pickRandomMatchBet,
  getSkitForCondition,
  type CompanionBet,
  type CompanionSkitId,
} from '../lib/companionBets';

export interface CompanionEventPayload {
  id: number;
  event: ChessEvent;
  context?: DialogueContext;
}

export const PERSONALITY_LABELS: Record<
  Personality,
  { label: string; icon: string; desc: string }
> = {
  roaster: { label: 'The Roaster', icon: '🔥', desc: 'Sarcastic roasts & witty banter' },
  supportive: { label: 'Supportive Friend', icon: '💖', desc: 'Warm & positive encouragement' },
  competitive: { label: 'The Competitor', icon: '⚔️', desc: 'Fierce & victory-driven' },
  coach: { label: 'Calm Coach', icon: '🧠', desc: 'Fundamentals & strategic guidance' },
  chaotic: { label: 'Chaotic Gremlin', icon: '⚡', desc: 'Wild attacks & reckless tactics' },
};

interface UseCompanionControllerArgs {
  status: string;
  isThinking: boolean;
  latestEvent?: CompanionEventPayload | null;
  liveContext?: DialogueContext;
  personality: Personality;
  onPersonalityChange?: (personality: Personality) => void;
}

export function useCompanionController({
  status,
  isThinking,
  latestEvent = null,
  liveContext,
  personality,
  onPersonalityChange,
}: UseCompanionControllerArgs) {
  const { soundEnabled } = useSettings();
  const { character, headwear, accessory, palette } = useCompanion();

  const [animationState, setAnimationState] = useState<AnimationState>('idle');
  const [currentText, setCurrentText] = useState<string>(
    "Ready when you are! Let's see what you've got."
  );
  const [isGestureOnly, setIsGestureOnly] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(false);
  const [activeBet, setActiveBet] = useState<CompanionBet>(() => MATCH_BETS[0]);
  const [activeSkit, setActiveSkit] = useState<CompanionSkitId>('none');
  const [freeRoam, setFreeRoam] = useState<boolean>(false);
  const [voiceSettings, setVoiceSettings] = useState<VoiceApiSettings>(() =>
    companionVoice.getSettings()
  );
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>(() =>
    companionVoice.getStatus()
  );

  useEffect(() => {
    return companionVoice.subscribeStatus(setVoiceStatus);
  }, []);

  const skitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSpokenRef = useRef<number>(0);
  const lastHandledEventIdRef = useRef<number>(0);

  const personalityRef = useRef(personality);
  personalityRef.current = personality;
  const characterRef = useRef(character);
  characterRef.current = character;
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;
  const isVoiceMutedRef = useRef(isVoiceMuted);
  isVoiceMutedRef.current = isVoiceMuted;
  const isThinkingRef = useRef(isThinking);
  isThinkingRef.current = isThinking;
  const liveContextRef = useRef(liveContext);
  liveContextRef.current = liveContext;

  useEffect(() => {
    companionVoice.setMuted(!soundEnabled || isVoiceMuted);
  }, [soundEnabled, isVoiceMuted]);

  useEffect(() => {
    return () => {
      if (skitTimerRef.current) clearTimeout(skitTimerRef.current);
    };
  }, []);

  const speakLine = useCallback((text: string, pers: Personality) => {
    if (!soundEnabledRef.current || isVoiceMutedRef.current) return;
    lastSpokenRef.current = Date.now();
    companionVoice.speak(
      text,
      pers,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      characterRef.current
    );
  }, []);

  const triggerSkit = useCallback((skit: CompanionSkitId, durationMs: number) => {
    if (skit === 'none') return;
    setActiveSkit(skit);
    if (skitTimerRef.current) clearTimeout(skitTimerRef.current);
    skitTimerRef.current = setTimeout(() => {
      setActiveSkit('none');
    }, durationMs || 4200);
  }, []);

  useEffect(() => {
    if (!latestEvent || latestEvent.id === lastHandledEventIdRef.current) {
      return;
    }
    lastHandledEventIdRef.current = latestEvent.id;

    const currentPersonality = personalityRef.current;
    const ctx: DialogueContext = {
      ...liveContextRef.current,
      ...latestEvent.context,
      character: characterRef.current,
    };

    const playerIsWhite = (ctx.playerColor || 'w') === 'w';
    const rawEval = ctx.evalScore ?? 0;
    const evalAdvantageCp = playerIsWhite ? rawEval : -rawEval;

    const skitOutcome = getSkitForCondition({
      event: latestEvent.event,
      isCheck: ctx.isCheck,
      evalAdvantageCp,
      activeBet,
    });

    if (skitOutcome.skit !== 'none') {
      triggerSkit(skitOutcome.skit, skitOutcome.durationMs);
    }

    if (skitOutcome.betTriggered && skitOutcome.payoffLine) {
      setCurrentText(skitOutcome.payoffLine);
      setIsGestureOnly(false);
      setAnimationState(skitOutcome.skit === 'eat_mustache' ? 'shocked' : 'excited');
      speakLine(skitOutcome.payoffLine, currentPersonality);
      return;
    }

    const now = Date.now();
    const msSinceSpoken = now - lastSpokenRef.current;
    const willSpeak = shouldSpeakForEvent(latestEvent.event, msSinceSpoken);

    if (willSpeak) {
      const pick = getContextualDialogue(currentPersonality, latestEvent.event, ctx);
      setCurrentText(pick.text);
      setIsGestureOnly(false);
      setAnimationState(pick.animation);
      speakLine(pick.text, currentPersonality);
    } else {
      const gesture = getSilentGesture(latestEvent.event);
      setCurrentText(gesture.text);
      setIsGestureOnly(true);
      setAnimationState(gesture.animation);
    }

    const timer = setTimeout(() => {
      if (!isThinkingRef.current) {
        setAnimationState('idle');
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, [latestEvent, speakLine, activeBet, triggerSkit]);

  // Conversational idle check-in: speaks up gently if player pauses to think for a while,
  // or mixes in a silent body gesture if he already spoke recently
  useEffect(() => {
    if (status !== 'playing' || isThinking) return;

    const idleTimer = setTimeout(() => {
      const msSinceSpoken = Date.now() - lastSpokenRef.current;
      if (msSinceSpoken > 18000) {
        const pick = getContextualDialogue(personalityRef.current, 'idle_thinking', {
          ...liveContextRef.current,
          character: characterRef.current,
        });
        setCurrentText(pick.text);
        setIsGestureOnly(false);
        setAnimationState(pick.animation);
        speakLine(pick.text, personalityRef.current);
      } else {
        const gesture = getSilentGesture('good_move');
        setCurrentText(gesture.text);
        setIsGestureOnly(true);
        setAnimationState(gesture.animation);
      }
    }, 19000);

    return () => clearTimeout(idleTimer);
  }, [latestEvent, status, isThinking, speakLine]);

  const handleCompanionClick = useCallback(() => {
    const currentPersonality = personalityRef.current;
    const pick = getContextualDialogue(currentPersonality, 'interaction_click', {
      ...liveContextRef.current,
      character: characterRef.current,
    });
    setCurrentText(pick.text);
    setIsGestureOnly(false);
    setAnimationState(pick.animation);
    speakLine(pick.text, currentPersonality);
  }, [speakLine]);

  const handleInteractiveAction = useCallback(
    (action: 'hint' | 'vibe' | 'hype') => {
      const currentPersonality = personalityRef.current;
      const pick = getInteractiveActionDialogue(action, currentPersonality, {
        ...liveContextRef.current,
        character: characterRef.current,
      });
      setCurrentText(pick.text);
      setIsGestureOnly(false);
      setAnimationState(pick.animation);
      speakLine(pick.text, currentPersonality);
    },
    [speakLine]
  );

  const handleVoiceSettingChange = useCallback(
    (patch: Partial<VoiceApiSettings>) => {
      setVoiceSettings((prev) => {
        const updated = { ...prev, ...patch };
        companionVoice.updateSettings(patch);
        return updated;
      });
    },
    []
  );

  const handleSelectPersonality = useCallback(
    (key: Personality) => {
      if (onPersonalityChange) onPersonalityChange(key);
      const sample = getContextualDialogue(key, 'start', {
        character: characterRef.current,
      }).text;
      setCurrentText(sample);
      setIsGestureOnly(false);
      speakLine(sample, key);
    },
    [onPersonalityChange, speakLine]
  );

  const handleRunDare = useCallback(() => {
    triggerSkit(activeBet.skit, activeBet.durationMs);
    setCurrentText(activeBet.payoffLine);
    setIsGestureOnly(false);
    setAnimationState(activeBet.skit === 'eat_mustache' ? 'shocked' : 'excited');
    speakLine(activeBet.payoffLine, personalityRef.current);
  }, [activeBet, triggerSkit, speakLine]);

  const handleNextBet = useCallback(() => {
    const next = pickRandomMatchBet(activeBet.id);
    setActiveBet(next);
    setCurrentText(next.betPrompt);
    setIsGestureOnly(false);
    setAnimationState('confident');
  }, [activeBet.id]);

  useEffect(() => {
    if (isThinking) {
      setAnimationState('thinking');
    } else if (animationState === 'thinking') {
      setAnimationState('idle');
    }
  }, [isThinking, animationState]);

  const getMoodPill = () => {
    if (isThinking) {
      return {
        text: 'CALCULATING',
        icon: '🧠',
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      };
    }
    if (animationState === 'celebrating' || animationState === 'victory') {
      return {
        text: 'HYPED',
        icon: '🎉',
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      };
    }
    if (animationState === 'facepalm' || animationState === 'disappointed') {
      return {
        text: 'UNAMUSED',
        icon: '🤦',
        color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      };
    }
    if (animationState === 'shocked') {
      return {
        text: 'SHOOK',
        icon: '⚡',
        color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      };
    }
    return {
      text: 'FOCUSED',
      icon: '👀',
      color: 'text-green-400 bg-green-500/10 border-green-500/30',
    };
  };

  const profile = CHARACTER_PROFILES[character] || CHARACTER_PROFILES.bruno;

  return {
    character,
    headwear,
    accessory,
    palette,
    characterName: profile.name,
    characterTitle: profile.title,
    personality,
    mood: getMoodPill(),
    animationState,
    currentText,
    isGestureOnly,
    isSpeaking,
    isVoiceMuted,
    toggleVoiceMuted: () => setIsVoiceMuted((prev) => !prev),
    activeBet,
    activeSkit,
    freeRoam,
    toggleFreeRoam: () => setFreeRoam((prev) => !prev),
    voiceSettings,
    voiceStatus,
    handleCompanionClick,
    handleInteractiveAction,
    handleVoiceSettingChange,
    handleSelectPersonality,
    handleRunDare,
    handleNextBet,
    handleTestVoice: () => {
      if (isVoiceMutedRef.current) setIsVoiceMuted(false);
      companionVoice.setMuted(false);
      companionVoice.unlockAudio(false);
      lastSpokenRef.current = Date.now();
      companionVoice.speak(
        `Hey! This is ${profile.name} checking in with my realistic voice! Let's crush this match!`,
        personalityRef.current,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        characterRef.current
      );
    },
    speakLine,
  };
}
