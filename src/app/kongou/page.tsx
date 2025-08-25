"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Confetti from "react-confetti";

/* ====== 見た目：正解ポップアップ（自作） ====== */
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

/* ====== 数学ユーティリティ（簡単化/パース/整形） ====== */

// √n = c√r（r は平方因子を含まない）へ
function simplifyRadicand(n: number): { c: number; r: number } {
  if (n <= 0 || !Number.isInteger(n)) return { c: 0, r: 0 };
  let c = 1;
  let r = n;
  for (let k = 2; k * k <= r; k++) {
    while (r % (k * k) === 0) {
      r = r / (k * k);
      c *= k;
    }
  }
  return { c, r };
}

// a√b の正規化（b=1 → 整数）
function normalize(a: number, b: number): { A: number; R: number } {
  if (b === 1) return { A: a, R: 1 };
  const { c, r } = simplifyRadicand(b);
  return { A: a * c, R: r };
}

// パース："3√8" / "-√18" / "4" などを {a,b} に
function parseRadicalTerm(raw: string): { a: number; b: number } | null {
  const s = raw.replace(/\s+/g, "");
  if (!s) return null;
  if (/^[+-]?\d+$/.test(s)) return { a: parseInt(s, 10), b: 1 };
  const m = s.match(/^([+-]?\d+)?√(\d+)$/);
  if (m) {
    const a = m[1] ? parseInt(m[1], 10) : 1;
    const b = parseInt(m[2], 10);
    if (b <= 0) return null;
    return { a, b };
  }
  return null;
}

// 表示整形：負の項は外部から括弧付け可能に
function formatRadical(A: number, R: number): string {
  if (A === 0) return "0";
  if (R === 1) return String(A);
  if (A === 1) return `√${R}`;
  if (A === -1) return `-√${R}`;
  return `${A}√${R}`;
}

// 同種（同じ R）を結合
function addLikeRadicals(terms: Array<{ A: number; R: number }>) {
  const map = new Map<number, number>();
  for (const t of terms) map.set(t.R, (map.get(t.R) || 0) + t.A);
  const out: Array<{ A: number; R: number }> = [];
  for (const [R, A] of map.entries()) if (A !== 0) out.push({ A, R });
  out.sort((p, q) => p.R - q.R);
  return out;
}

// "+/-" 分割で和差式を正規化
function sumExpression(expr: string): Array<{ A: number; R: number }> | null {
  const clean = expr.replace(/\s+/g, "");
  if (!clean) return null;
  const tokens: string[] = [];
  let i = 0;
  while (i < clean.length) {
    let sign = "+";
    if (clean[i] === "+" || clean[i] === "-") sign = clean[i++];
    let term = "";
    while (i < clean.length && clean[i] !== "+" && clean[i] !== "-") term += clean[i++];
    if (!term) return null;
    const pr = parseRadicalTerm(term);
    if (!pr) return null;
    const { A, R } = normalize(sign === "-" ? -pr.a : pr.a, pr.b);
    tokens.push(`${A}|${R}`);
  }
  const pieces = tokens.map(t => {
    const [A, R] = t.split("|").map(Number);
    return { A, R };
  });
  return addLikeRadicals(pieces);
}

// 積（2項）
function multiplyTwoTerms(t1: { a: number; b: number }, t2: { a: number; b: number }) {
  const n1 = normalize(t1.a, t1.b);
  const n2 = normalize(t2.a, t2.b);
  return normalize(n1.A * n2.A, n1.R * n2.R);
}

/* ====== 共通UI：進捗ゲージ・テンキー ====== */

function ProgressBar({ total, maxQ }: { total: number; maxQ: number }) {
  return (
    <div className="w-full max-w-3xl mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-700">進捗</span>
        <span className="text-sm font-semibold">
          {total} / {maxQ}
        </span>
      </div>
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: maxQ }).map((_, i) => (
          <div key={i} className={["h-3 rounded", i < total ? "bg-green-500" : "bg-gray-300"].join(" ")} />
        ))}
      </div>
    </div>
  );
}

