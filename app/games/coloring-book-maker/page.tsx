'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Palette, Download, Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import posthog from 'posthog-js';
import { GAME_PROPERTIES, GAME_NAMES } from '@/lib/analytics';

interface ColoringImage {
  id: string;
  prompt: string;
  imageUrl: string;
  createdAt: string;
  likes: number;
}

const ColoringBookMakerPage: React.FC = () => {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [communityImages, setCommunityImages] = useState<ColoringImage[]>([]);
  const [isLoadingCommunity, setIsLoadingCommunity] = useState(true);

  useEffect(() => {
    // Track page visit
    posthog.capture('game_page_visited', {
      [GAME_PROPERTIES.GAME_NAME]: GAME_NAMES.COLORING_BOOK_MAKER,
      page_url: window.location.href,
      referrer: document.referrer
    });

    // Load community images
    loadCommunityImages();
  }, []);

  const loadCommunityImages = async () => {
    try {
      const response = await fetch('/api/coloring-book/images');
      if (response.ok) {
        const images = await response.json();
        setCommunityImages(images);
      }
    } catch (error) {
      console.error('Failed to load community images:', error);
    } finally {
      setIsLoadingCommunity(false);
    }
  };

  const generateColoringPage = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt for your coloring page!');
      return;
    }

    setIsGenerating(true);
    try {
      posthog.capture('coloring_page_generation_started', {
        [GAME_PROPERTIES.GAME_NAME]: GAME_NAMES.COLORING_BOOK_MAKER,
        prompt: prompt.trim()
      });

      const response = await fetch('/api/coloring-book/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      setGeneratedImage(data.imageUrl);
      
      posthog.capture('coloring_page_generated', {
        [GAME_PROPERTIES.GAME_NAME]: GAME_NAMES.COLORING_BOOK_MAKER,
        prompt: prompt.trim(),
        success: true
      });

      toast.success('Your coloring page is ready!');
      
      // Refresh community images to show the new one
      loadCommunityImages();
      
    } catch (error) {
      console.error('Error generating image:', error);
      posthog.capture('coloring_page_generated', {
        [GAME_PROPERTIES.GAME_NAME]: GAME_NAMES.COLORING_BOOK_MAKER,
        prompt: prompt.trim(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      toast.error('Failed to generate coloring page. Please try again!');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      posthog.capture('coloring_page_downloaded', {
        [GAME_PROPERTIES.GAME_NAME]: GAME_NAMES.COLORING_BOOK_MAKER
      });
      
      toast.success('Image downloaded!');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image');
    }
  };

  const handleBackClick = () => {
    posthog.capture('game_page_back_clicked', {
      [GAME_PROPERTIES.GAME_NAME]: GAME_NAMES.COLORING_BOOK_MAKER
    });
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold text-center text-purple-800 flex items-center gap-2">
            <Palette className="text-pink-500" />
            Coloring Book Maker
          </h1>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>

        {/* Generation Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
            Create Your Coloring Page
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Describe what you'd like to color and we'll create a beautiful outline for you!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., a cute unicorn with rainbow wings, a castle with flowers..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && !isGenerating && generateColoringPage()}
              maxLength={100}
            />
            <button
              onClick={generateColoringPage}
              disabled={isGenerating}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Creating...
                </>
              ) : (
                <>
                  <Palette size={20} />
                  Create
                </>
              )}
            </button>
          </div>
        </div>

        {/* Generated Image */}
        {generatedImage && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              Your Coloring Page is Ready!
            </h3>
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src={generatedImage}
                  alt="Generated coloring page"
                  className="max-w-full h-auto rounded-lg shadow-md border-4 border-purple-200"
                  style={{ maxHeight: '500px' }}
                />
                <button
                  onClick={() => downloadImage(generatedImage, `coloring-page-${Date.now()}.png`)}
                  className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full shadow-lg transition-all"
                  title="Download"
                >
                  <Download size={20} className="text-purple-600" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Community Gallery */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Community Gallery
          </h3>
          <p className="text-gray-600 text-center mb-8">
            Check out coloring pages created by other kids!
          </p>
          
          {isLoadingCommunity ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-purple-500" size={32} />
              <span className="ml-2 text-gray-600">Loading community images...</span>
            </div>
          ) : communityImages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Palette size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No community images yet. Be the first to create one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {communityImages.map((image) => (
                <div key={image.id} className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={image.imageUrl}
                      alt={`Coloring page: ${image.prompt}`}
                      className="w-full h-48 object-cover"
                    />
                    <button
                      onClick={() => downloadImage(image.imageUrl, `coloring-page-${image.id}.png`)}
                      className="absolute top-2 right-2 bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full shadow-lg transition-all"
                      title="Download"
                    >
                      <Download size={16} className="text-purple-600" />
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                      {image.prompt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{new Date(image.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ColoringBookMakerPage; 