export const GROUPS = [
  "טכנולוג׳יקל גרופ",
  "כיפה",
  'מפע"ם',
  "איי סטאר",
  "מנהלת מלטים",
  "נספחות"
];

export const GROUP_COLORS = {
  "טכנולוג׳יקל גרופ": { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300", border: "border-blue-300 dark:border-blue-700" },
  "כיפה": { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300", border: "border-purple-300 dark:border-purple-700" },
  'מפע"ם': { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300", border: "border-orange-300 dark:border-orange-700" },
  "איי סטאר": { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300", border: "border-green-300 dark:border-green-700" },
  "מנהלת מלטים": { bg: "bg-teal-100 dark:bg-teal-900/30", text: "text-teal-700 dark:text-teal-300", border: "border-teal-300 dark:border-teal-700" },
  "נספחות": { bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-700 dark:text-rose-300", border: "border-rose-300 dark:border-rose-700" }
};

export const RANKS = [
  "טוראי", "רב-טוראי", "סמל", "סמל ראשון", "רב-סמל",
  "סמל מצטיין", "רב-סמל מצטיין", "סגן משנה", "סגן",
  "סרן", "רב סרן", "סגן אלוף", "אלוף-משנה", "אלוף", "רב-אלוף"
];

// Rank abbreviation mapping: full name -> abbreviation
export const RANK_ABBREVIATIONS = {
  "רב-אלוף": 'רא"ל',
  "רב אלוף": 'רא"ל',
  "אלוף": "אלוף",
  "אלוף-משנה": 'אלו"מ',
  "אלוף משנה": 'אלו"מ',
  "תת-אלוף": 'תא"ל',
  "תת אלוף": 'תא"ל',
  "סגן-אלוף": 'סא"ל',
  "סגן אלוף": 'סא"ל',
  "רב-סרן": 'רס"ן',
  "רב סרן": 'רס"ן',
  "סרן": "סרן",
  "סגן": "סגן",
  "סגן-משנה": 'סג"מ',
  "סגן משנה": 'סג"מ',
  "רב-סמל מצטיין": 'רסמ"צ',
  "רב סמל מצטיין": 'רסמ"צ',
  "רב-סמל": 'רס"ל',
  "רב סמל": 'רס"ל',
  "סמל מצטיין": 'סמ"צ',
  "סמל ראשון": 'סמ"ר',
  "סמל": "סמל",
  "רב-טוראי": 'רב"ט',
  "רב טוראי": 'רב"ט',
  "טוראי": "טוראי",
};

// Group English translations
export const GROUP_TRANSLATIONS = {
  "טכנולוג׳יקל גרופ": "Technological Group",
  "כיפה": "Kipa",
  'מפע"ם': "Mapa\"m",
  "איי סטאר": "I-Star",
  "מנהלת מלטים": "Malta Administration",
  "נספחות": "Attache Office"
};

// Default hotel security ratings (1-5)
export const DEFAULT_HOTEL_RATINGS = {
  "דן": 5,
  "הילטון": 4,
  "פנינסולה": 4,
  "קינג דייוויד": 5,
  "שרתון": 3,
  "הרודס": 3
};
