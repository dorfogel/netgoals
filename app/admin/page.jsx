'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

const MATCHES_LIST = [
  { id: '11111111-1111-1111-1111-111111111111', homeTeam: 'מכבי חיפה', awayTeam: 'מכבי תל אביב', league: 'ליגת העל' },
  { id: '22222222-2222-2222-2222-222222222222', homeTeam: 'בית"ר ירושלים', awayTeam: 'הפועל באר שבע', league: 'ליגת העל' },
  { id: '33333333-3333-3333-3333-333333333333', homeTeam: 'ברצלונה', awayTeam: 'ריאל מדריד', league: 'לה ליגה' },
  { id: '44444444-4444-4444-4444-444444444444', homeTeam: 'ארסנל', awayTeam: 'מנצ\'סטר סיטי', league: 'פרמייר ליג' },
  { id: '55555555-5555-5555-5555-555555555555', homeTeam: 'באיירן מינכן', awayTeam: 'בורוסיה דורטמונד', league: 'בונדסליגה' },
];

export default function AdminPanel() {
  const [actualScores, setActualScores] = useState({});
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    loadExistingScores();
  }, []);

  const loadExistingScores = async () => {
    const { data: matches } = await supabase.from('matches').select('*');
    if (matches && matches.length > 0) {
      const scores = {};
      matches.forEach((m) => {
        if (m.home_score !== null && m.home_score !== undefined && m.away_score !== null && m.away_score !== undefined) {
          scores[m.id] = { home: m.home_score, away: m.away_score };
        }
      });
      setActualScores(scores);
    }
  };

  const handleScoreInput = (matchId, team, value) => {
    setActualScores((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: value,
      },
    }));
  };

  // מנגנון חישוב ועדכון גורף לכל המשחקים שהוזנו
  const handleSaveAllAndCalculate = async () => {
    setLoading(true);
    setStatusMessage('');

    try {
      // 1. שליפת כל הניחושים הקיימים במערכת
      const { data: predictions, error: predErr } = await supabase
        .from('predictions')
        .select('*');

      if (predErr) throw predErr;

      let updatedMatchesCount = 0;

      for (const match of MATCHES_LIST) {
        const scoreData = actualScores[match.id];
        if (!scoreData || scoreData.home === '' || scoreData.away === '' || scoreData.home === undefined || scoreData.away === undefined) {
          continue; // דילוג על משחקים שלא הוזנה לצידם תוצאה
        }

        const homeActual = parseInt(scoreData.home, 10);
        const awayActual = parseInt(scoreData.away, 10);

        // א) עדכון/הכנסת תוצאת המשחק בטבלת matches
        await supabase
          .from('matches')
          .upsert([
            {
              id: match.id,
              home_team: match.homeTeam,
              away_team: match.awayTeam,
              league_name: match.league,
              home_score: homeActual,
              away_score: awayActual,
              match_time: new Date().toISOString(),
              status: 'finished',
            },
          ]);

        // ב) חישוב נקודות לכל הניחושים של המשחק הספציפי הזה
        const matchPredictions = (predictions || []).filter((p) => p.match_id === match.id);

        for (const pred of matchPredictions) {
          const homePred = pred.home_score_pred;
          const awayPred = pred.away_score_pred;

          let points = 0;

          // בול בתוצאה המדויקת (3 נקודות)
          if (homePred === homeActual && awayPred === awayActual) {
            points = 3;
          } 
          // בינגו בכיוון (1 נקודה)
          else {
            const actualOutcome = Math.sign(homeActual - awayActual);
            const predOutcome = Math.sign(homePred - awayPred);

            if (actualOutcome === predOutcome) {
              points = 1;
            }
          }

          // עדכון הנקודות בניחוש
          await supabase
            .from('predictions')
            .update({ points_earned: points })
            .eq('id', pred.id);
        }

        updatedMatchesCount++;
      }

      setStatusMessage(`✅ עדכון הושלם בהצלחה עבור ${updatedMatchesCount} משחקים! הניקוד בטבלה עודכן.`);
    } catch (err) {
      console.error('Error calculating scores:', err);
      setStatusMessage('❌ אירעה שגיאה בעדכון התוצאות.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <header className="text-center mb-8 border-b border-slate-800 pb-6">
        <h1 className="text-4xl font-extrabold text-amber-400 mb-2">netgoals Admin</h1>
        <p className="text-slate-400 text-lg">ניהול תוצאות משחקים וחישוב נקודות ⚙️</p>

        <div className="flex justify-center gap-4 mt-6">
          <Link
            href="/leaderboard"
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-md"
          >
            🏆 מעבר לטבלת המובילים
          </Link>
          <Link
            href="/"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold border border-slate-700 transition"
          >
            ⚽ לטופס הניחושים
          </Link>
        </div>
      </header>

      {statusMessage && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center font-bold rounded-xl">
          {statusMessage}
        </div>
      )}

      <div className="space-y-6">
        {MATCHES_LIST.map((match) => {
          const score = actualScores[match.id] || { home: '', away: '' };

          return (
            <div key={match.id} className="bg-slate-800 rounded-2xl p-5 border border-slate-700 shadow-lg">
              <div className="text-xs font-semibold text-amber-400 mb-3">{match.league}</div>

              <div className="grid grid-cols-7 items-center gap-2 text-center">
                <span className="col-span-2 font-bold text-lg text-slate-100">{match.homeTeam}</span>

                <input
                  type="number"
                  min="0"
                  max="9"
                  placeholder="-"
                  value={score.home ?? ''}
                  className="col-span-1 bg-slate-900 border border-slate-600 text-white text-center text-xl rounded-lg py-2 focus:border-amber-400 outline-none"
                  onChange={(e) => handleScoreInput(match.id, 'home', e.target.value)}
                />

                <span className="col-span-1 text-slate-500 font-bold">:</span>

                <input
                  type="number"
                  min="0"
                  max="9"
                  placeholder="-"
                  value={score.away ?? ''}
                  className="col-span-1 bg-slate-900 border border-slate-600 text-white text-center text-xl rounded-lg py-2 focus:border-amber-400 outline-none"
                  onChange={(e) => handleScoreInput(match.id, 'away', e.target.value)}
                />

                <span className="col-span-2 font-bold text-lg text-slate-100">{match.awayTeam}</span>
              </div>
            </div>
          );
        })}

        <button
          onClick={handleSaveAllAndCalculate}
          disabled={loading}
          className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xl py-4 rounded-xl transition shadow-lg mt-8 disabled:opacity-50"
        >
          {loading ? 'מחשב נקודות לכל המשחקים...' : 'שמור וחשב את כל התוצאות ⚡'}
        </button>
      </div>
    </main>
  );
}
