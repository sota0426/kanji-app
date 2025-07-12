// -----------------------
// src/components/RadicalSelector.tsx
// -----------------------
"use client";
import React from "react";

interface RadicalSelectorProps {
  radicals: string[];
  onSelect: (radical: string) => void;
}

export default function RadicalSelector({ radicals, onSelect }: RadicalSelectorProps) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
      {radicals.map((radical) => (
        <button
          key={radical}
          onClick={() => onSelect(radical)}
          className="bg-white hover:bg-blue-100 rounded-lg p-6 shadow text-3xl font-bold transition-colors"
        >
          {radical}
        </button>
      ))}
    </div>
  );
}
