
export const kankenToGrade = (level: number): string => {
  switch (level) {
    case 10: return "小学校1年生";
    case 9: return "小学校2年生";
    case 8: return "小学校3年生";
    case 7: return "小学校4年生";
    case 6: return "小学校5年生";
    case 5: return "小学校6年生";
    case 4: return "中学生以上";
    case 3: return "中学生以上";
    case 2.5: return "高校生レベル（準2級）";
    case 2: return "高校生レベル（2級）";
    case 1.5: return "大学・社会人（準1級）";
    case 1: return "大学・社会人（1級）";
    default: return "不明";
  }
};