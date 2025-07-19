import re

# TypeScript ファイル名
input_file = "public\yojiData.ts"
output_file = "public\yojiData_out.ts"

# ファイル読み込み
with open(input_file, "r", encoding="utf-8") as f:
    content = f.read()

# 全ての meaning エントリを探して処理
def clean_meaning(match):
    full_match = match.group(0)
    radical = match.group(1)
    meaning = match.group(2)

    # 意味が「radicalとは、」で始まっていたら削除
    pattern = f"^{re.escape(radical)}とは、"
    cleaned_meaning = re.sub(pattern, '', meaning)

    # 再構築して返す
    return f'meaning: "{cleaned_meaning}"'

# meaning: "◯◯とは、..." の形式にマッチ（radical も参照）
pattern = r'radical:\s*"(.*?)".*?meaning:\s*"(.*?)"', re.DOTALL

# 全ての meaning に対して一括処理
content_cleaned = re.sub(
    r'radical:\s*"([^"]+?)"(.*?)meaning:\s*"([^"]+?)"',
    lambda m: m.group(0).replace(
        f'meaning: "{m.group(3)}"',
        f'meaning: "{re.sub(f"^{re.escape(m.group(1))}とは、", "", m.group(3))}"'
    ),
    content,
    flags=re.DOTALL
)

# 結果を保存
with open(output_file, "w", encoding="utf-8") as f:
    f.write(content_cleaned)

print(f"処理完了: {output_file} に保存されました。")
