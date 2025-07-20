export interface Kanji {
  char: string;
  readings: string[];
  meaning: string;
  kanken:number;
}

export interface HistoryItem {
  kanji: string;
  correct: string;
  choice: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  reading:string[];
  kanji: string;
  correctreading: string;
  choices: string[];
}



export interface EnrichedBusyuEntry {
  radical: string;
  reading: string;
  kanji: Kanji[];
}

export interface ReadingQuizProps {
  filteredData: EnrichedBusyuEntry[];
  onBack: () => void;
}


export interface QuizQuestion {
  kanji: string;
  correctreading: string;
  choices: string[];
}


export interface EnrichedBusyuEntry {
  radical: string;
  reading: string;
  kanji: Kanji[];
}

export interface ReadingQuizProps {
  filteredData: EnrichedBusyuEntry[];
  onBack: () => void;
}
