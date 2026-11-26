import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import DifficultySelector from './DifficultySelector';
import TimeControlSelector from './TimeControlSelector';
import SideSelector, { SideChoice } from './SideSelector';
import type { Difficulty, TimeControl, PlayerColor } from '../../types/chess';
import { TIME_CONTROLS } from '../../types/chess';

export interface NewGameConfig {
  difficulty: Difficulty;
  timeControl: TimeControl;
  playerColor: PlayerColor;
}

interface NewGameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (config: NewGameConfig) => void;
  initialDifficulty?: Difficulty;
  initialTimeControl?: TimeControl;
  initialPlayerColor?: PlayerColor;
}

export default function NewGameDialog({
  isOpen,
  onClose,
  onStartGame,
  initialDifficulty = 'intermediate',
  initialTimeControl = TIME_CONTROLS[6], // 10+0 Rapid
  initialPlayerColor = 'w',
}: NewGameDialogProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);
  const [timeControl, setTimeControl] = useState<TimeControl>(initialTimeControl);
  const [sideChoice, setSideChoice] = useState<SideChoice>(initialPlayerColor);

  // Sync latest active game settings whenever dialog opens
  useEffect(() => {
    if (isOpen) {
      setDifficulty(initialDifficulty);
      setTimeControl(initialTimeControl);
      setSideChoice(initialPlayerColor);
    }
  }, [isOpen, initialDifficulty, initialTimeControl, initialPlayerColor]);

  const handleStart = () => {
    let resolvedColor: PlayerColor = 'w';
    if (sideChoice === 'random') {
      resolvedColor = Math.random() < 0.5 ? 'w' : 'b';
    } else {
      resolvedColor = sideChoice;
    }

    onStartGame({
      difficulty,
      timeControl,
      playerColor: resolvedColor,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New Game Setup"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleStart} autoFocus>
            Start Game
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <SideSelector selected={sideChoice} onSelect={setSideChoice} />
        <DifficultySelector selected={difficulty} onSelect={setDifficulty} />
        <TimeControlSelector selected={timeControl} onSelect={setTimeControl} />
      </div>
    </Modal>
  );
}
