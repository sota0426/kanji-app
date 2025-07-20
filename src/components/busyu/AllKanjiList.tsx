"use client";
import { Kanji } from "@/types/kanji";
import React from "react";
import { kankenToGrade } from "../kankenToGrade";

interface AllKanjiListProps {
  allKanji: Kanji[];
  foundKanji: Kanji[];
}

function toKatakana(str: string) {
  return str.replace(/[\u3041-\u3096]/g, ch =>
    String.fromCharCode(ch.charCodeAt(0) + 0x60)
  );
}

export default function AllKanjiList({ allKanji, foundKanji }: AllKanjiListProps) {
  const foundChars = new Set(foundKanji.map(k => k.char));

  const grouped: Record<number, Kanji[]> = {};
  allKanji.forEach(k => {
    const grade = k.kanken;
    if (!grouped[grade]) grouped[grade] = [];
    grouped[grade].push(k);
  });


  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <h3 className="text-xl font-bold mb-4">全漢字一覧（学年別）</h3>

      {Object.entries(grouped)
        .sort((a, b) => Number(b[0])-Number(a[0]))
        .map(([grade, kanjis]) => (
          <div key={grade} className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-300 pb-1">
              {kankenToGrade(Number(grade))}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {kanjis.map(k => {
                const discovered = foundChars.has(k.char);
                return (
                  <div
                    key={k.char}
                    className={`relative group text-center rounded-lg p-3 shadow transition-all cursor-pointer ${
                      discovered
                        ? "bg-white text-blue-800 border border-blue-200"
                        : "bg-red-100 text-red-600 border border-red-300"
                    }`}
                  >
                    <div className="text-3xl font-bold mb-1">{k.char}</div>
                    <div className="text-sm text-gray-600">{k.readings[1]}</div>
                    <div className="text-sm text-gray-500">{toKatakana(k.readings[0])}</div>

                    {/* Tooltip on hover */}
                    <div className="absolute z-10 hidden group-hover:block bg-white border text-black border-gray-300 rounded-lg p-3 text-sm 
                    text-left shadow-lg w-60 top-full mt-2 left-1/2 transform -translate-x-1/2">
                      <div><strong>漢字:</strong> {k.char}</div>
                      <div><strong>音読み:</strong> {toKatakana(k.readings[0])}</div>
                      <div><strong>訓読み:</strong> {k.readings[1]}</div>
                      <div><strong>意味:</strong> {k.meaning}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
}
