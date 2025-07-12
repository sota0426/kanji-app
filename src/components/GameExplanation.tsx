// -----------------------
// src/components/GameExplanation.tsx
// -----------------------
"use client";
import React from "react";

interface GameExplanationProps {
  onStart: () => void;
}

export default function GameExplanation({ onStart }: GameExplanationProps) {
  return (
    <div className="text-center bg-white rounded-lg shadow-lg p-8 mb-6">
      <h2 className="text-2xl font-bold mb-4">ゲームの説明</h2>
      <ul className="text-left max-w-md mx-auto space-y-2 mb-6 list-disc list-inside">
        <li>ひらがなで読み方を入力</li>
        <li>制限時間は 60 秒</li>
        <li>同じ漢字は 1 度だけカウント</li>
        <li>高学年の漢字は高得点</li>
      </ul>
      <button
        onClick={onStart}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-xl transition-colors"
      >
        ゲームスタート！
      </button>
    </div>
  );
}
