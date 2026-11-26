import { useState, useCallback, useRef, useEffect } from 'react';
import type { Difficulty, EvaluationData } from '../types/chess';
import { DIFFICULTY_CONFIG } from '../types/chess';

interface UseStockfishReturn {
  isReady: boolean;
  isThinking: boolean;
  currentEval: EvaluationData;
  getBestMove: (fen: string, depth?: number, moveTime?: number) => Promise<string | null>;
  evaluatePosition: (fen: string, depth?: number) => Promise<EvaluationData>;
  setDifficulty: (difficulty: Difficulty) => void;
  initialize: () => Promise<void>;
  terminate: () => void;
}

export function useStockfish(): UseStockfishReturn {
  const workerRef = useRef<Worker | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [currentEval, setCurrentEval] = useState<EvaluationData>({ score: 0, mate: null });
  const messageResolverRef = useRef<((value: string) => void) | null>(null);
  const evalResolverRef = useRef<((value: EvaluationData) => void) | null>(null);

  const sendCommand = useCallback((command: string) => {
    workerRef.current?.postMessage(command);
  }, []);

  const waitForMessage = useCallback(
    (match: string): Promise<string> => {
      return new Promise((resolve) => {
        const handler = (e: MessageEvent) => {
          const line: string = typeof e.data === 'string' ? e.data : String(e.data);
          if (line.includes(match)) {
            workerRef.current?.removeEventListener('message', handler);
            resolve(line);
          }
        };
        workerRef.current?.addEventListener('message', handler);
      });
    },
    [],
  );

  const initialize = useCallback(async () => {
    try {
      const worker = new Worker(new URL('../workers/stockfishWorker.ts', import.meta.url), {
        type: 'module',
      });
      workerRef.current = worker;

      worker.addEventListener('message', (e: MessageEvent) => {
        const line: string = typeof e.data === 'string' ? e.data : String(e.data);

        // Handle bestmove
        if (line.startsWith('bestmove') && messageResolverRef.current) {
          messageResolverRef.current(line);
          messageResolverRef.current = null;
        }

        // Handle evaluation results: evalresult score <score> mate <mate> bestmove <move>
        if (line.startsWith('evalresult')) {
          const parts = line.split(' ');
          const score = parseInt(parts[2], 10) || 0;
          const mateStr = parts[4];
          const mate = mateStr === 'none' ? null : parseInt(mateStr, 10);
          const bestMove = parts[6] === 'none' ? null : parts[6];

          const evalData: EvaluationData = { score, mate, bestMove };
          setCurrentEval(evalData);

          if (evalResolverRef.current) {
            evalResolverRef.current(evalData);
            evalResolverRef.current = null;
          }
        }

        // Handle UCI info score cp
        if (line.startsWith('info') && line.includes('score cp')) {
          const parts = line.split(' ');
          const cpIdx = parts.indexOf('cp');
          if (cpIdx !== -1 && parts[cpIdx + 1]) {
            const score = parseInt(parts[cpIdx + 1], 10) || 0;
            setCurrentEval((prev) => ({ ...prev, score }));
          }
        }
      });

      // Send UCI init
      sendCommand('uci');
      await waitForMessage('uciok');

      sendCommand('isready');
      await waitForMessage('readyok');

      setIsReady(true);
    } catch (error) {
      console.error('Failed to initialize Stockfish:', error);
      console.warn(
        'Stockfish WASM is not available. Please ensure /stockfish/stockfish.js is accessible.',
      );
    }
  }, [sendCommand, waitForMessage]);

  const setDifficulty = useCallback(
    (difficulty: Difficulty) => {
      if (!isReady) return;
      const config = DIFFICULTY_CONFIG[difficulty];
      sendCommand(`setoption name Skill Level value ${config.skill}`);
    },
    [isReady, sendCommand],
  );

  const evaluatePosition = useCallback(
    async (fen: string, _depth: number = 2): Promise<EvaluationData> => {
      if (!isReady || !workerRef.current) {
        return { score: 0, mate: null };
      }

      try {
        sendCommand(`eval ${fen}`);
        const result = await new Promise<EvaluationData>((resolve) => {
          evalResolverRef.current = resolve;
          // Fallback timeout after 1.5 seconds if worker gets interrupted
          setTimeout(() => {
            if (evalResolverRef.current === resolve) {
              evalResolverRef.current = null;
              resolve({ score: 0, mate: null });
            }
          }, 1500);
        });
        return result;
      } catch {
        return { score: 0, mate: null };
      }
    },
    [isReady, sendCommand],
  );

  const getBestMove = useCallback(
    async (fen: string, depth?: number, moveTime?: number): Promise<string | null> => {
      if (!isReady || !workerRef.current) return null;

      setIsThinking(true);

      try {
        sendCommand(`position fen ${fen}`);

        let goCommand = 'go';
        if (depth !== undefined) goCommand += ` depth ${depth}`;
        if (moveTime !== undefined) goCommand += ` movetime ${moveTime}`;
        sendCommand(goCommand);

        const watchdogMs = Math.max(5000, (moveTime || 2000) + 2000);
        const result = await new Promise<string>((resolve) => {
          messageResolverRef.current = resolve;
          // Dynamic safety watchdog: guarantees game engine never hangs
          setTimeout(() => {
            if (messageResolverRef.current === resolve) {
              messageResolverRef.current = null;
              resolve('bestmove (none)');
            }
          }, watchdogMs);
        });

        // Parse "bestmove e2e4" => "e2e4"
        const parts = result.split(' ');
        const bestMove = parts[1];
        return bestMove && bestMove !== '(none)' ? bestMove : null;
      } finally {
        setIsThinking(false);
      }
    },
    [isReady, sendCommand],
  );

  const stop = useCallback(() => {
    sendCommand('stop');
  }, [sendCommand]);

  const terminate = useCallback(() => {
    stop();
    workerRef.current?.terminate();
    workerRef.current = null;
    setIsReady(false);
    setIsThinking(false);
  }, [stop]);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  return {
    isReady,
    isThinking,
    currentEval,
    getBestMove,
    evaluatePosition,
    setDifficulty,
    initialize,
    terminate,
  };
}
