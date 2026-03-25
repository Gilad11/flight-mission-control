'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  Pencil, Plane, Users, Hotel, Check, ChevronDown, ChevronUp,
  Search, Filter, X, ArrowUpDown, Trash2, AlertTriangle, Star, RefreshCw
} from 'lucide-react';
import Toast, { showToast } from '@/components/Toast';
import { getFlights, getTravelersForFlight, updateTraveler, deleteTraveler, deleteFlight, getHotelRatings, setHotelRating } from '@/lib/storage';
import { formatDate, formatDateHebrew, directionLabel, directionEmoji, abbreviateRank, phoneToWhatsApp } from '@/lib/utils';
import { GROUPS, GROUP_COLORS } from '@/lib/constants';

// ── Passport Switch ──────────────────────────────────────────────────────────
function PassportSwitch({ value, onChange }) {
  const isV = value === 'V';
  return (
    <button
      onClick={() => onChange(isV ? 'החלקה' : 'V')}
      className={`relative inline-flex h-7 w-16 items-center rounded-full transition-colors focus:outline-none ${isV ? 'bg-green-500' : 'bg-blue-500'}`}
      title={isV ? 'V - אושר' : 'החלקה'}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${isV ? 'translate-x-10' : 'translate-x-1'}`} />
      <span className={`absolute text-xs font-bold text-white ${isV ? 'left-1.5' : 'right-1.5'}`}>{isV ? 'V' : 'ה'}</span>
    </button>
  );
}

// ── Inline editable hotel cell ───────────────────────────────────────────────
function HotelCell({ value, onChange }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value || '');

  const save = () => {
    setEditing(false);
    if (val !== value) onChange(val);
  };

  if (editing) {
    return (
      <input autoFocus value={val} onChange={e => setVal(e.target.value)} onBlur={save}
        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setVal(value); setEditing(false); } }}
        className="w-full px-2 py-0.5 text-sm border-2 border-indigo-500 rounded bg-white dark:bg-gray-800 outline-none"
      />
    );
  }
  return (
    <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-sm text-right hover:text-indigo-600 dark:hover:text-indigo-400 group w-full">
      <span>{value || <span className="text-gray-400 italic">הוסף מלון</span>}</span>
      <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-60 flex-shrink-0" />
    </button>
  );
}

// ── Group dropdown ───────────────────────────────────────────────────────────
function GroupDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const color = GROUP_COLORS[value] || {};

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className={`text-xs px-2 py-1 rounded-full border font-medium ${color.bg} ${color.text} ${color.border} flex items-center gap-1 whitespace-nowrap`}>
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
                <button key={g} onClick={() => { onChange(g); setOpen(false); }}
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

// ── Editable Star Rating ─────────────────────────────────────────────────────
function EditableStarRating({ hotel, ratings, onRate }) {
  const rating = ratings[hotel] || 0;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} onClick={() => onRate(hotel, i)} className="focus:outline-none" title={`${i} כוכבים`}>
          <Star className={`w-4 h-4 transition-colors ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600 hover:text-amber-200'}`} />
        </button>
      ))}
    </div>
  );
}