// 記号テンキー（数字/√/+/-/×/( )/⌫/C）
// クイズ用 Keypad（数字・√・×・⌫・C のみ）
function Keypad({ onInput }: { onInput: (k: string) => void }) {
  const keys = [
    "7","8","9","√",
    "4","5","6","×",
    "1","2","3","⌫",
    "0","C"
  ];
  return (
    <div className="grid grid-cols-4 gap-2 mb-3">
      {keys.map(k => (
        <Button
          key={k}
          variant="outline"
          onClick={() => onInput(k)}
          aria-label={`キー ${k}`}
        >
          {k}
        </Button>
      ))}
    </div>
  );
}


/* =========================
   ここから本体コンポーネント
   ========================= */

type Level = "easy2" | "easy3" | "ops";
type Screen = "quiz" | "calc";

type HistoryItem = { question: string; correct: string; user: string; isCorrect: boolean };

export default function RadicalTrainer() {
  const [screen, setScreen] = useState<Screen>("quiz");

  /* === クイズ共通 === */
  const MAX_Q = 10;
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [popup, setPopup] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  /* === クイズ：出題/判定状態 === */
  const [mode, setMode] = useState<Level | null>(null); // "ops"=演算, "easy2"=2桁簡単化, "easy3"=3桁簡単化
  const [question, setQuestion] = useState("");
  const [expected, setExpected] = useState<{ type: "sum", sum: Array<{A:number;R:number}> } | { type: "mul", A:number;R:number } | { type: "simp", A:number; R:number } | null>(null);
  const [answer, setAnswer] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  /* ====== ユーティリティ ====== */
  const ri = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  /* ====== 出題生成 ====== */

  // 演算クイズ：足し/引き（同種のみ、負の結果を避ける）、掛け算（正の結果）
  function makeOpsQuestion(): { text: string; expect: { type: "sum"; sum?: Array<{ A: number; R: number }>; A?: never; R?: never } | { type: "mul"; A: number; R: number; sum?: never } } {
    // 50% 加減算 / 50% 掛け算
    if (Math.random() < 0.5) {
      // 同種化：ベース r（平方因子無し）に s^2 を掛けた r1, r2 を作る
      let base = ri(2, 40);
      base = simplifyRadicand(base).r || base;
      if (base === 1) base = 2;
      const s1 = ri(1, 5), s2 = ri(1, 5);
      const r1 = base * s1 * s1;
      const r2 = base * s2 * s2;

      // 係数は正のみ（負の答えを避ける）
      const c1 = ri(1, 5);
      const c2 = ri(1, 5);
      const usePlus = Math.random() < 0.5;

      // 表示は "+ (-...)" にならないよう整形（ここでは両方正なので安心）
      const t1 = `${c1 === 1 ? "" : c1}√${r1}`;
      const t2 = `${c2 === 1 ? "" : c2}√${r2}`;
      const op = usePlus ? "+" : "-";

      // 期待値（同種結合）。引き算でも負にならないよう入れ替え
      const n1 = normalize(c1, r1); // (c1*s1)√base
      const n2 = normalize(c2, r2); // (c2*s2)√base
      let A = n1.A + (usePlus ? n2.A : -n2.A);
      if (A < 0) {
        // 逆にする（問題文を t2 op t1 に）
        A = n2.A - (usePlus ? -n1.A : n1.A); // 実質 |A|
        const text = `${t2} ${usePlus ? "+" : "-"} ${t1}`;
        return { text, expect: { type: "sum", sum: addLikeRadicals([{A:n2.A,R:n2.R},{A:usePlus? n1.A : -n1.A, R:n1.R}]) } };
      }
      const text = `${t1} ${op} ${t2}`;
      return { text, expect: { type: "sum", sum: addLikeRadicals([{A:n1.A,R:n1.R},{A:usePlus? n2.A : -n2.A, R:n2.R}]) } };
    } else {
      // 掛け算（正の答えのみ：係数は正で作る）
      const aCoeff = ri(1, 4);
      const bCoeff = ri(1, 4);
      const aRad = ri(2, 40);
      const bRad = ri(2, 40);

      const text = `${aCoeff === 1 ? "" : aCoeff}√${aRad} × ${bCoeff === 1 ? "" : bCoeff}√${bRad}`;
      const prod = multiplyTwoTerms({ a: aCoeff, b: aRad }, { a: bCoeff, b: bRad });
      if (prod.A < 0) { prod.A = -prod.A; } // 念のため正に
      return { text, expect: { type: "mul", A: prod.A, R: prod.R } };
    }
  }

  // 簡単化クイズ：√n を最簡へ（2桁/3桁）
  function makeSimpQuestion(level: "easy2" | "easy3") {
    const n = level === "easy2" ? ri(10, 99) : ri(100, 999);
    const text = `√${n} を簡単に：`;
    const expect = normalize(1, n); // = c√r と同じ
    return { text, expect: { type: "simp", A: expect.A, R: expect.R } };
  }

  function startQuiz(type: Level) {
    setMode(type);
    setScore(0);
    setTotal(0);
    setIsFinished(false);
    setHistory([]);
    setAnswer("");

    if (type === "ops") {
      const q = makeOpsQuestion();
      setQuestion(q.text);
      setExpected(q.expect as typeof expected);
    } else {
      const q = makeSimpQuestion(type);
      setQuestion(q.text);
      setExpected(q.expect as typeof expected);
    }
  }

  function nextQuestion() {
    if (!mode) return;
    setAnswer("");
    if (mode === "ops") {
      const q = makeOpsQuestion();
      setQuestion(q.text);
      setExpected(q.expect as typeof expected);
    } else {
      const q = makeSimpQuestion(mode);
      setQuestion(q.text);
      setExpected(q.expect as typeof expected);
    }
  }

  /* ====== 判定 ====== */

  function isAnswerCorrect(ans: string): { ok: boolean; canonical: string } | null {
    const s = ans.replace(/\s+/g, "");
    if (!s || !expected) return null;

    if (expected.type === "sum") {
      const parsed = sumExpression(s);
      if (!parsed) return null;
      const E = expected.sum;
      if (E.length !== parsed.length) {
        return { ok: false, canonical: parsed.map(t => formatRadical(t.A,t.R)).join(" + ") || "0" };
      }
      for (let i=0;i<E.length;i++) {
        if (E[i].R !== parsed[i].R || E[i].A !== parsed[i].A) {
          return { ok:false, canonical: parsed.map(t => formatRadical(t.A,t.R)).join(" + ") || "0" };
        }
      }
      return { ok:true, canonical: parsed.map(t => formatRadical(t.A,t.R)).join(" + ") || "0" };
    }

    if (expected.type === "mul" || expected.type === "simp") {
      const pr = parseRadicalTerm(s);
      if (!pr) return null;
      const n = normalize(pr.a, pr.b);
      const ok = n.A === expected.A && n.R === expected.R;
      return { ok, canonical: formatRadical(n.A, n.R) };
    }

    return null;
  }

  function checkAnswer() {
      if (isFinished || !expected) return;
      const res = isAnswerCorrect(answer);
      if (!res) return;
      const isOk = res.ok;

      // 正答表示
      let correctShow = "";
      if (expected.type === "sum") {
        correctShow = expected.sum.length ? expected.sum.map(t => formatRadical(t.A,t.R)).join(" + ") : "0";
      } else {
        correctShow = formatRadical(expected.A, expected.R);
      }

      setHistory(h => [...h, { question, correct: correctShow, user: res.canonical, isCorrect: isOk }]);

      if (isOk) {
        setScore(s => s + 1);
        setPopup(true);
        setTimeout(() => setPopup(false), 800);
        setErrorMsg("");   // 👈 正解ならエラーメッセージを消す
        setTotal(t => {
          const nt = t + 1;
          if (nt >= MAX_Q) setIsFinished(true);
          else nextQuestion();
          return nt;
        });
      } else {
        setErrorMsg("間違いだよ。もう一度チャレンジ！");
      }
    }


  /* ====== クイズ入力テンキー ====== */
  function applyQuizKey(k: string) {
    if (k === "⌫") setAnswer(p => p.slice(0,-1));
    else if (k === "C") setAnswer("");
    else if (k === "+") {
      setAnswer(p => (!p || /[+\-]$/.test(p)) ? p : p + "+");
    } else if (k === "-") {
      // 単項マイナスを許すため、直前が開始/演算子/ "(" のときはそのまま OK
      setAnswer(p => (!p || /[+\-(]$/.test(p)) ? p + "-" : p + "-");
    } else {
      setAnswer(p => p + k);
    }
  }

  /* ====== 画面 ====== */

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-3">根号トレーナー（クイズ / 計算機）</h1>

      {/* 画面切り替え */}
      <div className="mb-4 flex gap-2">
        <Button onClick={() => setScreen("quiz")} className={screen==="quiz" ? "" : "bg-gray-200 text-gray-800"}>
          Quiz
        </Button>
        <Button onClick={() => setScreen("calc")} className={screen==="calc" ? "" : "bg-gray-200 text-gray-800"}>
          Calculator
        </Button>
      </div>


        <div className="w-full max-w-3xl">
          <ProgressBar total={total} maxQ={MAX_Q} />
          {isFinished && score === MAX_Q && <Confetti />}
          <Popup message="🎉 正解！" show={popup} />

          {!mode ? (
            // モード選択
            <div className="grid md:grid-cols-3 gap-3">
              <Card><CardContent className="p-4 flex flex-col gap-2">
                <h3 className="font-semibold">【初級】２桁の数値</h3>
                <p className="text-sm text-gray-600">√n を最簡へ（10–99）</p>
                <Button onClick={() => startQuiz("easy2")}>スタート</Button>
              </CardContent></Card>
              <Card><CardContent className="p-4 flex flex-col gap-2">
                <h3 className="font-semibold">【中級】３桁の数値</h3>
                <p className="text-sm text-gray-600">√n を最簡へ（100–999）</p>
                <Button onClick={() => startQuiz("easy3")}>スタート</Button>
              </CardContent></Card>
              <Card><CardContent className="p-4 flex flex-col gap-2">
                <h3 className="font-semibold">【上級】演算クイズ</h3>
                <p className="text-sm text-gray-600">足し引き（同種のみ）/ 掛け算（異なる根OK）</p>
                <Button onClick={() => startQuiz("ops")}>スタート</Button>
              </CardContent></Card>            </div>
          ) : isFinished ? (
            // 終了画面
            <div>
              <Card className="mb-4">
                <CardContent className="p-4 text-center">
                  <h2 className="text-2xl font-bold mb-2">終了！</h2>
                  <p className="mb-2">スコア: <span className="font-semibold">{score}</span> / {MAX_Q}</p>
                  {score === MAX_Q ? (
                    <p className="text-green-600 font-bold text-xl">全問正解！おめでとう🎉</p>
                  ) : (
                    <p className="text-red-600 font-bold text-xl">また挑戦してね！</p>
                  )}
                  <div className="mt-4 flex gap-2 justify-center">
                    <Button onClick={() => startQuiz(mode!)}>もう一度</Button>
                    <Button variant="outline" onClick={() => { setMode(null); setHistory([]); setScore(0); setTotal(0); setIsFinished(false); }}>モード選択へ</Button>
                  </div>
                </CardContent>
              </Card>

              {/* 履歴（赤/緑） */}
              <div className="space-y-2">
                {history.map((h, i) => (
                  <div key={i} className="border rounded-lg p-3 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{i + 1}. {h.question}</div>
                      <div className={h.isCorrect ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                        {h.isCorrect ? "正解" : "不正解"}
                      </div>
                    </div>
                    <div className="mt-1 text-sm text-gray-700">
                      <div>正解：<span className="font-mono">{h.correct}</span></div>
                      <div>あなたの答え：<span className="font-mono">{h.user || "—"}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // 出題中
            <Card className="p-6">
              <CardContent>
                <p className="text-xl mb-3">{question}</p>

                {/* 入力欄（表示専用） */}
                <div className="mb-2">
                  <div className="border rounded px-3 py-2 text-right text-2xl bg-white select-none">
                    {answer.length ? answer : "…"}
                  </div>
                </div>

                <Keypad onInput={applyQuizKey} />

                {/* エラーメッセージを表示 */}
                {errorMsg && (
                  <p className="text-red-600 font-semibold mt-2">{errorMsg}</p>
                )}

                <div className="flex gap-2 mt-3">
                  <Button onClick={checkAnswer}>回答する</Button>
                </div>
              </CardContent>
            </Card>


          )}
        </div>

    </div>
  );
}
