export interface Project {
    name: string
    url?: string
    img: string
    category: string
}

export interface CommunityGame {
    id: string
    name: string
    slug: string
    description?: string
    author?: string
    userId?: string
    createdAt: string
    updatedAt: string
}

export const projects: Project[] = [
    {
        name: "Command Center",
        url: "/games/command-center",
        img: "/games/command-center.png",
        category: "Command Center"
    },
    {
        name: "Pokedex",
        url: "/games/pokedex",
        img: "/games/pokedex.png",
        category: "Pokedex"
    },
    {
        name: "Sexy Math",
        url: "/games/sexy-math",
        img: "/games/sexy-math.png",
        category: "Math"
    },
    {
        name: "Trump's Wild Ride",
        url: "/games/trump-wild-ride",
        img: "/games/wild-ride.png",
        category: "Racing"
    },
    {
        name: "Coloring Book Maker",
        url: "/games/coloring-book-maker",
        img: "/games/coloring-book-maker.png",
        category: "Coloring Book"
    },
    {
        name: "Hand Tracking Art",
        url: "/games/hand-tracking",
        img: "/games/hand-tracking.png",
        category: "Interactive"
    },
    {
        name: "Pixel Pirates",
        img: "/games/pixel-pirates.jpg",
        category: "RPG"
    },
    {
        name: "Neon Racer",
        img: "/games/neon-racer.jpg",
        category: "Racing"
    },
    {
        name: "Monster Tamer",
        img: "/games/monster-tamer.jpg",
        category: "RPG"
    },
    {
        name: "Medieval Mayhem",
        img: "/games/medieval-mayhem.jpg",
        category: "Action"
    },
    {
        name: "Dungeon Delver",
        img: "/games/dungeon-delver.jpg",
        category: "RPG"
    },
    {
        name: "Robot Wars",
        img: "/games/robot-wars.jpg",
        category: "Action"
    },
    {
        name: "Speed Demons",
        img: "/games/speed-demons.jpg",
        category: "Racing"
    },
    {
        name: "Dragon Quest",
        img: "/games/dragon-quest.jpg",
        category: "RPG"
    },
    {
        name: "Ninja Warriors",
        img: "/games/ninja-warriors.jpg",
        category: "Action"
    },
    {
        name: "Forest Explorer",
        img: "/games/forest-explorer.jpg",
        category: "Adventure"
    },
    {
        name: "Super Jump",
        img: "/games/super-jump.jpg",
        category: "Platformer"
    },
    {
        name: "Turbo Rally",
        img: "/games/turbo-rally.jpg",
        category: "Racing"
    },
    {
        name: "Cave Explorer",
        img: "/games/cave-explorer.jpg",
        category: "Adventure"
    },
    {
        name: "Pixel Runner",
        img: "/games/pixel-runner.jpg",
        category: "Platformer"
    },
    {
        name: "Magic Knights",
        img: "/games/magic-knights.jpg",
        category: "RPG"
    }
]

// Function to get community games from API
export const getCommunityGames = async (): Promise<CommunityGame[]> => {
    try {
        const response = await fetch('/api/games');
        if (!response.ok) {
            throw new Error('Failed to fetch community games');
        }
        const allGames = await response.json();
        // Filter for community games (those with userId)
        return allGames.filter((game: any) => game.userId);
    } catch (error) {
        console.error('Error fetching community games:', error);
        return [];
    }
};