
// -----------------------
// src/components/ResultFlash.tsx
// -----------------------
"use client";
import React from "react";
import { Star } from "lucide-react";
import { Kanji } from "@/types/kanji";

interface ResultFlashProps {
  visible: boolean;
  kanji: Kanji | null;
  calcPoint: (grade: number) => number;
}

export default function ResultFlash({ visible, kanji, calcPoint }: ResultFlashProps) {
  if (!visible || !kanji) return null;

  return (
    <div className="text-center bg-green-100 rounded-lg p-6 mb-6 border-2 border-green-300">
      <div className="flex items-center justify-center space-x-2 mb-2">
        <Star className="text-yellow-500" size={24} />
        <span className="text-2xl font-bold text-green-700">正解！</span>
        <Star className="text-yellow-500" size={24} />
      </div>
      <div className="text-6xl font-bold text-green-800 mb-2">{kanji.char}</div>
      <p className="text-green-700 font-semibold">読み: {kanji.readings.join("、")}</p>
      <p className="text-green-600">+{calcPoint(kanji.grade)}点</p>
    </div>
  );
}
