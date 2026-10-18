'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function ProfilePage() {
  const [searchName, setSearchName] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [userPredictions, setUserPredictions] = useState([]);
  const [matchesMap, setMatchesMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchName.trim()) return;

    setLoading(true);
    setSearched(true);
    setUserProfile(null);
    setUserPredictions([]);

    try {
      const cleanName = searchName.trim();

      // 1. שליפת הפרופיל לפי שם
      const { data: profiles, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .ilike('full_name', cleanName)
        .limit(1);

      if (profileErr) throw profileErr;

      if (profiles && profiles.length > 0) {
        const profile = profiles[0];
        setUserProfile(profile);

        // 2. שליפת הניחושים של המשתמש
        const { data: predictions, error: predErr } = await supabase
          .from('predictions')
          .select('*')
          .eq('user_id', profile.id);

        if (predErr) throw predErr;
        setUserPredictions(predictions || []);

        // 3. שליפת כל המשחקים
        const { data: matches } = await supabase.from('matches').select('*');
        const dict = {};
        (matches || []).forEach((m) => {
          dict[m.id] = m;
        });
        setMatchesMap(dict);
      }
    } catch (err) {
      console.error('Error fetching profile history:', err);
    } finally {
      setLoading(false);
    }
  };

  // חישוב סטטיסטיקות
  const totalPoints = userPredictions.reduce((sum, p) => sum + (p.points_earned || 0), 0);
  const exactHits = userPredictions.filter((p) => p.points_earned === 3).length;
  const directionHits = userPredictions.filter((p) => p.points_earned === 1).length;
  const avgPoints = userPredictions.length > 0 ? (totalPoints / userPredictions.length).toFixed(1) : '0';

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="text-center mb-8 border-b border-slate-800 pb-6">
        <h1 className="text-4xl font-extrabold text-amber-400 mb-2">netgoals.co.il</h1>
        <p className="text-slate-400 text-lg">פרופיל אישי והיסטוריית ניחושים 👤</p>

        <div className="flex justify-center gap-4 mt-6">
          <Link
            href="/"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold border border-slate-700 transition"
          >
            ⚽ לטופס הניחושים
          </Link>
          <Link
            href="/leaderboard"
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-md"
          >
            🏆 לטבלת המובילים
          </Link>
        </div>
      </header>

      {/* Search Box */}
      <section className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <label className="block text-sm font-semibold text-amber-400">
            איתור פרופיל אישי לפי שם / כינוי:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              required
              placeholder="הכנס את השם שהגשת בטופס (למשל: דור פוגל)"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 text-white rounded-xl px-4 py-3 outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-6 rounded-xl transition text-sm whitespace-nowrap disabled:opacity-50"
            >
              {loading ? 'מחפש...' : 'חפש 🔍'}
            </button>
          </div>
        </form>
      </section>

      {/* Results */}
      {searched && !loading && (
        <>
          {!userProfile ? (
            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 text-center text-slate-400">
              לא נמצא פרופיל בשם <strong className="text-white">"{searchName}"</strong>. ודא שהקשת את השם בדיוק כפי שהוזן בטופס הניחושים.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Overview Card */}
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl text-center">
                <div className="w-16 h-16 bg-amber-400/10 border border-amber-400/30 text-amber-400 text-2xl font-extrabold rounded-2xl flex items-center justify-center mx-auto mb-3">
                  ⚽
                </div>
                <h2 className="text-2xl font-extrabold text-white mb-1">{userProfile.full_name}</h2>
                <p className="text-xs text-slate-400 mb-6">כרטיס שחקן ב-NetGoals</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-2 bg-slate-900/80 p-4 rounded-xl border border-slate-700/60">
                  <div>
                    <span className="text-2xl font-black text-amber-400 block">{totalPoints}</span>
                    <span className="text-[11px] text-slate-400 font-semibold">סך נקודות</span>
                  </div>
                  <div>
                    <span className="text-2xl font-black text-emerald-400 block">{exactHits}</span>
                    <span className="text-[11px] text-slate-400 font-semibold">🎯 בול פגיעה</span>
                  </div>
                  <div>
                    <span className="text-2xl font-black text-sky-400 block">{directionHits}</span>
                    <span className="text-[11px] text-slate-400 font-semibold">✅ בינגו כיוון</span>
                  </div>
                  <div>
                    <span className="text-2xl font-black text-slate-200 block">{avgPoints}</span>
                    <span className="text-[11px] text-slate-400 font-semibold">ממוצע לניחוש</span>
                  </div>
                </div>
              </div>

              {/* Predictions History List */}
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
                <h3 className="text-lg font-bold text-slate-200 mb-4 border-b border-slate-700 pb-2">
                  📋 היסטוריית הניחושים שלי ({userPredictions.length})
                </h3>

                {userPredictions.length === 0 ? (
                  <p className="text-slate-400 text-center py-4">טרם נרשמו ניחושים במערכת.</p>
                ) : (
                  <div className="space-y-4">
                    {userPredictions.map((pred) => {
                      const match = matchesMap[pred.match_id];
                      if (!match) return null;

                      const hasActualScore =
                        match.home_score !== null &&
                        match.home_score !== undefined &&
                        match.away_score !== null &&
                        match.away_score !== undefined;

                      const pts = pred.points_earned || 0;

                      return (
                        <div key={pred.id} className="bg-slate-900/70 border border-slate-700/60 rounded-xl p-4">
                          <div className="flex justify-between items-center text-xs text-amber-400/80 mb-2">
                            <span>{match.league_name}</span>
                            {hasActualScore ? (
                              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono">
                                תוצאת אמת: {match.home_score} - {match.away_score}
                              </span>
                            ) : (
                              <span className="text-slate-500">טרם נקבעה תוצאה</span>
                            )}
                          </div>

                          <div className="flex justify-between items-center text-sm font-bold text-slate-200">
                            <span>{match.home_team}</span>
                            
                            <div className="bg-slate-800 border border-slate-600 px-3 py-1 rounded-lg text-amber-400 text-base font-mono">
                              {pred.home_score_pred} - {pred.away_score_pred}
                            </div>

                            <span>{match.away_team}</span>
                          </div>

                          {hasActualScore && (
                            <div className="mt-2 text-left text-xs">
                              {pts === 3 ? (
                                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                                  🎯 בול פגיעה! (+3 נק')
                                </span>
                              ) : pts === 1 ? (
                                <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                                  ✅ בינגו בכיוון! (+1 נק')
                                </span>
                              ) : (
                                <span className="text-slate-500 font-semibold">פספוס (0 נק')</span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
