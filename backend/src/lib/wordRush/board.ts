import type { WordRushDifficulty } from "./config";
import {
  WORD_RUSH_BOARD_SIZE,
  WORD_RUSH_MAX_PLANTED_WORDS,
  WORD_RUSH_MAX_WORD_LENGTH,
  WORD_RUSH_MIN_PLANTED_WORDS,
  WORD_RUSH_MIN_WORD_LENGTH,
} from "./config";
import { getBoardWordPool } from "./words";

export interface WordRushBoard {
  letters: string[];
  size: number;
  words: string[];
}

const LETTERS = "abcdefghijklmnopqrstuvwxyz";

const DIRECTIONS: ReadonlyArray<{ dx: number; dy: number }> = [
  { dx: 0, dy: -1 },
  { dx: 1, dy: -1 },
  { dx: 1, dy: 0 },
  { dx: 1, dy: 1 },
  { dx: 0, dy: 1 },
  { dx: -1, dy: 1 },
  { dx: -1, dy: 0 },
  { dx: -1, dy: -1 },
];

const MAX_GENERATION_ATTEMPTS = 30;
const MAX_PLACEMENT_ATTEMPTS = 200;

type Grid = (string | null)[];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function inBounds(x: number, y: number, size: number): boolean {
  return x >= 0 && x < size && y >= 0 && y < size;
}

function tryPlace(grid: Grid, word: string, size: number): boolean {
  for (let attempt = 0; attempt < MAX_PLACEMENT_ATTEMPTS; attempt += 1) {
    const dir = DIRECTIONS[randomInt(0, DIRECTIONS.length - 1)];
    const startX = randomInt(0, size - 1);
    const startY = randomInt(0, size - 1);

    let fits = true;
    for (let i = 0; i < word.length; i += 1) {
      const x = startX + dir.dx * i;
      const y = startY + dir.dy * i;
      if (!inBounds(x, y, size) || (grid[y * size + x] !== null && grid[y * size + x] !== word[i])) {
        fits = false;
        break;
      }
    }
    if (!fits) {
      continue;
    }

    for (let i = 0; i < word.length; i += 1) {
      const x = startX + dir.dx * i;
      const y = startY + dir.dy * i;
      grid[y * size + x] = word[i];
    }
    return true;
  }
  return false;
}

function doesWordExistInGrid(grid: Grid, word: string, size: number): boolean {
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      for (const dir of DIRECTIONS) {
        let ok = true;
        for (let i = 0; i < word.length; i += 1) {
          const cx = x + dir.dx * i;
          const cy = y + dir.dy * i;
          if (!inBounds(cx, cy, size) || grid[cy * size + cx] !== word[i]) {
            ok = false;
            break;
          }
        }
        if (ok) {
          return true;
        }
      }
    }
  }
  return false;
}

export function isWordOnBoard(board: WordRushBoard, word: string): boolean {
  const size = board.size;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      for (const dir of DIRECTIONS) {
        let ok = true;
        for (let i = 0; i < word.length; i += 1) {
          const cx = x + dir.dx * i;
          const cy = y + dir.dy * i;
          if (!inBounds(cx, cy, size) || board.letters[cy * size + cx] !== word[i]) {
            ok = false;
            break;
          }
        }
        if (ok) {
          return true;
        }
      }
    }
  }
  return false;
}

function randomLetter(): string {
  return LETTERS[randomInt(0, LETTERS.length - 1)] ?? "a";
}

function emptyGrid(size: number): Grid {
  return Array<null>(size * size).fill(null);
}

export function generateRoundBoard(difficulty: WordRushDifficulty): WordRushBoard {
  const size = WORD_RUSH_BOARD_SIZE;
  const candidates = getBoardWordPool(difficulty).filter(
    (word) =>
      word.length >= WORD_RUSH_MIN_WORD_LENGTH && word.length <= WORD_RUSH_MAX_WORD_LENGTH,
  );
  const targetCount = randomInt(WORD_RUSH_MIN_PLANTED_WORDS, WORD_RUSH_MAX_PLANTED_WORDS);

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const grid = emptyGrid(size);
    const placed: string[] = [];

    for (const word of shuffle(candidates)) {
      if (placed.length >= targetCount) {
        break;
      }
      if (placed.includes(word)) {
        continue;
      }
      if (tryPlace(grid, word, size)) {
        placed.push(word);
      }
    }

    if (placed.length < WORD_RUSH_MIN_PLANTED_WORDS) {
      continue;
    }

    const letters = grid.map((cell) => cell ?? randomLetter());

    let allPresent = true;
    for (const word of placed) {
      if (!doesWordExistInGrid(letters, word, size)) {
        allPresent = false;
        break;
      }
    }
    if (!allPresent) {
      continue;
    }

    return { letters, size, words: placed };
  }

  throw new Error("Failed to generate a valid 5x5 Word Rush board.");
}