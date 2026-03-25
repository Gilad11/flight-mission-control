'use client';
import { useState, useEffect, useMemo } from 'react';
import { History, Search, Trash2, RotateCcw, AlertTriangle, X, Calendar, Hotel } from 'lucide-react';
import Toast, { showToast } from '@/components/Toast';
import { getTravelers, getFlights, restoreTraveler, permanentDelete } from '@/lib/storage';
import { formatDate } from '@/lib/utils';
import { GROUP_COLORS } from '@/lib/constants';

export default function HistoryPage() {
  const [travelers, setTravelers] = useState([]);
  const [flights, setFlights] = useState([]);
  const [search, setSearch] = useState('');
  const [filterFlight, setFilterFlight] = useState('');
  const [filterHotel, setFilterHotel] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    const all = getTravelers();
    const archived = all.filter(t => t.isArchived);
    setTravelers(archived);
    setFlights(getFlights());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const flightMap = useMemo(() => {
    const m = {};
    flights.forEach(f => { m[f.id] = f; });
    return m;
  }, [flights]);

  const hotels = useMemo(() => {
    const s = new Set(travelers.map(t => t.hotel).filter(Boolean));
    return [...s].sort();
  }, [travelers]);

  const filtered = useMemo(() => {
    let data = [...travelers];
    if (filterFlight) data = data.filter(t => t.flightId === filterFlight);
    if (filterHotel) data = data.filter(t => t.hotel === filterHotel);
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(t =>
        t.fullName?.toLowerCase().includes(q) ||
        t.nationalId?.includes(q) ||
        t.militaryId?.includes(q) ||
        t.hotel?.toLowerCase().includes(q) ||
        flightMap[t.flightId]?.date?.includes(search)
      );
    }
    return data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [travelers, search, filterFlight, filterHotel, flightMap]);

  const handleRestore = (id) => {
    restoreTraveler(id);
    showToast('הנוסע שוחזר בהצלחה', 'success');
    load();
  };

  const handleDelete = (id) => {
    permanentDelete(id);
    setConfirmDelete(null);
    showToast('הנוסע נמחק לצמיתות', 'info');
    load();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Toast />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <History className="w-7 h-7 text-indigo-600" />
          היסטוריה
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          מסד נתונים של נוסעים מועברים לארכיון
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{travelers.length}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">נוסעים בארכיון</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {new Set(travelers.map(t => t.flightId)).size}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">טיסות שונות</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{hotels.length}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">מלונות שונים</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="חיפוש לפי שם, ת.ז, מ.א..."
            className="w-full pr-9 pl-3 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-400"
          />
        </div>
        <select
          value={filterFlight}
          onChange={e => setFilterFlight(e.target.value)}
          className="px-3 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-400"
        >
          <option value="">כל הטיסות</option>
          {flights.map(f => (
            <option key={f.id} value={f.id}>
              {f.flightNumber} - {formatDate(f.date)}
            </option>
          ))}
        </select>
        <select
          value={filterHotel}
          onChange={e => setFilterHotel(e.target.value)}
          className="px-3 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-400"
        >
          <option value="">כל המלונות</option>
          {hotels.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
        {(search || filterFlight || filterHotel) && (
          <button
            onClick={() => { setSearch(''); setFilterFlight(''); setFilterHotel(''); }}
            className="px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filtered.length} תוצאות
          </span>
        </div>
        {loading ? (
          <div className="text-center py-12 text-gray-400">טוען...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-600">
            <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>לא נמצאו נוסעים בארכיון</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
                  <th className="px-4 py-3 text-right font-semibold">שם מלא</th>
                  <th className="px-4 py-3 text-right font-semibold">דרגה / גוף</th>
                  <th className="px-4 py-3 text-right font-semibold">קבוצה</th>
                  <th className="px-4 py-3 text-right font-semibold">מלון</th>
                  <th className="px-4 py-3 text-right font-semibold">טיסה</th>
                  <th className="px-4 py-3 text-right font-semibold">ת.ז / דרכון</th>
                  <th className="px-4 py-3 text-center font-semibold">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, idx) => {
                  const flight = flightMap[t.flightId];
                  const colors = GROUP_COLORS[t.group] || {};
                  return (
                    <tr key={t.id} className={`border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors ${idx % 2 !== 0 ? 'bg-gray-50/30 dark:bg-gray-800/20' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{t.fullName}</div>
                        <div className="text-xs text-gray-400 font-mono">{t.phone}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div>{t.rank}</div>
                        <div className="text-xs text-gray-400">{t.unit}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full border font-medium ${colors.bg} ${colors.text} ${colors.border}`}>
                          {t.group}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {t.hotel ? (
                          <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                            <Hotel className="w-3.5 h-3.5 text-gray-400" />
                            {t.hotel}
                          </div>
                        ) : <span className="text-gray-400 text-xs">&mdash;</span>}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {flight ? (
                          <div>
                            <div className="font-medium">{flight.flightNumber}</div>
                            <div className="text-xs text-gray-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(flight.date)} &bull; {flight.time}
                            </div>
                          </div>
                        ) : <span className="text-gray-400 text-xs">&mdash;</span>}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-500 dark:text-gray-400">
                        <div>{t.nationalId}</div>
                        <div className="text-gray-400">{t.passport}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleRestore(t.id)}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all"
                            title="שחזר נוסע"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(t)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                            title="מחק לצמיתות"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">מחיקה לצמיתות</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  האם למחוק את <strong>{confirmDelete.fullName}</strong> לצמיתות? פעולה זו אינה ניתנת לביטול.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleDelete(confirmDelete.id)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition-all"
              >
                מחק לצמיתות
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-semibold text-sm transition-all"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
