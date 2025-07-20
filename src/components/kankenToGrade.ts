
export const kankenToGrade = (level: number): string => {
  switch (level) {
    case 10: return "小学1年生(10級)";
    case 9: return "小学2年生(9級)";
    case 8: return "小学3年生(8級)";
    case 7: return "小学4年生(7級)";
    case 6: return "小学5年生(6級)";
    case 5: return "小学6年生(5級)";
    case 4: return "中学生レベル(4級)";
    case 3: return "中学生レベル(3級)";
    case 2.5: return "高校生レベル（準2級）";
    case 2: return "高校生レベル（2級）";
    case 1.5: return "大学・社会人（準1級）";
    case 1: return "大学・社会人（1級）";
    default: return "不明";
  }
};


export const kankenToGakusei = (level: number): string => {
  switch (level) {
    case 10: return "小学1年生";
    case 9: return "小学2年生";
    case 8: return "小学3年生";
    case 7: return "小学4年生";
    case 6: return "小学5年生";
    case 5: return "小学6年生";
    case 4: return "中学生レベル";
    case 3: return "中学生レベル";
    case 2.5: return "高校生レベル";
    case 2: return "高校生レベル";
    case 1.5: return "大学・社会人";
    case 1: return "大学・社会人";
    default: return "不明";
  }
};