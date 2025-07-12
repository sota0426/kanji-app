
// -----------------------
// src/components/FoundKanjiList.tsx
// -----------------------
"use client";
import { Kanji } from "@/types/kanji";
import React from "react";

interface FoundKanjiListProps {
  foundKanji: Kanji[];
  total: number;
}

export default function FoundKanjiList({ foundKanji, total }: FoundKanjiListProps) {
  if (foundKanji.length === 0) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="font-semibold mb-3">見つけた漢字 ({foundKanji.length} / {total})</h3>
      <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
        {foundKanji.map((k) => (
          <div key={k.char} className="text-center bg-white rounded-lg p-3 shadow">
            <div className="text-3xl font-bold text-blue-800 mb-1">{k.char}</div>
            <div className="text-sm text-gray-600">{k.readings[0]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}