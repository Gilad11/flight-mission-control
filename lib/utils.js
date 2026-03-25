import { RANK_ABBREVIATIONS, GROUP_TRANSLATIONS } from './constants';

// ── Formatting ───────────────────────────────────────────────────────────────

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

export function formatDateHebrew(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const months = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
  return `${days[date.getDay()]}, ${date.getDate()} ב${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatFlightDateLabel(dateStr) {
  return formatDateHebrew(dateStr);
}

export function formatDateEnglish(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// ── Rank Abbreviations ───────────────────────────────────────────────────────

export function abbreviateRank(rank) {
  if (!rank) return '';
  // Direct match
  if (RANK_ABBREVIATIONS[rank]) return RANK_ABBREVIATIONS[rank];
  // Try normalized (replace hyphens with spaces)
  const normalized = rank.replace(/-/g, ' ');
  if (RANK_ABBREVIATIONS[normalized]) return RANK_ABBREVIATIONS[normalized];
  // Try with hyphens
  const hyphenated = rank.replace(/\s+/g, '-');
  if (RANK_ABBREVIATIONS[hyphenated]) return RANK_ABBREVIATIONS[hyphenated];
  // Return original if no match
  return rank;
}

// ── Communication ────────────────────────────────────────────────────────────

export function phoneToWhatsApp(phone) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) return '972' + digits.slice(1);
  if (digits.startsWith('972')) return digits;
  return '972' + digits;
}

export function directionLabel(direction) {
  return direction === 'incoming' ? 'נכנסים' : 'יוצאים';
}

export function directionLabelEnglish(direction) {
  return direction === 'incoming' ? 'Arriving' : 'Departing';
}

export function directionEmoji(direction) {
  return direction === 'incoming' ? '🛬' : '🛫';
}

// ── WhatsApp Summary ─────────────────────────────────────────────────────────

export function generateWhatsAppSummary(flight, travelers, lang = 'he') {
  if (!flight || !travelers.length) return '';

  if (lang === 'en') return generateWhatsAppSummaryEnglish(flight, travelers);
  return generateWhatsAppSummaryHebrew(flight, travelers);
}

function generateWhatsAppSummaryHebrew(flight, travelers) {
  const total = travelers.length;
  const hakhlaka = travelers.filter(t => t.passportCheck === 'החלקה').length;
  const dir = directionLabel(flight.direction);
  const emoji = directionEmoji(flight.direction);

  const GROUPS = ["טכנולוג׳יקל גרופ", "כיפה", 'מפע"ם', "איי סטאר", "מנהלת מלטים", "נספחות"];

  let groupLines = [];
  for (const group of GROUPS) {
    const groupTravelers = travelers.filter(t => t.group === group);
    if (!groupTravelers.length) continue;

    const count = groupTravelers.length;
    const poc = [...groupTravelers].sort((a, b) => a.serial - b.serial)[0];
    const hotel = poc.hotel || 'לא הוגדר';
    const hotelCount = groupTravelers.filter(t => t.hotel === hotel).length;
    const rooms = Math.ceil(hotelCount / 2);

    groupLines.push(`• ${count} - ${group}; POC ${poc.fullName} - ${hotel} - ${rooms} חדרים`);
  }

  return `✈️ *טיסה מס׳ ${flight.flightNumber}*
📅 תאריך: ${formatDate(flight.date)}
🕐 שעה: ${flight.time}

${emoji} *${dir}: ${total} נוסעים*
⚠️ החלקה: ${hakhlaka}

📋 *פירוט לפי קבוצות:*
${groupLines.join('\n')}`;
}

function generateWhatsAppSummaryEnglish(flight, travelers) {
  const total = travelers.length;
  const hakhlaka = travelers.filter(t => t.passportCheck === 'החלקה').length;
  const dir = directionLabelEnglish(flight.direction);
  const emoji = directionEmoji(flight.direction);

  const GROUPS = ["טכנולוג׳יקל גרופ", "כיפה", 'מפע"ם', "איי סטאר", "מנהלת מלטים", "נספחות"];

  let groupLines = [];
  for (const group of GROUPS) {
    const groupTravelers = travelers.filter(t => t.group === group);
    if (!groupTravelers.length) continue;

    const count = groupTravelers.length;
    const poc = [...groupTravelers].sort((a, b) => a.serial - b.serial)[0];
    const hotel = poc.hotel || 'N/A';
    const groupEn = GROUP_TRANSLATIONS[group] || group;
    const hotelCount = groupTravelers.filter(t => t.hotel === hotel).length;
    const rooms = Math.ceil(hotelCount / 2);

    groupLines.push(`• ${count} - ${groupEn}; POC ${poc.fullName} - ${hotel} - ${rooms} rooms`);
  }

  return `✈️ *Flight ${flight.flightNumber}*
📅 Date: ${formatDate(flight.date)}
🕐 Time: ${flight.time}

${emoji} *${dir}: ${total} passengers*
⚠️ Bypass (Hakhlaka): ${hakhlaka}

📋 *Group Breakdown:*
${groupLines.join('\n')}`;
}

// ── Excel Export ──────────────────────────────────────────────────────────────

export function exportToExcel(flight, travelers) {
  return import('xlsx').then(XLSX => {
    const data = travelers.map(t => ({
      'מס"ד': t.serial,
      'גוף': t.unit,
      'דרגה': t.rank,
      'שם מלא': t.fullName,
      'מ.א': t.militaryId,
      'ת.ז': t.nationalId,
      'דרכון': t.passport,
      'טלפון': t.phone,
      'קבוצה': t.group,
      'מלון': t.hotel,
      'הסעה הוזמנה': t.transportBooked ? 'כן' : 'לא',
      'בדיקת דרכון': t.passportCheck,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'נוסעים');
    XLSX.writeFile(wb, `טיסה_${flight.flightNumber}_${flight.date}.xlsx`);
  });
}

// ── Smart Paste ──────────────────────────────────────────────────────────────

export function parseSmartPaste(text) {
  const result = {};

  const extract = (pattern) => {
    const match = text.match(pattern);
    return match ? match[1].trim() : '';
  };

  result.fullName = extract(/שם:\s*(.+)/);
  result.nationalId = extract(/תז:\s*(\d+)/);
  result.phone = extract(/טלפון:\s*([\d\-]+)/);
  result.group = extract(/קבוצה:\s*(.+)/);
  result.flightDate = extract(/טיסה:\s*([\d\/\-\.]+)/);
  result.direction = extract(/כיוון:\s*(.+)/);

  if (result.flightDate) {
    const dateMatch = result.flightDate.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
    if (dateMatch) {
      const [, d, m, y] = dateMatch;
      const year = y.length === 2 ? '20' + y : y;
      result.flightDate = `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }

  if (result.direction) {
    const lower = result.direction;
    if (lower.includes('נכנס') || lower.includes('מגיע') || lower.includes('incoming')) {
      result.direction = 'incoming';
    } else if (lower.includes('יוצ') || lower.includes('עוזב') || lower.includes('outgoing')) {
      result.direction = 'outgoing';
    }
  }

  return result;
}
