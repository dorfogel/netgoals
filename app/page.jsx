'use client';
import { useState } from 'react';

const INITIAL_MATCHES = [
  { id: '1', homeTeam: 'מכבי חיפה', awayTeam: 'מכבי תל אביב', time: 'שבת, 20:30', league: 'ליגת העל' },
  { id: '2', homeTeam: 'בית"ר ירושלים', awayTeam: 'הפועל באר שבע', time: 'שבת, 19:30', league: 'ליגת העל' },
  { id: '3', homeTeam: 'ברצלונה', awayTeam: 'ריאל מדריד', time: 'ראשון, 22:00', league: 'לה ליגה' },
  { id: '4', homeTeam: 'ארסנל', awayTeam: 'מנצ\'סטר סיטי', time: 'ראשון, 18:30', league: 'פרמייר ליג' },
  { id: '5', homeTeam: 'באיירן מינכן', awayTeam: 'בורוסיה דורטמונד', time: 'שבת, 19:30', league: 'בונדסליגה' },
];

export default function Home() {
  const [predictions, setPredictions] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleScoreChange = (matchId, team, value) => {
    setPredictions((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: value,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const getWhatsAppShareLink = () => {
    let text = '⚽ *הניחושים שלי ל-NetGoals השבוע:* \n\n';
    INITIAL_MATCHES.forEach((m) => {
      const pred = predictions[m.id] || {};
      const home = pred.home ?? '-';
      const away = pred.away ?? '-';
      text += `• ${m.homeTeam} ${home} - ${away} ${m.awayTeam}\n`;
    });
    text += '\n🔥 בואו להילחם מולי בליגה: https://netgoals.co.il';
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="text-center mb-8 border-b border-slate-800 pb-6">
        <h1 className="text-4xl font-extrabold text-amber-400 mb-2">netgoals.co.il</h1>
        <p className="text-slate-400 text-lg">גולים ברשת • מערכת הניחושים הקהילתית</p>
      </header>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 mb-6 text-center">
            <h2 className="text-xl font-bold text-slate-200">מחזור 5 המשחקים המרכזיים</h2>
            <p className="text-sm text-slate-400">נחשו את התוצאות המדויקות למשחקי השבוע</p>
          </div>

          {INITIAL_MATCHES.map((match) => (
            <div key={match.id} className="bg-slate-800 rounded-2xl p-5 border border-slate-700 shadow-lg">
              <div className="flex justify-between items-center text-xs text-amber-400 mb-3">
                <span className="font-semibold">{match.league}</span>
                <span className="text-slate-400">{match.time}</span>
              </div>

              <div className="grid grid-cols-7 items-center gap-2 text-center">
                <span className="col-span-2 font-bold text-lg text-slate-100">{match.homeTeam}</span>
                
                <input
                  type="number"
                  min="0"
                  max="9"
                  placeholder="0"
                  required
                  className="col-span-1 bg-slate-900 border border-slate-600 text-white text-center text-xl rounded-lg py-2 focus:border-amber-400 outline-none"
                  onChange={(e) => handleScoreChange(match.id, 'home', e.target.value)}
                />

                <span className="col-span-1 text-slate-500 font-bold">:</span>

                <input
                  type="number"
                  min="0"
                  max="9"
                  placeholder="0"
                  required
                  className="col-span-1 bg-slate-900 border border-slate-600 text-white text-center text-xl rounded-lg py-2 focus:border-amber-400 outline-none"
                  onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
                />

                <span className="col-span-2 font-bold text-lg text-slate-100">{match.awayTeam}</span>
              </div>
            </div>
          ))}

          <button
            type="submit"
            className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xl py-4 rounded-xl transition shadow-lg shadow-amber-400/10 mt-8"
          >
            שליחת הניחושים שלי 🚀
          </button>
        </form>
      ) : (
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 text-center space-y-6">
          <div className="text-5xl">🎉</div>
          <h2 className="text-3xl font-extrabold text-amber-400">הניחושים נשמרו בהצלחה!</h2>
          <p className="text-slate-300">עכשיו הזמן לאתגר את החברים בקבוצת ה-WhatsApp!</p>

          <a
            href={getWhatsAppShareLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-lg py-4 rounded-xl transition shadow-lg"
          >
            שתף את הניחושים ב-WhatsApp 📲
          </a>

          <button
            onClick={() => setSubmitted(false)}
            className="block text-sm text-slate-400 hover:text-white mx-auto underline mt-4"
          >
            עריכת הניחושים
          </button>
        </div>
      )}
    </main>
  );
}
