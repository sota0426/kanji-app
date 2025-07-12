// -----------------------
// src/components/AllKanjiList.tsx
// -----------------------
"use client";
import { Kanji } from "@/types/kanji";
import React from "react";

interface AllKanjiListProps {
  allKanji: Kanji[];
  foundKanji: Kanji[];
}

function toKatakana(str) {
  return str.replace(/[\u3041-\u3096]/g, ch =>
    String.fromCharCode(ch.charCodeAt(0) + 0x60)
  );
}


export default function AllKanjiList({ allKanji, foundKanji }: AllKanjiListProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <h3 className="font-semibold mb-3">全漢字一覧</h3>
      <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
        {allKanji.map((k) => {
          const discovered = foundKanji.some((f) => f.char === k.char);
          return (
            <div
              key={k.char}
              className={`text-center rounded-lg p-3 shadow ${discovered ? "bg-white" : "bg-red-100"}`}
            >
              <div className={`text-3xl font-bold mb-1 ${discovered ? "text-blue-800" : "text-red-600"}`}>{k.char}</div>
              <div className="text-sm text-gray-600">{k.readings[1]}</div>
              <div className="text-sm text-gray-600">  {toKatakana(k.readings[0])}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
