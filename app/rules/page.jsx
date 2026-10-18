'use client';
import Link from 'next/link';

export default function RulesPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="text-center mb-8 border-b border-slate-800 pb-6">
        <h1 className="text-4xl font-extrabold text-amber-400 mb-2">netgoals.co.il</h1>
        <p className="text-slate-400 text-lg">חוקת הניקוד ותקנון המשחק 📜</p>

        <div className="flex justify-center flex-wrap gap-2 mt-6">
          <Link
            href="/"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold border border-slate-700 transition"
          >
            ⚽ לטופס הניחושים
          </Link>
          <Link
            href="/leaderboard"
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2.5 rounded-xl text-sm font-bold transition shadow-md"
          >
            🏆 טבלת המובילים
          </Link>
        </div>
      </header>

      <div className="space-y-6">
        {/* Scoring System Card */}
        <section className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
          <h2 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
            🎯 שיטת חישוב הנקודות
          </h2>

          <div className="space-y-4">
            <div className="bg-slate-900/80 p-4 rounded-xl border border-emerald-500/30 flex items-start gap-4">
              <span className="text-3xl">🎯</span>
              <div>
                <h3 className="text-emerald-400 font-extrabold text-lg">בול פגיעה — 3 נקודות</h3>
                <p className="text-xs text-slate-300 mt-1">
                  פגעתם בתוצאה המדויקת של המשחק!
                  <br />
                  <span className="text-slate-400 italic">דוגמה: ניחשתם 2-1 והמשחק הסתיים ב-2-1.</span>
                </p>
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-amber-500/30 flex items-start gap-4">
              <span className="text-3xl">✅</span>
              <div>
                <h3 className="text-amber-400 font-extrabold text-lg">בינגו בכיוון — 1 נקודה</h3>
                <p className="text-xs text-slate-300 mt-1">
                  צדקתם בזהות המנצחת או בתוצאת התיקו, אך לא בתוצאה המדויקת.
                  <br />
                  <span className="text-slate-400 italic">דוגמה: ניחשתם 1-0 והמשחק הסתיים ב-3-1 (או ניחשתם 1-1 והסתיים ב-2-2).</span>
                </p>
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/60 flex items-start gap-4">
              <span className="text-3xl">❌</span>
              <div>
                <h3 className="text-slate-400 font-extrabold text-lg">פספוס — 0 נקודות</h3>
                <p className="text-xs text-slate-300 mt-1">
                  הקבוצה השנייה ניצחה או שהמרתם על ניצחון והיה תיקו.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* General Rules Card */}
        <section className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl space-y-4">
          <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
            🔒 כללי השתתפות ונעילת טפסים
          </h2>

          <ul className="space-y-3 text-sm text-slate-300 divide-y divide-slate-700/60">
            <li className="pt-2 flex items-start gap-2">
              <span>⏰</span>
              <span><strong>נעילת ניחושים:</strong> הניחוש לכל משחק ננעל בדיוק בשעת שריקת הפתיחה שלו. לא ניתן להגיש או לערוך ניחוש למשחק שכבר התחיל.</span>
            </li>
            <li className="pt-3 flex items-start gap-2">
              <span>✏️</span>
              <span><strong>עדכון ניחוש:</strong> ניתן להגיש את הטופס מחדש באותו השם כל עוד המשחק פתוח. הניחוש האחרון שנשלח הוא זה שייחשב בטבלה.</span>
            </li>
            <li className="pt-3 flex items-start gap-2">
              <span>⏱️</span>
              <span><strong>תוצאה קובעת:</strong> התוצאה המכריעה היא התוצאה בתום 90 דקות (כולל תוספת זמן, ללא הארכה או פנדלים).</span>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
