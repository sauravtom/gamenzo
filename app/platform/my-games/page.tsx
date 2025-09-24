'use client';

import { useState, useEffect, Suspense } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Edit, ExternalLink, Calendar, User, Loader2, GamepadIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AuthGuard } from '@/components/auth-guard';

type UserGame = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  author?: string;
  code: string;
  createdAt: string;
  updatedAt: string;
};

function MyGamesPageContent() {
  const { user, getAccessToken } = usePrivy();
  const [games, setGames] = useState<UserGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyGames();
  }, []);

  const fetchMyGames = async () => {
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        setError('Authentication required');
        return;
      }

      const response = await fetch('/api/games/my-games', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }

      const gamesData = await response.json();
      setGames(gamesData);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              <Link 
                href="/platform" 
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Game Maker</span>
              </Link>
              <div className="h-6 w-px bg-border"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                  <Image src="/icon.webp" alt="Gamenzo" width={32} height={32} className="rounded-lg" />
                </div>
                <h1 className="text-xl font-bold text-foreground">
                  My Games
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm bg-muted/50 rounded-lg px-3 py-1.5">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary text-xs font-semibold">
                  {(user?.email?.address?.[0] || 'U').toUpperCase()}
                </span>
              </div>
              <span className="text-muted-foreground max-w-[150px] truncate">
                {user?.email?.address || 'User'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Your Published Games</h2>
            <p className="text-muted-foreground">Games you've created and published with Enzo AI</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                <span className="text-muted-foreground font-medium">Loading your games...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-8 max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-destructive mb-2">Error loading games</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <button 
                  onClick={fetchMyGames}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : games.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-card border border-border rounded-2xl p-8 max-w-md mx-auto shadow-sm">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <GamepadIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No games yet</h3>
                <p className="text-muted-foreground mb-6">You haven't published any games yet. Create something amazing!</p>
                <Link 
                  href="/platform"
                  className="inline-flex items-center bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-all shadow-sm"
                >
                  Start Creating
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {games.map((game) => (
                <div 
                  key={game.id} 
                  className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {game.name}
                    </h3>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <Link 
                        href={`/platform?edit=${game.slug}`}
                        className="p-2 bg-muted hover:bg-primary/10 hover:text-primary rounded-lg transition-colors flex-shrink-0"
                        title="Edit game"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <Link 
                        href={`/c/games/${game.slug}`}
                        target="_blank"
                        className="p-2 bg-muted hover:bg-green-500/10 hover:text-green-600 rounded-lg transition-colors flex-shrink-0"
                        title="View game"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {game.description || 'No description provided'}
                  </p>
                  
                  <div className="space-y-2 text-xs text-muted-foreground border-t border-border pt-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3 h-3" />
                      <span>Created {new Date(game.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3 h-3" />
                      <span>Updated {new Date(game.updatedAt).toLocaleDateString()}</span>
                    </div>
                    {game.author && (
                      <div className="flex items-center space-x-2">
                        <User className="w-3 h-3" />
                        <span>By {game.author}</span>
                      </div>
                    )}
                  </div>

                  {/* Game slug for reference */}
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="bg-muted/50 rounded px-2 py-1">
                      <span className="text-xs text-muted-foreground font-mono">
                        /c/games/{game.slug}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Call to action when games exist */}
          {games.length > 0 && (
            <div className="mt-12 text-center">
              <div className="bg-muted/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">Ready to create more?</h3>
                <p className="text-muted-foreground mb-4">Keep building amazing games with Enzo AI</p>
                <Link 
                  href="/platform"
                  className="inline-flex items-center bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-all shadow-sm"
                >
                  Create New Game
                </Link>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default function MyGamesPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <AuthGuard>
        <MyGamesPageContent />
      </AuthGuard>
    </Suspense>
  );
} 