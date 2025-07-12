export interface Kanji {
  char: string;
  readings: string[];
  meaning: string;
  grade: number; // 1–6 for elementary school grades, 7+ otherwise
}