import { BookOpen, Plane, Smartphone, ToggleLeft, MessageSquare, PlusCircle, History, Lightbulb } from 'lucide-react';

const Section = ({ icon: Icon, title, color, children }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-5">
    <div className={`flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800 ${color}`}>
      <Icon className="w-5 h-5" />
      <h2 className="text-lg font-bold">{title}</h2>
    </div>
    <div className="px-6 py-5 text-sm text-gray-600 dark:text-gray-400 leading-7 space-y-3">
      {children}
    </div>
  </div>
);

const Step = ({ n, children }) => (
  <div className="flex items-start gap-3">
    <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">{n}</span>
    <p className="flex-1">{children}</p>
  </div>
);

const Code = ({ children }) => (
  <code className="bg-gray-100 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
);

export default function GuidePage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-indigo-600" />
          מדריך למשתמש
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">מרכז בקרת טיסות &mdash; מדריך שלב אחר שלב</p>
      </div>

      <Section icon={Plane} title='לוגיקת "שתי הטיסות הקרובות"' color="text-indigo-700 dark:text-indigo-300">
        <p>הלוח הראשי מזהה אוטומטית את שתי הטיסות הקרובות ביותר שטרם יצאו.</p>
        <Step n="1">המערכת בודקת את כל הטיסות הרשומות במסד הנתונים.</Step>
        <Step n="2">מסננת רק טיסות שתאריך + שעתן גדולים מהרגע הנוכחי.</Step>
        <Step n="3">ממיינת אותן לפי תאריך + שעה בסדר עולה.</Step>
        <Step n="4">בוחרת את שתי הראשונות ומציגה כל אחת בטבלה נפרדת.</Step>
        <p className="text-amber-600 dark:text-amber-400 flex items-start gap-2">
          <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
          אם קיימת רק טיסה אחת קרובה, תוצג טבלה אחת בלבד. ניתן להוסיף טיסות חדשות בדף &#34;הוסף נוסע&#34;.
        </p>
      </Section>

      <Section icon={ToggleLeft} title='מתג V / החלקה (בדיקת דרכון)' color="text-green-700 dark:text-green-300">
        <p>המתג מייצג את סטטוס בדיקת הדרכון עבור כל נוסע:</p>
        <div className="grid grid-cols-2 gap-3 my-2">
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-xl p-3">
            <div className="font-bold text-green-700 dark:text-green-400 mb-1">&#x2713; V &mdash; מצב ימין (ירוק)</div>
            <p className="text-green-600 dark:text-green-500">הדרכון עבר בדיקה מלאה. הנוסע אושר.</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl p-3">
            <div className="font-bold text-blue-700 dark:text-blue-400 mb-1">החלקה &mdash; מצב שמאל (כחול)</div>
            <p className="text-blue-600 dark:text-blue-500">הנוסע עובר ללא בדיקת דרכון. &#34;מחליק&#34; את הביקורת.</p>
          </div>
        </div>
        <Step n="1">לחץ על המתג בשורת הנוסע בטבלה.</Step>
        <Step n="2">השינוי נשמר אוטומטית (Optimistic Update).</Step>
        <Step n="3">ספירת &#34;סה&#34;כ החלקה&#34; בכותרת הטבלה מתעדכנת בזמן אמת.</Step>
      </Section>

      <Section icon={MessageSquare} title="יצירת סיכום לווטסאפ" color="text-green-700 dark:text-green-300">
        <Step n="1">בכותרת כל טבלת טיסה, לחץ על כפתור <strong>&#34;הפק סיכום לווטסאפ&#34;</strong>.</Step>
        <Step n="2">תיפתח חלונית עם הסיכום המפורמט.</Step>
        <Step n="3">לחץ &#34;העתק&#34; להעתקת הטקסט ללוח, או &#34;פתח בווטסאפ&#34; לשיגור ישיר.</Step>
        <p>הסיכום מכיל:</p>
        <ul className="list-disc list-inside space-y-1 mr-4">
          <li>כותרת עם מספר הטיסה, תאריך ושעה</li>
          <li>סטטוס &mdash; כיוון הטיסה, מספר כולל, ספירת החלקה</li>
          <li>פירוט לפי קבוצה: כמות &middot; שם POC &middot; מלון &middot; מספר חדרים מחושב</li>
        </ul>
        <p>חישוב חדרים: <Code>חדרים = ceil(אנשים / 2)</Code></p>
      </Section>

      <Section icon={PlusCircle} title="הדבקה חכמה (Smart Paste)" color="text-purple-700 dark:text-purple-300">
        <p>מאפשרת להוסיף נוסע על ידי הדבקת טקסט חופשי המכיל מילות מפתח קבועות:</p>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 font-mono text-sm leading-8 my-2">
          <div><Code>שם:</Code> ישראל ישראלי</div>
          <div><Code>תז:</Code> 012345678</div>
          <div><Code>טלפון:</Code> 0521234567</div>
          <div><Code>קבוצה:</Code> כיפה</div>
          <div><Code>טיסה:</Code> 27/03/2026</div>
          <div><Code>כיוון:</Code> יוצאים</div>
        </div>
        <Step n="1">עבור לדף &#34;הוסף נוסע&#34; &#x2192; לשונית &#34;הדבקה חכמה&#34;.</Step>
        <Step n="2">הדבק את הטקסט בתיבת הטקסט.</Step>
        <Step n="3">לחץ &#34;נתח טקסט&#34;.</Step>
        <Step n="4">בדוק את התוצאות המוצגות ולחץ &#34;אשר ועבור לטופס&#34;.</Step>
        <Step n="5">השלם שדות חסרים בטופס ולחץ &#34;הוסף נוסע&#34;.</Step>
        <p className="text-amber-600 dark:text-amber-400 flex items-start gap-2">
          <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
          עבור <strong>כיוון</strong>, המערכת מזהה: יוצאים/עוזב/outgoing &#x2190; יוצאים; נכנסים/מגיע/incoming &#x2190; נכנסים.
        </p>
      </Section>

      <Section icon={Smartphone} title="ייצוא לאקסל" color="text-teal-700 dark:text-teal-300">
        <Step n="1">בכותרת כל טיסה לחץ על כפתור &#34;ייצוא לאקסל&#34;.</Step>
        <Step n="2">קובץ <Code>.xlsx</Code> יורד אוטומטית עם כל פרטי הנוסעים.</Step>
        <p>הקובץ כולל את כל העמודות: מס&#34;ד, גוף, דרגה, שם מלא, מ.א, ת.ז, דרכון, טלפון, קבוצה, מלון, הסעה הוזמנה, בדיקת דרכון.</p>
      </Section>

      <Section icon={History} title="היסטוריה וארכיון" color="text-orange-700 dark:text-orange-300">
        <Step n="1">נוסעים שנמחקו עוברים לארכיון (מחיקה רכה).</Step>
        <Step n="2">בדף &#34;היסטוריה&#34; ניתן לחפש לפי שם, ת.ז, תאריך טיסה, או מלון.</Step>
        <Step n="3">לחץ על סמל ה-&#x21A9; לשחזור נוסע לטיסה המקורית.</Step>
        <Step n="4">לחץ על סמל האשפה למחיקה לצמיתות (לא ניתן לבטל).</Step>
      </Section>
    </div>
  );
}
