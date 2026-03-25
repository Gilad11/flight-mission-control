'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  Plane, Users, Hotel, Download, MessageSquare, Filter,
  ChevronUp, ChevronDown, RefreshCw, Search, X, Check,
  ExternalLink, ArrowUpDown, Star, ArrowRight, Globe
} from 'lucide-react';
import Toast, { showToast } from '@/components/Toast';
import { getTodaysFlights, getTravelersForFlight, getHotelRatings, getTravelers } from '@/lib/storage';
import { formatDate, formatDateHebrew, phoneToWhatsApp, directionLabel, directionEmoji, generateWhatsAppSummary, exportToExcel, abbreviateRank } from '@/lib/utils';
import { GROUPS, GROUP_COLORS } from '@/lib/constants';

// ── Star rating display ──────────────────────────────────────────────────────
function StarRating({ rating = 0 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
        />
      ))}
    </div>
  );
}

// ── Group Summary Cards (top of dashboard) ───────────────────────────────────
function GroupSummaryCards({ allTravelers }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
      {GROUPS.map(group => {
        const colors = GROUP_COLORS[group] || {};
        const count = allTravelers.filter(t => t.group === group).length;
        return (
          <div
            key={group}
            className={`rounded-xl border px-4 py-3 shadow-sm ${colors.bg} ${colors.border}`}
          >
            <div className={`text-3xl font-extrabold ${colors.text}`}>{count}</div>
            <div className={`text-xs font-semibold mt-1 ${colors.text} opacity-80`}>{group}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Hotel Analytics - clickable cards with security rating ───────────────────
function HotelAnalytics({ travelers, hotelRatings, onHotelClick }) {
  const hotelCounts = useMemo(() => {
    const map = {};
    travelers.forEach(t => {
      if (t.hotel) map[t.hotel] = (map[t.hotel] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [travelers]);

  if (!hotelCounts.length) return null;

  return (
    <div className="flex flex-wrap gap-3 mb-4">
      {hotelCounts.map(([hotel, count]) => (
        <button
          key={hotel}
          onClick={() => onHotelClick(hotel)}
          className="flex flex-col gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600 transition-all text-right group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Hotel className="w-4 h-4 text-indigo-500" />
            <span className="font-semibold text-gray-900 dark:text-gray-100">{hotel}</span>
            <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-400 transition-colors mr-auto" />
          </div>
          <div className="flex items-center justify-between gap-3">
            <StarRating rating={hotelRatings[hotel] || 0} />
            <span className="text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full text-xs">
              {count} אנשים
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

// ── Hotel Detail Modal ───────────────────────────────────────────────────────
function HotelDetailView({ hotel, allTravelers, allHotels, hotelRatings, onChangeHotel, onClose }) {
  const travelers = allTravelers.filter(t => t.hotel === hotel);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl border border-gray-200 dark:border-gray-700 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Hotel className="w-6 h-6 text-indigo-500" />
            <div>
              <div className="flex items-center gap-3">
                <select
                  value={hotel}
                  onChange={e => onChangeHotel(e.target.value)}
                  className="text-lg font-bold bg-transparent border-none outline-none cursor-pointer text-gray-900 dark:text-white"
                >
                  {allHotels.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <StarRating rating={hotelRatings[hotel] || 0} />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{travelers.length} אנשים מאוכלסים</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1 p-5">
          {travelers.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Hotel className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>אין נוסעים במלון זה</p>
            </div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
                  <th className="px-3 py-2.5 text-right font-semibold rounded-tr-lg">שם מלא</th>
                  <th className="px-3 py-2.5 text-right font-semibold">דרגה</th>
                  <th className="px-3 py-2.5 text-right font-semibold">גוף</th>
                  <th className="px-3 py-2.5 text-right font-semibold">קבוצה</th>
                  <th className="px-3 py-2.5 text-right font-semibold">טלפון</th>
                  <th className="px-3 py-2.5 text-center font-semibold">הסעה</th>
                  <th className="px-3 py-2.5 text-center font-semibold rounded-tl-lg">בדיקת דרכון</th>
                </tr>
              </thead>
              <tbody>
                {travelers.map((t, idx) => {
                  const gc = GROUP_COLORS[t.group] || {};
                  return (
                    <tr key={t.id} className={`border-t border-gray-100 dark:border-gray-800 ${idx % 2 !== 0 ? 'bg-gray-50/40 dark:bg-gray-800/20' : ''}`}>
                      <td className="px-3 py-2.5 text-sm font-medium">{t.fullName}</td>
                      <td className="px-3 py-2.5 text-sm">{abbreviateRank(t.rank)}</td>
                      <td className="px-3 py-2.5 text-sm">{t.unit}</td>
                      <td className="px-3 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${gc.bg} ${gc.text} ${gc.border}`}>{t.group}</span>
                      </td>
                      <td className="px-3 py-2.5 text-sm">
                        <a href={`https://wa.me/${phoneToWhatsApp(t.phone)}`} target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline font-mono">{t.phone}</a>
                      </td>
                      <td className="px-3 py-2.5 text-center text-sm">{t.transportBooked ? '✓' : '—'}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${t.passportCheck === 'V' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                          {t.passportCheck === 'V' ? '✓ V' : 'החלקה'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Flight Footer ────────────────────────────────────────────────────────────
function FlightFooter({ flight, travelers }) {
  const total = travelers.length;
  const hakhlaka = travelers.filter(t => t.passportCheck === 'החלקה').length;
  const dir = directionLabel(flight.direction);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 rounded-b-xl">
      <div className="flex flex-wrap gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-gray-600 dark:text-gray-400">סה"כ {dir}:</span>
          <span className="font-bold text-gray-900 dark:text-white">{total}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-gray-600 dark:text-gray-400">סה"כ משתתפים:</span>
          <span className="font-bold text-gray-900 dark:text-white">{total}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-gray-600 dark:text-gray-400">סה"כ החלקה:</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">{hakhlaka}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {GROUPS.map(group => {
          const count = travelers.filter(t => t.group === group).length;
          if (!count) return null;
          const colors = GROUP_COLORS[group] || {};
          return (
            <div key={group} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
              <span className="font-semibold">{group}:</span>
              <span className="font-bold">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── WhatsApp Modal (bilingual) ───────────────────────────────────────────────
function WhatsAppModal({ flight, travelers, onClose }) {
  const [lang, setLang] = useState('he');
  const summary = generateWhatsAppSummary(flight, travelers, lang);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast(lang === 'he' ? 'הסיכום הועתק ללוח!' : 'Summary copied!', 'success');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-500" />
            סיכום לווטסאפ
          </h3>
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
              <button
                onClick={() => setLang('he')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${lang === 'he' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600' : 'text-gray-500'}`}
              >
                עברית
              </button>
              <button
                onClick={() => setLang('en')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${lang === 'en' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600' : 'text-gray-500'}`}
              >
                <Globe className="w-3 h-3" />
                English
              </button>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-5">
          <pre className={`bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm whitespace-pre-wrap font-[inherit] leading-relaxed text-gray-800 dark:text-gray-200 max-h-80 overflow-y-auto ${lang === 'en' ? 'text-left' : 'text-right'}`} dir={lang === 'en' ? 'ltr' : 'rtl'}>
            {summary}
          </pre>
        </div>
        <div className="flex gap-3 p-5 pt-0">
          <button
            onClick={copy}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold transition-all ${copied ? 'bg-green-500 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
          >
            {copied ? <Check className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
            {copied ? (lang === 'he' ? 'הועתק!' : 'Copied!') : (lang === 'he' ? 'העתק' : 'Copy')}
          </button>
          <button
            onClick={() => {
              window.open(`https://wa.me/?text=${encodeURIComponent(summary)}`, '_blank');
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-semibold transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            {lang === 'he' ? 'פתח בווטסאפ' : 'Open WhatsApp'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Read-only Flight Section ─────────────────────────────────────────────────
function FlightSection({ flight, travelers, hotelRatings, onHotelClick }) {
  const [filterGroup, setFilterGroup] = useState('');
  const [sortCol, setSortCol] = useState('serial');
  const [sortDir, setSortDir] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    let data = [...travelers];
    if (filterGroup) data = data.filter(t => t.group === filterGroup);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(t =>
        t.fullName?.toLowerCase().includes(q) ||
        t.unit?.toLowerCase().includes(q) ||
        t.hotel?.toLowerCase().includes(q) ||
        t.nationalId?.includes(q) ||
        t.militaryId?.includes(q)
      );
    }
    data.sort((a, b) => {
      let va = a[sortCol] ?? '';
      let vb = b[sortCol] ?? '';
      if (typeof va === 'number' && typeof vb === 'number') return sortDir === 'asc' ? va - vb : vb - va;
      if (typeof va === 'boolean') { va = va ? 1 : 0; vb = vb ? 1 : 0; }
      const cmp = String(va).localeCompare(String(vb), 'he');
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return data;
  }, [travelers, filterGroup, searchQuery, sortCol, sortDir]);

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  const Th = ({ children, col, className = '' }) => (
    <th
      className={`px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 first:rounded-tr-xl last:rounded-tl-xl select-none ${col ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''} ${className}`}
      onClick={col ? () => handleSort(col) : undefined}
    >
      <div className="flex items-center justify-center gap-1">
        {children}
        {col && <SortIcon col={col} />}
      </div>
    </th>
  );

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportToExcel(flight, filtered);
      showToast('הקובץ יוצא בהצלחה!', 'success');
    } catch (e) {
      showToast('שגיאה בייצוא', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mb-10">
      {/* Flight Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${flight.direction === 'incoming' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
            <Plane className={`w-5 h-5 ${flight.direction === 'incoming' ? 'text-green-600' : 'text-blue-600'} ${flight.direction === 'incoming' ? 'rotate-180' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">טיסה {flight.flightNumber}</h2>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${flight.direction === 'incoming' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                {directionEmoji(flight.direction)} {directionLabel(flight.direction)}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatDateHebrew(flight.date)} &bull; {flight.time}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleExport} disabled={exporting} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm disabled:opacity-60">
            <Download className="w-4 h-4 text-indigo-500" />
            {exporting ? 'מייצא...' : 'ייצוא לאקסל'}
          </button>
          <button onClick={() => setShowWhatsApp(true)} className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-medium transition-all shadow-sm">
            <MessageSquare className="w-4 h-4" />
            הפק סיכום לווטסאפ
          </button>
        </div>
      </div>

      {/* Hotel Analytics - clickable */}
      <HotelAnalytics travelers={travelers} hotelRatings={hotelRatings} onHotelClick={onHotelClick} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="חיפוש..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pr-9 pl-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-400" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)} className="text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-400">
            <option value="">כל הקבוצות</option>
            {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          {(filterGroup || searchQuery) && (
            <button onClick={() => { setFilterGroup(''); setSearchQuery(''); }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400 mr-auto">
          {filtered.length} מתוך {travelers.length} נוסעים
        </span>
      </div>

      {/* READ-ONLY Table — no מס"ד column */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <Th col="unit">גוף</Th>
                <Th col="rank">דרגה</Th>
                <Th col="fullName">שם מלא</Th>
                <Th col="militaryId">מ.א</Th>
                <Th col="nationalId">ת.ז</Th>
                <Th col="passport">דרכון</Th>
                <Th>טלפון</Th>
                <Th col="group">קבוצה</Th>
                <Th col="hotel">מלון</Th>
                <Th col="transportBooked">הסעה</Th>
                <Th>בדיקת דרכון</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-gray-400 dark:text-gray-600">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>לא נמצאו נוסעים</p>
                  </td>
                </tr>
              ) : filtered.map((t, idx) => {
                const gc = GROUP_COLORS[t.group] || {};
                return (
                  <tr key={t.id} className={`border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${idx % 2 === 0 ? '' : 'bg-gray-50/30 dark:bg-gray-800/20'}`}>
                    <td className="px-3 py-2.5 text-sm text-center">{t.unit}</td>
                    <td className="px-3 py-2.5 text-sm text-center whitespace-nowrap">{abbreviateRank(t.rank)}</td>
                    <td className="px-3 py-2.5 text-sm font-medium whitespace-nowrap">{t.fullName}</td>
                    <td className="px-3 py-2.5 text-sm text-center font-mono">{t.militaryId}</td>
                    <td className="px-3 py-2.5 text-sm text-center font-mono">{t.nationalId}</td>
                    <td className="px-3 py-2.5 text-sm text-center font-mono">{t.passport}</td>
                    <td className="px-3 py-2.5 text-sm text-center">
                      <a href={`https://wa.me/${phoneToWhatsApp(t.phone)}`} target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline font-mono">{t.phone}</a>
                    </td>
                    <td className="px-3 py-2.5 text-sm">
                      <span className={`text-xs px-2 py-1 rounded-full border font-medium whitespace-nowrap ${gc.bg} ${gc.text} ${gc.border}`}>{t.group}</span>
                    </td>
                    <td className="px-3 py-2.5 text-sm">{t.hotel || <span className="text-gray-400">—</span>}</td>
                    <td className="px-3 py-2.5 text-center text-sm">{t.transportBooked ? '✓' : '—'}</td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${t.passportCheck === 'V' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                        {t.passportCheck === 'V' ? '✓ V' : 'החלקה'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <FlightFooter flight={flight} travelers={filtered} />
      </div>

      {showWhatsApp && (
        <WhatsAppModal flight={flight} travelers={travelers} onClose={() => setShowWhatsApp(false)} />
      )}
    </div>
  );
}

// ── MAIN DASHBOARD PAGE ──────────────────────────────────────────────────────
export default function DashboardPage() {
  const [flights, setFlights] = useState([]);
  const [travelersMap, setTravelersMap] = useState({});
  const [allTodayTravelers, setAllTodayTravelers] = useState([]);
  const [hotelRatings, setHotelRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedHotel, setSelectedHotel] = useState(null);

  useEffect(() => {
    const todaysFlights = getTodaysFlights();
    setFlights(todaysFlights);
    const map = {};
    let allTravelers = [];
    todaysFlights.forEach(f => {
      const t = getTravelersForFlight(f.id);
      map[f.id] = t;
      allTravelers = [...allTravelers, ...t];
    });
    setTravelersMap(map);
    setAllTodayTravelers(allTravelers);
    setHotelRatings(getHotelRatings());
    setLoading(false);
  }, [refreshKey]);

  const refresh = () => setRefreshKey(k => k + 1);

  // All unique hotels across today's travelers
  const allHotels = useMemo(() => {
    const set = new Set(allTodayTravelers.map(t => t.hotel).filter(Boolean));
    return [...set].sort();
  }, [allTodayTravelers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Plane className="w-10 h-10 animate-bounce" />
          <p>טוען נתונים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <Toast />

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Plane className="w-7 h-7 text-indigo-600" />
            מרכז בקרת טיסות
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            {flights.length > 0 ? `${flights.length} טיסות מתוכננות להיום` : 'אין טיסות מתוכננות להיום'}
          </p>
        </div>
        <button onClick={refresh} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm">
          <RefreshCw className="w-4 h-4" />
          רענן
        </button>
      </div>

      {/* Group Summary Cards */}
      {allTodayTravelers.length > 0 && (
        <GroupSummaryCards allTravelers={allTodayTravelers} />
      )}

      {/* No flights state */}
      {flights.length === 0 && (
        <div className="text-center py-24 text-gray-400 dark:text-gray-600">
          <Plane className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <h3 className="text-xl font-semibold mb-2">אין טיסות להיום</h3>
          <p className="text-sm">לא נמצאו טיסות מתוכננות לתאריך הנוכחי</p>
        </div>
      )}

      {/* Flight sections */}
      {flights.map(flight => (
        <FlightSection
          key={flight.id}
          flight={flight}
          travelers={travelersMap[flight.id] || []}
          hotelRatings={hotelRatings}
          onHotelClick={setSelectedHotel}
        />
      ))}

      {/* Hotel Detail Modal */}
      {selectedHotel && (
        <HotelDetailView
          hotel={selectedHotel}
          allTravelers={allTodayTravelers}
          allHotels={allHotels}
          hotelRatings={hotelRatings}
          onChangeHotel={setSelectedHotel}
          onClose={() => setSelectedHotel(null)}
        />
      )}
    </div>
  );
}
