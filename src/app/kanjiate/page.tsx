// app/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { busyuData } from "../../../public/busyuData";
import RadicalSelector from "@/components/busyu/RadicalSelector";
import InfoBar from "@/components/busyu/InfoBar";

// RadicalSelector に渡すデータ構造を整形
const radicalData = busyuData.map((r) => ({
  radical: r.radical,
  count: r.kanji.length,
  reading: r.reading,
}));


export default function HomePage() {
  const [selectedRadical, setSelectedRadical] = useState(busyuData[0].radical);
  const [kanjiList, setKanjiList] = useState(busyuData[0].kanji);
  const [currentKanji, setCurrentKanji] = useState(kanjiList[0]);
  const [onyomi, setOnyomi] = useState("");
  const [kunyomi, setKunyomi] = useState("");
  const [isHintVisible, setIsHintVisible] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimeUnlimited, setIsTimeUnlimited] = useState(false);

  useEffect(() => {
    if (!isTimeUnlimited && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, isTimeUnlimited]);

  useEffect(() => {
    const group = busyuData.find((r) => r.radical === selectedRadical);
    if (group) {
      setKanjiList(group.kanji);
      const random = group.kanji[Math.floor(Math.random() * group.kanji.length)];
      setCurrentKanji(random);
    }
  }, [selectedRadical]);

  const pickNextKanji = () => {
    const random = kanjiList[Math.floor(Math.random() * kanjiList.length)];
    setCurrentKanji(random);
    setOnyomi("");
    setKunyomi("");
    setIsHintVisible(false);
  };

  const handleSubmit = () => {
    if (!currentKanji) return;
    const onyomiCorrect = currentKanji.onyomi.some((o) => o === onyomi.trim());
    const kunyomiCorrect = currentKanji.kunyomi.some((k) => k === kunyomi.trim());

    if (onyomiCorrect && kunyomiCorrect) {
      setScore((s) => s + 10);
    } else if (onyomiCorrect || kunyomiCorrect) {
      setScore((s) => s + 5);
    }

    pickNextKanji();
  };
  

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">漢字読みクイズ（部首別）</h1>



      <RadicalSelector
        radicals={radicalData}
        onSelect={setSelectedRadical}
      />

      <InfoBar
        timeLeft={timeLeft}
        isTimeUnlimited={isTimeUnlimited}
        score={score}
        onReset={pickNextKanji}
        onToggleTimeMode={() => setIsTimeUnlimited((b) => !b)}
      />

      {currentKanji && (
        <div className="text-5xl font-bold text-center mt-8">{currentKanji.char}</div>
      )}

      <div className="flex flex-col items-center my-6 space-y-4">
        <input
          placeholder="音読み（カタカナ）"
          value={onyomi}
          onChange={(e) => setOnyomi(e.target.value)}
          className="border rounded p-2 w-full text-center"
        />
        <input
          placeholder="訓読み（ひらがな）"
          value={kunyomi}
          onChange={(e) => setKunyomi(e.target.value)}
          className="border rounded p-2 w-full text-center"
        />
        <button
          onClick={handleSubmit}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          答える
        </button>
        <button
          onClick={() => setIsHintVisible((v) => !v)}
          className="text-blue-500 underline"
        >
          {isHintVisible ? "ヒントを隠す" : "ヒントを見る"}
        </button>
      </div>

      {isHintVisible && currentKanji.meaning.length > 0 && (
        <div className="bg-yellow-100 p-4 rounded">
          <p className="font-bold mb-2">ヒント（意味）:</p>
          <ul className="list-disc list-inside">
            {currentKanji.meaning.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
