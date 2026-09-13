export const WORD_RUSH_DIFFICULTIES = ["easy", "medium", "hard"] as const;

export type WordRushDifficulty = (typeof WORD_RUSH_DIFFICULTIES)[number];

export const DEFAULT_WORD_RUSH_DIFFICULTY: WordRushDifficulty = "easy";

export function isWordRushDifficulty(value: unknown): value is WordRushDifficulty {
  return (
    typeof value === "string" &&
    (WORD_RUSH_DIFFICULTIES as readonly string[]).includes(value)
  );
}

export interface WordRushScoringConfig {
  pointsPerCorrect: number;
  wrongAnswerPenalty: number;
}

export interface WordRushConfig {
  difficulty: WordRushDifficulty;
  roundDurationSeconds: number;
  numberOfRounds: number;
  wordsPerRound: number;
  countdownSeconds: number;
  scoring: WordRushScoringConfig;
}

const WORD_RUSH_CONFIGS: Record<WordRushDifficulty, Omit<WordRushConfig, "difficulty">> = {
  easy: {
    roundDurationSeconds: 20,
    numberOfRounds: 3,
    wordsPerRound: 5,
    countdownSeconds: 3,
    scoring: { pointsPerCorrect: 10, wrongAnswerPenalty: 0 },
  },
  medium: {
    roundDurationSeconds: 15,
    numberOfRounds: 4,
    wordsPerRound: 5,
    countdownSeconds: 3,
    scoring: { pointsPerCorrect: 15, wrongAnswerPenalty: 0 },
  },
  hard: {
    roundDurationSeconds: 12,
    numberOfRounds: 5,
    wordsPerRound: 5,
    countdownSeconds: 3,
    scoring: { pointsPerCorrect: 20, wrongAnswerPenalty: 0 },
  },
};

export function getWordRushConfig(difficulty: WordRushDifficulty): WordRushConfig {
  return structuredClone({
    difficulty,
    ...WORD_RUSH_CONFIGS[difficulty],
  });
}