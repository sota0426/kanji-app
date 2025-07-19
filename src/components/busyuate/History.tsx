import { HistoryItem } from "@/types/kanji";

export function HistoryList({
  history,
  className = "",
}: {
  history: HistoryItem[];
  className?: string;
}) {
  if (!history.length) return null;

  return (
    <div
      className={`mt-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-4 ${className}`}
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">回答履歴</h3>
      <ul className="space-y-2 pr-2">
        {history.map((item, idx) => (
          <li
            key={`${item.correct}-${idx}`}
            className={`flex justify-between items-center p-3 rounded-lg border ${
              item.isCorrect
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div>
              <p className="font-bold text-gray-700">
                Q{idx + 1}. {item.kanji || "意味なし"}
              </p>
              {item.isCorrect ? (
              <p className="text-sm text-gray-500">
                正解: {item.correct}
              </p>
              ):(
              <p className="text-sm text-gray-500">
                選択: {item.choice ?? "未選択"} 　⇒　 正解: {item.correct}
              </p>
              )}
            </div>
            <div className="text-xl">
              {item.isCorrect ? "✔️" : "❌"}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
