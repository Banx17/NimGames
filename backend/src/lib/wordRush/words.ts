import type { WordRushDifficulty } from "./config";

const WORD_POOLS: Record<WordRushDifficulty, string[]> = {
  easy: [
    "cat",
    "dog",
    "sun",
    "tree",
    "book",
    "water",
    "apple",
    "house",
    "river",
    "cloud",
    "smile",
    "light",
    "music",
    "dream",
    "friend",
  ],
  medium: [
    "mountain",
    "whisper",
    "journey",
    "breeze",
    "shadow",
    "crystal",
    "melody",
    "picnic",
    "village",
    "gadget",
    "sunset",
    "castle",
    "puzzle",
    "lantern",
    "ocean",
  ],
  hard: [
    "ephemeral",
    "serendipity",
    "quixotic",
    "mellifluous",
    "petrichor",
    "resplendent",
    "ineffable",
    "labyrinth",
    "halcyon",
    "cacophony",
    "bucolic",
    "eloquent",
    "gregarious",
    "defenestrate",
    "pandemonium",
  ],
};

export function getWordPool(difficulty: WordRushDifficulty): string[] {
  return [...WORD_POOLS[difficulty]];
}

export function buildRoundWords(
  difficulty: WordRushDifficulty,
  roundNumber: number,
  wordsPerRound: number,
): string[] {
  const pool = getWordPool(difficulty);
  const startIndex = (roundNumber - 1) * wordsPerRound;
  return Array.from(
    { length: wordsPerRound },
    (_, i) => pool[(startIndex + i) % pool.length],
  );
}