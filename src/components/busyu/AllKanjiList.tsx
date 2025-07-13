"use client";
import { Kanji } from "@/types/kanji";
import React from "react";

interface AllKanjiListProps {
  allKanji: Kanji[];
  foundKanji: Kanji[];
}

// ひらがな → カタカナ変換
function toKatakana(str: string) {
  return str.replace(/[\u3041-\u3096]/g, ch =>
    String.fromCharCode(ch.charCodeAt(0) + 0x60)
  );
}

export default function AllKanjiList({ allKanji, foundKanji }: AllKanjiListProps) {
  const foundChars = new Set(foundKanji.map(k => k.char));

  // 学年ごとにグループ化
  const grouped: Record<number, Kanji[]> = {};
  allKanji.forEach(k => {
    const grade = k.grade;
    if (!grouped[grade]) grouped[grade] = [];
    grouped[grade].push(k);
  });

  const gradeLabel = (grade: number) => {
    switch (grade) {
      case 1: return "小学1年";
      case 2: return "小学2年";
      case 3: return "小学3年";
      case 4: return "小学4年";
      case 5: return "小学5年";
      case 6: return "小学6年";
      case 7: return "中学生以上";
      default: return "その他";
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <h3 className="text-xl font-bold mb-4">全漢字一覧（学年別）</h3>

      {Object.entries(grouped)
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([grade, kanjis]) => (
          <div key={grade} className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-300 pb-1">
              {gradeLabel(Number(grade))}
            </h4>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
              {kanjis.map(k => {
                const discovered = foundChars.has(k.char);
                return (
                  <div
                    key={k.char}
                    className={`text-center rounded-lg p-3 shadow transition-all ${
                      discovered
                        ? "bg-white text-blue-800 border border-blue-200"
                        : "bg-red-100 text-red-600 border border-red-300"
                    }`}
                  >
                    <div className="text-3xl font-bold mb-1">{k.char}</div>
                    <div className="text-sm text-gray-600">{k.readings[1]}</div>
                    <div className="text-sm text-gray-500">{toKatakana(k.readings[0])}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
}
