import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Mark this route as dynamic since it uses search parameters
export const dynamic = 'force-dynamic';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request: NextRequest) {
  try {
    // Get query parameters for pagination
    const { searchParams } = request.nextUrl;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Search for coloring book images in Cloudinary
    const searchResult = await cloudinary.search
      .expression('folder:coloring-book AND tags:coloring-book')
      .sort_by('created_at', 'desc')
      .max_results(Math.min(limit, 100)) // Cap at 100 for performance
      .execute();

    // Transform the results to match our interface
    const images = searchResult.resources.map((resource: any) => ({
      id: resource.public_id,
      prompt: resource.context?.prompt || 'Coloring page',
      imageUrl: resource.secure_url,
      createdAt: resource.created_at,
      likes: Math.floor(Math.random() * 50), // Random likes for now - you could store this in a database later
    }));

    // Apply offset manually since Cloudinary search doesn't support it directly
    const paginatedImages = images.slice(offset, offset + limit);

    return NextResponse.json(paginatedImages);

  } catch (error) {
    console.error('Error fetching community images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch community images' },
      { status: 500 }
    );
  }
} 