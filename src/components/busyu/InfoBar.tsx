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
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Clock className="text-red-500" size={24} />
          <span className="text-2xl font-bold text-red-500">{timeLeft}秒</span>

          <button
            onClick={onToggleTimeMode}
            className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-bold py-2 px-2 rounded-lg"
          >
            {isTimeUnlimited ? "タイマーON" : "タイマーOFF"}
          </button>

        </div>
        <div className="flex items-center space-x-2">
          <Trophy className="text-yellow-500" size={24} />
          <span className="text-2xl font-bold text-yellow-600">{score}点</span>
        </div>
      </div>
      <button
        onClick={onReset}
        className="flex items-center space-x-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
      >
        <RefreshCw size={16} />
        <span>終了（答えを見る）</span>
      </button>
    </div>
  );
}
