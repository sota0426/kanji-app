// -----------------------
// src/components/InfoBar.tsx
// -----------------------
"use client";
import React from "react";
import { Clock, Trophy, RefreshCw } from "lucide-react";

interface InfoBarProps {
  timeLeft: number;
  isTimeUnlimited: boolean;
  onToggleTimeMode: () => void;
  score: number;
  onReset: () => void;
}


export default function InfoBar({ 
  timeLeft,
  isTimeUnlimited ,
  score,
  onReset,
  onToggleTimeMode
}: InfoBarProps) {
  return (
    <div className="flex justify-between items-center flex-wrap sm:flex-nowrap gap-4">
      {/* 左側：時計とタイマー切替ボタン */}
      <div className="flex items-center space-x-2 min-w-[140px] whitespace-nowrap">
        <Clock className="text-red-500" size={24} />
        <span className="md:text-2xl font-bold text-red-500">{timeLeft}秒</span>
        <button
          onClick={onToggleTimeMode}
          className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs sm:text-sm font-bold py-1 px-2 rounded-lg whitespace-nowrap"
        >
          {isTimeUnlimited ? "START" : "STOP"}
        </button>
      </div>

      {/* 中央：スコア */}
      <div className="flex items-center space-x-2 min-w-[60px] whitespace-nowrap">
        <Trophy className="text-yellow-500" size={24} />
        <span className="md:text-2xl font-bold text-yellow-600">{score}点</span>
      </div>

      {/* 右側：リセットボタン */}
      <button
        onClick={onReset}
        className="flex items-center space-x-1 bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded-lg transition-colors whitespace-nowrap mt-2 sm:mt-0"
      >
        <RefreshCw size={16} />
        <span className="text-sm">答え</span>
      </button>
    </div>
  );
}