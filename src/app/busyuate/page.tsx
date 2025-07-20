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

    const toHalfWidth = (str: string) =>
      str.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));

    return busyuData.map((entry) => {
      const enrichedKanji = entry.kanji.map((k) => {
        const readings = [...(k.onyomi || []), ...(k.kunyomi || [])]
          .map((r: string) =>
            kanaToHiragana(r.replace(/（.*?）/g, "")).toLowerCase()
          );

        const rawGrade = toHalfWidth(k.grade || "");
        const gradeMatch = rawGrade.match(/\d+/);
        const gradeNum = gradeMatch ? parseInt(gradeMatch[0], 10) : 7;

        return {
          char: k.char,
          readings,
          meaning: (k.meaning?.[0] || "").replace(/。$/, ""),
          grade: gradeNum,
          kanken: gradeNum, 
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
      .filter((item) => item.kanji.some((k) => k.grade === selectedGrade))
      .flatMap((item) =>
        item.kanji
          .filter((k) => k.grade === selectedGrade)
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
