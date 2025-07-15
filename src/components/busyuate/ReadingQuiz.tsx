"use client";
import React, { useEffect, useState } from "react";
import { busyuData } from "../../../out/busyuData";
import { useRouter } from "next/navigation";

interface QuizQuestion {
  kanji: string;
  correctreading: string;
  choices: string[];
}

function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const generateQuiz = (numQuestions: number): QuizQuestion[] => {
  const allQuestions: QuizQuestion[] = [];
  const allreadings = busyuData.map((d) => d.reading);
  const usedKanjis = new Set<string>();

  while (allQuestions.length < numQuestions) {
    const entry = busyuData[Math.floor(Math.random() * busyuData.length)];
    const reading = entry.reading;
    const kanjiObj = entry.kanji[Math.floor(Math.random() * entry.kanji.length)];

    if (!kanjiObj || usedKanjis.has(kanjiObj.char)) continue;
    usedKanjis.add(kanjiObj.char);

    const wrongChoices = shuffle(allreadings.filter((r) => r !== reading)).slice(
      0,
      3
    );
    const allChoices = shuffle([reading, ...wrongChoices]);

    allQuestions.push({
      kanji: kanjiObj.char,
      correctreading: reading,
      choices: allChoices,
    });
  }

  return allQuestions;
};

interface HistoryItem {
  kanji: string;
  correct: string;
  choice: string;
  isCorrect: boolean;
}

export default function ReadingQuiz() {
  const router = useRouter();
  const totalQuestions = 10;

  const [quizData, setQuizData] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    setQuizData(generateQuiz(totalQuestions));
  }, []);

  const handleChoice = (choice: string) => {
    if (selected) return;
    setSelected(choice);
    const current = quizData[currentIndex];
    const correct = current.correctreading;
    const correctFlag = choice === correct;

    setHistory((h) => [
      ...h,
      { kanji: current.kanji, correct, choice, isCorrect: correctFlag },
    ]);

    if (correctFlag) {
      setScore((s) => s + 1);
    }
    setTimeout(() => {
      if (currentIndex + 1 >= totalQuestions) {
        setIsFinished(true);
      } else {
        setCurrentIndex((i) => i + 1);
        setSelected(null);
      }
    }, 1000);
  };

  const resetQuiz = () => {
    setQuizData(generateQuiz(totalQuestions));
    setCurrentIndex(0);
    setScore(0);
    setSelected(null);
    setHistory([]);
    setIsFinished(false);
  };

  if (!quizData.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-xl font-medium text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl font-bold text-gray-800">クイズ終了！</h2>
          <p className="mb-6 text-lg text-gray-600">
            正解数 {score} / {totalQuestions}
          </p>
          <button
            onClick={resetQuiz}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            もう一度プレイ
          </button>
        </div>

        {/* history */}
        <HistoryList history={history} />
      </div>
    );
  }

  const current = quizData[currentIndex];
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-100 p-4">
      {/* Back and header */}
      <div className="mb-4 flex w-full max-w-2xl items-center justify-between">
        <button
          onClick={() => router.back()}
          className="rounded-md bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300"
        >
          戻る
        </button>
        <div className="text-sm text-gray-600">
          問題 {currentIndex + 1} / {totalQuestions}・スコア {score}
        </div>
      </div>

      <div className="w-full max-w-2xl rounded-lg bg-white p-8 shadow">
        {/* progress bar */}
        <div className="mb-6 h-2 w-full rounded bg-gray-200">
          <div
            className="h-full rounded bg-green-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* question */}
        <div className="mb-8 text-center">
          <div className="mb-4 text-7xl font-bold text-gray-800">
            {current.kanji}
          </div>
          <p className="text-gray-600">この漢字の部首の読み方は？</p>
        </div>

        {/* choices */}
        <div className="grid grid-cols-2 gap-4">
          {current.choices.map((choice) => {
            const isCorrect = choice === current.correctreading;
            const isSelected = selected === choice;

            const base =
              "rounded-lg border px-4 py-3 text-lg font-medium transition";
            let styles = "bg-white text-gray-800 hover:bg-gray-100";

            if (selected) {
              if (isSelected) {
                styles = isCorrect
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white";
              } else {
                styles = "bg-gray-100 text-gray-400";
              }
            }

            return (
              <button
                key={choice}
                onClick={() => handleChoice(choice)}
                className={`${base} ${styles}`}
                disabled={!!selected}
              >
                {choice}
              </button>
            );
          })}
        </div>
      </div>

      {/* history */}
      <HistoryList history={history} className="mt-8 w-full max-w-2xl" />
    </div>
  );
}

function HistoryList({
  history,
  className = "",
}: {
  history: HistoryItem[];
  className?: string;
}) {
  if (!history.length) return null;
  return (
    <ul className={`space-y-2 ${className}`}>
      {history.map((item, idx) => (
        <li
          key={idx}
          className="flex items-center justify-between rounded bg-white px-4 py-2 shadow"
        >
          <span className="text-2xl font-bold text-gray-800">
            <span className="text-xl">No {idx + 1} : </span>
             {item.kanji}</span>
          <div className="flex flex-col text-right">
            <span
              className={`text-sm ${
                item.isCorrect ? "text-green-600" : "text-red-600"
              }`}
            >
              {item.isCorrect ? "正解" : "不正解"}
            </span>
            <span className="text-xs text-gray-500">
              あなたの回答: {item.choice}
            </span>
            {!item.isCorrect && (
              <span className="text-xs text-gray-500">
                正しい答え: {item.correct}
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
