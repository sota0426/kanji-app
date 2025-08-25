"use client";
import React, { useMemo, useState } from "react";
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

const RANK_LABEL = (n: number) =>
  ({ 1: "A", 11: "J", 12: "Q", 13: "K" } as Record<number, string>)[n] ||
  String(n);

// ====== 型 ======
type Mode = "menu" | "cards" | "coins" | "mixed";
type Difficulty = "easy" | "normal"; // cards用

type CardQType =
  | { kind: "perm5" }
  | { kind: "permFrom5"; k: number }
  | { kind: "combFrom5"; k: number }
  | { kind: "permNoAdjEqual" }
  | { kind: "sumEvenOdd"; k: number; even: boolean }
  | { kind: "mustContain"; k: number; target: number; count: number }
  | { kind: "posNoEndsA" }
  | { kind: "firstNotMax" }
  | { kind: "firstLessThanLast" };

type CoinQType =
  | { kind: "exactK"; n: number; k: number }
  | { kind: "atLeastK"; n: number; k: number }
  | { kind: "atMostK"; n: number; k: number };

// ====== ユーティリティ ======
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function buildDeckCounts() {
  const counts: Record<number, number> = {};
  for (let r = 1; r <= 13; r++) counts[r] = 4;
  return counts;
}
function dealHand(difficulty: Difficulty): number[] {
  if (difficulty === "easy") {
    const pool = Array.from({ length: 13 }, (_, i) => i + 1);
    const hand: number[] = [];
    for (let i = 0; i < 5; i++) {
      const idx = randomInt(0, pool.length - 1);
      hand.push(pool[idx]);
      pool.splice(idx, 1);
    }
    return hand;
  } else {
    const counts = buildDeckCounts();
    const hand: number[] = [];
    for (let i = 0; i < 5; i++) {
      const remaining: number[] = [];
      for (let r = 1; r <= 13; r++) if (counts[r] > 0) remaining.push(r);
      const pick = remaining[randomInt(0, remaining.length - 1)];
      hand.push(pick);
      counts[pick]!--;
    }
    return hand;
  }
}
function multisetPermutationCount(arr: number[]): number {
  const n = arr.length;
  const freq: Record<number, number> = {};
  for (const x of arr) freq[x] = (freq[x] || 0) + 1;
  const fact = (m: number): number => (m <= 1 ? 1 : m * fact(m - 1));
  let denom = 1;
  for (const v of Object.values(freq)) denom *= fact(v);
  return fact(n) / denom;
}
function countUniqueOrdered(
  hand: number[],
  k: number,
  pred?: (arr: number[]) => boolean
): number {
  const n = hand.length;
  const used = Array(n).fill(false);
  const set = new Set<string>();
  const cur: number[] = [];
  function dfs(depth: number) {
    if (depth === k) {
      if (!pred || pred(cur)) set.add(cur.join(","));
      return;
    }
    for (let i = 0; i < n; i++) {
      if (used[i]) continue;
      used[i] = true;
      cur.push(hand[i]);
      dfs(depth + 1);
      cur.pop();
      used[i] = false;
    }
  }
  dfs(0);
  return set.size;
}
function countUniqueCombinations(
  hand: number[],
  k: number,
  pred?: (multiset: number[]) => boolean
): number {
  const n = hand.length;
  const set = new Set<string>();
  const curIdx: number[] = [];
  function rec(start: number) {
    if (curIdx.length === k) {
      const multiset = curIdx.map((i) => hand[i]);
      if (!pred || pred(multiset)) {
        const key = [...multiset].sort((a, b) => a - b).join(",");
        set.add(key);
      }
      return;
    }
    for (let i = start; i < n; i++) {
      curIdx.push(i);
      rec(i + 1);
      curIdx.pop();
    }
  }
  rec(0);
  return set.size;
}
function nCk(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  let num = 1,
    den = 1;
  for (let i = 1; i <= k; i++) {
    num *= n - k + i;
    den *= i;
  }
  return Math.round(num / den);
}
const pow2 = (n: number) => 1 << n;
// 分数
function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}
function simplifyFraction(n: number, d: number): { n: number; d: number } {
  if (d === 0) return { n: NaN, d };
  const sign = d < 0 ? -1 : 1;
  n *= sign;
  d *= sign;
  const g = gcd(Math.abs(n), Math.abs(d)) || 1;
  return { n: n / g, d: d / g };
}
function parseFraction(input: string): { n: number; d: number } | null {
  const s = input.trim();
  if (s.includes("/")) {
    const [a, b] = s.split("/").map((x) => Number(x.trim()));
    if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
    const { n, d } = simplifyFraction(a, b);
    return { n, d };
  } else {
    const a = Number(s);
    if (!Number.isFinite(a)) return null;
    return simplifyFraction(a, 1);
  }
}
function fractionEqual(a: { n: number; d: number }, b: { n: number; d: number }) {
  return a.n === b.n && a.d === b.d;
}

