'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePrivy } from '@privy-io/react-auth'
import { KickstartNav } from '@/components/kickstart-nav'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import { 
  Search, 
  Plus, 
  TrendingUp, 
  Calendar, 
  Users, 
  DollarSign,
  Filter,
  Heart,
  Share2
} from 'lucide-react'
import { Input } from '@/components/ui/input'

// Mock data for game funding campaigns
const mockCampaigns = [
  {
    id: '1',
    title: 'Pixel Quest: Retro Adventure',
    description: 'A nostalgic 16-bit RPG with modern gameplay mechanics and an epic storyline.',
    creator: 'RetroGameDev',
    goal: 25000,
    raised: 18500,
    backers: 342,
    daysLeft: 15,
    image: '/games/pixel-pirates.jpg',
    category: 'RPG',
    featured: true,
    status: 'active'
  },
  {
    id: '2',
    title: 'Neon Racer: Future Streets',
    description: 'High-speed cyberpunk racing with customizable vehicles and online multiplayer.',
    creator: 'CyberSpeed Studios',
    goal: 40000,
    raised: 8200,
    backers: 156,
    daysLeft: 28,
    image: '/games/neon-racer.jpg',
    category: 'Racing',
    featured: false,
    status: 'active'
  },
  {
    id: '3',
    title: 'Mystic Forest Explorer',
    description: 'Peaceful exploration game with beautiful hand-drawn environments.',
    creator: 'NatureGames',
    goal: 15000,
    raised: 16200,
    backers: 287,
    daysLeft: 3,
    image: '/games/forest-explorer.jpg',
    category: 'Adventure',
    featured: false,
    status: 'funded'
  },
  {
    id: '4',
    title: 'Space Miner Tycoon',
    description: 'Build your asteroid mining empire in this strategic management game.',
    creator: 'CosmicGames',
    goal: 35000,
    raised: 2100,
    backers: 45,
    daysLeft: 42,
    image: '/games/robot-wars.jpg',
    category: 'Strategy',
    featured: false,
    status: 'active'
  },
  {
    id: '5',
    title: 'Dragon Knights Online',
    description: 'Multiplayer fantasy game with dragon taming and kingdom building.',
    creator: 'MythicRealms',
    goal: 50000,
    raised: 32800,
    backers: 521,
    daysLeft: 8,
    image: '/games/dragon-quest.jpg',
    category: 'MMO',
    featured: true,
    status: 'active'
  },
  {
    id: '6',
    title: 'Puzzle Master Academy',
    description: 'Brain-training puzzle game with adaptive difficulty and daily challenges.',
    creator: 'BrainBox Games',
    goal: 12000,
    raised: 14500,
    backers: 298,
    daysLeft: 0,
    image: '/games/command-center.png',
    category: 'Puzzle',
    featured: false,
    status: 'funded'
  }
]

const categories = ['All', 'RPG', 'Racing', 'Adventure', 'Strategy', 'MMO', 'Puzzle', 'Action']

