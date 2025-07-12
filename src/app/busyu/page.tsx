"use client";

import React, { useState, useEffect } from "react";
import RadicalSelector from "../../components/RadicalSelector";
import GameExplanation from "../../components/GameExplanation";
import InfoBar from "../../components/InfoBar";
import KanjiInput from "../../components/KanjiInput";
import HintSection from "../../components/HintSection";
import ResultFlash from "../../components/ResultFlash";
import FoundKanjiList from "../../components/FoundKanjiList";
import GameEndScreen from "../../components/GameEndScreen";
import { Kanji } from "../../types/kanji";

/** ---------------------- データ構造定義 ---------------------- */
interface RawKanji {
  char: string;
  [key: string]: any;
}

interface RadicalEntry {
  radical: string;
  reading: string;
  kanji: RawKanji[];
}

/** ---------------------- 学年→得点換算 ---------------------- */
const calcPoint = (grade: number) => {
  if (grade <= 2) return 1;
  if (grade <= 4) return 2;
  return 3;
};

export default function KanjiBushuGame() {
  /** ---------------------- 状態管理 ---------------------- */
  const [radicalMap, setRadicalMap] = useState<Record<string, Kanji[]>>({});
  const [radicalReadings, setRadicalReadings] = useState<Record<string, string>>({});

  const [currentRadical, setCurrentRadical] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  const [input, setInput] = useState("");
  const [foundKanji, setFoundKanji] = useState<Kanji[]>([]);
  const [currentKanji, setCurrentKanji] = useState<Kanji | null>(null);
  const [showResult, setShowResult] = useState(false);

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);

  const [hintList, setHintList] = useState<string[]>([]);
  const [isHintVisible, setIsHintVisible] = useState(false);

  /** ---------------------- データ取得 ---------------------- */
  useEffect(() => {
    fetch("/busyu.json")
      .then((res) => res.json())
      .then((json: RadicalEntry[]) => {
        const map: Record<string, Kanji[]> = {};
        const readingMap: Record<string, string> = {};

        json.forEach((entry) => {
          readingMap[entry.radical] = entry.reading;
          map[entry.radical] = entry.kanji.map((k) => {
            const kanaToHiragana = (str: string) =>
              str.replace(/[ァ-ヶ]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0x60));
            const readings = [...(k["音読み"] || []), ...(k["訓読み"] || [])]
              .map((r: string) => kanaToHiragana(r.replace(/（.*?）/g, "")).toLowerCase());

            const gradeMatch = (k["学年"] || "").match(/\d+/);
            const gradeNum = gradeMatch ? parseInt(gradeMatch[0], 10) : 7;

            return {
              char: k.char,
              readings,
              meaning: (k["意味"]?.[0] || "").replace(/。$/, ""),
              grade: gradeNum,
            } as Kanji;
          });
        });

        setRadicalMap(map);
        setRadicalReadings(readingMap);
      })
      .catch(() => alert("busyu.json の読み込みに失敗しました"));
  }, []);

  /** ---------------------- タイマー ---------------------- */
  useEffect(() => {
    if (gameStarted && !gameEnded && timeLeft > 0) {
      const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(id);
    }
    if (gameStarted && timeLeft === 0) {
      endGame();
    }
  }, [gameStarted, gameEnded, timeLeft]);

  /** ---------------------- ゲーム制御 ---------------------- */
  const startGame = (radical: string) => {
    setCurrentRadical(radical);
    setGameStarted(true);
    setGameEnded(false);
    setInput("");
    setFoundKanji([]);
    setCurrentKanji(null);
    setShowResult(false);
    setScore(0);
    setTimeLeft(120);
    setIsHintVisible(false);
    setHintList([]);
  };

  const resetAll = () => {
    setCurrentRadical(null);
    setGameStarted(false);
    setGameEnded(false);
    setInput("");
    setFoundKanji([]);
    setCurrentKanji(null);
    setShowResult(false);
    setScore(0);
    setTimeLeft(120);
    setIsHintVisible(false);
    setHintList([]);
  };

  const endGame = () => {
    setGameStarted(false);
    setGameEnded(true);
  };

  /** ---------------------- 判定 ---------------------- */
  const checkAnswer = () => {
    if (!currentRadical || !input.trim()) return;

    const reading = input.trim().toLowerCase();
    const allKanji = radicalMap[currentRadical] || [];

    const matched = allKanji.find(
      (k) => !foundKanji.some((f) => f.char === k.char) && k.readings.includes(reading)
    );

if (matched) {
  const pts = calcPoint(matched.grade);
  setScore((s) => s + pts);
  setFoundKanji((prev) => [...prev, matched]);
  setCurrentKanji(matched);
  setShowResult(true);

  // ✅ 正解後に Hint を更新
  if (isHintVisible && currentRadical) {
    const all = radicalMap[currentRadical];
    const notFound = all.filter((k) =>
      !foundKanji.some((f) => f.char === k.char) && k.char !== matched.char
    );
    const hints = [...notFound]
      .sort(() => Math.random() - 0.5)
      .slice(0, 2)
      .map((k) => `${k.meaning || "？"}（${k.char.length}文字）`);
    setHintList(hints);
  }

  setTimeout(() => {
    setShowResult(false);
    setCurrentKanji(null);
  }, 1800);
}


    setInput("");
  };

  /** ---------------------- ヒント ---------------------- */
  const toggleHint = () => {
    if (!currentRadical) return;
    if (!isHintVisible) {
      const all = radicalMap[currentRadical];
      const notFound = all.filter((k) => !foundKanji.some((f) => f.char === k.char));
      const hints = [...notFound]
        .sort(() => Math.random() - 0.5)
        .slice(0, 2)
        .map((k) => `${k.meaning || "？"}（${k.char.length}文字）`);
      setHintList(hints);
    }
    setIsHintVisible(!isHintVisible);
  };

  /** ---------------------- メッセージ ---------------------- */
  const getScoreMessage = () => {
    if (score >= 20) return "漢字マスター！";
    if (score >= 15) return "素晴らしい！";
    if (score >= 10) return "よくできました！";
    if (score >= 5) return "がんばりました！";
    return "また挑戦してね！";
  };

  /** ---------------------- レンダリング ---------------------- */
  const allRadicals = Object.keys(radicalMap).sort();
  const currentAllKanji = currentRadical ? radicalMap[currentRadical] : [];

  // 部首未選択画面
  if (!currentRadical) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
        <h1 className="text-center text-4xl font-bold mb-8">部首を選択</h1>
        <RadicalSelector radicals={allRadicals} onSelect={startGame} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* タイトル */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">部首漢字ゲーム</h1>
        <p className="text-gray-600">
          部首「{currentRadical}」（{radicalReadings[currentRadical] || "?"}）の漢字を答えよう！
        </p>
      </div>

      {/* === ゲーム未開始（説明） === */}
      {!gameStarted && !gameEnded && (
        <GameExplanation onStart={() => setGameStarted(true)} />
      )}

      {/* === ゲーム中 === */}
      {gameStarted && (
        <div className="space-y-6">
          {/* 情i報バー */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <InfoBar timeLeft={timeLeft} score={score} onReset={endGame} />

            {/* 部首表示 */}
            <div className="text-center mb-6">
              <h2 className="font-semibold mb-2">この部首を使った漢字は？</h2>
              <div className="inline-block bg-blue-100 rounded-lg p-8 mb-2">
                <span className="text-8xl font-bold text-blue-800">{currentRadical}</span>
              </div>
              <p className="text-gray-700 mt-2">全 {currentAllKanji.length} 個の漢字があります</p>
            </div>

            {/* 入力 */}
            <KanjiInput value={input} onChange={setInput} onSubmit={checkAnswer} />

            {/* ヒント欄 */}
            <HintSection isVisible={isHintVisible} hints={hintList} onToggle={toggleHint} />

            {/* 正解フラッシュ */}
            <ResultFlash visible={showResult} kanji={currentKanji} calcPoint={calcPoint} />

            {/* 発見済みリスト */}
            <FoundKanjiList foundKanji={foundKanji} total={currentAllKanji.length} />

          </div>
        </div>
      )}

      {/* === 終了画面 === */}
      {gameEnded && (
        <GameEndScreen
          score={score}
          message={getScoreMessage()}
          currentRadical={currentRadical}
          foundKanji={foundKanji}
          allKanji={currentAllKanji}
          onReplay={() => startGame(currentRadical)}
          onReturn={resetAll}
        />
      )}
    </div>
  );
}
