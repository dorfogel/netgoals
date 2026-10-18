# ⚽ NetGoals - גולים ברשת

מערכת ניחושי כדורגל קהילתית בזמן אמת, הבנויה על גבי Next.js, Vercel ו-Supabase.

---

## 🚀 טכנולוגיות (Tech Stack)

* **Frontend Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Database & BaaS:** [Supabase](https://supabase.com/) (PostgreSQL)
* **Hosting & Deployment:** [Vercel](https://vercel.com/)

---

## 🔥 תכונות מרכזיות (Key Features)

1. **טופס ניחושים מהיר:** הגשת תוצאות מדויקות למחזורי משחקים ללא צורך בהרשמה מסורבלת.
2. **טבלת מובילים בזמן אמת (`/leaderboard`):** חישוב ניקוד מצטבר ודירוג מנחשים בלייב מתוך Supabase.
3. **שתיית ניחושים ב-WhatsApp:** אפשרות לשתף את הטופס המלא ישירות לקבוצות חברים.
4. **פאנל אדמין מאובטח (`/admin`):**
   * הגנה באמצעות סיסמת אדמין (`NEXT_PUBLIC_ADMIN_PASSWORD`).
   * הזנת תוצאות אמת למשחקים.
   * חישוב נקודות אוטומטי (3 נק' על בול פגיעה, 1 נק' על כיוון).

---

## 🗄️ מבנה בסיס הנתונים (Supabase Schema)

הטבלאות העיקריות ב-PostgreSQL:

* **`profiles`**: מזהה משתמש (`id` כ-`text`), שם מלא (`full_name`).
* **`matches`**: מזהה משחק (`id`), קבוצת בית (`home_team`), קבוצת חוץ (`away_team`), תוצאות אמת (`home_score`, `away_score`), סטאטוס (`status`).
* **`predictions`**: מזהה ניחוש (`id`), מקושר ל-`user_id` ו-`match_id`, ניחושי תוצאה (`home_score_pred`, `away_score_pred`), וניקוד שחושב (`points_earned`).

---

## ⚙️ משתני סביבה (Environment Variables)

יש להגדיר את המשתנים הבאים ב-Vercel או בקובץ `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=[https://your-supabase-id.supabase.co](https://your-supabase-id.supabase.co)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_ADMIN_PASSWORD=your-admin-password
