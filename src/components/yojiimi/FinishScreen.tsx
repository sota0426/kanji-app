"use client";

import React from "react";
import { Button } from "../ui/button";

interface FinishScreenProps {
  score: number;
  total: number;
  onRetry: () => void;
  onReturnTop: () => void;
};

export const FinishScreen: React.FC<FinishScreenProps> = ({
  score,
  total,
  onRetry,
  onReturnTop,
}) => {
  const percentage = Math.round((score / total) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 flex flex-col items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-indigo-700 mb-4">クイズ終了！</h1>
        <p className="text-xl font-semibold text-gray-800 mb-6">
          あなたのスコア：<span className="text-indigo-600">{score} / {total}</span><br />
          正答率：<span className="text-indigo-600">{percentage}%</span>
        </p>

        {/* メッセージ */}
        <div className="mb-6 text-sm text-gray-600">
          {percentage === 100 && "完璧です！素晴らしい！🎉"}
          {percentage >= 80 && percentage < 100 && "とてもよくできました！👏"}
          {percentage >= 50 && percentage < 80 && "あと少し！頑張りました👍"}
          {percentage < 50 && "また挑戦してみましょう！💪"}
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col space-y-3">
          <Button
            onClick={onRetry}
            className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg px-6 py-2"
          >
            もう一度挑戦する
          </Button>
          <Button
            variant="outline"
            onClick={onReturnTop}
            className="hover:border-indigo-400 hover:text-indigo-600"
          >
            トップに戻る
          </Button>
        </div>
      </div>
    </div>
  );
};
