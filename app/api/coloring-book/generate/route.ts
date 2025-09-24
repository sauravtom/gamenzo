import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate prompt length
    if (prompt.trim().length === 0 || prompt.length > 100) {
      return NextResponse.json(
        { error: 'Prompt must be between 1 and 100 characters' },
        { status: 400 }
      );
    }

    // Generate image using the external API with kid-friendly prefix
    const fullPrompt = `A basic black and white coloring book page for a 7 year old of ${prompt.trim()}`;
    const imageApiUrl = `https://orange-glade-50a4.alenyohannan71.workers.dev/?prompt=${encodeURIComponent(fullPrompt)}`;
    
    console.log('Calling image generation API:', imageApiUrl);
    console.log('Full prompt:', fullPrompt);
    
    const imageResponse = await fetch(imageApiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'image/*,*/*',
      },
    });

    if (!imageResponse.ok) {
      console.error('Image generation failed:', imageResponse.status, imageResponse.statusText);
      return NextResponse.json(
        { error: 'Failed to generate image from external API' },
        { status: 500 }
      );
    }

    // Get the image as a buffer
    const imageBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(imageBuffer);

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'coloring-book',
          public_id: `coloring-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          tags: ['coloring-book', 'generated'],
          context: {
            prompt: prompt.trim(),
            created_at: new Date().toISOString(),
          },
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    });

    console.log('Image uploaded to Cloudinary:', uploadResult);

    return NextResponse.json({
      success: true,
      imageUrl: (uploadResult as any).secure_url,
      publicId: (uploadResult as any).public_id,
      prompt: prompt.trim(),
    });

  } catch (error) {
    console.error('Error in generate API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 