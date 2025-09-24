import supabaseStorage from '@/lib/supabase-storage';
import { NextResponse } from 'next/server';
import { requireAuthWithProfile } from '@/lib/supabase-auth';
// Mark this route as dynamic since POST method uses request headers for auth
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const games = await supabaseStorage.game.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await requireAuthWithProfile(request);
    
    if (authResult instanceof Response) {
      return authResult; // Return the 401 response
    }
    
    const { userId } = authResult;
    const { name, slug, description, code, author } = await request.json();

    if (!name || !slug || !code) {
      return NextResponse.json({ error: 'Name, slug, and code are required' }, { status: 400 });
    }

    // Check if slug is unique
    const existingGame = await supabaseStorage.game.findUnique({
      where: { slug },
    });

    if (existingGame) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }

    const game = await supabaseStorage.game.create({
      data: {
        name,
        slug,
        description,
        author,
        code,
        userId,
      },
    });

    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 