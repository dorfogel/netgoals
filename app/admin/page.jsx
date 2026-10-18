'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'netgoals2026';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [matches, setMatches] = useState([]);
  const [actualScores, setActualScores] = useState({});
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // שדות להוספת משחק חדש
  const [newHomeTeam, setNewHomeTeam] = useState('');
  const [newAwayTeam, setNewAwayTeam] = useState('');
  const [newLeague, setNewLeague] = useState('ליגת העל');
  const [newMatchTime, setNewMatchTime] = useState('');

  useEffect(() => {
    const savedAuth = sessionStorage.getItem('netgoals_admin_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
      fetchMatches();
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem('netgoals_admin_auth', 'true');
      setIsAuthenticated(true);
      setLoginError('');
      fetchMatches();
    } else {
      setLoginError('סיסמה שגויה. נסה שוב.');
    }
  };

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMatches(data || []);

      const scores = {};
      (data || []).forEach((m) => {
        if (m.home_score !== null && m.home_score !== undefined && m.away_score !== null && m.away_score !== undefined) {
          scores[m.id] = { home: m.home_score, away: m.away_score };
        }
      });
      setActualScores(scores);
    } catch (err) {
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMatch = async (e) => {
    e.preventDefault();
    if (!newHomeTeam.trim() || !newAwayTeam.trim()) return;

    setLoading(true);
    setStatusMessage('');

    try {
      const newMatchId = crypto.randomUUID();
      const matchTimestamp = newMatchTime ? new Date(newMatchTime).toISOString() : new Date().toISOString();

      const { error } = await supabase.from('matches').insert([
        {
          id: newMatchId,
          home_team: newHomeTeam.trim(),
          away_team: newAwayTeam.trim(),
          league_name: newLeague.trim(),
          match_time: matchTimestamp,
          status: 'scheduled',
        },
      ]);

      if (error) throw error;

      setNewHomeTeam('');
      setNewAwayTeam('');
      setNewMatchTime('');
      setStatusMessage('✅ המשחק נוסף בהצלחה למחזור!');
      await fetchMatches();
    } catch (err) {
      console.error('Error adding match:', err);
      setStatusMessage('❌ שגיאה בהוספת המשחק.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMatch = async (matchId) => {
    if (!confirm('האם למחוק את המשחק ואת כל הניחושים הקשורים אליו?')) return;

    setLoading(true);
    try {
      await supabase.from('predictions').delete().eq('match_id', matchId);
      await supabase.from('matches').delete().eq('id', matchId);
      setStatusMessage('🗑️ המשחק נמחק בהצלחה.');
      await fetchMatches();
    } catch (err) {
      console.error('Error deleting match:', err);
    } finally {
      setLoading(false);
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

  const handleSaveAllAndCalculate = async () => {
    setLoading(true);
    setStatusMessage('');

    try {
      const { data: predictions, error: predErr } = await supabase
        .from('predictions')
        .select('*');

      if (predErr) throw predErr;

      let updatedCount = 0;

      for (const match of matches) {
        const scoreData = actualScores[match.id];
        if (!scoreData || scoreData.home === '' || scoreData.away === '' || scoreData.home === undefined || scoreData.away === undefined) {
          continue;
        }

        const homeActual = parseInt(scoreData.home, 10);
        const awayActual = parseInt(scoreData.away, 10);

        await supabase
          .from('matches')
          .update({
            home_score: homeActual,
            away_score: awayActual,
            status: 'finished',
          })
          .eq('id', match.id);

        const matchPredictions = (predictions || []).filter((p) => p.match_id === match.id);

        for (const pred of matchPredictions) {
          const homePred = pred.home_score_pred;
          const awayPred = pred.away_score_pred;

          let points = 0;

          if (homePred === homeActual && awayPred === awayActual) {
            points = 3;
          } else {
            const actualOutcome = Math.sign(homeActual - awayActual);
            const predOutcome = Math.sign(homePred - awayPred);

            if (actualOutcome === predOutcome) {
              points = 1;
            }
          }

          await supabase
            .from('predictions')
            .update({ points_earned: points })
            .eq('id', pred.id);
        }

        updatedCount++;
      }

      setStatusMessage(`✅ עדכון התוצאות והנקודות הושלם עבור ${updatedCount} משחקים!`);
      await fetchMatches();
    } catch (err) {
      console.error('Error calculating scores:', err);
      setStatusMessage('❌ אירעה שגיאה בחישוב התוצאות.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="max-w-md mx-auto px-4 py-16">
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-xl text-center">
          <div className="text-4xl mb-3">🔒</div>
          <h1 className="text-2xl font-bold text-amber-400 mb-2">כניסת מנהל למערכת</h1>
          <p className="text-sm text-slate-400 mb-6">הזן סיסמת אדמין כדי לגשת לפאנל הניהול</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              required
              placeholder="הכנס סיסמת אדמין"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 text-white text-center rounded-xl px-4 py-3 outline-none focus:border-amber-400"
            />
            {loginError && <p className="text-rose-400 text-sm font-semibold">{loginError}</p>}
            <button
              type="submit"
              className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold py-3.5 rounded-xl transition shadow-lg"
            >
              התחבר לפאנל 🚀
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-700">
            <Link href="/" className="text-xs text-slate-400 hover:text-white underline">
              חזרה לטופס הניחושים
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <header className="text-center mb-8 border-b border-slate-800 pb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full font-semibold">
            ● אדמין מחובר
          </span>
          <button
            onClick={() => {
              sessionStorage.removeItem('netgoals_admin_auth');
              setIsAuthenticated(false);
            }}
            className="text-xs text-slate-400 hover:text-rose-400 underline"
          >
            התנתק
          </button>
        </div>

        <h1 className="text-4xl font-extrabold text-amber-400 mb-2">netgoals Admin</h1>
        <p className="text-slate-400 text-lg">ניהול מחזורים, משחקים ותוצאות ⚙️</p>

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

      {/* Form: Add New Match */}
      <section className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl mb-8">
        <h2 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
          ➕ הוספת משחק חדש למחזור
        </h2>

        <form onSubmit={handleAddMatch} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-semibold">קבוצת בית:</label>
              <input
                type="text"
                required
                placeholder="למשל: מכבי נתניה"
                value={newHomeTeam}
                onChange={(e) => setNewHomeTeam(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-semibold">קבוצת חוץ:</label>
              <input
                type="text"
                required
                placeholder="למשל: הפועל תל אביב"
                value={newAwayTeam}
                onChange={(e) => setNewAwayTeam(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-semibold">מסגרת / ליגה:</label>
              <input
                type="text"
                required
                placeholder="למשל: ליגת העל"
                value={newLeague}
                onChange={(e) => setNewLeague(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs text-amber-400 mb-1 font-semibold">⏰ מועד שריקת פתיחה (נעילה):</label>
              <input
                type="datetime-local"
                required
                value={newMatchTime}
                onChange={(e) => setNewMatchTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl transition shadow-md disabled:opacity-50"
          >
            {loading ? 'מוסיף משחק...' : 'הוסף משחק למערכת 🚀'}
          </button>
        </form>
      </section>

      {/* List & Score Management */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-slate-200 border-b border-slate-700 pb-2">
          ⚽ משחקי המחזור הנוכחי ({matches.length})
        </h2>

        {matches.length === 0 ? (
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 text-center text-slate-400">
            אין משחקים פעילים במחזור. השתמש בטופס למעלה כדי להוסיף משחקים!
          </div>
        ) : (
          matches.map((match) => {
            const score = actualScores[match.id] || { home: '', away: '' };
            const matchDate = match.match_time ? new Date(match.match_time) : null;
            const isPast = matchDate ? new Date() > matchDate : false;

            return (
              <div key={match.id} className="bg-slate-800 rounded-2xl p-5 border border-slate-700 shadow-lg relative">
                <div className="flex justify-between items-center text-xs font-semibold text-amber-400 mb-3">
                  <div className="flex items-center gap-2">
                    <span>{match.league_name}</span>
                    {matchDate && (
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${isPast ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-700 text-slate-300'}`}>
                        {isPast ? '🔒 נעול (' + matchDate.toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' }) + ')' : '⏰ ' + matchDate.toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteMatch(match.id)}
                    className="text-slate-500 hover:text-rose-400 transition"
                    title="מחק משחק"
                  >
                    🗑️ מחק
                  </button>
                </div>

                <div className="grid grid-cols-7 items-center gap-2 text-center">
                  <span className="col-span-2 font-bold text-lg text-slate-100">{match.home_team}</span>

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

                  <span className="col-span-2 font-bold text-lg text-slate-100">{match.away_team}</span>
                </div>
              </div>
            );
          })
        )}

        {matches.length > 0 && (
          <button
            onClick={handleSaveAllAndCalculate}
            disabled={loading}
            className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xl py-4 rounded-xl transition shadow-lg mt-8 disabled:opacity-50"
          >
            {loading ? 'מחשב נקודות...' : 'שמור תוצאות וחשב נקודות ⚡'}
          </button>
        )}
      </section>
    </main>
  );
}
