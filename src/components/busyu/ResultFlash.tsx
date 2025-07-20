"use client";
import React from "react";
import { Star } from "lucide-react";
import { Kanji } from "@/types/kanji";
import { kankenToGrade } from "../kankenToGrade";

interface ResultFlashProps {
  visible: boolean;
  kanji: Kanji | null;
  isCorrect: boolean; // ←追加
}

export default function ResultFlash({ visible, kanji,  isCorrect }: ResultFlashProps) {
  if (!visible) return null;

  if (!isCorrect) {
    // 間違い表示
    return (
      <div
        className="
          fixed top-1/2 left-1/2
          transform -translate-x-1/2 -translate-y-1/2
          bg-red-100 border-2 border-red-400 rounded-lg
          p-6 max-w-xs w-full
          text-center
          shadow-lg
          z-50
          animate-pulse
        "
        role="alert"
        aria-live="assertive"
      >
        <p className="text-red-700 font-bold text-xl">不正解！</p>
      </div>
    );
  }

  // 正解表示
  if (!kanji) return null;

  return (
    <div
      className="
        fixed top-1/2 left-1/2
        transform -translate-x-1/2 -translate-y-1/2
        bg-green-100 border-2 border-green-300 rounded-lg
        p-6 max-w-xs w-full
        text-center
        shadow-lg
        z-50
      "
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center justify-center">
        <Star className="text-yellow-500" size={20} />
        <span className="font-bold text-green-700 text-xl">正解！</span>
        <span className="font-bold text-green-700 text-xl">+10秒</span>
        <Star className="text-yellow-500" size={20} />
      </div>
      <div className="text-5xl font-bold text-green-800 mb-4">{kanji.char}</div>
      <p className="text-green-700 font-semibold mb-1">読み: {kanji.readings.join("、")}</p>
     <p className="text-green-600 text-lg">{kankenToGrade(kanji.kanken)}</p>
    </div>
  );
}
