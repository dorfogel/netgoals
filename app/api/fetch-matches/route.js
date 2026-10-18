import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET() {
  try {
    const apiKey = process.env.RAPIDAPI_FOOTBALL_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'משתנה RAPIDAPI_FOOTBALL_KEY חסר ב-Vercel' }, { status: 500 });
    }

    // קריאה ל-RapidAPI לקבלת אירועים מתוזמנים
    const response = await fetch(
      'https://sofascore3.p.rapidapi.com/matches/v2/get-scheduled-events?page=0',
      {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'sofascore3.p.rapidapi.com',
          'x-rapidapi-key': apiKey.trim(),
        },
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('API Error Response:', errText);
      return NextResponse.json(
        { error: `שגיאה מה-API (סטטוס ${response.status}): ${errText || 'אין הרשאה גישה'}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const events = data.events || data.data || [];

    if (events.length === 0) {
      return NextResponse.json({ message: 'לא נמצאו משחקים קרובים ב-API' });
    }

    // סינון והמרת 5 המשחקים הקרובים לפורמט המערכת
    const newMatches = events.slice(0, 5).map((item) => ({
      id: crypto.randomUUID(),
      home_team: item.homeTeam?.name || item.homeTeam?.shortName || 'קבוצת בית',
      away_team: item.awayTeam?.name || item.awayTeam?.shortName || 'קבוצת חוץ',
      league_name: item.tournament?.name || item.category?.name || 'ליגת העל',
      match_time: item.startTimestamp ? new Date(item.startTimestamp * 1000).toISOString() : new Date().toISOString(),
      status: 'scheduled',
    }));

    const { error } = await supabase.from('matches').insert(newMatches);
    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: `יובאו בהצלחה ${newMatches.length} משחקים למערכת!`,
      matches: newMatches,
    });
  } catch (err) {
    console.error('Error fetching matches:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
