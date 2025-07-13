"use client";

import React, { useState, useEffect } from "react";
import RadicalSelector from "../../components/busyu/RadicalSelector";
import GameExplanation from "../../components/busyu/GameExplanation";
import InfoBar from "../../components/busyu/InfoBar";
import ResultFlash from "../../components/busyu/ResultFlash";
import FoundKanjiList from "../../components/busyu/FoundKanjiList";
import GameEndScreen from "../../components/busyu/GameEndScreen";
import { Kanji } from "../../types/kanji";
import KanjiInputWithHint from "../../components/busyu/KanjiInput";
// import getConfig from "next/config"; // この行は削除します

/** ---------------------- データ構造定義 ---------------------- */
interface RawKanji {
  char: string;
  [key: string]: string;
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

  const [ isGameClear , setIsGameClear] = useState(false);
  const [isTimeUnlimited, setIsTimeUnlimited] = useState(false);


  /** ---------------------- データ取得 ---------------------- */

  useEffect(() => {
    // 環境変数から NEXT_PUBLIC_BASE_PATH を取得
    // 環境変数が設定されていない場合は空文字列を使用（デフォルト値）
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

    // `busyu.json` への完全なパスを構築
    const jsonPath = `${basePath}/busyu.json`;

    fetch(jsonPath)
      .then((res) => {
        if (!res.ok) {
          // HTTPエラーの場合、具体的なメッセージを出す
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
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

            const toHalfWidth = (str: string) =>
              str.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
            const rawGrade = toHalfWidth(k["学年"] || "");
            const gradeMatch = rawGrade.match(/\d+/);
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
      .catch((error) => alert(`busyu.json の読み込みに失敗しました: ${error.message}\nJSONパス: ${jsonPath}`));
  }, []);

  /** ---------------------- タイマー ---------------------- */
    useEffect(() => {
      if (gameStarted && !gameEnded && !isTimeUnlimited && timeLeft > 0) {
        const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
        return () => clearTimeout(id);
      }
      if (gameStarted && !gameEnded && !isTimeUnlimited && timeLeft === 0) {
        endGame();
      }
    }, [gameStarted, gameEnded, timeLeft, isTimeUnlimited]);



  /** ----------------------　問題終了 ---------------------- */
    useEffect(() => {
      if (!currentRadical || gameEnded) return;

      const totalCount = radicalMap[currentRadical]?.length || 0;
      const foundCount = foundKanji.length;

      if (totalCount > 0 && foundCount === totalCount) {
        setIsGameClear(true);
        endGame();
      }
    }, [foundKanji, currentRadical, radicalMap, gameEnded]);



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
  if (isHintVisible) {
    generateHints(matched.char);   // 直前に当てた漢字を除外
  }

  setTimeout(() => {
    setShowResult(false);
    setCurrentKanji(null);
  }, 1800);
}


    setInput("");
  };

/** ---------------------- ヒント生成 ---------------------- */
  const generateHints = (excludeChar: string | null = null) => {
    if (!currentRadical) return;

    const all = radicalMap[currentRadical];
    const notFound = all.filter(
      (k) =>
        !foundKanji.some((f) => f.char === k.char) &&   // まだ見つけていない
        k.char !== excludeChar                         // 直前に正解した文字を除外（任意）
    );

    const hints = [...notFound]
      .sort((a, b) => a.grade - b.grade)              // 学年が低い順
      .slice(0, 2)                                   // 最大 2 件
      .map(
        (k) =>
          `${k.meaning}（${k.grade === 7 ? "中学生漢字" : k.grade + "年生"}）`
      );

    setHintList(hints);
  };

  const toggleHint = () => {
  if (!currentRadical) return;

  // 非表示→表示へ切り替えるときだけ新しく作成
  if (!isHintVisible) {
    generateHints();
  }
  setIsHintVisible(!isHintVisible);
};





  /** ---------------------- レンダリング ---------------------- */
 const allRadicalsWithCount = Object.entries(radicalMap)
  .map(([radical, kanjiList]) => ({
    radical,
    count: kanjiList.length,
    reading:radicalReadings[radical] || "？"
  }))
  .sort((a, b) => b.count-a.count);


  const currentAllKanji = currentRadical ? radicalMap[currentRadical] : [];

  // 部首未選択画面
  if (!currentRadical) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
        <h1 className="text-center text-4xl font-bold mb-8">部首を選択</h1>
        <RadicalSelector radicals={allRadicalsWithCount} onSelect={startGame} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* タイトル */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">部首漢字ゲーム</h1>
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
            <InfoBar
              timeLeft={timeLeft}
              isTimeUnlimited={isTimeUnlimited}
              onToggleTimeMode={() => setIsTimeUnlimited(prev => !prev)}
              score={score}
              onReset={endGame}
            />



            {/* 部首表示 */}
            <div className="text-center mb-6">
              <h2 className="font-semibold mb-2 text-gray-600">
                部首「{currentRadical}」（{radicalReadings[currentRadical] || "?"}）の漢字を答えよう！
              </h2>
              <div className="inline-block bg-blue-100 rounded-lg p-8 mb-2">
                <span className="text-8xl font-bold text-blue-800">{currentRadical}</span>
              </div>
              <p className="text-gray-700 mt-2">全 {currentAllKanji.length} 個の漢字があります</p>
            </div>

            {/* インプット */}
            <KanjiInputWithHint
              value={input}
              onChange={setInput}
              onSubmit={checkAnswer}
              isHintVisible={isHintVisible}
              hints={hintList}
              onToggleHint={toggleHint}
            />

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
          currentRadical={currentRadical}
          foundKanji={foundKanji}
          allKanji={currentAllKanji}
          isGameClear={isGameClear}
          onReplay={() => startGame(currentRadical)}
          onReturn={resetAll}
        />
      )}

    </div>
  );
}