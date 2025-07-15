// -----------------------
// src/components/RadicalSelector.tsx
// -----------------------
"use client";
import React from "react";

interface RadicalSelectorProps {
  radicals: {
    radical:string ; 
    count:number ; 
    reading :string
  }[];
  onSelect: (radical: string) => void;
}

export default function RadicalSelector({ radicals, onSelect }: RadicalSelectorProps) {
  return (
    <div className="grid gird-cols-1 md:grid-cols-2  gap-4">
      {radicals
      .filter(({count})=> count>3)
      .map(({ radical, count ,reading}) => (
        
        <button
          key={radical}
          onClick={() => onSelect(radical)}
          className="bg-white hover:bg-blue-100 rounded-lg p-4 shadow text-center transition-colors"
        >
          <div className="text-left">
            <span className="ml-4 text-4xl font-bold mb-1">{radical}</span>   
            <span className="text-sm text-gray-600">（漢字数：{count}）</span>
            <div className="mt-2">
              <span className="ml-2text-gray-700 mb-1">部首名: {reading}</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
