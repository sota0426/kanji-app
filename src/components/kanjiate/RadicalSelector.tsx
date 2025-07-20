// src/components/RadicalSelector.tsx
"use client";
import React from "react";

interface RadicalSelectorProps {
  radicalList: string[];
  selectedRadical: string;
  onChange: (radical: string) => void;
}

export default function RadicalSelector({
  radicalList,
  selectedRadical,
  onChange,
}: RadicalSelectorProps) {
  return (
    <div className="my-4">
      <label className="font-bold">部首を選んでください：</label>
      <select
        value={selectedRadical}
        onChange={(e) => onChange(e.target.value)}
        className="ml-2 border p-2 rounded"
      >
        {radicalList.map((radical) => (
          <option key={radical} value={radical}>
            {radical}
          </option>
        ))}
      </select>
    </div>
  );
}
