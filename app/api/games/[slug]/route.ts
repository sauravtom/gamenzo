import supabaseStorage from '@/lib/supabase-storage';
import { NextResponse } from 'next/server';
import { requireAuthWithProfile } from '@/lib/supabase-auth';

// Mark this route as dynamic since PUT method uses request headers for auth
export const dynamic = 'force-dynamic';
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const game = await supabaseStorage.game.findUnique({
      where: { slug: params.slug },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    return NextResponse.json(game);
  } catch (error) {
    console.error(`Error fetching game with slug ${params.slug}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const authResult = await requireAuthWithProfile(request);
    
    if (authResult instanceof Response) {
      return authResult; // Return the 401 response
    }
    
    const { userId } = authResult;
    const { name, description, code, author } = await request.json();

    if (!name || !code) {
      return NextResponse.json({ error: 'Name and code are required' }, { status: 400 });
    }

    // Check if the game exists and belongs to the user
    const existingGame = await supabaseStorage.game.findUnique({
      where: { slug: params.slug },
    });

    if (!existingGame) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (existingGame.user_id !== userId) {
      return NextResponse.json({ error: 'You can only edit your own games' }, { status: 403 });
    }

    const updatedGame = await supabaseStorage.game.update({
      where: { slug: params.slug },
      data: {
        name,
        description,
        author,
        code,
      },
    });

    return NextResponse.json(updatedGame);
  } catch (error) {
    console.error(`Error updating game with slug ${params.slug}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 