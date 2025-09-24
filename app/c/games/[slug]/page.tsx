'use client';

import { useEffect, useState, useRef } from 'react';
import { Loader2, AlertCircle, User, Calendar, ExternalLink, ArrowLeft, Maximize, Minimize } from 'lucide-react';
import Link from 'next/link';

type Game = {
  name: string;
  description: string;
  code: string;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
};

const p5jsCdnUrl = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.3/p5.min.js';

function PublishedGamePageContent({ params }: { params: { slug: string } }) {
  const [game, setGame] = useState<Game | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/games/${params.slug}`);
        if (!response.ok) {
          throw new Error('Game not found');
        }
        const data = await response.json();
        setGame(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [params.slug]);

  const toggleFullscreen = async () => {
    if (!gameContainerRef.current) return;

    try {
      if (!isFullscreen) {
        // Enter fullscreen
        if (gameContainerRef.current.requestFullscreen) {
          await gameContainerRef.current.requestFullscreen();
        } else if ((gameContainerRef.current as any).webkitRequestFullscreen) {
          await (gameContainerRef.current as any).webkitRequestFullscreen();
        } else if ((gameContainerRef.current as any).msRequestFullscreen) {
          await (gameContainerRef.current as any).msRequestFullscreen();
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const getIframeContent = (code: string) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>p5.js Sketch</title>
        <style>
            body { 
              margin: 0; 
              overflow: hidden; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              height: 100vh; 
              background-color: hsl(var(--background)); 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }
        </style>
        <script src="${p5jsCdnUrl}"></script>
    </head>
    <body>
        <script>
            ${code}
        </script>
    </body>
    </html>
  `;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          </div>
          <p className="text-muted-foreground text-sm font-medium">Loading game...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="relative mb-6">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Game Not Found</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link 
            href="/"
            className="inline-flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!game) {
    return null;
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/"
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </Link>
            <div className="h-6 w-px bg-border"></div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{game.name}</h1>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                {game.author && (
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>By {game.author}</span>
                  </div>
                )}
                {game.createdAt && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(game.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={toggleFullscreen}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <ExternalLink className="w-5 h-5" />
            </button>
          </div>
        </div>
        {game.description && (
          <div className="max-w-7xl mx-auto mt-3">
            <p className="text-muted-foreground">{game.description}</p>
          </div>
        )}
      </div>

      {/* Game Content */}
      <div 
        ref={gameContainerRef}
        className={`flex-1 overflow-hidden ${isFullscreen ? 'bg-black' : ''}`}
      >
        <iframe
          srcDoc={getIframeContent(game.code)}
          className="w-full h-full border-0"
          title={game.name}
        />
      </div>
    </div>
  );
}

export default function PublishedGamePage({ params }: { params: { slug: string } }) {
  return (
    <PublishedGamePageContent params={params} />
  );
} 