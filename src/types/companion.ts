export type Personality = 'supportive' | 'roaster' | 'competitive' | 'coach' | 'chaotic';
export type ReactionFrequency = 'frequent' | 'balanced' | 'minimal' | 'silent';
export type AnimationState =
  | 'idle'
  | 'thinking'
  | 'happy'
  | 'excited'
  | 'shocked'
  | 'sad'
  | 'disappointed'
  | 'facepalm'
  | 'nervous'
  | 'confident'
  | 'celebrating'
  | 'victory'
  | 'defeat';

export interface CompanionSettings {
  characterId: string;
  personality: Personality;
  outfitId: string;
  accessoryIds: string[];
  themeId: string;
  reactionFrequency: ReactionFrequency;
  animationIntensity: number;
  voiceEnabled: boolean;
}

export interface ChessReactionEvent {
  type: string;
  move: string;
  fen: string;
  evaluationBefore?: number;
  evaluationAfter?: number;
  classification?: string;
  priority: 'low' | 'medium' | 'high';
}
