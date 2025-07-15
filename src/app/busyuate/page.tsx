"use client";
import React, { useState } from "react";

import { busyuData } from "../../../public/busyuData";
import ReadingQuiz from "@/components/busyuate/ReadingQuiz";

const gradeLabels: Record<number, string> = {
  1: "小学1年",
  2: "小学2年",
  3: "小学3年",
  4: "小学4年",
  5: "小学5年",
  6: "小学6年",
  7: "中学生以上",
};

export default function QuizStarter() {
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);

  const handleSelectGrade = (grade: number) => {
    setSelectedGrade(grade);
  };

  if (selectedGrade !== null) {
    // 選択された学年に合う漢字だけ抽出
    const kanjiList = busyuData
      .filter((item) => item.kanji.some((k) => k.grade === selectedGrade))
      .flatMap((item) =>
        item.kanji.filter((k) => k.grade === selectedGrade).map((k) => ({
          ...item,
          kanji: [k],
        }))
      );

    return <ReadingQuiz filteredData={kanjiList} />;
  }

  return (
    <div className="max-w-xl mx-auto p-6 text-center">
      <h2 className="text-2xl font-bold mb-6">学年を選んでください</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6, 7].map((grade) => (
          <button
            key={grade}
            onClick={() => handleSelectGrade(grade)}
            className="bg-blue-100 hover:bg-blue-200 text-blue-900 font-semibold py-3 rounded-lg shadow"
          >
            {gradeLabels[grade]}
          </button>
        ))}
      </div>
    </div>
  );
}
