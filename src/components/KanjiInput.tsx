"use client";
import React, { useRef, useEffect } from "react";

interface KanjiInputWithHintProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isHintVisible: boolean;
  hints: string[];
  onToggleHint: () => void;
}

export default function KanjiInputWithHint({
  value,
  onChange,
  onSubmit,
  isHintVisible,
  hints,
  onToggleHint,
}: KanjiInputWithHintProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSubmit();
  };

  return (
    <div className="text-center mb-4">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="読み方をひらがなで入力"
        className="text-2xl p-4 border-2 border-gray-300 rounded-lg w-80 text-center focus:border-blue-500 focus:outline-none"
      />
      <div className="mt-4 mb-4">
        <button
          onClick={onSubmit}
          disabled={!value.trim()}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-3 px-8 rounded-lg text-xl transition-colors"
        >
          答える
        </button>
        <button
          onClick={onToggleHint}
          className="ml-10 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg mb-2"
        >
          {isHintVisible ? "ヒントを隠す" : "ヒントを見る"}
        </button>
   
      </div>



      <div>
        {isHintVisible && hints.length > 0 && (
          <div className="mt-4 bg-yellow-100 border border-yellow-300 p-4 rounded-lg mb-4 text-left w-full">
            <p className="font-semibold mb-2">ヒント（意味のみ）:</p>
            <ul className="list-disc list-inside text-gray-700">
              {hints.map((hint, idx) => (
                <li key={idx}>{hint}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
