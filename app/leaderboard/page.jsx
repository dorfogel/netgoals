'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // 1. שליפת כל הפרופילים
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // 2. שליפת כל הניחושים
      const { data: predictions, error: predError } = await supabase
        .from('predictions')
        .select('*');

      if (predError) throw predError;

      // 3. חישוב סך הניקוד והניחושים לכל משתמש
      const userScores = (profiles || []).map((profile) => {
        const userPreds = (predictions || []).filter((p) => p.user_id === profile.id);
        const totalPoints = userPreds.reduce((sum, p) => sum + (p.points_earned || 0), 0);

        return {
          id: profile.id,
          name: profile.full_name || 'משתמש אנונימי',
          points: totalPoints,
          predictionsCount: userPreds.length,
        };
      });

      // 4. מיון לפי ניקוד יורד
      userScores.sort((a, b) => b.points - a.points);

      setLeaderboard(userScores);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {/* Header & Navigation */}
      <header className="text-center mb-8 border-b border-slate-800 pb-6">
        <h1 className="text-4xl font-extrabold text-amber-400 mb-2">netgoals.co.il</h1>
        <p className="text-slate-400 text-lg">טבלת המובילים הקהילתית 🏆</p>
        
        <div className="flex justify-center gap-4 mt-6">
          <Link
            href="/"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold border border-slate-700 transition"
          >
            ⚽ לטופס הניחושים
          </Link>
          <button
            onClick={fetchLeaderboard}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-md"
          >
            🔄 רענון טבלה
          </button>
        </div>
      </header>

      {/* Leaderboard Table */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
        <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex justify-between items-center">
          <span className="font-bold text-slate-200">דירוג מנחשים</span>
          <span className="text-xs text-slate-400">מתעדכן בלייב מ-Supabase</span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 font-semibold">
            טוען נתונים מציגים... ⏳
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            עדיין אין מנחשים בטבלה. היו הראשונים לנחש!
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {leaderboard.map((user, index) => {
              const rank = index + 1;
              let badge = `${rank}`;
              let rankStyle = 'text-slate-400 bg-slate-900/50';

              if (rank === 1) {
                badge = '🥇';
                rankStyle = 'bg-amber-400/10 text-amber-400 border border-amber-400/30';
              } else if (rank === 2) {
                badge = '🥈';
                rankStyle = 'bg-slate-300/10 text-slate-300 border border-slate-300/30';
              } else if (rank === 3) {
                badge = '🥉';
                rankStyle = 'bg-amber-700/10 text-amber-600 border border-amber-700/30';
              }

              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 hover:bg-slate-700/30 transition"
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-9 h-9 flex items-center justify-center rounded-xl font-extrabold text-sm ${rankStyle}`}>
                      {badge}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-100 text-base">{user.name}</h3>
                      <p className="text-xs text-slate-400">{user.predictionsCount} ניחושים במערכת</p>
                    </div>
                  </div>

                  <div className="text-left">
                    <span className="text-xl font-black text-amber-400">{user.points}</span>
                    <span className="text-xs text-slate-400 block font-semibold">נקודות</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
