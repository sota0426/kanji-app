import json
import re
import csv

# TypeScript構文の配列だけを貼り付けたファイル（例: ts_data.txt）
with open(r'public\busyuData copy.txt', 'r', encoding='utf-8') as f:
    ts_data = f.read()

# ステップ1: コメントを削除（// や /* */ を削除）
ts_data = re.sub(r'//.*', '', ts_data)
ts_data = re.sub(r'/\*.*?\*/', '', ts_data, flags=re.DOTALL)

# ステップ2: キーにダブルクォートをつける（例: char: → "char":）
ts_data = re.sub(r'(\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:', r'\1"\2":', ts_data)

# ステップ3: シングルクォートをダブルクォートに変換
ts_data = ts_data.replace("'", '"')

# ステップ4: 末尾のカンマを削除（オブジェクトや配列の中で）
ts_data = re.sub(r',(\s*[}\]])', r'\1', ts_data)

# ステップ5: JSONとして読み込み
try:
    busyu_data = json.loads(ts_data)

    # 集計処理
    results = []
    for entry in busyu_data:
        radical = entry['radical']
        kanji_count = len(entry['kanji'])
        results.append({'部首': radical, '漢字数': kanji_count})

    # CSV出力
    with open('busyu_kanji_counts.csv', 'w', newline='', encoding='utf-8-sig') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=['部首', '漢字数'])
        writer.writeheader()
        writer.writerows(results)

    print("✅ CSVファイル 'busyu_kanji_counts.csv' を出力しました。")

except json.JSONDecodeError as e:
    print("❌ JSONとして読み込めませんでした:", e)
