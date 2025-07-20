"use client";

import Link from "next/link";

export default function Home() {
  const quizzes = [
    {
      title: "部首漢字ゲーム",
      description: "部首から漢字を連想して答えるクイズ",
      path: "/busyu",
      disabled: false,      
    },
    {
      title: "漢字当てクイズ",
      description: "漢字１文字の音読み・訓読みを答えるクイズ",
      path: "/kanjiate", 
      disabled: true,
    },    // 追加クイズがあればここに追記
    {
      title: "部首当てクイズ",
      description: "漢字の部首を答える４択クイズ",
      path: "/busyuate", 
      disabled: false,
    },
    {
      title: "四字熟語当てクイズ",
      description: "意味から四字熟語を答える４択クイズ",
      path: "/yojiimi", 
      disabled: false,
    },    // 追加クイズがあればここに追記
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">漢字クイズメニュー</h1>
        
        <div className="grid md:grid-cols-1 gap-6">
          {quizzes.map((quiz, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl shadow-lg transition-transform transform hover:scale-105 ${
                quiz.disabled ? "bg-gray-200 cursor-not-allowed opacity-60" : "bg-white"
              }`}
            >
              <h2 className="text-2xl font-bold mb-2">{quiz.title}</h2>
              <p className="text-gray-600 mb-4">{quiz.description}</p>
              {!quiz.disabled && (
                <Link href={quiz.path}>
                  <span className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                    プレイする
                  </span>
                </Link>
              )}
              {quiz.disabled && <span className="text-sm text-gray-500">近日公開予定</span>}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
