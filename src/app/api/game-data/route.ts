import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase';

function getUserId(session: Session | null): string | null {
  if (!session?.user) return null;
  return (session.user as Session['user'] & { id?: string }).id ?? null;
}

/** GET /api/game-data — fetch the authenticated user's game data */
export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = createServerSupabase();
    const { data, error } = await db
      .from('game_profiles')
      .select('game_data')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      // No saved data yet — return null so client starts fresh
      return NextResponse.json(null);
    }
    return NextResponse.json(data.game_data);
  } catch (err) {
    console.error('[game-data GET]', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

/** PUT /api/game-data — upsert the authenticated user's game data */
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const gameData = await req.json();
    const db = createServerSupabase();
    const { error } = await db.from('game_profiles').upsert({
      user_id: userId,
      email: session?.user?.email ?? null,
      game_data: gameData,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('[game-data PUT]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[game-data PUT]', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
