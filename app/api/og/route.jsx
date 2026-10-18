import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#020617', // שחור-כחול כהה (slate-950)
          border: '12px solid #fbbf24', // מסגרת זהב (amber-400)
          fontFamily: 'sans-serif',
          direction: 'rtl',
          padding: '40px',
        }}
      >
        {/* אייגון כדורגל */}
        <div style={{ fontSize: 90, marginBottom: 10 }}>⚽</div>

        {/* כותרת מותג בזהב */}
        <div
          style={{
            fontSize: 70,
            fontWeight: 900,
            color: '#fbbf24',
            letterSpacing: '-2px',
            marginBottom: 10,
            textShadow: '0 4px 20px rgba(251, 191, 36, 0.3)',
          }}
        >
          netgoals.co.il
        </div>

        {/* תת כותרת בלבן */}
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: 30,
          }}
        >
          גולים ברשת • מערכת הניחושים הקהילתית
        </div>

        {/* באנר קטן בתחתית */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#1e293b',
            padding: '12px 30px',
            borderRadius: '20px',
            border: '1px solid #334155',
            color: '#fbbf24',
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          🏆 נחשו את תוצאות השבוע והילחמו בטבלת המובילים!
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
