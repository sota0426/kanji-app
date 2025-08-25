"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Confetti from "react-confetti";
import { useRouter } from "next/navigation";

// ✅ 自作ポップアップ（インストール不要）
function Popup({ message, show }: { message: string; show: boolean }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div className="bg-white rounded-2xl shadow-lg px-8 py-6 text-3xl font-bold text-green-600 animate-bounce">
        {message}
      </div>
    </div>
  );
}

type Level = "basic" | "easy" | "medium" | "hard";
type Mode = "normal" | "fun";

type Attempt = { answer: number; isCorrect: boolean };
type HistoryItem = {
  prompt: string;          // 表示した問題文（例: "7 × 8 = ?" / "答えは56、片方は7。もう片方は？"）
  correctAnswer: number;   // 正解
  attempts: Attempt[];     // 解答履歴（✗→✓ の順で並ぶ）
};

export default function MultiplicationQuiz() {
  const [difficulty, setDifficulty] = useState<Level | null>(null);
  const [mode, setMode] = useState<Mode>("normal");
  const [showKuku, setShowKuku] = useState(true);

  // 現在の問題の内部値
  const [num1, setNum1] = useState<number | null>(null);
  const [num2, setNum2] = useState<number | null>(null);
  const [product, setProduct] = useState<number | null>(null);

  // 表示＆入力
  const [prompt, setPrompt] = useState<string>("");  // 現在の問題文（履歴にも保存）
  const [answer, setAnswer] = useState<string>("");
  const [result, setResult] = useState<string>("");

  // 進行・スコア・履歴
  const MAX_QUESTIONS = 10;
  const [score, setScore] = useState(0);       // 正解数
  const [total, setTotal] = useState(0);       // 出題完了数（=正解でのみ加算 → 進行度）
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentAttempts, setCurrentAttempts] = useState<Attempt[]>([]);

  // 演出
  const [isFinished, setIsFinished] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  //戻る
  const router = useRouter();

  const difficultyRanges: Record<Level, [number, number]> = {
    basic: [1, 9],
    easy: [10, 19],
    medium: [10, 50],
    hard: [10, 99],
  };

  const startQuiz = (level: Level, quizMode: Mode = "normal") => {
    setDifficulty(level);
    setMode(quizMode);

    // リセット
    setScore(0);
    setTotal(0);
    setHistory([]);
    setCurrentAttempts([]);
    setAnswer("");
    setResult("");
    setIsFinished(false);

    generateQuestion(level, quizMode);
  };

  const randomInRange = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const generateQuestion = (level: Level | null = difficulty, quizMode: Mode = mode) => {
    if (!level) return;

    const [min, max] = difficultyRanges[level];
    const a = randomInRange(min, max);
    const b = randomInRange(min, max);

    setCurrentAttempts([]); // 新しい問題の試行履歴をリセット
    setAnswer("");
    setResult("");

    if (quizMode === "fun") {
      const p = a * b;
      setProduct(p);
      if (Math.random() > 0.5) {
        setNum1(null);
        setNum2(b);
        setPrompt(`ヒント: 答えは ${p}、片方は ${b}。もう片方は？`);
      } else {
        setNum1(a);
        setNum2(null);
        setPrompt(`ヒント: 答えは ${p}、片方は ${a}。もう片方は？`);
      }
    } else {
      setNum1(a);
      setNum2(b);
      setProduct(a * b);
      setPrompt(`問題: ${a} × ${b} = ?`);
    }
  };

  const getCorrectAnswer = (): number | null => {
    if (mode === "fun") {
      if (product == null) return null;
      if (num1 === null && num2 !== null) return product / num2;
      if (num2 === null && num1 !== null) return product / num1;
      return null;
    }
    if (num1 == null || num2 == null) return null;
    return num1 * num2;
  };

  const finalizeQuestion = (finalAttempts: Attempt[], correctAnswer: number) => {
    // 履歴へ確定保存（この問題の全試行）
    setHistory((prev) => [...prev, { prompt, correctAnswer, attempts: finalAttempts }]);
    setTotal((t) => t + 1);

    // 10問目で終了
    if (total + 1 >= MAX_QUESTIONS) {
      setIsFinished(true);
    } else {
      generateQuestion();
    }
  };

  const checkAnswer = () => {
    if (isFinished) return;

    const user = parseInt(answer);
    const correctValue = getCorrectAnswer();

    if (isNaN(user) || correctValue == null) {
      setResult("数値で答えてね。");
      return;
    }

    const isCorrect = user === correctValue;

    // 現在の問題の試行履歴に追加
    const updatedAttempts = [...currentAttempts, { answer: user, isCorrect }];
    setCurrentAttempts(updatedAttempts);

    if (isCorrect) {
      // スコア加算 & 正解ポップアップ
      setScore((s) => s + 1);
      setResult("正解！");
      setIsPopupOpen(true);
      setTimeout(() => setIsPopupOpen(false), 900);

      // 問題を確定して次へ
      finalizeQuestion(updatedAttempts, correctValue);
    } else {
      setResult("残念！ もう一度チャレンジしてみて。");
      // 同じ問題に再挑戦（履歴確定はしない）
    }
  };

  const revealAnswer = () => {
    const correctValue = getCorrectAnswer();
    if (correctValue == null) return;
    setResult(`答えは ${correctValue} だよ。`);
  };

  const KukuTable = () => (
    <Card className="w-full max-w-3xl mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">ウォームアップ：九九表（1×1 〜 9×9）</h2>
          <Button variant="outline" onClick={() => setShowKuku(!showKuku)}>
            {showKuku ? "隠す" : "表示"}
          </Button>
        </div>
        {showKuku && (
          <div className="mt-4 grid grid-cols-9 gap-2 text-center">
            {[...Array(9)].map((_, i) => (
              <div key={`head-${i}`} className="font-bold">
                {i + 1}
              </div>
            ))}
            {[...Array(9)].map((_, r) =>
              [...Array(9)].map((_, c) => (
                <div key={`${r}-${c}`} className="p-2 rounded bg-white shadow-sm">
                  {r + 1}×{c + 1}={(r + 1) * (c + 1)}
                </div>
              ))
            )}
          </div>
        )}
        <p className="mt-3 text-sm text-gray-600">まずは表で思い出してから、下のボタンでクイズを始めましょう。</p>
      </CardContent>
    </Card>
  );


  // 進捗ゲージ（10分割）
  const ProgressBar = () => {
    return (
      <div className="w-full max-w-3xl mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-700">進捗</span>
          <span className="text-sm font-semibold">
            {total} / {MAX_QUESTIONS}
          </span>
        </div>
        <div className="grid grid-cols-10 gap-1">
          {Array.from({ length: MAX_QUESTIONS }).map((_, i) => {
            const isDone = i < total;
            const isCurrent = i === total && !isFinished && difficulty;
            return (
              <div
                key={i}
                className={[
                  "h-3 rounded",
                  isDone ? "bg-green-500" : isCurrent ? "bg-blue-500 animate-pulse" : "bg-gray-300"
                ].join(" ")}
              />
            );
          })}
        </div>
      </div>
    );
  };

  // 履歴の行（終了画面）
  const HistoryRow = ({ item, index }: { item: HistoryItem; index: number }) => {
    const last = item.attempts[item.attempts.length - 1];
    const finalCorrect = last?.isCorrect ?? false;
    return (
      <div className="border rounded-lg p-3 bg-white">
        <div className="flex items-center justify-between">
          <div className="font-semibold">
            {index + 1}. {item.prompt}
          </div>
          <div className={finalCorrect ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
            {finalCorrect ? "正解" : "不正解"}
          </div>
        </div>

        <div className="mt-2 text-sm">
          <div className="text-gray-600">正解：<span className="font-semibold">{item.correctAnswer}</span></div>
          <div className="mt-1 flex flex-wrap gap-2">
            {item.attempts.map((att, i) => (
              <span
                key={i}
                className={[
                  "px-2 py-0.5 rounded text-xs font-mono",
                  att.isCorrect ? "bg-green-100 text-green-700 border border-green-300" :
                                  "bg-red-100 text-red-700 border border-red-300",
                ].join(" ")}
                title={att.isCorrect ? "正解" : "不正解"}
              >
                {att.answer}{att.isCorrect ? " ✓" : " ✗"}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
          <button
            onClick={() => router.push("/")}
            className="rounded-md bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300"
          >
            ← タイトルに戻る
          </button>  
          <div className="flex flex-col items-center justify-start">
          <h1 className="text-3xl font-bold mb-2">掛け算クイズ</h1>
    

      {/* 進捗ゲージ */}
      {difficulty && <ProgressBar />}

      {!difficulty && <KukuTable />}

      {/* 🎉 全問正解でクラッカー */}
      {isFinished && score === MAX_QUESTIONS && <Confetti />}

      {/* 正解ポップアップ */}
      <Popup message="🎉 正解！" show={isPopupOpen} />

      {/* 終了画面 */}
      {isFinished ? (
        <div className="w-full max-w-3xl">
          <Card className="mb-4">
            <CardContent className="p-4 text-center">
              <h2 className="text-2xl font-bold mb-2">終了！</h2>
              <p className="mb-2">スコア: <span className="font-semibold">{score}</span> / {MAX_QUESTIONS}</p>
              {score === MAX_QUESTIONS ? (
                <p className="text-green-600 font-bold text-xl">全問正解！おめでとう🎉</p>
              ) : (
                <p className="text-red-600 font-bold text-xl">また挑戦してね！</p>
              )}
              <div className="mt-4 flex gap-2 justify-center">
                <Button className="bg-blue-500 hover:bg-blue-600" onClick={() => startQuiz("basic")}>
                  もう一度（九九 1〜9）
                </Button>
                <Button variant="outline" onClick={() => setDifficulty(null)}>
                  モード選択に戻る
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 履歴一覧 */}
          <div className="space-y-2">
            {history.map((item, idx) => (
              <HistoryRow key={idx} item={item} index={idx} />
            ))}
          </div>
        </div>
      ) : difficulty ? (
        <Card className="p-6 w-full max-w-md mt-2">
          <CardContent>
            <p className="text-xl mb-4">{prompt}</p>

            {/* 表示専用の“擬似入力欄” */}
            <div className="mb-3">
              <div className="border rounded px-3 py-2 text-right text-2xl bg-white select-none">
                {answer.length ? answer : "…"}
              </div>
            </div>

            {/* 画面内キーパッド */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[1,2,3,4,5,6,7,8,9].map((d) => (
                <Button key={d} variant="outline" onClick={() => setAnswer((p)=> (p==="0"? String(d): p + String(d)))}>
                  {d}
                </Button>
              ))}
              <Button className="col-span-2" variant="outline" onClick={() => setAnswer((p)=> (p==="0"? "0": p + "0"))}>
                0
              </Button>
              <Button variant="outline" onClick={() => setAnswer((p)=> p.slice(0,-1))}>⌫</Button>
            </div>

            {/* 操作ボタン */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={checkAnswer}>回答する</Button>
              <Button onClick={revealAnswer} variant="secondary">答えを見る</Button>
              <Button onClick={() => setAnswer("")} variant="outline">C</Button>
            </div>

            {/* フィードバック */}
            {result && (
              <p className={`mt-4 text-lg font-bold ${
                result.startsWith("正解") ? "text-green-600" :
                result.startsWith("残念") ? "text-red-600" : ""
              }`}>
                {result}
              </p>
            )}

            <p className="mt-4">スコア: {score} / {total}</p>
          </CardContent>
        </Card>
      ) : (
        // モード選択
        <div className="grid grid-cols-2 gap-4 w-full max-w-3xl mt-2">
          <Button onClick={() => startQuiz("basic")} className="p-4 text-lg">九九 (1〜9)</Button>
          <Button onClick={() => startQuiz("easy")} className="p-4 text-lg">初級 (10〜19)</Button>
          <Button onClick={() => startQuiz("medium")} className="p-4 text-lg">中級 (10〜50)</Button>
          <Button onClick={() => startQuiz("hard")} className="p-4 text-lg">上級 (10〜99)</Button>
          <Button onClick={() => startQuiz("easy", "fun")} className="p-4 text-lg col-span-2 bg-purple-500 hover:bg-purple-600">
            面白いモード (逆転クイズ)
          </Button>
        </div>
      )}
    </div>
    </div>
  );
}
