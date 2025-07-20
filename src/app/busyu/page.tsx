"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import RadicalSelector from "../../components/busyu/RadicalSelector";
import GameExplanation from "../../components/busyu/GameExplanation";
import InfoBar from "../../components/busyu/InfoBar";
import FoundKanjiList from "../../components/busyu/FoundKanjiList";
import GameEndScreen from "../../components/busyu/GameEndScreen";
import KanjiInputWithHint from "../../components/busyu/KanjiInput";

import { busyuData } from "../../../public/busyuData";
import { Kanji } from "../../types/kanji";
import { kankenToGakusei } from "@/components/kankenToGrade";
import ResultFlash from "@/components/busyu/ResultFlash";

/** ユーティリティ関数 */
const calcPoint = (kanken: number): number => {
  if (kanken >= 5 && kanken <= 10) return 1;      // 小学生
  if (kanken >= 3 && kanken <= 4) return 2;       // 中学生
  if (kanken >= 2 && kanken <= 2.5) return 3;     // 高校生
  if (kanken === 1.5) return 5;                   // 準1級
  if (kanken === 1) return 8;                     // 1級
  return 1;                                       // 不明・その他は1点
};


const kanaToHiragana = (str: string) =>
  str.replace(/[ァ-ヶ]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0x60));
const toHalfWidth = (str: string) =>
  str.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
const parseGrade = (gradeStr: string): number => {
  const raw = toHalfWidth(gradeStr || "");
  const match = raw.match(/\d+/);
  return match ? parseInt(match[0], 10) : 7;
};

export default function KanjiBushuGame() {
  const router = useRouter();

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
  const [isGameClear, setIsGameClear] = useState(false);
  const [isTimeUnlimited, setIsTimeUnlimited] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean>(false);

  /** 初期化 */
  useEffect(() => {
    const map: Record<string, Kanji[]> = {};
    const readingMap: Record<string, string> = {};

    busyuData.forEach(({ radical, reading, kanji }) => {
      readingMap[radical] = reading;
      map[radical] = kanji.map((k) => ({
        char: k.char,
        readings: [...(k.onyomi || []), ...(k.kunyomi || [])]
          .map((r) => kanaToHiragana(r.replace(/（.*?）/g, "")).toLowerCase()),
        meaning: (k.meaning?.[0] || "").replace(/。$/, ""),
        grade: parseGrade(k.grade || ""),
        kanken:k.kanken
      }));
    });

    setRadicalMap(map);
    setRadicalReadings(readingMap);
  }, []);


  /** タイマー管理 */
  useEffect(() => {
    if (gameStarted && !gameEnded && !isTimeUnlimited && timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timerId);
    }
    if (gameStarted && !gameEnded && !isTimeUnlimited && timeLeft === 0) endGame();
  }, [gameStarted, gameEnded, timeLeft, isTimeUnlimited]);

  /** 全正解チェック */
  useEffect(() => {
    if (!currentRadical || gameEnded) return;
    const total = radicalMap[currentRadical]?.length || 0;
    if (foundKanji.length === total && total > 0) {
      setIsGameClear(true);
      endGame();
    }
  }, [foundKanji, currentRadical, radicalMap, gameEnded]);




  const startGame = (radical: string) => {
    setCurrentRadical(radical);
    setGameStarted(true);
    setGameEnded(false);
    setInput("");
    setFoundKanji([]);
    setCurrentKanji(null);
    setShowResult(false);
    setScore(0);
    setTimeLeft(60);
    setIsHintVisible(false);
    setHintList([]);
    setIsGameClear(false);
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
    setIsTimeUnlimited(false);
    setTimeLeft(60);
    setIsHintVisible(false);
    setHintList([]);
    setIsGameClear(false);
  };

  const endGame = () => {
    setGameStarted(false);
    setGameEnded(true);
  };




