'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

const MATCHES_MAP = {
  '11111111-1111-1111-1111-111111111111': { home: 'מכבי חיפה', away: 'מכבי תל אביב', league: 'ליגת העל' },
  '22222222-2222-2222-2222-222222222222': { home: 'בית"ר ירושלים', away: 'הפועל באר שבע', league: 'ליגת העל' },
  '33333333-3333-3333-3333-333333333333': { home: 'ברצלונה', away: 'ריאל מדריד', league: 'לה ליגה' },
  '44444444-4444-4444-4444-444444444444': { home: 'ארסנל', away: 'מנצ\'סטר סיטי', league: 'פרמייר ליג' },
  '55555555-5555-5555-5555-555555555555': { home: 'באיירן מינכן', away: 'בורוסיה דורטמונד', league: 'בונדסליגה' },
};

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [matchesData, setMatchesData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null); // המשתמש שנבחר לצפייה בפירוט

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. שליפת פרופילים
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      if (profilesError) throw profilesError;

      // 2. שליפת ניחושים
      const { data: predictions, error: predError } = await supabase
        .from('predictions')
        .select('*');
      if (predError) throw predError;

      // 3. שליפת תוצאות אמת של משחקים
      const { data: matches } = await supabase.from('matches').select('*');
      const matchesDict = {};
      (matches || []).forEach((m) => {
        matchesDict[m.id] = m;
      });
      setMatchesData(matchesDict);

      // 4. חישוב לכל משתמש
      const userScores = (profiles || []).map((profile) => {
        const userPreds = (predictions || []).filter((p) => p.user_id === profile.id);
        const totalPoints = userPreds.reduce((sum, p) => sum + (p.points_earned || 0), 0);

        return {
          id: profile.id,
          name: profile.full_name || 'משתמש אנונימי',
          points: totalPoints,
          predictionsCount: userPreds.length,
          predictions: userPreds,
        };
      });

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
      {/* Header */}
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
            onClick={fetchData}
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
          <span className="text-xs text-amber-400 font-medium">💡 לחץ על מנחש לצפייה בניחושים שלו</span>
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
                  onClick={() => setSelectedUser(user)}
                  className="flex items-center justify-between p-4 hover:bg-slate-700/40 cursor-pointer transition group"
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-9 h-9 flex items-center justify-center rounded-xl font-extrabold text-sm ${rankStyle}`}>
                      {badge}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-100 text-base group-hover:text-amber-400 transition">
                        {user.name}
                      </h3>
                      <p className="text-xs text-slate-400">{user.predictionsCount} ניחושים במערכת</p>
                    </div>
                  </div>

                  <div className="text-left flex items-center gap-3">
                    <div>
                      <span className="text-xl font-black text-amber-400">{user.points}</span>
                      <span className="text-xs text-slate-400 block font-semibold">נקודות</span>
                    </div>
                    <span className="text-slate-500 group-hover:text-amber-400 text-sm font-bold transition">👁️</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: User Predictions Details */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-700 pb-4 mb-4">
              <div>
                <h2 className="text-xl font-extrabold text-amber-400">הניחושים של {selectedUser.name}</h2>
                <p className="text-xs text-slate-400">סך הכל: {selectedUser.points} נקודות</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-white text-2xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Predictions List */}
            <div className="space-y-4">
              {Object.keys(MATCHES_MAP).map((matchId) => {
                const matchInfo = MATCHES_MAP[matchId];
                const pred = selectedUser.predictions.find((p) => p.match_id === matchId);
                const actualMatch = matchesData[matchId];

                const hasActualScore =
                  actualMatch &&
                  actualMatch.home_score !== null &&
                  actualMatch.away_score !== null;

                const pointsEarned = pred ? pred.points_earned || 0 : 0;

                return (
                  <div key={matchId} className="bg-slate-900/70 border border-slate-700/60 rounded-xl p-4">
                    <div className="flex justify-between items-center text-xs text-amber-400/80 mb-2">
                      <span>{matchInfo.league}</span>
                      {hasActualScore ? (
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono">
                          תוצאת אמת: {actualMatch.home_score} - {actualMatch.away_score}
                        </span>
                      ) : (
                        <span className="text-slate-500">טרם הסתיים</span>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-sm font-bold text-slate-200">
                      <span>{matchInfo.home}</span>
                      
                      <div className="bg-slate-800 border border-slate-600 px-3 py-1 rounded-lg text-amber-400 text-base font-mono">
                        {pred ? `${pred.home_score_pred} - ${pred.away_score_pred}` : 'לא ניחש'}
                      </div>

                      <span>{matchInfo.away}</span>
                    </div>

                    {hasActualScore && (
                      <div className="mt-2 text-left text-xs">
                        {pointsEarned === 3 ? (
                          <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                            🎯 בול פגיעה! (+3 נק')
                          </span>
                        ) : pointsEarned === 1 ? (
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

            {/* Close Button */}
            <button
              onClick={() => setSelectedUser(null)}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition mt-6 text-sm"
            >
              סגור חלון
            </button>

          </div>
        </div>
      )}
    </main>
  );
}
