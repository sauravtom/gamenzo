'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CommunityGame, getCommunityGames } from '@/data';

const gradients = [
  'from-purple-500 via-pink-500 to-red-500',
  'from-blue-500 via-cyan-500 to-teal-500',
  'from-green-500 via-emerald-500 to-lime-500',
  'from-orange-500 via-yellow-500 to-amber-500',
  'from-gray-700 via-slate-600 to-zinc-500',
  'from-indigo-500 via-blue-600 to-cyan-600',
  'from-rose-400 via-fuchsia-500 to-indigo-500',
  'from-sky-400 to-blue-500',
];

const getRandomGradient = () => {
  return gradients[Math.floor(Math.random() * gradients.length)];
};

export default function CommunityGames() {
  const [communityGames, setCommunityGames] = useState<CommunityGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const games = await getCommunityGames();
        setCommunityGames(games);
      } catch (error) {
        console.error('Error loading community games:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  if (loading) {
    return (
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8">Community Created Games</h2>
          <div className="text-center text-gray-500">Loading community games...</div>
        </div>
      </div>
    );
  }

  if (communityGames.length === 0) {
    return (
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8">Community Created Games</h2>
          <div className="text-center text-gray-500">
            <p>No community games yet!</p>
            <p className="mt-2">
              <a href="/platform" className="text-blue-500 hover:text-blue-600 underline">
                Be the first to create one →
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Community Collection
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Discover amazing games created by the community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {communityGames.map(game => (
            <Card
              key={game.id}
              className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 cursor-pointer"
            >
              <a href={`/c/games/${game.slug}`} className="absolute inset-0 z-20" />
              {/* Gradient Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${getRandomGradient()} opacity-90 group-hover:opacity-100 transition-opacity duration-300`}
              />

              {/* Animated Overlay */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />

              {/* Floating Elements */}
              <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                <div className="w-16 h-16 rounded-full bg-white/20 animate-pulse" />
              </div>
              <div className="absolute bottom-4 left-4 opacity-10 group-hover:opacity-30 transition-opacity duration-300">
                <div
                  className="w-12 h-12 rounded-full bg-white/20 animate-bounce"
                  style={{ animationDelay: '0.5s' }}
                />
              </div>

              <CardContent className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
                <div>
                  <Badge
                    variant="secondary"
                    className="mb-4 bg-white/20 text-white border-white/30 hover:bg-white/30 transition-colors duration-200"
                  >
                    Community Game
                  </Badge>

                  <h3 className="text-2xl font-bold mb-2 group-hover:text-yellow-200 transition-colors duration-300">
                    {game.name}
                  </h3>

                  {game.author && (
                    <p className="text-white/80 mb-6 group-hover:text-white transition-colors duration-300">
                      by {game.author}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Animated Progress Bar Placeholder */}
                  <div className="w-full bg-white/20 rounded-full h-1 overflow-hidden mt-4">
                    <div
                      className="h-full bg-white rounded-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-out"
                    />
                  </div>
                </div>
              </CardContent>

              {/* Shine Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 