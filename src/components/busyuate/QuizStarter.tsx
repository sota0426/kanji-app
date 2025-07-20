"use client";

import React, { useState, useMemo } from "react";
import { busyuData } from "../../../public/busyuData";
import ReadingQuiz from "@/components/busyuate/ReadingQuiz";
import { BusyuStartScreen } from "@/components/busyuate/BusyuStartScreen";

export default function QuizStarter() {
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  // 漢字データ整形
  const enrichedData = useMemo(() => {
    const kanaToHiragana = (str: string) =>
      str.replace(/[ァ-ヶ]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0x60));


    return busyuData.map((entry) => {
      const enrichedKanji = entry.kanji.map((k) => {
        const readings = [...(k.onyomi || []), ...(k.kunyomi || [])]
          .map((r: string) =>
            kanaToHiragana(r.replace(/（.*?）/g, "")).toLowerCase()
          );



        return {
          char: k.char,
          readings,
          meaning: (k.meaning?.[0] || "").replace(/。$/, ""),
          kanken: k.kanken,          
        };
      });

      return {
        radical: entry.radical,
        reading: entry.reading,
        kanji: enrichedKanji,
      };
    });
  }, []);

  const handleSelectGrade = (grade: number) => {
    setSelectedGrade(grade);
  };

  if (selectedGrade !== null) {
    const kanjiList = enrichedData
      .filter((item) => item.kanji.some((k) => k.kanken === selectedGrade))
      .flatMap((item) =>
        item.kanji
          .filter((k) => k.kanken === selectedGrade)
          .map((k) => ({
            radical: item.radical,
            reading: item.reading,
            kanji: [k],
          }))
      );

    return (
      <ReadingQuiz
        filteredData={kanjiList}
        onBack={() => setSelectedGrade(null)} // 🔁 戻るボタン用
      />
    );
  }

  return <BusyuStartScreen onSelect={handleSelectGrade} />;
}