// ── MAIN EDIT PAGE ───────────────────────────────────────────────────────────
export default function EditPage() {
  const [flights, setFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [travelers, setTravelers] = useState([]);
  const [hotelRatings, setHotelRatings] = useState({});
  const [filterGroup, setFilterGroup] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortCol, setSortCol] = useState('serial');
  const [sortDir, setSortDir] = useState('asc');
  const [confirmDeleteFlight, setConfirmDeleteFlight] = useState(false);
  const [confirmDeleteTraveler, setConfirmDeleteTraveler] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const all = getFlights();
    setFlights(all);
    setHotelRatings(getHotelRatings());
    if (all.length > 0 && !selectedFlight) {
      setSelectedFlight(all[0].id);
    }
    setLoading(false);
  }, [refreshKey]);

  // Load travelers when flight changes
  useEffect(() => {
    if (selectedFlight) {
      setTravelers(getTravelersForFlight(selectedFlight));
    } else {
      setTravelers([]);
    }
  }, [selectedFlight, refreshKey]);

  const flight = flights.find(f => f.id === selectedFlight);
  const refresh = () => setRefreshKey(k => k + 1);

  const handleUpdate = (id, field, value) => {
    setTravelers(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
    updateTraveler(id, { [field]: value });
  };

  const handleDeleteTraveler = (id) => {
    deleteTraveler(id);
    setConfirmDeleteTraveler(null);
    showToast('הנוסע הועבר לארכיון', 'success');
    refresh();
  };

  const handleDeleteFlight = () => {
    if (!selectedFlight) return;
    deleteFlight(selectedFlight);
    setConfirmDeleteFlight(false);
    setSelectedFlight(null);
    showToast('הטיסה נמחקה בהצלחה', 'success');
    refresh();
  };

  const handleRateHotel = (hotel, rating) => {
    setHotelRating(hotel, rating);
    setHotelRatings(prev => ({ ...prev, [hotel]: rating }));
    showToast(`דירוג ${hotel} עודכן ל-${rating} כוכבים`, 'success');
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
        t.nationalId?.includes(q)
      );
    }
    data.sort((a, b) => {
      let va = a[sortCol] ?? '';
      let vb = b[sortCol] ?? '';
      if (typeof va === 'number' && typeof vb === 'number') return sortDir === 'asc' ? va - vb : vb - va;
      if (typeof va === 'boolean') { va = va ? 1 : 0; vb = vb ? 1 : 0; }
      return sortDir === 'asc' ? String(va).localeCompare(String(vb), 'he') : String(vb).localeCompare(String(va), 'he');
    });
    return data;
  }, [travelers, filterGroup, searchQuery, sortCol, sortDir]);

  // Unique hotels for rating display
  const uniqueHotels = useMemo(() => {
    const s = new Set(travelers.map(t => t.hotel).filter(Boolean));
    return [...s].sort();
  }, [travelers]);

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  const Th = ({ children, col }) => (
    <th className={`px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 select-none ${col ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''}`}
      onClick={col ? () => handleSort(col) : undefined}>
      <div className="flex items-center justify-center gap-1">{children}{col && <SortIcon col={col} />}</div>
    </th>
  );

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><Plane className="w-10 h-10 animate-bounce text-gray-400" /></div>;
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <Toast />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Pencil className="w-7 h-7 text-indigo-600" />
            עריכה וניהול
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">עריכת פרטי נוסעים, ניהול מלונות וטיסות</p>
        </div>
        <button onClick={refresh} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm">
          <RefreshCw className="w-4 h-4" /> רענן
        </button>
      </div>

      {/* Flight Selector */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-60">
            <Plane className="w-5 h-5 text-indigo-500" />
            <select
              value={selectedFlight || ''}
              onChange={e => setSelectedFlight(e.target.value)}
              className="flex-1 px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-400"
            >
              <option value="">בחר טיסה...</option>
              {flights.map(f => (
                <option key={f.id} value={f.id}>
                  {f.flightNumber} — {formatDate(f.date)} {f.time} ({directionLabel(f.direction)})
                </option>
              ))}
            </select>
          </div>

          {flight && (
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${flight.direction === 'incoming' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                {directionEmoji(flight.direction)} {directionLabel(flight.direction)}
              </span>
              <button
                onClick={() => setConfirmDeleteFlight(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium transition-all border border-red-200 dark:border-red-800"
              >
                <Trash2 className="w-3.5 h-3.5" />
                מחק טיסה
              </button>
            </div>
          )}
        </div>
      </div>

      {!selectedFlight && (
        <div className="text-center py-20 text-gray-400 dark:text-gray-600">
          <Pencil className="w-14 h-14 mx-auto mb-3 opacity-30" />
          <h3 className="text-lg font-semibold mb-1">בחר טיסה לעריכה</h3>
          <p className="text-sm">בחר טיסה מהרשימה למעלה כדי לערוך את הנוסעים שלה</p>
        </div>
      )}

      {selectedFlight && flight && (
        <>
          {/* Hotel Security Ratings */}
          {uniqueHotels.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Hotel className="w-4 h-4 text-indigo-500" />
                דירוג אבטחת מלונות
              </h3>
              <div className="flex flex-wrap gap-4">
                {uniqueHotels.map(hotel => (
                  <div key={hotel} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{hotel}</span>
                    <EditableStarRating hotel={hotel} ratings={hotelRatings} onRate={handleRateHotel} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="חיפוש..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pr-9 pl-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)}
                className="text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-400">
                <option value="">כל הקבוצות</option>
                {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              {(filterGroup || searchQuery) && (
                <button onClick={() => { setFilterGroup(''); setSearchQuery(''); }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400 mr-auto">{filtered.length} נוסעים</span>
          </div>

          {/* Editable Table */}
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
                    <Th>פעולות</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="text-center py-12 text-gray-400 dark:text-gray-600">
                        <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p>לא נמצאו נוסעים</p>
                      </td>
                    </tr>
                  ) : filtered.map((t, idx) => (
                    <tr key={t.id} className={`border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${idx % 2 !== 0 ? 'bg-gray-50/30 dark:bg-gray-800/20' : ''}`}>
                      <td className="px-3 py-2.5 text-center text-sm font-mono text-gray-500">{t.serial}</td>
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
                        <GroupDropdown value={t.group} onChange={val => handleUpdate(t.id, 'group', val)} />
                      </td>
                      <td className="px-3 py-2.5 text-sm min-w-28">
                        <HotelCell value={t.hotel} onChange={val => handleUpdate(t.id, 'hotel', val)} />
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <input type="checkbox" checked={t.transportBooked} onChange={e => handleUpdate(t.id, 'transportBooked', e.target.checked)} className="w-4 h-4 rounded accent-indigo-600 cursor-pointer" />
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex justify-center">
                          <PassportSwitch value={t.passportCheck} onChange={val => handleUpdate(t.id, 'passportCheck', val)} />
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <button onClick={() => setConfirmDeleteTraveler(t)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" title="העבר לארכיון">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Delete Flight Confirmation */}
      {confirmDeleteFlight && flight && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">מחיקת טיסה</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  האם למחוק את טיסה <strong>{flight.flightNumber}</strong> ({formatDate(flight.date)})? כל הנוסעים יועברו לארכיון.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleDeleteFlight} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition-all">מחק טיסה</button>
              <button onClick={() => setConfirmDeleteFlight(false)} className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-semibold text-sm transition-all">ביטול</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Traveler Confirmation */}
      {confirmDeleteTraveler && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">העברה לארכיון</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  האם להעביר את <strong>{confirmDeleteTraveler.fullName}</strong> לארכיון? ניתן לשחזר אותו מדף הארכיון.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleDeleteTraveler(confirmDeleteTraveler.id)} className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-sm transition-all">העבר לארכיון</button>
              <button onClick={() => setConfirmDeleteTraveler(null)} className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-semibold text-sm transition-all">ביטול</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
