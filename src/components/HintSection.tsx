
// -----------------------
// src/components/HintSection.tsx
// -----------------------
"use client";
import React from "react";

interface HintSectionProps {
  isVisible: boolean;
  hints: string[];
  onToggle: () => void;
}

export default function HintSection({ isVisible, hints, onToggle }: HintSectionProps) {
  return (
    <>
      <div className="text-center ">
        <button
          onClick={onToggle}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg mb-2"
        >
          {isVisible ? "ヒントを隠す" : "ヒントを見る"}
        </button>
      </div>

      {isVisible && hints.length > 0 && (
        <div className="text-center mt-4 bg-yellow-100 border border-yellow-300 p-4 rounded-lg mb-4">
          <p className="font-semibold mb-2">ヒント（意味のみ）:</p>
          <ul className="list-disc list-inside text-left inline-block text-gray-700">
            {hints.map((hint, idx) => (
              <li key={idx}>{hint}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}