// ====== 型ガード ======
function hasK(q: CardQType): q is Extract<CardQType, { k: number }> {
  return "k" in q;
}
function hasEven(q: CardQType): q is Extract<CardQType, { even: boolean }> {
  return "even" in q;
}
function hasTargetAndCount(
  q: CardQType
): q is Extract<CardQType, { target: number; count: number }> {
  return "target" in q && "count" in q;
}

// ====== 本体コンポーネント ======
export default function CombinatoricsQuizApp() {
  const [mode, setMode] = useState<Mode>("menu");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [popup, setPopup] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const [cardQ, setCardQ] = useState<CardQType>({ kind: "perm5" });
  const [coinQ, setCoinQ] = useState<CoinQType>({
    kind: "exactK",
    n: 4,
    k: 2,
  });

  const [hand, setHand] = useState<number[]>([]);
  const [userAnswer, setUserAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [wrong , setWrong] = useState<boolean | null>(null);

  const TOTAL_QUESTIONS = 5;

  function startGame(selected: Mode) {
    setMode(selected);
    setScore(0);
    setQIndex(0);
    setUserAnswer("");
    setRevealed(false);
    setShowConfetti(false);
    if (selected === "cards" || selected === "mixed") {
      setHand(dealHand(difficulty));
    }
  }
  function nextQuestion() {
    setWrong(false);
    if (mode === "cards" || (mode === "mixed" && qIndex % 2 === 0)) {
      setHand(dealHand(difficulty));
    }
    setUserAnswer("");
    setRevealed(false);
    setQIndex((i) => Math.min(TOTAL_QUESTIONS - 1, i + 1));
  }



  // ====== 問題テキスト＆答え計算 ======
  function calcCards() {
    let answer = 0;
    let text = "";
    let explain = "";
    if (cardQ.kind === "perm5") {
      answer = multisetPermutationCount(hand);
      text = `5枚 [${hand.map(RANK_LABEL).join(" ")}] を並び替える通り数は？`;
      explain = "多重集合の順列 n!/(a!b!…) で数える（全部ちがうなら 5!）。";
    } else if (cardQ.kind === "permFrom5") {
      answer = countUniqueOrdered(hand, cardQ.k);
      text = `5枚 [${hand.map(RANK_LABEL).join(" ")}] から ${cardQ.k} 枚を順に並べる通り数は？`;
      explain = "同じ見た目の並びは1通りにまとめて数える（重複除去）。";
    } else if (cardQ.kind === "combFrom5") {
      answer = countUniqueCombinations(hand, cardQ.k);
      text = `5枚 [${hand.map(RANK_LABEL).join(" ")}] から ${cardQ.k} 枚を取り出す（順序なし）通り数は？`;
      explain = "順序なし、同じ数は一つの集合として数える。";
    } else if (cardQ.kind === "permNoAdjEqual") {
      const pred = (arr: number[]) => arr.every((v, i) => i === 0 || v !== arr[i - 1]);
      answer = countUniqueOrdered(hand, 5, pred);
      text = `5枚 [${hand.map(RANK_LABEL).join(" ")}] を、同じ数が隣り合わないように並べる通り数は？`;
      explain = "隣どうしが同じになる並びを除いて数える。";
    } else if (cardQ.kind === "sumEvenOdd") {
      answer = countUniqueCombinations(hand, cardQ.k, (arr) => (arr.reduce((a,b)=>a+b,0) % 2 === (cardQ.even?0:1)));
      text = `5枚から ${cardQ.k} 枚取り出し、合計が${cardQ.even?"偶数":"奇数"}になる通り数は？`;
      explain = "取り出した集合の合計の偶奇でフィルタして数える。";
    } else if (cardQ.kind === "mustContain") {
      answer = countUniqueCombinations(hand, cardQ.k, (arr) => arr.filter(x=>x===cardQ.target).length===cardQ.count);
      text = `5枚から ${cardQ.k} 枚取り出し、「${RANK_LABEL(cardQ.target)}」をちょうど ${cardQ.count} 枚含む通り数は？`;
      explain = "特定の数の枚数を条件にして組合せを数える。";
    } else if (cardQ.kind === "posNoEndsA") {
      const pred = (arr:number[]) => arr.length===5 && arr[0]!==1 && arr[4]!==1;
      answer = countUniqueOrdered(hand, 5, pred);
      text = `5枚を並べる。A(=1)が両はしに来ない並びは何通り？`;
      explain = "位置条件でフィルタして数える。";
    } else if (cardQ.kind === "firstNotMax") {
      const max = Math.max(...hand);
      const pred = (arr:number[]) => arr.length===5 && arr[0]!==max;
      answer = countUniqueOrdered(hand, 5, pred);
      text = `5枚を並べる。先頭が最大の数でない並びは何通り？`;
      explain = "先頭の値に条件をつけて数える。";
    } else {
      const pred = (arr:number[]) => arr.length===5 && arr[0] < arr[4];
      answer = countUniqueOrdered(hand, 5, pred);
      text = `5枚を並べる。先頭の数 < 最後の数 となる並びは何通り？`;
      explain = "両端の大小関係でフィルタ。";
    }
    return { qtext: text, answer: String(answer), explanation: explain, isFraction: false };
  }

  function calcCoins() {
    const { n, k } = coinQ;
    const total = pow2(n);
    let fav = 0;
    if (coinQ.kind === "exactK") {
      fav = nCk(n, k);
    } else if (coinQ.kind === "atLeastK") {
      for (let i=k;i<=n;i++) fav += nCk(n,i);
    } else {
      for (let i=0;i<=k;i++) fav += nCk(n,i);
    }
    const { n: sn, d: sd } = simplifyFraction(fav, total);
    const kindLabel = coinQ.kind === "exactK" ? `ちょうど ${k} 個 表` : coinQ.kind === "atLeastK" ? `少なくとも ${k} 個 表` : `高々 ${k} 個 表`;
    return {
      qtext: `コインを ${n} 回投げて、${kindLabel} となる確率は？（分数 a/b で答える）`,
      answer: `${sn}/${sd}`,
      explanation: `全事象は2^${n}=${total}通り、当たりは${fav}通り → 約分して ${sn}/${sd}`,
      isFraction: true,
    };
  }

  // mixed は 交互にカード/コインを出題
  const { qtext, answer, explanation, isFraction } = useMemo(() => {
    if (mode === "cards") return calcCards();
    if (mode === "coins") return calcCoins();
    if (mode === "mixed") return (qIndex % 2 === 0 ? calcCards() : calcCoins());
    return { qtext: "", answer: "", explanation: "", isFraction: false };
  }, [mode, hand, cardQ, coinQ, qIndex]);


  
  // ====== 判定 ======
  function check() {
    let ok = false;
    if (isFraction) {
      const user = parseFraction(userAnswer);
      const correct = parseFraction(answer)!;
      ok = !!user && fractionEqual(user, correct);
    } else {
      ok = userAnswer.trim() === String(answer);
    }

    if (ok) {
    setRevealed(true);

      setPopup(true);
      setWrong(false);
      setTimeout(() => setPopup(false), 800);
      setScore((s) => s + 1);
      const isLast = qIndex === TOTAL_QUESTIONS - 1;
      if (isLast) {
        const finalScore = ok ? score + 1 : score;
        if (finalScore === TOTAL_QUESTIONS) {
          setShowConfetti(true); // ✅ここで表示
        }
    }else{
      setTimeout(()=>nextQuestion(),2000)
    }
   }else{
    setWrong(true);
   }
  }

  // ====== メニュー画面 ======
  if (mode === "menu") {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <div className="mx-auto max-w-3xl p-6">
          <h1 className="text-3xl font-bold mb-4">場合の数クイズ（メニュー）</h1>
          <section className="mb-6 rounded-2xl border bg-white p-4 shadow grid gap-3">
            <h2 className="text-lg font-semibold">カード設定</h2>
            <div className="flex flex-wrap gap-2 items-center">
              <label className="text-sm">難易度</label>
              <select className="rounded-xl border px-3 py-2 text-sm" value={difficulty} onChange={(e)=>setDifficulty(e.target.value as Difficulty)}>
                <option value="easy">やさしい（全部ちがう）</option>
                <option value="normal">ふつう（同じ数もOK）</option>
              </select>


              <label className="text-sm ml-4">お題</label>
              <select
                className="rounded-xl border px-3 py-2 text-sm"
                value={cardQ.kind}
                onChange={(e) => {
                  const v = e.target.value as CardQType["kind"];
                  if (v === "perm5") setCardQ({ kind: "perm5" });
                  else if (v === "permFrom5") setCardQ({ kind: "permFrom5", k: 3 });
                  else if (v === "combFrom5") setCardQ({ kind: "combFrom5", k: 3 });
                  else if (v === "permNoAdjEqual") setCardQ({ kind: "permNoAdjEqual" });
                  else if (v === "sumEvenOdd") setCardQ({ kind: "sumEvenOdd", k: 3, even: true });
                  else if (v === "mustContain") setCardQ({ kind: "mustContain", k: 3, target: 7, count: 1 });
                  else if (v === "posNoEndsA") setCardQ({ kind: "posNoEndsA" });
                  else if (v === "firstNotMax") setCardQ({ kind: "firstNotMax" });
                  else setCardQ({ kind: "firstLessThanLast" });
                }}
              >
                <option value="perm5">5枚を並べ替える</option>
                <option value="permFrom5">5枚から k 枚を順に</option>
                <option value="combFrom5">5枚から k 枚（順序なし）</option>
                <option value="permNoAdjEqual">同数が隣り合わない並べ方</option>
                <option value="sumEvenOdd">合計の偶奇を指定</option>
                <option value="mustContain">特定ランクをちょうど c 枚含む</option>
                <option value="posNoEndsA">A が両端禁止</option>
                <option value="firstNotMax">先頭は最大でない</option>
                <option value="firstLessThanLast">先頭 &lt; 最後</option>
              </select>
            </div>

              {/* ▼▼ 追加入力は select の外に置く ▼▼ */}
              {hasK(cardQ) && (
                <>
                  <span className="text-sm">k</span>
                  <input
                    type="number"
                    className="w-20 rounded-xl border px-3 py-2 text-sm"
                    min={1}
                    max={5}
                    value={cardQ.k}
                    onChange={(e) => {
                      const k = Math.max(1, Math.min(5, Number(e.target.value)));
                      if (cardQ.kind === "permFrom5") setCardQ({ kind: "permFrom5", k });
                      if (cardQ.kind === "combFrom5") setCardQ({ kind: "combFrom5", k });
                      if (cardQ.kind === "sumEvenOdd" && hasEven(cardQ))
                        setCardQ({ kind: "sumEvenOdd", k, even: cardQ.even });
                      if (cardQ.kind === "mustContain" && hasTargetAndCount(cardQ))
                        setCardQ({ kind: "mustContain", k, target: cardQ.target, count: cardQ.count });
                    }}
                  />
                </>
              )}

              {cardQ.kind === "sumEvenOdd" && hasK(cardQ) && hasEven(cardQ) && (
                <>
                  <span className="text-sm">偶奇</span>
                  <select
                    className="rounded-xl border px-3 py-2 text-sm"
                    value={cardQ.even ? "even" : "odd"}
                    onChange={(e) =>
                      setCardQ({ kind: "sumEvenOdd", k: cardQ.k, even: e.target.value === "even" })
                    }
                  >
                    <option value="even">偶数</option>
                    <option value="odd">奇数</option>
                  </select>
                </>
              )}

              {cardQ.kind === "mustContain" && hasK(cardQ) && hasTargetAndCount(cardQ) && (
                <>
                  <span className="text-sm">ターゲット数</span>
                  <input
                    type="number"
                    min={1}
                    max={13}
                    className="w-20 rounded-xl border px-3 py-2 text-sm"
                    value={cardQ.target}
                    onChange={(e) =>
                      setCardQ({
                        kind: "mustContain",
                        k: cardQ.k,
                        target: Math.max(1, Math.min(13, Number(e.target.value))),
                        count: cardQ.count,
                      })
                    }
                  />
                  <span className="text-sm">枚数</span>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    className="w-20 rounded-xl border px-3 py-2 text-sm"
                    value={cardQ.count}
                    onChange={(e) =>
                      setCardQ({
                        kind: "mustContain",
                        k: cardQ.k,
                        target: cardQ.target,
                        count: Math.max(0, Math.min(5, Number(e.target.value))),
                      })
                    }
                  />
                </>
              )}

          </section>

          <section className="mb-6 rounded-2xl border bg-white p-4 shadow grid gap-3">
            <h2 className="text-lg font-semibold">コイン設定（分数で答える）</h2>
            <div className="flex flex-wrap gap-2 items-center">
              <label className="text-sm">お題</label>
              <select className="rounded-xl border px-3 py-2 text-sm" value={coinQ.kind}
                onChange={(e)=>{
                  const v = e.target.value as CoinQType["kind"];
                  if (v === "exactK") setCoinQ({kind:"exactK", n:4, k:2});
                  else if (v === "atLeastK") setCoinQ({kind:"atLeastK", n:4, k:2});
                  else setCoinQ({kind:"atMostK", n:4, k:2});
                }}>
                <option value="exactK">ちょうど k 個 表</option>
                <option value="atLeastK">少なくとも k 個 表</option>
                <option value="atMostK">高々 k 個 表</option>
              </select>
              <span className="text-sm">n（回数）</span>
              <input type="number" min={1} max={15} className="w-24 rounded-xl border px-3 py-2 text-sm"
                value={coinQ.n}
                onChange={(e)=>{
                  const n = Math.max(1, Math.min(15, Number(e.target.value)));
                  setCoinQ({ ...coinQ, n, k: Math.min(coinQ.k, n) });
                }} />
              <span className="text-sm">k</span>
              <input type="number" min={0} max={coinQ.n} className="w-20 rounded-xl border px-3 py-2 text-sm"
                value={coinQ.k}
                onChange={(e)=>{
                  const k = Math.max(0, Math.min(coinQ.n, Number(e.target.value)));
                  setCoinQ({ ...coinQ, k });
                }} />
            </div>
          </section>

          <section className="flex flex-wrap gap-3">
            <button onClick={()=>startGame("cards")} className="rounded-xl border bg-blue-600 text-white px-5 py-3 shadow">トランプ 5問に挑戦</button>
            <button onClick={()=>startGame("coins")} className="rounded-xl border bg-green-600 text-white px-5 py-3 shadow">コイン 5問に挑戦</button>
            <button onClick={()=>startGame("mixed")} className="rounded-xl border bg-purple-600 text-white px-5 py-3 shadow">ミックス（交互に5問）</button>
          </section>
        </div>
      </div>
    );
  }

  // ====== プレイ画面 ======
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-3xl p-6">

        {/* 🎉 全問正解クラッカー */}
        {showConfetti && <Confetti />}

        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">問題 {qIndex + 1}/{TOTAL_QUESTIONS}（得点 {score}）</h1>
          <button className="text-sm underline" onClick={()=>setMode("menu")}>メニューへ戻る</button>
        </header>

        <section className="mb-4 rounded-2xl border bg-white p-4 shadow grid gap-3">
          <h2 className="text-lg font-semibold">問題</h2>
          <p className="text-base">{qtext}</p>
          {(mode === "cards" || (mode === "mixed" && qIndex % 2 === 0)) && (
            <div className="flex items-center justify-between gap-3">
              <div className="text-2xl font-mono tracking-wider">
                {hand.map((r, i) => (
                  <span key={i} className="mr-2 inline-block rounded-xl bg-gray-100 px-3 py-1">{RANK_LABEL(r)}</span>
                ))}
              </div>
              <div className="text-sm opacity-70">難易度：{difficulty === "easy" ? "やさしい（全異）" : "ふつう（重複あり）"}</div>
            </div>
          )}
        </section>

      <section className="mb-6 rounded-2xl border bg-white p-4 shadow grid gap-3">
        <div className="flex items-center gap-2">
          <input
            type={isFraction ? "text" : "number"}
            inputMode={isFraction ? "text" : "numeric"}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder={isFraction ? "分数で入力（例 3/8）" : "数字で答えてね"}
            className="w-56 rounded-xl border px-3 py-2 text-base"
          />
          </div>
          <div className="flex items-center gap-2">
          <button
            onClick={check}
            className="rounded-xl border bg-emerald-600 px-4 py-2 font-semibold text-white shadow hover:bg-emerald-700"
          >
            こたえ合わせ
          </button>
          <button
            onClick={() => { setRevealed(true); setUserAnswer(String(answer)); }}
            className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
          >
            こたえを見る
          </button>
          {qIndex < TOTAL_QUESTIONS - 1 && (
            <button
              onClick={nextQuestion}
              className="ml-auto rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
            >
              次の問題 ▶
            </button>
          )}
        </div>

        {revealed && (
          <div className="mt-3 rounded-xl bg-gray-50 p-3">
            <div className="text-base">
              正解：<span className="font-bold">{answer}</span>
            </div>
            <div className="text-sm opacity-80">{explanation}</div>
            {userAnswer !== "" && (
              <div className="mt-2 text-sm">
                あなたの答え：<b>{userAnswer}</b>
              </div>
            )}
          </div>
        )}

        {/* ❌間違い時のメッセージ */}
        {wrong && (
          <div className="mt-3 text-red-600 font-bold">
            ❌ 間違いです。もう一度チャレンジしてね！
          </div>
        )}
      </section>

      {qIndex === TOTAL_QUESTIONS - 1 && (
        <section className="rounded-2xl border bg-white p-4 shadow text-center">
          <div className="text-lg font-semibold">ゲーム終了！ 得点 {score}/{TOTAL_QUESTIONS}</div>
          <div className="mt-2 text-sm text-gray-600">全問正解でクラッカーが鳴るよ！</div>
          <div className="mt-4">
            <button className="rounded-xl border bg-blue-600 text-white px-4 py-2" onClick={()=>setMode("menu")}>もう一度メニューへ</button>
          </div>
        </section>
      )}

      <footer className="mt-6 grid gap-1 text-center text-xs text-gray-500">
        <div>© 2025 場合の数トランプ&コインクイズ</div>
      </footer>
    </div>

    {/* ✅ 正解ポップアップ */}
    <Popup message="正解！" show={popup} />
  </div>
)};