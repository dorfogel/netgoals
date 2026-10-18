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
  const [loadingMatchId, setLoadingMatchId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    loadExistingScores();
  }, []);

  const loadExistingScores = async () => {
    const { data: matches } = await supabase.from('matches').select('*');
    if (matches) {
      const scores = {};
      matches.forEach((m) => {
        if (m.home_score !== null && m.away_score !== null) {
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

  // מנגנון החישוב והעדכון
  const handleSaveAndCalculate = async (matchId) => {
    const scoreData = actualScores[matchId];
    if (!scoreData || scoreData.home === undefined || scoreData.away === undefined) {
      alert('נא להזין תוצאה לשתי הקבוצות');
      return;
    }

    const homeActual = parseInt(scoreData.home, 10);
    const awayActual = parseInt(scoreData.away, 10);

    setLoadingMatchId(matchId);
    setStatusMessage('');

    try {
      // 1. עדכון תוצאת המשחק בטבלת matches
      await supabase
        .from('matches')
        .update({
          home_score: homeActual,
          away_score: awayActual,
          status: 'finished',
        })
        .eq('id', matchId);

      // 2. שליפת כל הניחושים למשחק הזה
      const { data: predictions, error: predErr } = await supabase
        .from('predictions')
        .select('*')
        .eq('match_id', matchId);

      if (predErr) throw predErr;

      // 3. חישוב נקודות לכל ניחוש
      for (const pred of predictions || []) {
        const homePred = pred.home_score_pred;
        const awayPred = pred.away_score_pred;

        let points = 0;

        // בול בתוצאה
        if (homePred === homeActual && awayPred === awayActual) {
          points = 3;
        } 
        // בינגו בכיוון (ניצחון בית / ניצחון חוץ / תיקו)
        else {
          const actualOutcome = Math.sign(homeActual - awayActual);
          const predOutcome = Math.sign(homePred - awayPred);

          if (actualOutcome === predOutcome) {
            points = 1;
          }
        }

        // 4. עדכון הנקודות ב-predictions
        await supabase
          .from('predictions')
          .update({ points_earned: points })
          .eq('id', pred.id);
      }

      setStatusMessage(`✅ התוצאה עודכנה והנקודות חושבו בהצלחה!`);
    } catch (err) {
      console.error('Error calculating scores:', err);
      setStatusMessage('❌ אירעה שגיאה בעדכון התוצאות.');
    } finally {
      setLoadingMatchId(null);
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
          const isLoading = loadingMatchId === match.id;

          return (
            <div key={match.id} className="bg-slate-800 rounded-2xl p-5 border border-slate-700 shadow-lg">
              <div className="text-xs font-semibold text-amber-400 mb-3">{match.league}</div>

              <div className="grid grid-cols-7 items-center gap-2 text-center mb-4">
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

              <button
                onClick={() => handleSaveAndCalculate(match.id)}
                disabled={isLoading}
                className="w-full bg-slate-700 hover:bg-slate-600 text-amber-400 font-bold py-2.5 rounded-xl transition text-sm disabled:opacity-50"
              >
                {isLoading ? 'מחשב נקודות...' : 'שמור תוצאה וחשב נקודות ⚡'}
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}
