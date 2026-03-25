'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  Plane, Users, Hotel, Download, MessageSquare, Filter,
  ChevronUp, ChevronDown, RefreshCw, Search, X, Check,
  ExternalLink, Edit2, ArrowUpDown
} from 'lucide-react';
import Toast, { showToast } from '@/components/Toast';
import { getTwoNearestFlights, getTravelersForFlight, updateTraveler } from '@/lib/storage';
import { formatDate, formatDateHebrew, phoneToWhatsApp, directionLabel, directionEmoji, generateWhatsAppSummary, exportToExcel } from '@/lib/utils';
import { GROUPS, GROUP_COLORS } from '@/lib/constants';

// --- Sub-components ---

function PassportSwitch({ value, onChange }) {
  const isV = value === 'V';
  return (
    <button
      onClick={() => onChange(isV ? 'החלקה' : 'V')}
      className={`relative inline-flex h-7 w-16 items-center rounded-full transition-colors focus:outline-none ${
        isV ? 'bg-green-500' : 'bg-blue-500'
      }`}
      title={isV ? 'V - אושר' : 'החלקה'}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
        isV ? 'translate-x-1' : 'translate-x-10'
      }`} />
      <span className={`absolute text-xs font-bold text-white ${isV ? 'right-1.5' : 'left-1.5'}`}>
        {isV ? 'V' : 'ה'}
      </span>
    </button>
  );
}

function HotelCell({ value, onChange }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value || '');

  const save = () => {
    setEditing(false);
    if (val !== value) onChange(val);
  };

  if (editing) {
    return (
      <input
        autoFocus
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={save}
        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setVal(value); setEditing(false); } }}
        className="w-full px-2 py-0.5 text-sm border-2 border-indigo-500 rounded bg-white dark:bg-gray-800 outline-none"
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="flex items-center gap-1 text-sm text-right hover:text-indigo-600 dark:hover:text-indigo-400 group w-full"
    >
      <span>{value || <span className="text-gray-400 italic">הוסף מלון</span>}</span>
      <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-60 flex-shrink-0" />
    </button>
  );
}

function GroupDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const color = GROUP_COLORS[value] || {};

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`text-xs px-2 py-1 rounded-full border font-medium ${color.bg} ${color.text} ${color.border} flex items-center gap-1 whitespace-nowrap`}
      >
        {value}
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-20 py-1 min-w-max">
            {GROUPS.map(g => {
              const c = GROUP_COLORS[g] || {};
              return (
                <button
                  key={g}
                  onClick={() => { onChange(g); setOpen(false); }}
                  className={`w-full text-right px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 ${g === value ? 'font-bold' : ''}`}
                >
                  <span className={`w-2 h-2 rounded-full ${c.bg} ${c.border} border`} />
                  {g}
                  {g === value && <Check className="w-3.5 h-3.5 text-indigo-500 mr-auto" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// Hotel Analytics cards above table
function HotelAnalytics({ travelers }) {
  const hotelCounts = useMemo(() => {
    const map = {};
    travelers.forEach(t => {
      if (t.hotel) {
        map[t.hotel] = (map[t.hotel] || 0) + 1;
      }
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [travelers]);

  if (!hotelCounts.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {hotelCounts.map(([hotel, count]) => (
        <div
          key={hotel}
          className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 shadow-sm"
        >
          <Hotel className="w-4 h-4 text-indigo-500" />
          <span className="font-semibold text-gray-900 dark:text-gray-100">{hotel}</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full text-sm">
            {count} אנשים
          </span>
        </div>
      ))}
    </div>
  );
}

// Flight Footer
function FlightFooter({ flight, travelers }) {
  const total = travelers.length;
  const hakhlaka = travelers.filter(t => t.passportCheck === 'החלקה').length;
  const dir = directionLabel(flight.direction);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 rounded-b-xl">
      {/* Summary row */}
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

      {/* Group breakdown */}
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

// WhatsApp Summary Modal
function WhatsAppModal({ flight, travelers, onClose }) {
  const summary = generateWhatsAppSummary(flight, travelers);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('הסיכום הועתק ללוח!', 'success');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-500" />
            סיכום לווטסאפ
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">
          <pre className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm text-right whitespace-pre-wrap font-[inherit] leading-relaxed text-gray-800 dark:text-gray-200 max-h-80 overflow-y-auto">
            {summary}
          </pre>
        </div>
        <div className="flex gap-3 p-5 pt-0">
          <button
            onClick={copy}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold transition-all ${
              copied ? 'bg-green-500 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
            {copied ? 'הועתק!' : 'העתק'}
          </button>
          <button
            onClick={() => {
              const wa = `https://wa.me/?text=${encodeURIComponent(summary)}`;
              window.open(wa, '_blank');
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-semibold transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            פתח בווטסאפ
          </button>
        </div>
      </div>
    </div>
  );
}

