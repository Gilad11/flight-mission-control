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

// Alias for backward compatibility
export function formatFlightDateLabel(dateStr) {
  return formatDateHebrew(dateStr);
}

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

export function directionEmoji(direction) {
  return direction === 'incoming' ? '🛬' : '🛫';
}

export function generateWhatsAppSummary(flight, travelers) {
  if (!flight || !travelers.length) return '';

  const total = travelers.length;
  const hakhlaka = travelers.filter(t => t.passportCheck === 'החלקה').length;
  const dir = directionLabel(flight.direction);
  const dirEmoji = directionEmoji(flight.direction);

  const GROUPS = ["טכנולוג׳יקל גרופ", "כיפה", 'מפע"ם', "איי סטאר", "מנהלת מלטים", "נספחות"];

  let groupLines = [];
  for (const group of GROUPS) {
    const groupTravelers = travelers.filter(t => t.group === group);
    if (!groupTravelers.length) continue;

    const count = groupTravelers.length;
    const poc = groupTravelers.sort((a, b) => a.serial - b.serial)[0];
    const hotel = poc.hotel || 'לא הוגדר';
    const hotelCount = groupTravelers.filter(t => t.hotel === hotel).length;
    const rooms = Math.ceil(hotelCount / 2);

    groupLines.push(`• ${count} - ${group}; POC ${poc.fullName} - ${hotel} - ${rooms} חדרים`);
  }

  return `✈️ *טיסה מס׳ ${flight.flightNumber}*
📅 תאריך: ${formatDate(flight.date)}
🕐 שעה: ${flight.time}

${dirEmoji} *${dir}: ${total} נוסעים*
⚠️ החלקה: ${hakhlaka}

📋 *פירוט לפי קבוצות:*
${groupLines.join('\n')}`;
}

export function exportToExcel(flight, travelers) {
  // Dynamic import xlsx
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

  // Normalize flight date to YYYY-MM-DD
  if (result.flightDate) {
    const dateMatch = result.flightDate.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
    if (dateMatch) {
      const [, d, m, y] = dateMatch;
      const year = y.length === 2 ? '20' + y : y;
      result.flightDate = `${year}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
    }
  }

  // Normalize direction
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
