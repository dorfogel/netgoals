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
      return NextResponse.json({ error: 'Missing RapidAPI Key' }, { status: 500 });
    }

    // קריאה ל-RapidAPI מול Sofascore לקבלת משחקי מפתח/featured
    const response = await fetch(
      'https://sofascore3.p.rapidapi.com/matches/get-featured-events',
      {
        headers: {
          'x-rapidapi-host': 'sofascore3.p.rapidapi.com',
          'x-rapidapi-key': apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API response status: ${response.status}`);
    }

    const data = await response.json();
    const events = data.events || data.response || [];

    if (events.length === 0) {
      return NextResponse.json({ message: 'לא נמצאו משחקים קרובים ב-API' });
    }

    // לוקחים את 5 המשחקים הראשונים וממירים לפורמט של המערכת
    const newMatches = events.slice(0, 5).map((item) => ({
      id: crypto.randomUUID(),
      home_team: item.homeTeam?.name || item.home_team || 'קבוצת בית',
      away_team: item.awayTeam?.name || item.away_team || 'קבוצת חוץ',
      league_name: item.tournament?.name || item.league_name || 'ליגת העל',
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
