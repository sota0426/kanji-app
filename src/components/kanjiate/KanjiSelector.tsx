// -----------------------
// src/components/KanjiSelector.tsx
// -----------------------
"use client";
import React, { useEffect } from "react";

interface KanjiSelectorProps {
  kankenList: number[];
  radicalList: string[];
  selectedMode: "kanken" | "radical";
  selectedValue: string | number;
  onChangeMode: (mode: "kanken" | "radical") => void;
  onChangeValue: (value: string | number) => void;
}

export default function KanjiSelector({
  kankenList,
  radicalList,
  selectedMode,
  selectedValue,
  onChangeMode,
  onChangeValue,
}: KanjiSelectorProps) {
  // デバッグ用（必要に応じて）
  useEffect(() => {
    console.log("選択モード:", selectedMode);
    console.log("選択値:", selectedValue);
  }, [selectedMode, selectedValue]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const raw = e.target.value;
    const value = selectedMode === "kanken" ? Number(raw) : raw;
    onChangeValue(value);
  };

  return (
    <div className="flex flex-col items-center mb-6 space-y-4">
      {/* モード切り替え */}
      <div className="flex gap-6">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            value="kanken"
            checked={selectedMode === "kanken"}
            onChange={() => onChangeMode("kanken")}
          />
          <span>漢検級で選ぶ</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            value="radical"
            checked={selectedMode === "radical"}
            onChange={() => onChangeMode("radical")}
          />
          <span>部首で選ぶ</span>
        </label>
      </div>

      {/* 値選択 */}
      <select
        className="border rounded p-2 w-full max-w-sm text-center"
        value={String(selectedValue)}
        onChange={handleSelectChange}
      >
        {(selectedMode === "kanken" ? kankenList : radicalList).map((val) => (
          <option key={val} value={val}>
            {selectedMode === "kanken" ? `${val}級` : val}
          </option>
        ))}
      </select>
    </div>
  );
}
