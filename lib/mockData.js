export const MOCK_FLIGHTS = [
  {
    id: "flight_001",
    flightNumber: "TK1580",
    date: "2026-03-27",
    time: "14:30",
    direction: "outgoing"
  },
  {
    id: "flight_002",
    flightNumber: "LY315",
    date: "2026-03-31",
    time: "09:15",
    direction: "incoming"
  },
  {
    id: "flight_003",
    flightNumber: "W63821",
    date: "2026-03-20",
    time: "11:00",
    direction: "outgoing"
  }
];

export const MOCK_TRAVELERS = [
  // Flight 001 - TK1580 - outgoing - 2026-03-27
  { id: "t001", flightId: "flight_001", serial: 1, unit: "8200", rank: "סגן", fullName: "ישראל כהן", militaryId: "7123456", nationalId: "012345678", passport: "21234567", phone: "0521234567", group: "טכנולוג׳יקל גרופ", hotel: "דן", transportBooked: true, passportCheck: "V", isArchived: false, createdAt: "2026-03-20T10:00:00Z" },
  { id: "t002", flightId: "flight_001", serial: 2, unit: "81", rank: "סרן", fullName: "שרה לוי", militaryId: "7234567", nationalId: "023456789", passport: "22345678", phone: "0532345678", group: "טכנולוג׳יקל גרופ", hotel: "דן", transportBooked: false, passportCheck: "החלקה", isArchived: false, createdAt: "2026-03-20T10:00:00Z" },
  { id: "t003", flightId: "flight_001", serial: 3, unit: "מג'ן", rank: "רב-סמל", fullName: "דוד אברהם", militaryId: "7345678", nationalId: "034567890", passport: "23456789", phone: "0543456789", group: "כיפה", hotel: "פנינסולה", transportBooked: true, passportCheck: "V", isArchived: false, createdAt: "2026-03-20T10:00:00Z" },
  { id: "t004", flightId: "flight_001", serial: 4, unit: "אמ\"ן", rank: "אלוף-משנה", fullName: "רחל גולן", militaryId: "7456789", nationalId: "045678901", passport: "24567890", phone: "0554567890", group: "כיפה", hotel: "פנינסולה", transportBooked: true, passportCheck: "V", isArchived: false, createdAt: "2026-03-20T10:00:00Z" },
  { id: "t005", flightId: "flight_001", serial: 5, unit: "חיל האוויר", rank: "סגן", fullName: "מיכאל ברק", militaryId: "7567890", nationalId: "056789012", passport: "25678901", phone: "0565678901", group: 'מפע"ם', hotel: "הילטון", transportBooked: false, passportCheck: "החלקה", isArchived: false, createdAt: "2026-03-20T10:00:00Z" },
  { id: "t006", flightId: "flight_001", serial: 6, unit: "מטכ\"ל", rank: "רב-אלוף", fullName: "אורית שמיר", militaryId: "7678901", nationalId: "067890123", passport: "26789012", phone: "0576789012", group: 'מפע"ם', hotel: "הילטון", transportBooked: true, passportCheck: "V", isArchived: false, createdAt: "2026-03-20T10:00:00Z" },
  { id: "t007", flightId: "flight_001", serial: 7, unit: "חיל הים", rank: "סמל", fullName: "יוסי מזרחי", militaryId: "7789012", nationalId: "078901234", passport: "27890123", phone: "0587890123", group: "איי סטאר", hotel: "קינג דייוויד", transportBooked: true, passportCheck: "V", isArchived: false, createdAt: "2026-03-20T10:00:00Z" },
  { id: "t008", flightId: "flight_001", serial: 8, unit: "פיקוד מרכז", rank: "אלוף", fullName: "נועה כץ", militaryId: "7890123", nationalId: "089012345", passport: "28901234", phone: "0598901234", group: "איי סטאר", hotel: "קינג דייוויד", transportBooked: false, passportCheck: "החלקה", isArchived: false, createdAt: "2026-03-20T10:00:00Z" },
  { id: "t009", flightId: "flight_001", serial: 9, unit: "8200", rank: "סגן-אלוף", fullName: "אלי פרץ", militaryId: "7901234", nationalId: "090123456", passport: "29012345", phone: "0509012345", group: "מנהלת מלטים", hotel: "שרתון", transportBooked: true, passportCheck: "V", isArchived: false, createdAt: "2026-03-20T10:00:00Z" },
  { id: "t010", flightId: "flight_001", serial: 10, unit: "מג'ן", rank: "טוראי", fullName: "תמר ניסים", militaryId: "8012345", nationalId: "001234567", passport: "30123456", phone: "0510123456", group: "נספחות", hotel: "הרודס", transportBooked: true, passportCheck: "V", isArchived: false, createdAt: "2026-03-20T10:00:00Z" },

  // Flight 002 - LY315 - incoming - 2026-03-31
  { id: "t011", flightId: "flight_002", serial: 1, unit: "81", rank: "רב-סמל", fullName: "בנימין שפירא", militaryId: "8123456", nationalId: "012345679", passport: "31234567", phone: "0521234568", group: "טכנולוג׳יקל גרופ", hotel: "דן", transportBooked: true, passportCheck: "V", isArchived: false, createdAt: "2026-03-21T10:00:00Z" },
  { id: "t012", flightId: "flight_002", serial: 2, unit: "אמ\"ן", rank: "סרן", fullName: "חנה רוזן", militaryId: "8234567", nationalId: "023456780", passport: "32345678", phone: "0532345679", group: "כיפה", hotel: "פנינסולה", transportBooked: false, passportCheck: "החלקה", isArchived: false, createdAt: "2026-03-21T10:00:00Z" },
  { id: "t013", flightId: "flight_002", serial: 3, unit: "חיל האוויר", rank: "סגן", fullName: "גבי ויס", militaryId: "8345678", nationalId: "034567891", passport: "33456789", phone: "0543456780", group: 'מפע"ם', hotel: "הילטון", transportBooked: true, passportCheck: "V", isArchived: false, createdAt: "2026-03-21T10:00:00Z" },
  { id: "t014", flightId: "flight_002", serial: 4, unit: "מטכ\"ל", rank: "אלוף-משנה", fullName: "לילה עמר", militaryId: "8456789", nationalId: "045678902", passport: "34567890", phone: "0554567891", group: "איי סטאר", hotel: "קינג דייוויד", transportBooked: true, passportCheck: "V", isArchived: false, createdAt: "2026-03-21T10:00:00Z" },
  { id: "t015", flightId: "flight_002", serial: 5, unit: "חיל הים", rank: "רב-אלוף", fullName: "שלמה חדד", militaryId: "8567890", nationalId: "056789013", passport: "35678901", phone: "0565678902", group: "מנהלת מלטים", hotel: "שרתון", transportBooked: false, passportCheck: "החלקה", isArchived: false, createdAt: "2026-03-21T10:00:00Z" },
  { id: "t016", flightId: "flight_002", serial: 6, unit: "8200", rank: "סמל ראשון", fullName: "ורד גרין", militaryId: "8678901", nationalId: "067890124", passport: "36789012", phone: "0576789013", group: "נספחות", hotel: "הרודס", transportBooked: true, passportCheck: "V", isArchived: false, createdAt: "2026-03-21T10:00:00Z" },

  // Flight 003 - W63821 - past - 2026-03-20 (for history)
  { id: "t017", flightId: "flight_003", serial: 1, unit: "81", rank: "סגן", fullName: "אמיר דוד", militaryId: "9001234", nationalId: "090012345", passport: "40012345", phone: "0520012345", group: "כיפה", hotel: "פנינסולה", transportBooked: true, passportCheck: "V", isArchived: false, createdAt: "2026-03-15T10:00:00Z" },
  { id: "t018", flightId: "flight_003", serial: 2, unit: "מג'ן", rank: "סרן", fullName: "מיה פישר", militaryId: "9012345", nationalId: "090123456", passport: "40123456", phone: "0530123456", group: "איי סטאר", hotel: "הילטון", transportBooked: false, passportCheck: "החלקה", isArchived: false, createdAt: "2026-03-15T10:00:00Z" },
  // One archived traveler
  { id: "t019", flightId: "flight_001", serial: 11, unit: "אמ\"ן", rank: "סמל", fullName: "ניר שלום", militaryId: "9123456", nationalId: "091234567", passport: "41234567", phone: "0541234567", group: "כיפה", hotel: "פנינסולה", transportBooked: false, passportCheck: "V", isArchived: true, createdAt: "2026-03-20T10:00:00Z" }
];
