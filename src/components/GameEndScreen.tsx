// -----------------------
// src/components/GameEndScreen.tsx
// -----------------------
"use client";
import React from "react";
import AllKanjiList from "./AllKanjiList";
import { Kanji } from "@/types/kanji";

interface GameEndScreenProps {
  score: number;
  message: string;
  currentRadical: string;
  foundKanji: Kanji[];
  allKanji: Kanji[];
  onReplay: () => void;
  onReturn: () => void;
}

export default function GameEndScreen({
  score,
  message,
  currentRadical,
  foundKanji,
  allKanji,
  onReplay,
  onReturn,
}: GameEndScreenProps) {
  return (
    <div className="text-center bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-3xl font-bold mb-4">ゲーム終了！</h2>
      <div className="text-6xl font-bold text-blue-600 mb-4">{score}点</div>
      <p className="text-2xl text-gray-700 mb-2">{message}</p>
      <p className="text-lg text-gray-600 mb-6">
        部首「{currentRadical}」で {foundKanji.length} / {allKanji.length} 個の漢字を発見しました！
      </p>

      <AllKanjiList allKanji={allKanji} foundKanji={foundKanji} />

      <div className="space-x-4">
        <button
          onClick={onReplay}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-xl transition-colors"
        >
          もう一度プレイ
        </button>
        <button
          onClick={onReturn}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg text-xl transition-colors"
        >
          部首選択へ戻る
        </button>
      </div>
    </div>
  );
}