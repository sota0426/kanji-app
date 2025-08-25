"use client";

import Link from "next/link";

export default function Home() {
  const quizzes = [
    {
      title: "部首漢字ゲーム",
      description: "部首から漢字を連想して答えるクイズ",
      path: "/busyu",
      disabled: false,
      genre: "漢字",
      difficulty: "",
      icon: "📝"
    },
    {
      title: "部首当てクイズ",
      description: "漢字の部首を答える４択クイズ",
      path: "/busyuate", 
      disabled: false,
      genre: "漢字",
      difficulty: "",
      icon: "🔍"
    },
    {
      title: "四字熟語当てクイズ",
      description: "意味から四字熟語を答える４択クイズ",
      path: "/yojiimi", 
      disabled: false,
      genre: "漢字",
      difficulty: "",
      icon: "📚"
    },      
    {
      title: "２×２の掛け算クイズ",
      description: "２×２の掛け算をひたすら行う",
      path: "/kakezan", 
      disabled: false,
      genre: "算数",
      difficulty: "",
      icon: "✖️"
    },    
    {
      title: "ルート（根号）の計算クイズ",
      description: "ルートの計算練習アプリ！",
      path: "/kongou", 
      disabled: false,
      genre: "算数",
      difficulty: "",
      icon: "√"
    },  
    {
      title: "組み合わせ・確率の計算クイズ",
      description: "カードやサイコロで組み合わせや確率を学ぶ！",
      path: "/kakuritu", 
      disabled: false,
      genre: "算数",
      difficulty: "",
      icon: "🎲"
    },  
  ];

  // ジャンル別にクイズをグループ化
  const groupedQuizzes = quizzes.reduce<Record<string, typeof quizzes>>((
    acc,
    quiz
  ) => {
    if (!acc[quiz.genre]) {
      acc[quiz.genre] = [];
    }
    acc[quiz.genre].push(quiz);
    return acc;
  }, {});

  // 難易度の色分け
// 難易度の色分け
const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case "初級": return "bg-green-100 text-green-800";
    case "中級": return "bg-yellow-100 text-yellow-800";
    case "上級": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

  // ジャンルの色分け
  const getGenreColor = (genre:string): string  => {
    switch (genre) {
      case "漢字": return "from-purple-400 to-pink-400";
      case "算数": return "from-blue-400 to-cyan-400";
      case "英語": return "from-green-400 to-emerald-400";
      default: return "from-gray-400 to-slate-400";
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
            学習クイズメニュー
          </h1>
          <p className="text-gray-600 text-lg">ジャンル別に選んで楽しく学習しよう！</p>
        </div>
        
        {Object.entries(groupedQuizzes).map(([genre, genreQuizzes]) => (
          <div key={genre} className="mb-12">
            <div className="flex items-center mb-6">
              <div className={`inline-block px-6 py-3 rounded-full bg-gradient-to-r ${getGenreColor(genre)} text-white font-bold text-xl shadow-lg`}>
                {genre}クイズ
              </div>
              <div className="flex-grow h-0.5 bg-gradient-to-r from-gray-300 to-transparent ml-4"></div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {genreQuizzes.map((quiz, index) => (
                <div
                  key={index}
                  className={`group relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                    quiz.disabled 
                      ? "bg-gray-100 cursor-not-allowed opacity-60" 
                      : "bg-white hover:bg-gradient-to-br hover:from-white hover:to-gray-50"
                  }`}
                >
                  {/* カードヘッダー */}
                  <div className={`h-2 bg-gradient-to-r ${getGenreColor(quiz.genre)}`}></div>
                  
                  <div className="p-6">
                    {/* アイコンと難易度 */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-4xl">{quiz.icon}</div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(quiz.difficulty)}`}>
                        {quiz.difficulty}
                      </span>
                    </div>
                    
                    {/* タイトル */}
                    <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-purple-600 transition-colors">
                      {quiz.title}
                    </h3>
                    
                    {/* 説明 */}
                    <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                      {quiz.description}
                    </p>
                    
                    {/* ボタン */}
                    <div className="flex justify-center">
                      {!quiz.disabled ? (
                        <Link href={quiz.path}>
                          <span className={`inline-flex items-center px-6 py-3 rounded-xl font-bold text-white transition-all duration-200 bg-gradient-to-r ${getGenreColor(quiz.genre)} hover:shadow-lg hover:scale-105 transform`}>
                            <span>プレイする</span>
                            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </Link>
                      ) : (
                        <span className="inline-flex items-center px-6 py-3 rounded-xl font-bold text-gray-500 bg-gray-200">
                          近日公開予定
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* ホバーエフェクト */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {/* フッター */}
        <div className="text-center mt-16 text-gray-500">
          <p className="text-sm">新しいクイズを続々追加予定です！お楽しみに 🎉</p>
        </div>
      </div>
    </main>
  );
}