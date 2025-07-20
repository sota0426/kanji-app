// -----------------------
// src/components/GameEndScreen.tsx
// -----------------------
"use client";
import React from "react";
import AllKanjiList from "./AllKanjiList";
import { Kanji } from "@/types/kanji";
import Confetti from "react-confetti";
import {  useWindowSize } from "@react-hook/window-size";


interface GameEndScreenProps {
  score: number;
  currentRadical: string;
  foundKanji: Kanji[];
  allKanji: Kanji[];
  isGameClear:boolean;
  onReplay: () => void;
  onReturn: () => void;
}

export default function GameEndScreen({
  score,
  currentRadical,
  foundKanji,
  allKanji,
  isGameClear,
  onReplay,
  onReturn,
}: GameEndScreenProps) {
  const [width , height] = useWindowSize();
  
  /** ---------------------- メッセージ ---------------------- */
  const message = (score:number) => {
    if (score >= 20) return "漢字マスター！";
    if (score >= 15) return "素晴らしい！";
    if (score >= 10) return "よくできました！";
    if (score >= 5) return "がんばりました！";
    return "また挑戦してね！";
  };

  const isAnimation = (isGameClear || score >= 15 )


  return (
    <div className="text-center bg-white rounded-lg shadow-lg p-8">
      {/* 🎉 紙吹雪アニメーション */}
      {isAnimation && (
        <Confetti width={width} height={height} numberOfPieces={1000} recycle={false} />
      )}

      <h2 className="text-3xl font-bold mb-4">ゲーム終了！</h2>
      <div className="text-6xl font-bold text-blue-600 mb-4">{score}点</div>
      <p className="text-2xl text-gray-700 mb-2">{message(score)}</p>
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