// The main flight table
function FlightSection({ flight, travelers: initialTravelers, onUpdate }) {
  const [travelers, setTravelers] = useState(initialTravelers);
  const [filterGroup, setFilterGroup] = useState('');
  const [sortCol, setSortCol] = useState('serial');
  const [sortDir, setSortDir] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Sync with parent
  useEffect(() => { setTravelers(initialTravelers); }, [initialTravelers]);

  const handleUpdate = (id, field, value) => {
    // Optimistic update
    setTravelers(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
    updateTraveler(id, { [field]: value });
    onUpdate();
  };

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

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm disabled:opacity-60"
          >
            <Download className="w-4 h-4 text-indigo-500" />
            {exporting ? 'מייצא...' : 'ייצוא לאקסל'}
          </button>
          <button
            onClick={() => setShowWhatsApp(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-medium transition-all shadow-sm"
          >
            <MessageSquare className="w-4 h-4" />
            הפק סיכום לווטסאפ
          </button>
        </div>
      </div>

      {/* Hotel Analytics */}
      <HotelAnalytics travelers={filtered} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="חיפוש..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterGroup}
            onChange={e => setFilterGroup(e.target.value)}
            className="text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-400"
          >
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

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <Th col="serial">מס"ד</Th>
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
                  <td colSpan={12} className="text-center py-12 text-gray-400 dark:text-gray-600">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>לא נמצאו נוסעים</p>
                  </td>
                </tr>
              ) : filtered.map((t, idx) => (
                <tr
                  key={t.id}
                  className={`border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${idx % 2 === 0 ? '' : 'bg-gray-50/30 dark:bg-gray-800/20'}`}
                >
                  <td className="px-3 py-2.5 text-center text-sm font-mono text-gray-500">{t.serial}</td>
                  <td className="px-3 py-2.5 text-sm text-center">{t.unit}</td>
                  <td className="px-3 py-2.5 text-sm text-center whitespace-nowrap">{t.rank}</td>
                  <td className="px-3 py-2.5 text-sm font-medium whitespace-nowrap">{t.fullName}</td>
                  <td className="px-3 py-2.5 text-sm text-center font-mono">{t.militaryId}</td>
                  <td className="px-3 py-2.5 text-sm text-center font-mono">{t.nationalId}</td>
                  <td className="px-3 py-2.5 text-sm text-center font-mono">{t.passport}</td>
                  <td className="px-3 py-2.5 text-sm text-center">
                    <a
                      href={`https://wa.me/${phoneToWhatsApp(t.phone)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 dark:text-green-400 hover:underline font-mono"
                    >
                      {t.phone}
                    </a>
                  </td>
                  <td className="px-3 py-2.5 text-sm">
                    <GroupDropdown
                      value={t.group}
                      onChange={val => handleUpdate(t.id, 'group', val)}
                    />
                  </td>
                  <td className="px-3 py-2.5 text-sm min-w-28">
                    <HotelCell
                      value={t.hotel}
                      onChange={val => handleUpdate(t.id, 'hotel', val)}
                    />
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <input
                      type="checkbox"
                      checked={t.transportBooked}
                      onChange={e => handleUpdate(t.id, 'transportBooked', e.target.checked)}
                      className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex justify-center">
                      <PassportSwitch
                        value={t.passportCheck}
                        onChange={val => handleUpdate(t.id, 'passportCheck', val)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <FlightFooter flight={flight} travelers={filtered} />
      </div>

      {showWhatsApp && (
        <WhatsAppModal
          flight={flight}
          travelers={travelers}
          onClose={() => setShowWhatsApp(false)}
        />
      )}
    </div>
  );
}

// ---- MAIN PAGE ----
export default function DashboardPage() {
  const [flights, setFlights] = useState([]);
  const [travelersMap, setTravelersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const twoFlights = getTwoNearestFlights();
    setFlights(twoFlights);
    const map = {};
    twoFlights.forEach(f => {
      map[f.id] = getTravelersForFlight(f.id);
    });
    setTravelersMap(map);
    setLoading(false);
  }, [refreshKey]);

  const refresh = () => setRefreshKey(k => k + 1);

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Plane className="w-7 h-7 text-indigo-600" />
            מרכז בקרת טיסות
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            מציג {flights.length} טיסות קרובות
          </p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          רענן
        </button>
      </div>

      {/* No flights */}
      {flights.length === 0 && (
        <div className="text-center py-24 text-gray-400 dark:text-gray-600">
          <Plane className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <h3 className="text-xl font-semibold mb-2">אין טיסות קרובות</h3>
          <p className="text-sm">לא נמצאו טיסות עתידיות במערכת</p>
        </div>
      )}

      {/* Flight sections */}
      {flights.map(flight => (
        <FlightSection
          key={flight.id}
          flight={flight}
          travelers={travelersMap[flight.id] || []}
          onUpdate={refresh}
        />
      ))}
    </div>
  );
}
