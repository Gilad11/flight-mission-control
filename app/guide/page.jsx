import { BookOpen, Plane, ToggleLeft, MessageSquare, PlusCircle, Pencil, Archive, Hotel, Lightbulb, Globe } from 'lucide-react';

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
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">מרכז בקרת טיסות — מדריך שלב אחר שלב</p>
      </div>

      <Section icon={Plane} title="לוח בקרה — תצוגה בלבד" color="text-indigo-700 dark:text-indigo-300">
        <p>הלוח הראשי מציג את <strong>כל הטיסות המתוכננות להיום</strong> בטבלאות נפרדות. התצוגה הינה לקריאה בלבד.</p>
        <Step n="1">המערכת מזהה אוטומטית את כל הטיסות שתאריכן הוא היום.</Step>
        <Step n="2">ממיינת אותן לפי שעה בסדר עולה.</Step>
        <Step n="3">כל טיסה מוצגת בטבלה נפרדת עם כותרת, פירוט נוסעים ומלונות.</Step>
        <Step n="4">כרטיסי סיכום קבוצות מוצגים בראש הדף — סה"כ אנשים בכל אחת מ-6 הקבוצות.</Step>
        <p className="text-amber-600 dark:text-amber-400 flex items-start gap-2">
          <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
          עמודת מס"ד (מספר סידורי) מוסתרת בתצוגת הלוח אך נשמרת בנתונים ומופיעה בייצוא לאקסל.
        </p>
        <p><strong>קיצורי דרגות:</strong> המערכת ממירה אוטומטית שמות דרגות לקיצורים עבריים (למשל: סגן אלוף → סא"ל, רב סרן → רס"ן).</p>
      </Section>

      <Section icon={Hotel} title="כרטיסי מלונות אינטראקטיביים" color="text-teal-700 dark:text-teal-300">
        <Step n="1">כרטיסי מלון מוצגים מעל כל טבלת טיסה עם ספירת אנשים.</Step>
        <Step n="2"><strong>לחיצה על כרטיס מלון</strong> פותחת תצוגה מפורטת של כל הנוסעים באותו מלון.</Step>
        <Step n="3">בתצוגת המלון ניתן להחליף מלון באמצעות תפריט נפתח.</Step>
        <Step n="4">כל כרטיס מציג <strong>דירוג אבטחה</strong> (1-5 כוכבים).</Step>
        <p className="text-amber-600 dark:text-amber-400 flex items-start gap-2">
          <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
          ניתן לערוך את דירוג הכוכבים רק מדף <strong>עריכה וניהול</strong>.
        </p>
      </Section>

      <Section icon={ToggleLeft} title='מתג V / החלקה (בדיקת דרכון)' color="text-green-700 dark:text-green-300">
        <div className="grid grid-cols-2 gap-3 my-2">
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-xl p-3">
            <div className="font-bold text-green-700 dark:text-green-400 mb-1">✓ V — ימין (ירוק)</div>
            <p className="text-green-600 dark:text-green-500">הדרכון עבר בדיקה מלאה.</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl p-3">
            <div className="font-bold text-blue-700 dark:text-blue-400 mb-1">החלקה — שמאל (כחול)</div>
            <p className="text-blue-600 dark:text-blue-500">הנוסע עובר ללא בדיקת דרכון.</p>
          </div>
        </div>
        <p>ניתן לשנות את המתג רק מדף <strong>עריכה וניהול</strong>. בלוח הבקרה מוצג סטטוס בלבד.</p>
      </Section>

      <Section icon={Pencil} title="עריכה וניהול" color="text-orange-700 dark:text-orange-300">
        <p>דף <strong>עריכה וניהול</strong> הוא המקום היחיד בו ניתן לבצע שינויים:</p>
        <Step n="1">בחר טיסה מהרשימה הנפתחת.</Step>
        <Step n="2">ערוך ישירות: מלון (לחיצה על תא), קבוצה (תפריט), הסעה (תיבת סימון), בדיקת דרכון (מתג).</Step>
        <Step n="3">העבר נוסע לארכיון באמצעות כפתור האשפה.</Step>
        <Step n="4">מחק טיסה שלמה (משימה שבוטלה) — כל הנוסעים יועברו לארכיון.</Step>
        <Step n="5">ערוך דירוג אבטחת מלונות (כוכבים 1-5).</Step>
      </Section>

      <Section icon={Globe} title="סיכום לווטסאפ דו-לשוני" color="text-green-700 dark:text-green-300">
        <Step n="1">בלוח הבקרה, לחץ <strong>"הפק סיכום לווטסאפ"</strong>.</Step>
        <Step n="2">בחר שפה: <strong>עברית</strong> או <strong>English</strong>.</Step>
        <Step n="3">הסיכום נוצר באותו פורמט בשתי השפות.</Step>
        <Step n="4">לחץ "העתק" או "פתח בווטסאפ" לשליחה ישירה.</Step>
        <p>הסיכום כולל: מספר טיסה, תאריך, שעה, כיוון, סה"כ נוסעים, ספירת החלקה, ופירוט לפי קבוצה (POC, מלון, חדרים).</p>
      </Section>

      <Section icon={PlusCircle} title="הדבקה חכמה (Smart Paste)" color="text-purple-700 dark:text-purple-300">
        <p>מאפשרת להוסיף נוסע על ידי הדבקת טקסט חופשי:</p>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 font-mono text-sm leading-8 my-2">
          <div><Code>שם:</Code> ישראל ישראלי</div>
          <div><Code>תז:</Code> 012345678</div>
          <div><Code>טלפון:</Code> 0521234567</div>
          <div><Code>קבוצה:</Code> כיפה</div>
          <div><Code>טיסה:</Code> 25/03/2026</div>
          <div><Code>כיוון:</Code> יוצאים</div>
        </div>
        <Step n="1">עבור לדף "הוסף נוסע" → לשונית "הדבקה חכמה".</Step>
        <Step n="2">הדבק את הטקסט ולחץ "נתח טקסט".</Step>
        <Step n="3">אשר את התוצאות ועבור לטופס להשלמה.</Step>
      </Section>

      <Section icon={Archive} title="ארכיון" color="text-rose-700 dark:text-rose-300">
        <Step n="1">נוסעים שנמחקים (מדף העריכה) עוברים לארכיון — לא נמחקים לצמיתות.</Step>
        <Step n="2">בדף <strong>ארכיון</strong> ניתן לחפש לפי שם, ת.ז, תאריך טיסה, או מלון.</Step>
        <Step n="3">לחץ ↩ לשחזור נוסע לטיסה המקורית.</Step>
        <Step n="4">לחץ על סמל האשפה למחיקה סופית (לא ניתן לבטל).</Step>
      </Section>
    </div>
  );
}