export default function KickstartPage() {
  const { authenticated, login } = usePrivy()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('trending')

  const filteredCampaigns = mockCampaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || campaign.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    switch (sortBy) {
      case 'trending':
        return b.backers - a.backers
      case 'newest':
        return b.daysLeft - a.daysLeft
      case 'ending-soon':
        return a.daysLeft - b.daysLeft
      case 'most-funded':
        return b.raised - a.raised
      default:
        return 0
    }
  })

  const getStatusBadge = (campaign: typeof mockCampaigns[0]) => {
    if (campaign.status === 'funded') {
      return <Badge variant="default" className="bg-green-500">Funded</Badge>
    }
    if (campaign.daysLeft <= 7) {
      return <Badge variant="destructive">Ending Soon</Badge>
    }
    return <Badge variant="secondary">Active</Badge>
  }

  const getFundingPercentage = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100)
  }

  return (
    <div className="min-h-screen bg-background">
        <KickstartNav />
        <MaxWidthWrapper>
          {/* Header */}
          <div className="pt-12 pb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-in fade-in duration-700">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Game Kickstart
                </h1>
                <p className="text-lg text-muted-foreground">
                  Fund innovative browser games and bring creative visions to life
                </p>
              </div>
              {authenticated ? (
                <Link href="/kickstart/create">
                  <Button size="lg" className="gap-2 self-start md:self-center transition-all duration-200 hover:scale-105">
                    <Plus className="w-4 h-4" />
                    Start Campaign
                  </Button>
                </Link>
              ) : (
                <Button 
                  onClick={login}
                  size="lg" 
                  className="gap-2 self-start md:self-center transition-all duration-200 hover:scale-105 bg-purple-600 hover:bg-purple-700"
                >
                  <span className="text-sm">◎</span>
                  Sign In to Start Campaign
                </Button>
              )}
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-8 animate-in slide-in-from-bottom duration-500 delay-200">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search games..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2 flex-wrap">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-md border border-input bg-background text-sm"
              >
                <option value="trending">Trending</option>
                <option value="newest">Newest</option>
                <option value="ending-soon">Ending Soon</option>
                <option value="most-funded">Most Funded</option>
              </select>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-in slide-in-from-bottom duration-500 delay-300">
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Active Campaigns</p>
                    <p className="text-xl font-bold">
                      {mockCampaigns.filter(c => c.status === 'active').length}
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Raised</p>
                    <p className="text-xl font-bold">
                      ◎{(mockCampaigns.reduce((sum, c) => sum + c.raised, 0) / 100).toLocaleString()} SOL
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Backers</p>
                    <p className="text-xl font-bold">
                      {mockCampaigns.reduce((sum, c) => sum + c.backers, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-xl font-bold">
                      {Math.round((mockCampaigns.filter(c => c.status === 'funded').length / mockCampaigns.length) * 100)}%
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Featured Campaigns */}
          {sortedCampaigns.some(c => c.featured) && (
            <div className="mb-12 animate-in slide-in-from-bottom duration-500 delay-400">
              <h2 className="text-2xl font-bold mb-6">Featured Campaigns</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {sortedCampaigns.filter(c => c.featured).map((campaign, index) => (
                  <Card key={campaign.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-in fade-in duration-500" style={{ animationDelay: `${(index + 1) * 100}ms` }}>
                    <Link href={`/kickstart/${campaign.id}`}>
                      <div className="relative h-48 bg-muted">
                        <Image
                          src={campaign.image}
                          alt={campaign.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-4 left-4">
                          {getStatusBadge(campaign)}
                        </div>
                        <div className="absolute top-4 right-4 flex gap-2">
                          <Button size="icon" variant="secondary" className="w-8 h-8">
                            <Heart className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="secondary" className="w-8 h-8">
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl">{campaign.title}</CardTitle>
                            <CardDescription>by {campaign.creator}</CardDescription>
                          </div>
                          <Badge variant="outline">{campaign.category}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {campaign.description}
                        </p>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                                                  <span className="text-muted-foreground">
                        ◎{(campaign.raised / 100).toLocaleString()} SOL raised
                      </span>
                      <span className="font-medium">
                        ◎{(campaign.goal / 100).toLocaleString()} SOL goal
                      </span>
                          </div>
                          <Progress value={getFundingPercentage(campaign.raised, campaign.goal)} />
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>{campaign.backers} backers</span>
                            <span>
                              {campaign.daysLeft > 0 ? `${campaign.daysLeft} days left` : 'Campaign ended'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Campaigns */}
          <div className="mb-12 animate-in slide-in-from-bottom duration-500 delay-500">
            <h2 className="text-2xl font-bold mb-6">All Campaigns</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedCampaigns.map((campaign, index) => (
                <Card key={campaign.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-in fade-in duration-500" style={{ animationDelay: `${(index + 1) * 50}ms` }}>
                  <Link href={`/kickstart/${campaign.id}`}>
                    <div className="relative h-40 bg-muted">
                      <Image
                        src={campaign.image}
                        alt={campaign.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        {getStatusBadge(campaign)}
                      </div>
                    </div>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-1">{campaign.title}</CardTitle>
                          <CardDescription className="text-xs">by {campaign.creator}</CardDescription>
                        </div>
                        <Badge variant="outline" className="text-xs">{campaign.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {campaign.description}
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            ◎{(campaign.raised / 100).toLocaleString()} SOL
                          </span>
                          <span className="font-medium">
                            {getFundingPercentage(campaign.raised, campaign.goal).toFixed(0)}%
                          </span>
                        </div>
                        <Progress value={getFundingPercentage(campaign.raised, campaign.goal)} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{campaign.backers} backers</span>
                          <span>
                            {campaign.daysLeft > 0 ? `${campaign.daysLeft}d left` : 'Ended'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center py-12 bg-muted/50 rounded-lg animate-in slide-in-from-bottom duration-500 delay-700">
            <h3 className="text-2xl font-bold mb-4">Have a Game Idea?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join our community of game developers and get funding for your browser-based game project. 
              Share your vision and bring it to life with the support of gaming enthusiasts.
            </p>
            {authenticated ? (
              <Link href="/kickstart/create">
                <Button size="lg" className="gap-2 transition-all duration-200 hover:scale-105">
                  <Plus className="w-4 h-4" />
                  Start Your Campaign
                </Button>
              </Link>
            ) : (
              <Button 
                onClick={login}
                size="lg" 
                className="gap-2 transition-all duration-200 hover:scale-105 bg-purple-600 hover:bg-purple-700"
              >
                <span className="text-sm">◎</span>
                Sign In to Start Campaign
              </Button>
            )}
          </div>
        </MaxWidthWrapper>
      </div>
    )
  } 