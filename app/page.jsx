'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from './lib/supabase';

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [fetchingMatches, setFetchingMatches] = useState(true);

  const [userName, setUserName] = useState('');
  const [predictions, setPredictions] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    setFetchingMatches(true);
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMatches(data || []);
    } catch (err) {
      console.error('Error loading matches:', err);
    } finally {
      setFetchingMatches(false);
    }
  };

  const handleScoreChange = (matchId, team, value) => {
    setPredictions((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanName = userName.trim();
      let userId = null;

      const { data: existingProfiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('full_name', cleanName)
        .limit(1);

      if (existingProfiles && existingProfiles.length > 0) {
        userId = existingProfiles[0].id;
      } else {
        userId = crypto.randomUUID();
        await supabase.from('profiles').insert([
          {
            id: userId,
            full_name: cleanName,
          },
        ]);
      }

      // סינון משחקים פתוחים בלבד (בדיקת בטיחות בצד הלקוח והשרת)
      const now = new Date();
      const openMatches = matches.filter((m) => {
        if (!m.match_time) return true;
        return new Date(m.match_time) > now;
      });

      if (openMatches.length === 0) {
        alert('כל המשחקים במחזור כבר ננעלו לניחושים.');
        setLoading(false);
        return;
      }

      // מחיקת ניחושים ישנים אך ורק למשחקים שעדיין פתוחים
      const openMatchIds = openMatches.map((m) => m.id);
      for (const mId of openMatchIds) {
        await supabase
          .from('predictions')
          .delete()
          .eq('user_id', userId)
          .eq('match_id', mId);
      }

      const predictionInserts = openMatches.map((match) => {
        const pred = predictions[match.id] || { home: '0', away: '0' };
        return {
          user_id: userId,
          match_id: match.id,
          home_score_pred: parseInt(pred.home || '0', 10),
          away_score_pred: parseInt(pred.away || '0', 10),
        };
      });

      await supabase.from('predictions').insert(predictionInserts);

      setSubmitted(true);
    } catch (err) {
      console.error('Submission error:', err);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const getWhatsAppShareLink = () => {
    let text = `⚽ *הניחושים של ${userName || 'משתמש'} ל-NetGoals:* \n\n`;
    matches.forEach((m) => {
      const pred = predictions[m.id] || {};
      const home = pred.home ?? '0';
      const away = pred.away ?? '0';
      text += `• ${m.home_team} ${home} - ${away} ${m.away_team}\n`;
    });
    text += '\n🔥 בואו להילחם מולי בליגה: https://netgoals.co.il';
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  const now = new Date();
  const allLocked = matches.length > 0 && matches.every((m) => m.match_time && new Date(m.match_time) <= now);

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
{/* Header */}
      <header className="text-center mb-8 border-b border-slate-800 pb-6">
        <h1 className="text-4xl font-extrabold text-amber-400 mb-2">netgoals.co.il</h1>
        <p className="text-slate-400 text-lg">גולים ברשת • מערכת הניחושים הקהילתית</p>
        
        <div className="flex justify-center flex-wrap gap-2 mt-6">
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-1.5 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30 px-3.5 py-2 rounded-xl font-bold transition text-xs"
          >
            🏆 טבלת המובילים
          </Link>
          <Link
            href="/stats"
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl font-bold transition text-xs"
          >
            📊 מגמות קהילה
          </Link>
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl font-bold transition text-xs"
          >
            👤 הפרופיל שלי
          </Link>
        </div>
      </header>

      {fetchingMatches ? (
        <div className="text-center py-12 text-slate-400 font-semibold">
          טוען את משחקי המחזור... ⏳
        </div>
      ) : matches.length === 0 ? (
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 text-center text-slate-300">
          אין משחקים פעילים במחזור כרגע. חזרו בהמשך!
        </div>
      ) : !submitted ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 mb-6 text-center">
            <h2 className="text-xl font-bold text-slate-200">מחזור המשחקים המרכזי</h2>
            <p className="text-sm text-slate-400">נחשו את התוצאות המדויקות לפני שריקת הפתיחה</p>
          </div>

          <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 shadow-lg">
            <label className="block text-sm font-semibold text-amber-400 mb-2">
              שם מלא / כינוי לטבלת המובילים:
            </label>
            <input
              type="text"
              required
              placeholder="הכנס שם או כינוי (למשל: דור פוגל)"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-3 outline-none focus:border-amber-400"
            />
          </div>

          {matches.map((match) => {
            const matchDate = match.match_time ? new Date(match.match_time) : null;
            const isLocked = matchDate ? now >= matchDate : false;

            return (
              <div
                key={match.id}
                className={`bg-slate-800 rounded-2xl p-5 border transition ${
                  isLocked ? 'border-rose-500/30 opacity-75' : 'border-slate-700 shadow-lg'
                }`}
              >
                <div className="flex justify-between items-center text-xs text-amber-400 mb-3">
                  <span className="font-semibold">{match.league_name}</span>
                  {matchDate && (
                    <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                      isLocked ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-slate-400'
                    }`}>
                      {isLocked ? '🔒 ננעל לניחושים' : '⏰ שריקת פתיחה: ' + matchDate.toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-7 items-center gap-2 text-center">
                  <span className="col-span-2 font-bold text-lg text-slate-100">{match.home_team}</span>
                  
                  <input
                    type="number"
                    min="0"
                    max="9"
                    placeholder="0"
                    disabled={isLocked}
                    required={!isLocked}
                    className="col-span-1 bg-slate-900 border border-slate-600 text-white text-center text-xl rounded-lg py-2 focus:border-amber-400 outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                    onChange={(e) => handleScoreChange(match.id, 'home', e.target.value)}
                  />

                  <span className="col-span-1 text-slate-500 font-bold">:</span>

                  <input
                    type="number"
                    min="0"
                    max="9"
                    placeholder="0"
                    disabled={isLocked}
                    required={!isLocked}
                    className="col-span-1 bg-slate-900 border border-slate-600 text-white text-center text-xl rounded-lg py-2 focus:border-amber-400 outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                    onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
                  />

                  <span className="col-span-2 font-bold text-lg text-slate-100">{match.away_team}</span>
                </div>
              </div>
            );
          })}

          <button
            type="submit"
            disabled={loading || allLocked}
            className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xl py-4 rounded-xl transition shadow-lg shadow-amber-400/10 mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'שומר ניחושים...' : allLocked ? '🔒 כל המשחקים ננעלו' : 'שליחת הניחושים שלי 🚀'}
          </button>
        </form>
      ) : (
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 text-center space-y-6">
          <div className="text-5xl">🎉</div>
          <h2 className="text-3xl font-extrabold text-amber-400">הניחושים נשמרו בהצלחה!</h2>
          <p className="text-slate-300">
            תודה {userName}! הניחושים שלך נשמרו במערכת. עכשיו הזמן לאתגר את החברים ב-WhatsApp!
          </p>

          <a
            href={getWhatsAppShareLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-lg py-4 rounded-xl transition shadow-lg"
          >
            שתף את הניחושים ב-WhatsApp 📲
          </a>

          <Link
            href="/leaderboard"
            className="inline-block w-full bg-slate-700 hover:bg-slate-600 text-white font-bold text-lg py-3 rounded-xl transition mt-2"
          >
            🏆 מעבר לטבלת המובילים
          </Link>
        </div>
      )}
    </main>
  );
}
