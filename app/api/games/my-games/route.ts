import supabaseStorage from '@/lib/supabase-storage';
import { NextResponse } from 'next/server';
import { requireAuthWithProfile } from '@/lib/supabase-auth';

// Mark this route as dynamic since it uses request headers for auth
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authResult = await requireAuthWithProfile(request);
    
    if (authResult instanceof Response) {
      return authResult; // Return the 401 response
    }
    
    const { userId } = authResult;

    const games = await supabaseStorage.game.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(games);
  } catch (error) {
    console.error('Error fetching user games:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 