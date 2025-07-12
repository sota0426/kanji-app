
// -----------------------
// src/components/KanjiInput.tsx
// -----------------------
"use client";
import React, { useRef, useEffect } from "react";

interface KanjiInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export default function KanjiInput({ value, onChange, onSubmit }: KanjiInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSubmit();
  };

  return (
    <div className="text-center mb-6">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="読み方をひらがなで入力"
        className="text-2xl p-4 border-2 border-gray-300 rounded-lg w-80 text-center focus:border-blue-500 focus:outline-none"
      />
      <div className="mt-4">
        <button
          onClick={onSubmit}
          disabled={!value.trim()}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-3 px-8 rounded-lg text-xl transition-colors"
        >
          答える
        </button>
      </div>
    </div>
  );
}
