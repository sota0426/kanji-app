"use client";

import React, { useState, useEffect } from "react";
import { yojiData, yojiDataProps } from "../../../public/yojiData";
import { Button } from "../ui/button";

interface YojiProps {
 level: number; 
 onFinish: (score:number) => void; 
 onQuit: () => void
}

const getRandomQuizSet = (level: number): yojiDataProps[] => {
  const filtered = yojiData.filter((item) => item.kanken === level);
  const shuffled = [...filtered].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 10); // 10問
};

const getRandomChoices = (correct: yojiDataProps, allData: yojiDataProps[]) => {
  const shuffled = allData
    .filter((item) => item.radical !== correct.radical)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);
  return [...shuffled, correct].sort(() => 0.5 - Math.random());
};

export const YojiQuiz = ({ 
  level, 
  onFinish, 
  onQuit 
}:YojiProps) => {
  const [quizSet, setQuizSet] = useState<yojiDataProps[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [choices, setChoices] = useState<yojiDataProps[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [history, setHistory] = useState<
    { 
      question: yojiDataProps;
      selected: string | null;
      correct: boolean;
    }[]
  >([]);

  // 初回レンダリング時にquizSetを作成
  useEffect(() => {
    const newQuizSet = getRandomQuizSet(level);
    setQuizSet(newQuizSet);
    setCurrentIndex(0);
    setScore(0);
  }, [level]);

  const current = quizSet[currentIndex];
  const progress = quizSet.length > 0 ? ((currentIndex + 1) / quizSet.length) * 100 : 0;

  useEffect(() => {
    if (!current) return;
    setChoices(getRandomChoices(current, yojiData));
    setSelected(null);
    setShowAnswer(false);
    setShowCelebration(false);
  }, [current]);

  const handleChoice = (radical: string) => {
    if (selected) return;
    setSelected(radical);
    setShowAnswer(true);
    
    if (radical === current.radical) {
      setScore((prev) => prev + 1);
      setShowCelebration(true);
      // 正解時の効果音やアニメーション用のタイマー
      setTimeout(() => setShowCelebration(false), 2000);
    }
  };

const handleNextQuiz = () => {
  setHistory((prev) => [
    ...prev,
    {
      question: current,
      selected,
      correct: selected === current.radical,
    },
  ]);

  if (currentIndex + 1 === quizSet.length) {
    onFinish(score);
  } else {
    setCurrentIndex((prev) => prev + 1);
  }
};


  if (!current) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-center">問題を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      {/* 正解時のお祝い表示 */}
      {showCelebration && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-green-500 text-white px-6 py-3 rounded-2xl shadow-2xl transform animate-bounce">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🎉</span>
              <span className="text-lg font-bold">正解！</span>
              <span className="text-xl">🎉</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6 py-4">
        {/* ヘッダー部分 - コンパクト */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-xl font-bold text-gray-800">四字熟語クイズ</h1>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                {score} / {quizSet.length}
              </span>
              <Button 
                onClick={onQuit}
                variant="outline"
                size="sm"
                className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all"
              >
                終了
              </Button>
            </div>
          </div>
          
          {/* プログレスバー */}
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600 min-w-0">{currentIndex + 1}/{quizSet.length}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* メインコンテンツ - 1画面に収める */}
        <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 flex flex-col min-h-0">
          {!showAnswer ? (
            // 問題表示モード
            <>
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-3">この意味の四字熟語は？</h2>
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border-l-4 border-indigo-500">
                  <p className="text-base text-gray-800 font-medium">{current.meaning}</p>
                </div>
              </div>
              
              {/* 選択肢 - 2列グリッド */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 content-center">
                {choices.map((item, index) => (
                  <button
                    key={item.radical}
                    onClick={() => handleChoice(item.radical)}
                    disabled={selected !== null}
                    className="group p-4 rounded-lg border-2 bg-white border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <div className="text-left">
                        <div className="text-lg font-semibold">{item.radical}</div>
                        <div className="text-sm text-gray-600">({item.reading})</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            // 解答表示モード
            <div className="flex-1 flex flex-col">
              {/* 結果表示 */}
              <div className={`text-center mb-4 ${selected === current.radical ? 'text-green-600' : 'text-red-600'}`}>
                <div className="text-3xl mb-2">
                  {selected === current.radical ? "🎉" : "❌"}
                </div>
                <p className="text-lg font-semibold">
                  {selected === current.radical 
                    ? "正解！素晴らしいです！" 
                    : `不正解 - 正解は「${current.radical}」`
                  }
                </p>
              </div>

              {/* 選択肢の結果表示 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {choices.map((item, index) => (
                  <div
                    key={item.radical}
                    className={`p-4 rounded-lg border-2 ${
                      item.radical === current.radical
                        ? "bg-gradient-to-r from-green-400 to-green-500 border-green-500 text-white"
                        : item.radical === selected
                        ? "bg-gradient-to-r from-red-400 to-red-500 border-red-500 text-white"
                        : "bg-gray-100 border-gray-200 text-gray-500"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                          item.radical === current.radical
                            ? "bg-white text-green-500"
                            : item.radical === selected
                            ? "bg-white text-red-500"
                            : "bg-gray-300 text-gray-600"
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <div className="text-left">
                          <div className="font-semibold">{item.radical}</div>
                          <div className="text-sm opacity-80">({item.reading})</div>
                        </div>
                      </div>
                      <div className="text-xl">
                        {item.radical === current.radical ? "✓" : item.radical === selected ? "✗" : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* 補足情報 - コンパクト */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 mb-6 text-sm">
                <div className="grid grid-cols-1 gap-2">
                  <span className="text-xl font-semibold text-indigo-600">意味</span> 
                  <div>{current.meaning}</div>                 
                   <span className="text-xl font-semibold mt-3 text-indigo-600">補足</span> 
                  <div>{current.note}</div>
                  <span className="text-xl font-semibold text- text-indigo-600 mt-3">類義語 </span> 
                  <div>{current.synonym}</div>
                </div>
              </div>

              {/* 次へボタン */}
              <div className="flex justify-center">
                <Button
                  onClick={handleNextQuiz}
                  size="lg"
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg transform transition-all hover:scale-105"
                >
                  {currentIndex + 1 === quizSet.length ? "結果を見る" : "次の問題へ"}
                  <span className="ml-2">→</span>
                </Button>
              </div>


            </div>
          )}
        </div>
      </div>
      {/* 回答履歴 */}
      {history.length > 0 && (
        <div className="mt-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">回答履歴</h3>
          <ul className="space-y-2 pr-2">
            {history.map((entry, idx) => (
              <li
                key={`${entry.question.radical}-${idx}`}
                className={`flex justify-between items-center p-3 rounded-lg border
                  ${entry.correct ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
              >
                <div>
                  <p className="font-bold text-gray-700">
                    Q{idx + 1}. {entry.question.meaning}
                  </p>
                  <p className="text-sm text-gray-500">
                    選択: {entry.selected ?? "未選択"} ／ 正解: {entry.question.radical}
                  </p>
                </div>
                <div className="text-xl">
                  {entry.correct ? "✔️" : "❌"}
                </div>
              </li>
            ))}
          </ul>
        </div>
)}

    </div>
  );
};