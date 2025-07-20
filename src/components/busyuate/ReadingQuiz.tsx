"use client";

import { EnrichedBusyuEntry, HistoryItem, QuizQuestion, ReadingQuizProps } from "@/types/kanji";
import React, { useEffect, useState } from "react";
import { HistoryList } from "./History";


function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const generateQuiz = (
  sourceData: EnrichedBusyuEntry[],
  numQuestions: number
): QuizQuestion[] => {
  const allQuestions: QuizQuestion[] = [];
  const allreadings = sourceData.map((d) => d.reading);
  const usedKanjis = new Set<string>();

  while (allQuestions.length < numQuestions) {
    const entry = sourceData[Math.floor(Math.random() * sourceData.length)];
    const reading = entry.reading;
    const kanjiObj = entry.kanji[Math.floor(Math.random() * entry.kanji.length)];

    if (!kanjiObj || usedKanjis.has(kanjiObj.char + reading)) continue;
    usedKanjis.add(kanjiObj.char + reading);

    const wrongChoices = shuffle(allreadings.filter((r) => r !== reading)).slice(0, 3);
    const allChoices = shuffle([reading, ...wrongChoices]);

    allQuestions.push({
      kanji: kanjiObj.char,
      reading:kanjiObj.readings,
      correctreading: reading,
      choices: allChoices,
    });
  }

  return allQuestions;
};

export default function ReadingQuiz({ 
  filteredData, 
  onBack 
}: ReadingQuizProps) {

  const totalQuestions = 10;
  const [quizData, setQuizData] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    setQuizData(generateQuiz(filteredData, totalQuestions));
  }, [filteredData]);

  const current = quizData[currentIndex];
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

const handleChoice = (choice: string) => {
  if (selected) return;
  setSelected(choice);
  setShowAnswer(true);

  const correct = current.correctreading;
  const isCorrect = choice === correct;

  setHistory((prev) => [
    ...prev,
    { kanji: current.kanji, correct, choice, isCorrect }
  ]);

  if (isCorrect) setScore((s) => s + 1);

  // ⏱️ 3秒後に次の問題へ
  setTimeout(() => {
    if (currentIndex + 1 >= totalQuestions) {
      setIsFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setShowAnswer(false);
    }
  }, 1500); // ← ここが3秒
};

  const resetQuiz = () => {
    setQuizData(generateQuiz(filteredData, totalQuestions));
    setCurrentIndex(0);
    setScore(0);
    setSelected(null);
    setShowAnswer(false);
    setHistory([]);
    setIsFinished(false);
  };

  if (!quizData.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-blue-50">
        <p className="text-xl text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-xl text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">クイズ終了！</h2>
          <p className="text-lg text-gray-600 mb-6">正解数: {score} / {totalQuestions}</p>
          <div className="flex gap-4 justify-center mb-6">
            <button onClick={resetQuiz} className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-6 rounded-xl">
              もう一度
            </button>
            <button onClick={onBack} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-xl">
              戻る
            </button>
          </div>
          <HistoryList history={history} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm shadow-md rounded-xl p-4 mb-6 flex justify-between items-center">
          <button onClick={onBack} className="text-sm text-gray-600 hover:underline">← 戻る</button>
          <div className="text-sm text-gray-700">{currentIndex + 1} / {totalQuestions}・スコア {score}</div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full mb-4">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" style={{ width: `${progress}%` }} />
        </div>

        {/* Quiz Box */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-gray-800 mb-2">{current.kanji}</div>
                <div className="font-bold text-gray-800 mb-2">
                  ({current.reading[0]},{current.reading[1]})
                </div>
                <p className="text-gray-600 text-lg">この漢字の部首の読み方は？</p>
              </div>
          {!showAnswer ? (              
            <>
              <div className="grid grid-cols-2 gap-4">
                {current.choices.map((choice, idx) => (
                  <button
                    key={`${choice} - ${idx}`}
                    onClick={() => handleChoice(choice)}
                    disabled={!!selected}
                    className="p-4 bg-white border-2 border-indigo-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-400 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full font-bold">
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <div className="text-lg font-medium">{choice}</div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div>
              {/* Answer Display */}
              <div className="text-center mb-6">
                <div className={`text-3xl font-bold mb-2 ${selected === current.correctreading ? "text-green-600" : "text-red-600"}`}>
                  {selected === current.correctreading ? "🎉 正解！" : "❌ 不正解"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {current.choices.map((choice, idx) => {
                  const isCorrect = choice === current.correctreading;
                  const isSelected = selected === choice;

                  let bg = "bg-gray-100 text-gray-600 border border-gray-300";
                  if (isCorrect) {
                    bg = "bg-green-500 text-white border-green-600";
                  } else if (isSelected) {
                    bg = "bg-red-500 text-white border-red-600";
                  }

                  return (
                    <div
                      key={choice}
                      className={`p-4 rounded-lg ${bg} flex items-center justify-between`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-sm font-bold text-gray-800">
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <div className="font-medium">{choice}</div>
                      </div>
                      {isCorrect ? "✓" : isSelected ? "✗" : ""}
                    </div>
                  );
                })}
              </div>

            </div>
          )}
        </div>

        {/* Answer History */}
        <HistoryList history={history} className="mt-8" />
      </div>
    </div>
  );
}