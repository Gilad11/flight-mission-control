'use client';
import { useState, useEffect } from 'react';
import { UserPlus, ClipboardPaste, Check, AlertCircle, Plane, Wand2, RefreshCw } from 'lucide-react';
import Toast, { showToast } from '@/components/Toast';
import { getFlights, addTraveler, addFlight } from '@/lib/storage';
import { formatDate, parseSmartPaste } from '@/lib/utils';
import { GROUPS, RANKS } from '@/lib/constants';
import { useRouter } from 'next/navigation';

const EMPTY_FORM = {
  unit: '', rank: '', fullName: '', militaryId: '', nationalId: '',
  passport: '', phone: '', group: GROUPS[0], hotel: '',
  transportBooked: false, passportCheck: 'V', flightId: ''
};

export default function AddPage() {
  const [tab, setTab] = useState('manual');
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [flights, setFlights] = useState([]);
  const [pasteText, setPasteText] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newFlightMode, setNewFlightMode] = useState(false);
  const [newFlight, setNewFlight] = useState({ flightNumber: '', date: '', time: '', direction: 'outgoing' });
  const router = useRouter();

  useEffect(() => {
    const f = getFlights();
    setFlights(f);
    if (f.length > 0) setForm(p => ({ ...p, flightId: f[0].id }));
  }, []);

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'שדה חובה';
    if (!form.flightId && !newFlightMode) e.flightId = 'בחר טיסה';
    if (newFlightMode) {
      if (!newFlight.flightNumber) e.flightNumber = 'חובה';
      if (!newFlight.date) e.date = 'חובה';
      if (!newFlight.time) e.time = 'חובה';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);

    try {
      let flightId = form.flightId;
      if (newFlightMode) {
        const created = addFlight(newFlight);
        flightId = created.id;
      }
      addTraveler({ ...form, flightId });
      showToast('הנוסע נוסף בהצלחה!', 'success');
      setForm(EMPTY_FORM);
      setErrors({});
      setTimeout(() => router.push('/'), 1200);
    } catch {
      showToast('שגיאה בשמירה', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleParse = () => {
    const result = parseSmartPaste(pasteText);
    if (!result.fullName && !result.nationalId) {
      showToast('לא ניתן לנתח את הטקסט. ודא שהוא מכיל את השדות הנדרשים.', 'error');
      return;
    }
    // Find flight by date
    let flightId = form.flightId;
    if (result.flightDate) {
      const match = flights.find(f => f.date === result.flightDate);
      if (match) flightId = match.id;
    }
    setParsedData({ ...EMPTY_FORM, ...result, flightId });
    showToast('הנתונים נותחו בהצלחה!', 'success');
  };

  const handleConfirmParsed = () => {
    if (!parsedData) return;
    setForm(parsedData);
    setTab('manual');
    setParsedData(null);
    setPasteText('');
  };

  const Field = ({ label, name, required, children }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {errors[name] && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {errors[name]}
        </p>
      )}
    </div>
  );

  const inputCls = (name) => `w-full px-3 py-2.5 text-sm bg-white dark:bg-gray-800 border rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 transition ${errors[name] ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'}`;

  const Input = ({ name, ...props }) => (
    <input
      value={form[name]}
      onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}
      className={inputCls(name)}
      {...props}
    />
  );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Toast />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <UserPlus className="w-7 h-7 text-indigo-600" />
          הוסף נוסע
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">הוסף נוסע ידנית או הדבק טקסט לניתוח אוטומטי</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6 w-fit">
        {[
          { id: 'manual', icon: UserPlus, label: 'הוספה ידנית' },
          { id: 'paste', icon: ClipboardPaste, label: 'הדבקה חכמה' },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === id
                ? 'bg-white dark:bg-gray-900 shadow-sm text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Manual Tab */}
      {tab === 'manual' && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          {/* Flight Selection */}
          <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <Plane className="w-4 h-4 text-indigo-500" /> בחירת טיסה
            </h3>
            <div className="flex flex-wrap gap-3">
              {!newFlightMode ? (
                <Field label="טיסה" name="flightId" required>
                  <div className="flex gap-2">
                    <select
                      value={form.flightId}
                      onChange={e => setForm(p => ({ ...p, flightId: e.target.value }))}
                      className={`flex-1 px-3 py-2.5 text-sm bg-white dark:bg-gray-800 border rounded-xl focus:outline-none focus:border-indigo-400 ${errors.flightId ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'}`}
                    >
                      <option value="">בחר טיסה...</option>
                      {flights.map(f => (
                        <option key={f.id} value={f.id}>
                          {f.flightNumber} - {formatDate(f.date)} {f.time} ({f.direction === 'incoming' ? 'נכנסים' : 'יוצאים'})
                        </option>
                      ))}
                    </select>
                    <button type="button" onClick={() => setNewFlightMode(true)} className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 whitespace-nowrap">
                      + טיסה חדשה
                    </button>
                  </div>
                </Field>
              ) : (
                <div className="w-full">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">מס׳ טיסה *</label>
                      <input value={newFlight.flightNumber} onChange={e => setNewFlight(p => ({...p, flightNumber: e.target.value}))} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:outline-none focus:border-indigo-400" placeholder="e.g. TK1234" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">כיוון</label>
                      <select value={newFlight.direction} onChange={e => setNewFlight(p => ({...p, direction: e.target.value}))} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:outline-none focus:border-indigo-400">
                        <option value="outgoing">יוצאים</option>
                        <option value="incoming">נכנסים</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">תאריך *</label>
                      <input type="date" value={newFlight.date} onChange={e => setNewFlight(p => ({...p, date: e.target.value}))} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:outline-none focus:border-indigo-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">שעה *</label>
                      <input type="time" value={newFlight.time} onChange={e => setNewFlight(p => ({...p, time: e.target.value}))} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:outline-none focus:border-indigo-400" />
                    </div>
                  </div>
                  <button type="button" onClick={() => setNewFlightMode(false)} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">&larr; חזור לבחירת טיסה קיימת</button>
                </div>
              )}
            </div>
          </div>

          {/* Personal Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="שם מלא" name="fullName" required>
              <Input name="fullName" placeholder="ישראל ישראלי" />
            </Field>
            <Field label="דרגה" name="rank">
              <input
                value={form.rank}
                onChange={e => setForm(p => ({ ...p, rank: e.target.value }))}
                list="ranks-list"
                className="w-full px-3 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-400"
                placeholder="בחר או הקלד דרגה"
              />
              <datalist id="ranks-list">
                {RANKS.map(r => <option key={r} value={r} />)}
              </datalist>
            </Field>
            <Field label="גוף" name="unit">
              <Input name="unit" placeholder='8200, אמ"ן...' />
            </Field>
            <Field label="מ.א (מספר אישי)" name="militaryId">
              <Input name="militaryId" placeholder="7123456" />
            </Field>
            <Field label="ת.ז (תעודת זהות)" name="nationalId">
              <Input name="nationalId" placeholder="012345678" />
            </Field>
            <Field label="דרכון" name="passport">
              <Input name="passport" placeholder="P1234567" />
            </Field>
            <Field label="טלפון" name="phone">
              <Input name="phone" placeholder="052-1234567" type="tel" />
            </Field>
            <Field label="קבוצה" name="group">
              <select
                value={form.group}
                onChange={e => setForm(p => ({ ...p, group: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-400"
              >
                {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
            <Field label="מלון" name="hotel">
              <Input name="hotel" placeholder="דן, הילטון..." />
            </Field>
            <div className="sm:col-span-2 flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.transportBooked}
                  onChange={e => setForm(p => ({ ...p, transportBooked: e.target.checked }))}
                  className="w-4 h-4 accent-indigo-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">הסעה הוזמנה</span>
              </label>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">בדיקת דרכון:</span>
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, passportCheck: p.passportCheck === 'V' ? 'החלקה' : 'V' }))}
                  className={`relative inline-flex h-7 w-16 items-center rounded-full transition-colors ${form.passportCheck === 'V' ? 'bg-green-500' : 'bg-blue-500'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${form.passportCheck === 'V' ? 'translate-x-10' : 'translate-x-1'}`} />
                  <span className={`absolute text-xs font-bold text-white ${form.passportCheck === 'V' ? 'left-1.5' : 'right-1.5'}`}>
                    {form.passportCheck === 'V' ? 'V' : 'ה'}
                  </span>
                </button>
                <span className={`text-sm font-medium ${form.passportCheck === 'V' ? 'text-green-600' : 'text-blue-600'}`}>
                  {form.passportCheck === 'V' ? '✓ V' : 'החלקה'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl font-semibold transition-all shadow-sm"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {saving ? 'שומר...' : 'הוסף נוסע'}
            </button>
          </div>
        </form>
      )}

      {/* Smart Paste Tab */}
      {tab === 'paste' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">הדבק טקסט לניתוח</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">המערכת תנתח טקסט המכיל מילות מפתח:</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {['שם:', 'תז:', 'טלפון:', 'קבוצה:', 'טיסה:', 'כיוון:'].map(kw => (
                <code key={kw} className="text-xs bg-gray-100 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-lg">{kw}</code>
              ))}
            </div>
          </div>

          <textarea
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            placeholder={`שם: ישראל ישראלי\nתז: 012345678\nטלפון: 0521234567\nקבוצה: כיפה\nטיסה: 27/03/2026\nכיוון: יוצאים`}
            className="w-full h-48 px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-400 font-mono leading-relaxed resize-none"
            dir="rtl"
          />

          <button
            onClick={handleParse}
            disabled={!pasteText.trim()}
            className="mt-3 flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-all"
          >
            <Wand2 className="w-4 h-4" />
            נתח טקסט
          </button>

          {/* Parsed Preview */}
          {parsedData && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-xl">
              <h4 className="font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                <Check className="w-4 h-4" /> תוצאות ניתוח
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  ['שם מלא', parsedData.fullName],
                  ['ת.ז', parsedData.nationalId],
                  ['טלפון', parsedData.phone],
                  ['קבוצה', parsedData.group],
                  ['תאריך טיסה', parsedData.flightDate],
                  ['כיוון', parsedData.direction === 'incoming' ? 'נכנסים' : parsedData.direction === 'outgoing' ? 'יוצאים' : parsedData.direction],
                ].map(([label, val]) => val ? (
                  <div key={label} className="flex gap-2">
                    <span className="text-gray-500 dark:text-gray-400 shrink-0">{label}:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{val}</span>
                  </div>
                ) : null)}
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleConfirmParsed}
                  className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-all"
                >
                  <Check className="w-4 h-4" />
                  אשר ועבור לטופס
                </button>
                <button
                  onClick={() => setParsedData(null)}
                  className="px-5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  בטל
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
