'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function CommunityStats() {
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. שליפת כל המשחקים
      const { data: matchesData, error: mErr } = await supabase
        .from('matches')
        .select('*')
        .order('created_at', { ascending: true });

      if (mErr) throw mErr;

      // 2. שליפת כל הניחושים
      const { data: predsData, error: pErr } = await supabase
        .from('predictions')
        .select('*');

      if (pErr) throw pErr;

      setMatches(matchesData || []);
      setPredictions(predsData || []);
    } catch (err) {
      console.error('Error fetching stats data:', err);
    } finally {
      setLoading(false);
    }
  };

  // פונקציית עזר לחישוב התפלגות ניחושים למשחק
  const calculateMatchStats = (matchId) => {
    const matchPreds = predictions.filter((p) => p.match_id === matchId);
    const total = matchPreds.length;

    if (total === 0) {
      return { total: 0, homeWinPct: 0, drawPct: 0, awayWinPct: 0, topScore: '-' };
    }

    let homeWins = 0;
    let draws = 0;
    let awayWins = 0;
    const scoreCounts = {};

    matchPreds.forEach((p) => {
      const h = p.home_score_pred;
      const a = p.away_score_pred;

      if (h > a) homeWins++;
      else if (h === a) draws++;
      else awayWins++;

      const scoreKey = `${h}-${a}`;
      scoreCounts[scoreKey] = (scoreCounts[scoreKey] || 0) + 1;
    });

    // מציאת התוצאה הפופולרית ביותר
    let topScore = '-';
    let maxCount = 0;
    Object.entries(scoreCounts).forEach(([score, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topScore = score;
      }
    });

    return {
      total,
      homeWinPct: Math.round((homeWins / total) * 100),
      drawPct: Math.round((draws / total) * 100),
      awayWinPct: Math.round((awayWins / total) * 100),
      topScore,
    };
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="text-center mb-8 border-b border-slate-800 pb-6">
        <h1 className="text-4xl font-extrabold text-amber-400 mb-2">netgoals.co.il</h1>
        <p className="text-slate-400 text-lg">מגמות ותגובות הקהילה 📊</p>

        <div className="flex justify-center gap-3 mt-6">
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

      {/* Main Content */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 font-semibold">
          מחשב מגמות קהילה... ⏳
        </div>
      ) : matches.length === 0 ? (
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 text-center text-slate-400">
          אין משחקים במערכת להצגת סטטיסטיקות.
        </div>
      ) : (
        <div className="space-y-6">
          {matches.map((match) => {
            const stats = calculateMatchStats(match.id);

            return (
              <div key={match.id} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
                {/* Match Header */}
                <div className="flex justify-between items-center text-xs text-amber-400 mb-4 border-b border-slate-700/60 pb-3">
                  <span className="font-semibold">{match.league_name}</span>
                  <span className="text-slate-400">{stats.total} מנחשים במערכת</span>
                </div>

                {/* Teams Row */}
                <div className="flex justify-between items-center text-lg font-bold text-slate-100 mb-6">
                  <span className="w-2/5 text-right">{match.home_team}</span>
                  <span className="text-xs bg-slate-900 text-amber-400 border border-slate-700 px-3 py-1 rounded-full font-mono">
                    VS
                  </span>
                  <span className="w-2/5 text-left">{match.away_team}</span>
                </div>

                {stats.total === 0 ? (
                  <p className="text-xs text-center text-slate-500 py-2">טרם נרשמו ניחושים למשחק זה</p>
                ) : (
                  <>
                    {/* Visual Progress Bar */}
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                        <span className="text-emerald-400">{match.home_team} ({stats.homeWinPct}%)</span>
                        <span className="text-amber-400">תיקו ({stats.drawPct}%)</span>
                        <span className="text-sky-400">{match.away_team} ({stats.awayWinPct}%)</span>
                      </div>

                      <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden flex border border-slate-700">
                        <div
                          style={{ width: `${stats.homeWinPct}%` }}
                          className="bg-emerald-500 transition-all duration-500"
                          title={`ניצחון ${match.home_team}: ${stats.homeWinPct}%`}
                        />
                        <div
                          style={{ width: `${stats.drawPct}%` }}
                          className="bg-amber-400 transition-all duration-500"
                          title={`תיקו: ${stats.drawPct}%`}
                        />
                        <div
                          style={{ width: `${stats.awayWinPct}%` }}
                          className="bg-sky-500 transition-all duration-500"
                          title={`ניצחון ${match.away_team}: ${stats.awayWinPct}%`}
                        />
                      </div>
                    </div>

                    {/* Most Popular Score Badge */}
                    <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-700 flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-semibold">🎯 התוצאה הנפוצה ביותר בקהילה:</span>
                      <span className="text-amber-400 font-mono font-bold text-sm bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                        {stats.topScore}
                      </span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
