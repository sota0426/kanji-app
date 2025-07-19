"use client";

import React from "react";
import { kankenToGrade, yojiData } from "../../../public/yojiData";
import { useRouter } from "next/navigation";

const levels = [5, 4, 3, 2.5, 2, 1.5, 1];

const getLevelCounts = () => {
  const counts: Record<number, number> = {} as Record<number, number>;
  levels.forEach((level) => {
    counts[level] = yojiData.filter((item) => item.kanken === level).length;
  });
  return counts;
};

const levelCounts = getLevelCounts();

// 表示用の「漢検○級」「準○級」変換関数
const getKankenLabel = (level: number): string => {
  switch (level) {
    case 1.5:
      return "準1級";
    case 2.5:
      return "準2級";
    default:
      return `${level}級`;
  }
};

// レベル別の色テーマ
const getLevelTheme = (level: number) => {
  const themes = {
    5: {
      gradient: "from-green-400 to-emerald-500",
      bg: "bg-green-50",
      border: "border-green-200",
      hoverBorder: "hover:border-green-400",
      text: "text-green-700",
      badge: "bg-green-100 text-green-800",
      icon: "🌱"
    },
    4: {
      gradient: "from-blue-400 to-blue-500",
      bg: "bg-blue-50",
      border: "border-blue-200",
      hoverBorder: "hover:border-blue-400",
      text: "text-blue-700",
      badge: "bg-blue-100 text-blue-800",
      icon: "🌊"
    },
    3: {
      gradient: "from-purple-400 to-purple-500",
      bg: "bg-purple-50",
      border: "border-purple-200",
      hoverBorder: "hover:border-purple-400",
      text: "text-purple-700",
      badge: "bg-purple-100 text-purple-800",
      icon: "🌸"
    },
    2.5: {
      gradient: "from-pink-400 to-rose-500",
      bg: "bg-pink-50",
      border: "border-pink-200",
      hoverBorder: "hover:border-pink-400",
      text: "text-pink-700",
      badge: "bg-pink-100 text-pink-800",
      icon: "🌺"
    },
    2: {
      gradient: "from-orange-400 to-orange-500",
      bg: "bg-orange-50",
      border: "border-orange-200",
      hoverBorder: "hover:border-orange-400",
      text: "text-orange-700",
      badge: "bg-orange-100 text-orange-800",
      icon: "🔥"
    },
    1.5: {
      gradient: "from-red-400 to-red-500",
      bg: "bg-red-50",
      border: "border-red-200",
      hoverBorder: "hover:border-red-400",
      text: "text-red-700",
      badge: "bg-red-100 text-red-800",
      icon: "⚡"
    },
    1: {
      gradient: "from-gray-700 to-black",
      bg: "bg-gray-50",
      border: "border-gray-300",
      hoverBorder: "hover:border-gray-500",
      text: "text-gray-800",
      badge: "bg-gray-100 text-gray-800",
      icon: "👑"
    }
  };
  return themes[level as keyof typeof themes] || themes[1];
};

export const StartScreen = ({ onStart }: { onStart: (level: number) => void }) => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* ヘッダー */}
        <button
          onClick={() => router.push("/")}
          className="rounded-md mb-2  bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300"
        >
          ← タイトルに戻る
        </button>
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <span className="text-3xl text-white font-bold">漢</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            四字熟語クイズ
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            漢字検定のレベルを選んでクイズを始めましょう。
            <br />
            各レベルの問題数も確認できます。
          </p>
        </div>

        {/* レベル選択カード */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {levels.map((level) => {
            const theme = getLevelTheme(level);
            return (
              <button
                key={level}
                onClick={() => onStart(level)}
                className={`group relative ${theme.bg} ${theme.border} ${theme.hoverBorder} border-2 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 overflow-hidden`}
              >
                {/* 背景グラデーション効果 */}
                <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                {/* アイコン */}
                <div className="text-4xl mb-3 group-hover:animate-bounce">
                  {theme.icon}
                </div>
                
                {/* レベル表示 */}
                <div className={`${theme.text} mb-2`}>
                  <div className="text-xl font-bold mb-1">
                    漢検{getKankenLabel(level)}
                  </div>
                  <div className="text-sm opacity-80">
                    {kankenToGrade(level)}
                  </div>
                </div>
                
                {/* 問題数バッジ */}
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${theme.badge} mb-3`}>
                  {levelCounts[level]}問
                </div>
                
                {/* 難易度インジケーター */}
                <div className="flex justify-center space-x-1 mb-3">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < (6 - level) ? theme.gradient.includes('gray') ? 'bg-gray-400' : 'bg-current' : 'bg-gray-200'
                      } opacity-60`}
                    />
                  ))}
                </div>
                
                {/* ホバー効果のテキスト */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium">
                  クイズを開始 →
                </div>
              </button>
            );
          })}
        </div>

        {/* フッター */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
            <span>💡</span>
            <span>レベルが低いほど難易度が高くなります</span>
          </div>
        </div>
      </div>
    </div>
  );
};