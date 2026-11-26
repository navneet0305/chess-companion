'use client';

import React from 'react';
import type { Personality } from '../../types/companion';
import type { DialogueContext } from '../../lib/companionDialogueEngine';
import {
  useCompanionController,
  type CompanionEventPayload,
} from '../../hooks/useCompanionController';
import CompanionFloatingPresence from './CompanionFloatingPresence';

export type { CompanionEventPayload };

interface CompanionContainerProps {
  status: string;
  isThinking: boolean;
  latestEvent?: CompanionEventPayload | null;
  liveContext?: DialogueContext;
  personality?: Personality;
  onPersonalityChange?: (personality: Personality) => void;
}

/**
 * Legacy wrapper delegating to useCompanionController + CompanionFloatingPresence.
 */
export default function CompanionContainer({
  status,
  isThinking,
  latestEvent = null,
  liveContext,
  personality = 'roaster',
  onPersonalityChange,
}: CompanionContainerProps) {
  const companion = useCompanionController({
    status,
    isThinking,
    latestEvent,
    liveContext,
    personality,
    onPersonalityChange,
  });

  return (
    <CompanionFloatingPresence
      animationState={companion.animationState}
      activeSkit={companion.activeSkit}
      freeRoam={companion.freeRoam}
      isSpeaking={companion.isSpeaking}
      isGestureOnly={companion.isGestureOnly}
      currentText={companion.currentText}
      character={companion.character}
      characterName={companion.characterName}
      headwear={companion.headwear}
      accessory={companion.accessory}
      palette={companion.palette}
      onCompanionClick={companion.handleCompanionClick}
    />
  );
}
