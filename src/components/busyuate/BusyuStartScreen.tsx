"use client";

import { useRouter } from "next/navigation";
import React from "react";

const gradeLabels: Record<number, string> = {
  1: "小学1年",
  2: "小学2年",
  3: "小学3年",
  4: "小学4年",
  5: "小学5年",
  6: "小学6年",
  7: "中学生以上",
};

const themes = {
  1: { icon: "🌱", gradient: "from-green-400 to-green-600", bg: "bg-green-50", text: "text-green-700" },
  2: { icon: "🌼", gradient: "from-yellow-400 to-yellow-500", bg: "bg-yellow-50", text: "text-yellow-700" },
  3: { icon: "📘", gradient: "from-blue-400 to-blue-500", bg: "bg-blue-50", text: "text-blue-700" },
  4: { icon: "📗", gradient: "from-emerald-400 to-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
  5: { icon: "🔮", gradient: "from-purple-400 to-purple-600", bg: "bg-purple-50", text: "text-purple-700" },
  6: { icon: "🧠", gradient: "from-pink-400 to-pink-600", bg: "bg-pink-50", text: "text-pink-700" },
  7: { icon: "👑", gradient: "from-gray-700 to-black", bg: "bg-gray-100", text: "text-gray-800" },
};

export const BusyuStartScreen = ({ onSelect }: { onSelect: (grade: number) => void }) => {
  const router = useRouter();


  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <button
          onClick={() => router.push("/")}
          className="rounded-md mb-2  bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300"
        >
          ← タイトルに戻る
        </button>


        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-rose-400 to-pink-500 rounded-2xl mb-6 shadow-lg">
            <span className="text-3xl text-white font-bold">部</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">部首あてクイズ</h1>
          <p className="text-lg text-gray-600">
            学年（漢字の習得目安）を選んで、部首クイズを始めましょう！
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6, 7].map((grade) => {
            const theme = themes[grade as keyof typeof themes];
            return (
              <button
                key={grade}
                onClick={() => onSelect(grade)}
                className={`group relative ${theme.bg} rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`} />

                {/* アイコン */}
                <div className="text-4xl mb-3">{theme.icon}</div>

                {/* 学年 */}
                <div className={`${theme.text} text-xl font-bold mb-2`}>
                  {gradeLabels[grade]}
                </div>

                {/* ホバー説明 */}
                <div className="text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  クイズを開始 →
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-500">※ 学年が上がるほど難しい漢字が出題されます</div>
      </div>
    </div>
  );
};
