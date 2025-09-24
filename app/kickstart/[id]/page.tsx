'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { usePrivy } from '@privy-io/react-auth'
import { AuthGuard } from '@/components/auth-guard'
import { KickstartNav } from '@/components/kickstart-nav'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import { 
  ArrowLeft,
  Heart,
  Share2,
  DollarSign,
  Users,
  Calendar,
  Trophy,
  MessageCircle,
  Star,
  ExternalLink,
  Play,
  Image as ImageIcon,
  FileText,
  Zap
} from 'lucide-react'

// Mock data - in a real app this would come from an API
const mockCampaignData = {
  '1': {
    id: '1',
    title: 'Pixel Quest: Retro Adventure',
    description: 'A nostalgic 16-bit RPG with modern gameplay mechanics and an epic storyline.',
    fullDescription: `Pixel Quest: Retro Adventure brings back the golden age of RPGs with a modern twist. Explore vast dungeons, battle mythical creatures, and uncover ancient secrets in a beautifully crafted pixel art world.

Our game features:
• Classic turn-based combat with strategic depth
• Over 50 hours of engaging storyline
• Customizable character classes and skills  
• Beautiful hand-crafted pixel art environments
• Original orchestral soundtrack
• Local co-op multiplayer mode
• Cross-platform save sync

We're a small indie team passionate about creating memorable gaming experiences. Your support will help us polish the game, add more content, and bring this vision to life.`,
    creator: 'RetroGameDev',
    creatorImage: '/games/pixel-pirates.jpg',
    goal: 25000,
    raised: 18500,
    backers: 342,
    daysLeft: 15,
    image: '/games/pixel-pirates.jpg',
    category: 'RPG',
    featured: true,
    status: 'active',
    images: [
      '/games/pixel-pirates.jpg',
      '/games/dragon-quest.jpg',
      '/games/forest-explorer.jpg'
    ],
    rewards: [
      {
        id: '1',
        amount: 10,
        title: 'Digital Thank You',
        description: 'Your name in the credits + exclusive wallpapers',
        backers: 45,
        estimated: 'December 2024'
      },
      {
        id: '2',
        amount: 25,
        title: 'Early Access',
        description: 'Beta access + digital thank you rewards',
        backers: 128,
        estimated: 'November 2024'
      },
      {
        id: '3',
        amount: 50,
        title: 'Collector\'s Edition',
        description: 'Digital deluxe version + soundtrack + art book',
        backers: 89,
        estimated: 'December 2024'
      },
      {
        id: '4',
        amount: 100,
        title: 'Developer\'s Pack',
        description: 'All previous rewards + exclusive developer commentary',
        backers: 34,
        estimated: 'December 2024'
      }
    ],
    updates: [
      {
        id: '1',
        title: 'Milestone Reached: 70% Funded!',
        content: 'Amazing news! We\'ve reached 70% of our funding goal with 15 days still to go. Thank you to all our amazing backers!',
        date: '2024-01-15',
        likes: 28
      },
      {
        id: '2', 
        title: 'New Gameplay Video Released',
        content: 'Check out our latest gameplay footage showing the combat system and character progression.',
        date: '2024-01-12',
        likes: 45
      }
    ],
    comments: [
      {
        id: '1',
        user: 'GamerMike92',
        content: 'This looks amazing! Can\'t wait to play it. The art style is perfect.',
        date: '2024-01-16',
        likes: 12
      },
      {
        id: '2',
        user: 'PixelFan',
        content: 'Backed! Love seeing quality indie RPGs like this.',
        date: '2024-01-15',
        likes: 8
      }
    ]
  },
  '2': {
    id: '2',
    title: 'Neon Racer: Future Streets',
    description: 'High-speed cyberpunk racing with customizable vehicles and online multiplayer.',
    fullDescription: `Race through neon-soaked streets in this high-octane cyberpunk racing experience. Customize your ride, compete online, and climb the leaderboards in the most stylish racing game of the year.

Features include:
• Stunning cyberpunk visuals with real-time ray tracing
• 20+ customizable vehicles with deep modification systems
• 8-player online multiplayer racing
• Story mode with branching narratives
• Dynamic weather and day/night cycles
• Cross-platform play and progression
• Original synthwave soundtrack

Join us in creating the ultimate cyberpunk racing experience!`,
    creator: 'CyberSpeed Studios',
    goal: 40000,
    raised: 8200,
    backers: 156,
    daysLeft: 28,
    image: '/games/neon-racer.jpg',
    category: 'Racing',
    featured: false,
    status: 'active',
    images: [
      '/games/neon-racer.jpg',
      '/games/speed-demons.jpg',
      '/games/turbo-rally.jpg'
    ],
    rewards: [
      {
        id: '1',
        amount: 15,
        title: 'Speed Demon',
        description: 'Digital copy + exclusive neon skin pack',
        backers: 32,
        estimated: 'March 2024'
      },
      {
        id: '2',
        amount: 35,
        title: 'Street Racer',
        description: 'Early access + exclusive vehicles + soundtrack',
        backers: 67,
        estimated: 'February 2024'
      },
      {
        id: '3',
        amount: 75,
        title: 'Cyber Champion',
        description: 'All previous + your custom livery in the game',
        backers: 28,
        estimated: 'March 2024'
      }
    ],
    updates: [
      {
        id: '1',
        title: 'Pre-Alpha Gameplay Revealed!',
        content: 'Check out our first gameplay trailer showing the racing mechanics and visual effects.',
        date: '2024-01-10',
        likes: 34
      }
    ],
    comments: [
      {
        id: '1',
        user: 'RaceFan88',
        content: 'This looks incredible! The graphics are next level.',
        date: '2024-01-11',
        likes: 15
      }
    ]
  },
  '3': {
    id: '3',
    title: 'Mystic Forest Explorer',
    description: 'Peaceful exploration game with beautiful hand-drawn environments.',
    fullDescription: `Embark on a tranquil journey through mystical forests in this meditative exploration experience. Discover hidden secrets, befriend woodland creatures, and find inner peace in nature's embrace.

What awaits you:
• Hand-painted environments inspired by Studio Ghibli films
• Relaxing ambient soundtrack that responds to your actions
• No combat or time pressure - pure exploration
• Photography mode to capture beautiful moments
• Seasonal changes that affect the world
• Multiple endings based on your choices
• Accessibility features for all players

Perfect for unwinding after a long day or sharing magical moments with family.`,
    creator: 'NatureGames',
    goal: 15000,
    raised: 16200,
    backers: 287,
    daysLeft: 3,
    image: '/games/forest-explorer.jpg',
    category: 'Adventure',
    featured: false,
    status: 'funded',
    images: [
      '/games/forest-explorer.jpg',
      '/games/cave-explorer.jpg',
      '/games/magic-knights.jpg'
    ],
    rewards: [
      {
        id: '1',
        amount: 12,
        title: 'Forest Friend',
        description: 'Digital copy + wallpaper collection',
        backers: 78,
        estimated: 'January 2024'
      },
      {
        id: '2',
        amount: 25,
        title: 'Nature Guardian',
        description: 'All previous + digital art book + soundtrack',
        backers: 124,
        estimated: 'January 2024'
      }
    ],
    updates: [
      {
        id: '1',
        title: 'We Did It! Fully Funded!',
        content: 'Thanks to your incredible support, we\'ve reached our funding goal! Development is now in full swing.',
        date: '2024-01-08',
        likes: 89
      }
    ],
    comments: [
      {
        id: '1',
        user: 'ZenGamer',
        content: 'Finally, a game that focuses on peace and beauty. Thank you!',
        date: '2024-01-09',
        likes: 23
      }
    ]
  },
  '4': {
    id: '4',
    title: 'Space Miner Tycoon',
    description: 'Build your asteroid mining empire in this strategic management game.',
    fullDescription: `Take command of your own space mining corporation in this deep strategy game. Manage resources, research new technologies, and expand your empire across the galaxy.

Core gameplay features:
• Complex resource management and economics
• Research tree with 100+ technologies
• Fleet management and space exploration
• Diplomatic relations with alien factions
• Real-time strategy with pause-and-play mechanics
• Procedurally generated galaxy maps
• Mod support and level editor
• Campaign mode with 30+ missions

Build the ultimate space empire and dominate the cosmos!`,
    creator: 'CosmicGames',
    goal: 35000,
    raised: 2100,
    backers: 45,
    daysLeft: 42,
    image: '/games/robot-wars.jpg',
    category: 'Strategy',
    featured: false,
    status: 'active',
    images: [
      '/games/robot-wars.jpg',
      '/games/ninja-warriors.jpg',
      '/games/medieval-mayhem.jpg'
    ],
    rewards: [
      {
        id: '1',
        amount: 20,
        title: 'Space Cadet',
        description: 'Digital copy + ship blueprints collection',
        backers: 15,
        estimated: 'June 2024'
      },
      {
        id: '2',
        amount: 40,
        title: 'Fleet Commander',
        description: 'Early access + exclusive ships + soundtrack',
        backers: 18,
        estimated: 'May 2024'
      },
      {
        id: '3',
        amount: 80,
        title: 'Galaxy Emperor',
        description: 'All previous + design your own ship + developer access',
        backers: 8,
        estimated: 'June 2024'
      }
    ],
    updates: [
      {
        id: '1',
        title: 'Development Update: Mining Mechanics',
        content: 'We\'ve been working hard on the core mining mechanics. Check out this dev diary showing how resource extraction will work.',
        date: '2024-01-05',
        likes: 12
      }
    ],
    comments: [
      {
        id: '1',
        user: 'StrategyFan',
        content: 'Love the concept! Reminds me of classic space 4X games but with a modern twist.',
        date: '2024-01-06',
        likes: 8
      }
    ]
  },
  '5': {
    id: '5',
    title: 'Dragon Knights Online',
    description: 'Multiplayer fantasy game with dragon taming and kingdom building.',
    fullDescription: `Enter a magical realm where dragons soar and kingdoms rise! Team up with friends to tame legendary dragons, build mighty fortresses, and engage in epic battles that will determine the fate of the realm.

Epic features await:
• Tame and ride over 50 different dragon species
• Build and customize your own kingdom
• 4-player cooperative campaign mode
• Large-scale PvP battles with up to 100 players
• Deep crafting system with legendary equipment
• Dynamic weather affecting dragon abilities
• Cross-platform play (PC, Mobile, Console)
• Regular content updates and seasonal events

Join thousands of players in the ultimate dragon fantasy experience!`,
    creator: 'MythicRealms',
    goal: 50000,
    raised: 32800,
    backers: 521,
    daysLeft: 8,
    image: '/games/dragon-quest.jpg',
    category: 'MMO',
    featured: true,
    status: 'active',
    images: [
      '/games/dragon-quest.jpg',
      '/games/magic-knights.jpg',
      '/games/dungeon-delver.jpg'
    ],
    rewards: [
      {
        id: '1',
        amount: 25,
        title: 'Dragon Rider',
        description: 'Game access + exclusive dragon mount',
        backers: 156,
        estimated: 'April 2024'
      },
      {
        id: '2',
        amount: 50,
        title: 'Knight Commander',
        description: 'All previous + premium kingdom starter pack',
        backers: 189,
        estimated: 'April 2024'
      },
      {
        id: '3',
        amount: 100,
        title: 'Dragon Lord',
        description: 'All previous + legendary dragon + custom armor',
        backers: 98,
        estimated: 'April 2024'
      },
      {
        id: '4',
        amount: 200,
        title: 'Realm Founder',
        description: 'All previous + immortal NPC + beta access',
        backers: 45,
        estimated: 'March 2024'
      }
    ],
    updates: [
      {
        id: '1',
        title: 'Stretch Goals Unlocked!',
        content: 'Thanks to your amazing support, we\'ve unlocked aerial combat and the volcanic dragon species!',
        date: '2024-01-14',
        likes: 156
      },
      {
        id: '2',
        title: 'Beta Testing Begins Soon',
        content: 'We\'re preparing for closed beta testing next month. All Knight Commander backers and above will get access!',
        date: '2024-01-10',
        likes: 89
      }
    ],
    comments: [
      {
        id: '1',
        user: 'DragonMaster99',
        content: 'This is exactly what I\'ve been waiting for! The dragon taming system looks incredible.',
        date: '2024-01-15',
        likes: 34
      },
      {
        id: '2',
        user: 'MMOGuildLeader',
        content: 'My guild is so excited for this. We\'re planning our kingdom already!',
        date: '2024-01-14',
        likes: 28
      }
    ]
  },
  '6': {
    id: '6',
    title: 'Puzzle Master Academy',
    description: 'Brain-training puzzle game with adaptive difficulty and daily challenges.',
    fullDescription: `Challenge your mind with the most comprehensive puzzle game ever created! From classic logic puzzles to innovative new brain teasers, Puzzle Master Academy adapts to your skill level and keeps you coming back for more.

Mental training features:
• 500+ handcrafted puzzles across 12 categories
• AI-powered adaptive difficulty system
• Daily challenges with global leaderboards
• Multiplayer puzzle battles and tournaments
• Progress tracking and detailed analytics
• Accessibility options for all ages and abilities
• Offline mode for puzzle solving anywhere
• Achievement system with 100+ unlockables

Train your brain and become a true Puzzle Master!`,
    creator: 'BrainBox Games',
    goal: 12000,
    raised: 14500,
    backers: 298,
    daysLeft: 0,
    image: '/games/command-center.png',
    category: 'Puzzle',
    featured: false,
    status: 'funded',
    images: [
      '/games/command-center.png',
      '/games/hand-tracking.png',
      '/games/pokedex.png'
    ],
    rewards: [
      {
        id: '1',
        amount: 8,
        title: 'Puzzle Apprentice',
        description: 'Digital copy + exclusive puzzle pack',
        backers: 89,
        estimated: 'February 2024'
      },
      {
        id: '2',
        amount: 15,
        title: 'Logic Master',
        description: 'All previous + premium themes + no ads',
        backers: 134,
        estimated: 'February 2024'
      },
      {
        id: '3',
        amount: 30,
        title: 'Grand Puzzler',
        description: 'All previous + beta access + custom puzzle creator',
        backers: 75,
        estimated: 'January 2024'
      }
    ],
    updates: [
      {
        id: '1',
        title: 'Funded! Development in Full Swing',
        content: 'We\'re thrilled to announce that we\'ve exceeded our funding goal! Development is now accelerating with additional features planned.',
        date: '2024-01-03',
        likes: 67
      },
      {
        id: '2',
        title: 'Multiplayer Mode Revealed',
        content: 'Thanks to reaching our stretch goal, we\'re adding real-time multiplayer puzzle battles!',
        date: '2023-12-28',
        likes: 45
      }
    ],
    comments: [
      {
        id: '1',
        user: 'BrainTrainer',
        content: 'Perfect for my daily mental workout routine. Can\'t wait for the analytics features!',
        date: '2024-01-04',
        likes: 19
      },
      {
        id: '2',
        user: 'PuzzleEnthusiast',
        content: 'The adaptive difficulty sounds amazing. No more puzzles that are too easy or impossible!',
        date: '2024-01-02',
        likes: 15
      }
    ]
  }
}

