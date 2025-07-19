"use client";

import React, { useState } from "react";
import { StartScreen } from "../../components/yojiimi/StartSxreen";
import { YojiQuiz } from "../../components/yojiimi/YojiQuiz";
import { FinishScreen } from "../../components/yojiimi/FinishScreen";

export default function App() {
  const [level, setLevel] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);

  const handleFinish = (finalScore: number) => {
    setScore(finalScore);
    setFinished(true);
  };

  const handleRetry = () => {
    setFinished(false);
  };

  const handleReturnTop = () => {
    setLevel(null);
    setFinished(false);
    setScore(0);
  };

  if (finished) {
    return (
      <FinishScreen
        score={score}
        total={10}
        onRetry={handleRetry}
        onReturnTop={handleReturnTop}
      />
    );
  }

  if (level === null) {
    return <StartScreen onStart={(lvl) => setLevel(lvl)} />;
  }

  return (
    <YojiQuiz
      level={level}
      onFinish={(finalScore) => handleFinish(finalScore)}
      onQuit={handleReturnTop}
    />
  );
}
