// localStorage-based storage utility to replace Prisma
// This is a simple in-memory/localStorage solution for development

export interface Game {
  id: string;
  name: string;
  slug: string;
  description?: string;
  author?: string;
  code: string;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage for server-side operations
let serverGames: Game[] = [
  {
    id: 'builtin-1',
    name: 'Snake Game',
    slug: 'snake',
    description: 'Classic Snake game',
    author: 'Gamenzo',
    code: `
// Simple Snake Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 400;

let snake = [{x: 200, y: 200}];
let food = {x: 100, y: 100};
let dx = 20;
let dy = 0;

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw snake
  ctx.fillStyle = 'green';
  snake.forEach(segment => {
    ctx.fillRect(segment.x, segment.y, 20, 20);
  });
  
  // Draw food
  ctx.fillStyle = 'red';
  ctx.fillRect(food.x, food.y, 20, 20);
}

function moveSnake() {
  const head = {x: snake[0].x + dx, y: snake[0].y + dy};
  snake.unshift(head);
  
  if (head.x === food.x && head.y === food.y) {
    food = {
      x: Math.floor(Math.random() * 20) * 20,
      y: Math.floor(Math.random() * 20) * 20
    };
  } else {
    snake.pop();
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp' && dy === 0) { dx = 0; dy = -20; }
  if (e.key === 'ArrowDown' && dy === 0) { dx = 0; dy = 20; }
  if (e.key === 'ArrowLeft' && dx === 0) { dx = -20; dy = 0; }
  if (e.key === 'ArrowRight' && dx === 0) { dx = 20; dy = 0; }
});

setInterval(() => {
  moveSnake();
  drawGame();
}, 100);

drawGame();
    `,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

class GameStorage {
  private storageKey = 'gamenzo_games';
  
  // Helper to generate unique IDs
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Get all games (server-side uses in-memory, client-side uses localStorage)
  private getGames(): Game[] {
    if (typeof window === 'undefined') {
      // Server-side: use in-memory storage
      return serverGames;
    }
    
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) {
        // Initialize with server games
        localStorage.setItem(this.storageKey, JSON.stringify(serverGames));
        return serverGames;
      }
      
      const games = JSON.parse(stored);
      // Convert date strings back to Date objects
      return games.map((game: any) => ({
        ...game,
        createdAt: new Date(game.createdAt),
        updatedAt: new Date(game.updatedAt)
      }));
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return serverGames;
    }
  }

  // Save games (server-side updates in-memory, client-side updates localStorage)
  private saveGames(games: Game[]): void {
    if (typeof window === 'undefined') {
      // Server-side: update in-memory storage
      serverGames = games;
      return;
    }
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(games));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  // Mimic Prisma's game.findMany()
  async findMany(options?: { 
    where?: { userId?: string };
    orderBy?: { createdAt?: 'asc' | 'desc' };
  }): Promise<Game[]> {
    let games = this.getGames();
    
    // Apply where filter
    if (options?.where?.userId) {
      games = games.filter(game => game.userId === options.where!.userId);
    }
    
    // Apply ordering
    if (options?.orderBy?.createdAt) {
      games.sort((a, b) => {
        const aTime = a.createdAt.getTime();
        const bTime = b.createdAt.getTime();
        return options.orderBy!.createdAt === 'desc' ? bTime - aTime : aTime - bTime;
      });
    }
    
    return games;
  }

  // Mimic Prisma's game.findUnique()
  async findUnique(options: { where: { slug?: string; id?: string } }): Promise<Game | null> {
    const games = this.getGames();
    
    if (options.where.slug) {
      return games.find(game => game.slug === options.where.slug) || null;
    }
    
    if (options.where.id) {
      return games.find(game => game.id === options.where.id) || null;
    }
    
    return null;
  }

  // Mimic Prisma's game.create()
  async create(options: { 
    data: {
      name: string;
      slug: string;
      description?: string;
      author?: string;
      code: string;
      userId?: string;
    }
  }): Promise<Game> {
    const games = this.getGames();
    
    const newGame: Game = {
      id: this.generateId(),
      ...options.data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    games.push(newGame);
    this.saveGames(games);
    
    return newGame;
  }

  // Mimic Prisma's game.update()
  async update(options: {
    where: { slug: string };
    data: {
      name?: string;
      description?: string;
      author?: string;
      code?: string;
    }
  }): Promise<Game> {
    const games = this.getGames();
    const gameIndex = games.findIndex(game => game.slug === options.where.slug);
    
    if (gameIndex === -1) {
      throw new Error('Game not found');
    }
    
    const updatedGame: Game = {
      ...games[gameIndex],
      ...options.data,
      updatedAt: new Date()
    };
    
    games[gameIndex] = updatedGame;
    this.saveGames(games);
    
    return updatedGame;
  }

  // Mimic Prisma's game.delete()
  async delete(options: { where: { slug?: string; id?: string } }): Promise<Game> {
    const games = this.getGames();
    let gameIndex = -1;
    
    if (options.where.slug) {
      gameIndex = games.findIndex(game => game.slug === options.where.slug);
    } else if (options.where.id) {
      gameIndex = games.findIndex(game => game.id === options.where.id);
    }
    
    if (gameIndex === -1) {
      throw new Error('Game not found');
    }
    
    const deletedGame = games[gameIndex];
    games.splice(gameIndex, 1);
    this.saveGames(games);
    
    return deletedGame;
  }
}

// Create a singleton instance
const gameStorage = new GameStorage();

// Export an object that mimics the Prisma client structure
export default {
  game: gameStorage
};