export default function CampaignPage() {
  const params = useParams()
  const id = params.id as string
  const { authenticated, login } = usePrivy()
  const [selectedReward, setSelectedReward] = useState<string | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [comment, setComment] = useState('')
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  
  // In a real app, this would fetch data based on the ID
  const campaign = mockCampaignData[id as keyof typeof mockCampaignData]
  
  if (!campaign) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Campaign Not Found</h1>
            <p className="text-muted-foreground mb-4">The campaign you're looking for doesn't exist.</p>
            <Link href="/kickstart">
              <Button>Back to Campaigns</Button>
            </Link>
          </div>
        </div>
      </AuthGuard>
    )
  }

  const getFundingPercentage = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100)
  }

  const getStatusBadge = () => {
    if (campaign.status === 'funded') {
      return <Badge variant="default" className="bg-green-500">Funded</Badge>
    }
    if (campaign.daysLeft <= 7) {
      return <Badge variant="destructive">Ending Soon</Badge>
    }
    return <Badge variant="secondary">Active</Badge>
  }

  const handleBackingAttempt = () => {
    if (!authenticated) {
      setShowAuthPrompt(true)
      return
    }
    // Handle actual backing logic here
    console.log('Processing backing...', { selectedReward, customAmount })
  }

  const handleAuthAndBack = async () => {
    try {
      await login()
      setShowAuthPrompt(false)
      // After successful login, proceed with backing
      console.log('User authenticated, processing backing...')
    } catch (error) {
      console.error('Authentication failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
        <KickstartNav />
        <MaxWidthWrapper>
          {/* Header */}
          <div className="pt-12 pb-8">
            <div className="flex items-center gap-4 mb-6">
              <Link href="/kickstart">
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Campaigns
                </Button>
              </Link>
              <div className="flex gap-2">
                {getStatusBadge()}
                <Badge variant="outline">{campaign.category}</Badge>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Hero Section */}
                <div>
                  <h1 className="text-4xl font-bold mb-4">{campaign.title}</h1>
                  <p className="text-lg text-muted-foreground mb-6">
                    by <span className="text-foreground font-medium">{campaign.creator}</span>
                  </p>
                  
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted mb-6">
                    <Image
                      src={campaign.image}
                      alt={campaign.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Button size="lg" className="gap-2">
                        <Play className="w-5 h-5" />
                        Watch Video
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-8">
                    <Button variant="outline" className="gap-2">
                      <Heart className="w-4 h-4" />
                      Like
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Demo
                    </Button>
                  </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="story" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="story">Story</TabsTrigger>
                    <TabsTrigger value="updates">Updates</TabsTrigger>
                    <TabsTrigger value="comments">Comments</TabsTrigger>
                    <TabsTrigger value="gallery">Gallery</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="story" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          About This Project
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-neutral dark:prose-invert max-w-none">
                          {campaign.fullDescription.split('\n').map((paragraph, index) => (
                            <p key={index} className="mb-4 last:mb-0">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="updates" className="space-y-4">
                    {campaign.updates.map(update => (
                      <Card key={update.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{update.title}</CardTitle>
                            <span className="text-sm text-muted-foreground">{update.date}</span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground mb-4">{update.content}</p>
                          <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" className="gap-2">
                              <Heart className="w-4 h-4" />
                              {update.likes}
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-2">
                              <MessageCircle className="w-4 h-4" />
                              Reply
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="comments" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Leave a Comment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          placeholder="Share your thoughts..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="mb-4"
                        />
                        <Button>Post Comment</Button>
                      </CardContent>
                    </Card>
                    
                    {campaign.comments.map(comment => (
                      <Card key={comment.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                                {comment.user[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium">{comment.user}</p>
                                <p className="text-sm text-muted-foreground">{comment.date}</p>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground mb-4">{comment.content}</p>
                          <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" className="gap-2">
                              <Heart className="w-4 h-4" />
                              {comment.likes}
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-2">
                              <MessageCircle className="w-4 h-4" />
                              Reply
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="gallery" className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      {campaign.images.map((image, index) => (
                        <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                          <Image
                            src={image}
                            alt={`${campaign.title} screenshot ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Funding Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Funding Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="text-2xl font-bold">
                          ◎{(campaign.raised / 100).toLocaleString()} SOL
                        </span>
                        <span className="text-sm text-muted-foreground">
                          of ◎{(campaign.goal / 100).toLocaleString()} SOL
                        </span>
                      </div>
                      <Progress value={getFundingPercentage(campaign.raised, campaign.goal)} className="mb-4" />
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-green-500">
                            {getFundingPercentage(campaign.raised, campaign.goal).toFixed(0)}%
                          </p>
                          <p className="text-xs text-muted-foreground">Funded</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{campaign.backers}</p>
                          <p className="text-xs text-muted-foreground">Backers</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{campaign.daysLeft}</p>
                          <p className="text-xs text-muted-foreground">Days Left</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Custom Backing */}
                <Card>
                  <CardHeader>
                    <CardTitle>Back This Project</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Custom Amount (SOL)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">◎</span>
                        <Input
                          type="number"
                          placeholder="Enter SOL amount"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          className="pl-8"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </div>
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleBackingAttempt}
                    >
                      {authenticated ? 'Back This Project' : 'Sign In to Back Project'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Rewards */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      Rewards
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {campaign.rewards.map(reward => (
                      <div
                        key={reward.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedReward === reward.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedReward(reward.id)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">◎{(reward.amount / 10).toFixed(1)} SOL</h4>
                          <Badge variant="secondary" className="text-xs">
                            {reward.backers} backers
                          </Badge>
                        </div>
                        <h5 className="font-medium text-sm mb-1">{reward.title}</h5>
                        <p className="text-xs text-muted-foreground mb-2">
                          {reward.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Est. delivery: {reward.estimated}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Creator */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Creator
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                        {campaign.creator[0]}
                      </div>
                      <div>
                        <h4 className="font-medium">{campaign.creator}</h4>
                        <p className="text-sm text-muted-foreground">Game Developer</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Contact Creator
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </MaxWidthWrapper>

        {/* Authentication Dialog */}
        <Dialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-500" />
                Sign In with Solana
              </DialogTitle>
              <DialogDescription>
                Connect your Solana wallet to back this project and support game development.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">◎</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Secure wallet connection powered by Solana blockchain
                </p>
              </div>
              <div className="space-y-2">
                <Button 
                  onClick={handleAuthAndBack} 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  size="lg"
                >
                  Connect Solana Wallet
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAuthPrompt(false)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
              <div className="text-xs text-center text-muted-foreground">
                <p>Your wallet address will be used for secure transactions</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  } 