'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'
import { KickstartNav } from '@/components/kickstart-nav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import { 
  FileText,
  Gift,
  Sparkles,
  CheckCircle,
  Info,
  Plus,
  X
} from 'lucide-react'

interface RewardTier {
  id: string
  amount: number
  title: string
  description: string
  estimatedDelivery: string
}

export default function CreateCampaignPage() {
  const router = useRouter()
  const { authenticated, login } = usePrivy()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    fullDescription: '',
    category: '',
    fundingGoal: '',
    campaignDuration: '30',
    rewards: [] as RewardTier[]
  })

  const categories = [
    'RPG', 'Racing', 'Adventure', 'Strategy', 'MMO', 'Puzzle', 'Action', 'Platformer', 'Simulation', 'Shooter'
  ]

  const addRewardTier = () => {
    const newReward: RewardTier = {
      id: Date.now().toString(),
      amount: 0,
      title: '',
      description: '',
      estimatedDelivery: ''
    }
    setFormData(prev => ({
      ...prev,
      rewards: [...prev.rewards, newReward]
    }))
  }

  const updateRewardTier = (id: string, field: keyof RewardTier, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      rewards: prev.rewards.map(reward =>
        reward.id === id ? { ...reward, [field]: value } : reward
      )
    }))
  }

  const removeRewardTier = (id: string) => {
    setFormData(prev => ({
      ...prev,
      rewards: prev.rewards.filter(reward => reward.id !== id)
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // In a real app, this would submit to your API
    console.log('Campaign data:', formData)
    
    setIsSubmitting(false)
    router.push('/kickstart?new=true')
  }

  const steps = [
    { id: 1, title: 'Basic Info', description: 'Tell us about your game' },
    { id: 2, title: 'Funding', description: 'Set goals and duration' },
    { id: 3, title: 'Rewards', description: 'Create reward tiers' },
    { id: 4, title: 'Review', description: 'Final review' }
  ]

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background">
        <KickstartNav />
        <MaxWidthWrapper>
          <div className="pt-12 pb-8">
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-4xl">◎</span>
              </div>
              <h1 className="text-3xl font-bold mb-4">Connect Your Solana Wallet</h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-md">
                Sign in with your Solana wallet to start creating your game funding campaign
              </p>
              <Button 
                onClick={login} 
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 gap-2"
              >
                <span className="text-lg">◎</span>
                Connect Solana Wallet
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Secure wallet connection powered by Solana blockchain
              </p>
            </div>
          </div>
        </MaxWidthWrapper>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
        <KickstartNav />
        <MaxWidthWrapper>
          <div className="pt-12 pb-8">
            {/* Header */}
            <div className="text-center mb-8 animate-in fade-in duration-500">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Start Your Game Campaign
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Bring your browser game vision to life with the support of our gaming community
              </p>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex justify-center">
                <div className="flex items-center space-x-4">
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                      <div className={`flex flex-col items-center transition-all duration-300 ${
                        currentStep >= step.id ? 'opacity-100' : 'opacity-50'
                      }`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                          currentStep >= step.id 
                            ? 'bg-primary border-primary text-primary-foreground' 
                            : 'border-muted-foreground text-muted-foreground'
                        }`}>
                          {currentStep > step.id ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            step.id
                          )}
                        </div>
                        <div className="text-center mt-2">
                          <p className="text-sm font-medium">{step.title}</p>
                          <p className="text-xs text-muted-foreground hidden sm:block">{step.description}</p>
                        </div>
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`w-12 h-0.5 mx-4 transition-all duration-300 ${
                          currentStep > step.id ? 'bg-primary' : 'bg-muted'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="max-w-4xl mx-auto">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <Card className="animate-in slide-in-from-right duration-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Basic Information
                    </CardTitle>
                    <CardDescription>
                      Let's start with the basics about your game project
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Game Title *</Label>
                      <Input
                        id="title"
                        placeholder="Enter your game's title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="transition-all duration-200 focus:scale-[1.02]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shortDescription">Short Description *</Label>
                      <Textarea
                        id="shortDescription"
                        placeholder="Briefly describe your game in 1-2 sentences"
                        value={formData.shortDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                        className="transition-all duration-200 focus:scale-[1.02]"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger className="transition-all duration-200 focus:scale-[1.02]">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fullDescription">Full Description *</Label>
                      <Textarea
                        id="fullDescription"
                        placeholder="Provide a detailed description of your game, including features, gameplay mechanics, and what makes it special"
                        value={formData.fullDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullDescription: e.target.value }))}
                        className="transition-all duration-200 focus:scale-[1.02]"
                        rows={8}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Funding */}
              {currentStep === 2 && (
                <Card className="animate-in slide-in-from-right duration-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-lg">◎</span>
                      Funding Goals
                    </CardTitle>
                    <CardDescription>
                      Set your funding target and campaign duration
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fundingGoal">Funding Goal (SOL) *</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">◎</span>
                          <Input
                            id="fundingGoal"
                            type="number"
                            placeholder="250"
                            value={formData.fundingGoal}
                            onChange={(e) => setFormData(prev => ({ ...prev, fundingGoal: e.target.value }))}
                            className="pl-8 transition-all duration-200 focus:scale-[1.02]"
                            step="0.1"
                            min="0"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="duration">Campaign Duration</Label>
                        <Select onValueChange={(value) => setFormData(prev => ({ ...prev, campaignDuration: value }))}>
                          <SelectTrigger className="transition-all duration-200 focus:scale-[1.02]">
                            <SelectValue placeholder="30 days" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 days</SelectItem>
                            <SelectItem value="30">30 days</SelectItem>
                            <SelectItem value="45">45 days</SelectItem>
                            <SelectItem value="60">60 days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Rewards */}
              {currentStep === 3 && (
                <Card className="animate-in slide-in-from-right duration-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="w-5 h-5" />
                      Reward Tiers
                    </CardTitle>
                    <CardDescription>
                      Create reward tiers to incentivize backers
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {formData.rewards.map((reward, index) => (
                      <Card key={reward.id} className="animate-in fade-in duration-300">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">Reward Tier {index + 1}</CardTitle>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeRewardTier(reward.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Amount (SOL) *</Label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">◎</span>
                                <Input
                                  type="number"
                                  placeholder="2.5"
                                  value={reward.amount || ''}
                                  onChange={(e) => updateRewardTier(reward.id, 'amount', Number(e.target.value))}
                                  className="pl-8"
                                  step="0.1"
                                  min="0"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Title *</Label>
                              <Input
                                placeholder="Early Access"
                                value={reward.title}
                                onChange={(e) => updateRewardTier(reward.id, 'title', e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Description *</Label>
                            <Textarea
                              placeholder="Digital copy + beta access + exclusive content"
                              value={reward.description}
                              onChange={(e) => updateRewardTier(reward.id, 'description', e.target.value)}
                              rows={3}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Estimated Delivery *</Label>
                            <Input
                              placeholder="March 2024"
                              value={reward.estimatedDelivery}
                              onChange={(e) => updateRewardTier(reward.id, 'estimatedDelivery', e.target.value)}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    <Button
                      variant="outline"
                      className="w-full gap-2 transition-all duration-200 hover:scale-[1.02]"
                      onClick={addRewardTier}
                    >
                      <Plus className="w-4 h-4" />
                      Add Reward Tier
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <Card className="animate-in slide-in-from-right duration-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Campaign Preview
                    </CardTitle>
                    <CardDescription>
                      Review your campaign before launching
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-2">{formData.title || 'Your Game Title'}</h3>
                        <Badge variant="outline" className="mb-3">{formData.category || 'Category'}</Badge>
                        <p className="text-sm text-muted-foreground">
                          {formData.shortDescription || 'Your short description will appear here'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">◎{formData.fundingGoal || '0'} SOL</p>
                        <p className="text-sm text-muted-foreground">funding goal</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {formData.campaignDuration} day campaign
                        </p>
                      </div>
                    </div>
                    
                    {formData.rewards.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Reward Tiers ({formData.rewards.length})</h4>
                        <div className="space-y-2">
                          {formData.rewards.map((reward, index) => (
                            <div key={reward.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                              <div>
                                <span className="font-medium">◎{reward.amount} SOL - {reward.title}</span>
                                <p className="text-xs text-muted-foreground">{reward.description}</p>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {reward.estimatedDelivery}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900 dark:text-blue-100">Ready to Launch?</h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            Once you launch your campaign, you'll be able to start receiving funding from backers. 
                            Make sure all information is accurate as some details cannot be changed after launch.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="transition-all duration-200 hover:scale-105"
                >
                  Previous
                </Button>

                <div className="flex gap-2">
                  {currentStep < 4 ? (
                    <Button
                      onClick={nextStep}
                      className="transition-all duration-200 hover:scale-105"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="gap-2 transition-all duration-200 hover:scale-105"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Launching...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Launch Campaign
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </div>
    )
  } 