const checkAnswer = () => {
  if (!currentRadical || !input.trim()) return;
  const ans = input.trim().toLowerCase();
  const allKanji = radicalMap[currentRadical] || [];

  const matched = allKanji.find(
    (k) => !foundKanji.some((f) => f.char === k.char) && k.readings.includes(ans)
  );

  if (matched) {
    const pts = calcPoint(matched.kanken);
    setTimeLeft((s)=>s + 15)
    setScore((s) => s + pts);
    setFoundKanji((prev) => [...prev, matched]);
    setCurrentKanji(matched);
    setIsAnswerCorrect(true);
    setShowResult(true);
    if (isHintVisible) generateHints(matched.char);
    setTimeout(() => {
      setShowResult(false);
      setCurrentKanji(null);
    }, 2000);
  } else {
    setIsAnswerCorrect(false);
    setShowResult(true);
    setTimeout(() => {
      setShowResult(false);
    }, 700);
  }
  setInput("");
};

  const generateHints = (excludeChar: string | null = null) => {
    if (!currentRadical) return;
    const notFound = radicalMap[currentRadical].filter(
      (k) => !foundKanji.some((f) => f.char === k.char) && k.char !== excludeChar
    );
    const hints = notFound
      .sort((a, b) =>b.kanken -  a.kanken)
      .slice(0, 2)
      .map((k) => `${k.meaning}　（${k.kanken ? kankenToGakusei(k.kanken) : "不明"}）`);
    setHintList(hints);
  };

  const toggleHint = () => {
    if (!currentRadical) return;
    if (!isHintVisible) generateHints();
    setIsHintVisible((v) => !v);
  };

  const radicalsWithCount = Object.entries(radicalMap)
    .map(([radical, kanjiList]) => ({
      radical,
      count: kanjiList.length,
      reading: radicalReadings[radical] || "？",
    }))
    .sort((a, b) => b.count - a.count);

  const currentAllKanji = currentRadical ? radicalMap[currentRadical] : [];

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4 py-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen overflow-x-hidden">
      {!currentRadical ? (
        <>
          <button
            onClick={() => router.push("/")}
            className="rounded-md mb-2 bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300"
          >
            ← タイトルに戻る
          </button>
          <h1 className="text-center text-4xl font-bold mb-6">部首を選択</h1>
          <RadicalSelector 
            radicals={radicalsWithCount} 
            onSelect={startGame} />
        </>
      ) : (
        <>
          <div className="text-center mb-4">
            <p className="text-3xl font-bold text-gray-800">
              「{currentRadical}」（{radicalReadings[currentRadical] || "?"}）の漢字
            </p>
          </div>

          {!gameStarted && !gameEnded && <GameExplanation onStart={() => setGameStarted(true)} />}

          {gameStarted && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <InfoBar
                  timeLeft={timeLeft}
                  isTimeUnlimited={isTimeUnlimited}
                  onToggleTimeMode={() => setIsTimeUnlimited((v) => !v)}
                  score={score}
                  onReset={endGame}
                />


                <div className="text-center">
                  <div className="inline-block bg-blue-100 rounded-lg p-8 mb-2">
                    <span className="text-4xl sm:text-6xl md:text-8xl font-bold text-blue-800">
                      {currentRadical}
                    </span>
                  </div>
                  <p className="text-gray-700 text-base">
                    全 {currentAllKanji.length} 個の漢字があります
                  </p>
                </div>

                <KanjiInputWithHint
                  value={input}
                  onChange={setInput}
                  onSubmit={checkAnswer}
                  isHintVisible={isHintVisible}
                  hints={hintList}
                  onToggleHint={toggleHint}
                />

              <ResultFlash 
                visible={showResult} 
                kanji={currentKanji} 
                isCorrect={isAnswerCorrect} 
              />

                <FoundKanjiList foundKanji={foundKanji} total={currentAllKanji.length} />

              </div>
            </div>
          )}

          {gameEnded && (
            <GameEndScreen
              score={score}
              currentRadical={currentRadical}
              foundKanji={foundKanji}
              allKanji={currentAllKanji}
              isGameClear={isGameClear}
              onReplay={() => startGame(currentRadical!)}
              onReturn={resetAll}
            />
          )}
        </>
      )}
    </div>
  );
}