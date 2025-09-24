"use client";

import { projects } from "@/data"
import { Gamepad2, Sparkles, Zap, Users, Code, Trophy, Rocket } from "lucide-react"

// Import magicui components
import { SparklesText } from "@/components/magicui/sparkles-text"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { RetroGrid } from "@/components/magicui/retro-grid"
import { OrbitingCircles } from "@/components/magicui/orbiting-circles"
import { MagicCard } from "@/components/magicui/magic-card"
import { ShimmerButton } from "@/components/magicui/shimmer-button"
import { Meteors } from "@/components/magicui/meteors"
import { BlurFade } from "@/components/magicui/blur-fade"

// Import existing components

import Categories from "@/components/categories"
import List from "@/components/list"
import CommunityGames from "@/components/community-games"
import { useRouter } from "next/navigation"


export interface Category {
    name: string
    icon?: React.ReactNode
}

export default function HomePage({ searchParams = {} }: { searchParams?: { category?: string | undefined } }) {
    const router = useRouter();
    
    const categories: Category[] = [
        {
            name: "Math"
        },
        {
            name: "RPG"
        },
        {
            name: "Racing"
        },
        {
            name: "Action"
        },
        {
            name: "Adventure"
        },
        {
            name: "Platformer"
        }
    ]



    return (
        <div className="min-h-screen bg-background overflow-x-hidden">
            {/* Hero Section */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_0)] bg-[size:20px_20px] sm:bg-[size:40px_40px] h-full" />
            <section className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
                {/* Background */}
                
                {/* Content */}
                <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-6 md:gap-8 max-w-6xl text-center px-4 sm:px-6">
                    <BlurFade delay={0.25} inView>
                        <SparklesText 
                            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold"
                            sparklesCount={15}
                            colors={{
                                first: "#9E7AFF",
                                second: "#FE8BBB"
                            }}
                        >
                            GAMENZO
                        </SparklesText>
                    </BlurFade>

                    <BlurFade delay={0.5} inView>
                        <AnimatedGradientText 
                            className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold px-2"
                            colorFrom="#9E7AFF"
                            colorTo="#FE8BBB"
                            speed={2}
                        >
                            AI-Powered Browser Gaming for Immersive, Accessible Experiences
                        </AnimatedGradientText>
                    </BlurFade>
{/* 
                    <BlurFade delay={0.75} inView>
                        <div className="relative w-full max-w-5xl">
                            <OrbitingCircles
                                className="hidden sm:flex size-12 md:size-16 border-none bg-purple-500/20 backdrop-blur-sm"
                                duration={20}
                                radius={140}
                                iconSize={48}
                            >
                              </OrbitingCircles>
                            <div className="transform scale-125 sm:scale-140 md:scale-150 w-full min-w-full">
                                <AIInput />
                            </div>
                        </div>
                    </BlurFade> */}

                    <BlurFade delay={1} inView>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 w-full sm:w-auto max-w-md sm:max-w-none">
                            <ShimmerButton
                                className="px-6 sm:px-8 py-4 sm:py-4 text-base sm:text-lg font-semibold w-full sm:w-auto min-h-[48px] touch-manipulation"
                                background="linear-gradient(135deg, #9E7AFF 0%, #FE8BBB 100%)"
                                onClick={() => router.push('/platform')}
                            >
                                <Rocket className="size-4 sm:size-5 mr-2" />
                                Start Creating
                            </ShimmerButton>
                            <ShimmerButton
                                className="px-6 sm:px-8 py-4 sm:py-4 text-base sm:text-lg font-semibold w-full sm:w-auto min-h-[48px] touch-manipulation"
                                background="rgba(255, 255, 255, 0.1)"
                                shimmerColor="#ffffff40"
                                onClick={() => document.getElementById('games')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                <Gamepad2 className="size-4 sm:size-5 mr-2" />
                                Explore Games
                            </ShimmerButton>
                        </div>
                    </BlurFade>
                </div>
            </section>



            {/* Enhanced Games Section */}
            <section id="games" className="relative py-12 sm:py-16 md:py-24 px-4">
                <div className="max-w-7xl mx-auto relative z-10">
                    <BlurFade delay={0.25} inView>
                        <div className="text-center mb-8 sm:mb-12 md:mb-16">
                            <SparklesText 
                                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4"
                                sparklesCount={8}
                                colors={{
                                    first: "#9E7AFF",
                                    second: "#FE8BBB"
                                }}
                            >
                                Featured Games
                            </SparklesText>
                            <AnimatedGradientText className="text-base sm:text-lg md:text-xl px-4">
                                Discover amazing games created by our community
                            </AnimatedGradientText>
                        </div>
                    </BlurFade>

                    <BlurFade delay={0.75} inView>
                        <MagicCard 
                            className="p-4 sm:p-6 md:p-8 bg-white/80 dark:bg-black/40 backdrop-blur-sm border-2 border-white/20 dark:border-white/10"
                            gradientSize={400}
                            gradientOpacity={0.2}
                        >
                            <div className="relative">
                                <div className="hidden sm:block absolute top-4 right-4">
                                    <OrbitingCircles
                                        className="size-6 border-none bg-purple-400/30"
                                        duration={30}
                                        radius={40}
                                        iconSize={24}
                                    >
                                        <Gamepad2 className="size-3 text-purple-600" />
                                    </OrbitingCircles>
                                </div>
                                <List projects={projects.slice(0, 12)} categories={categories} searchParams={searchParams} />
                            </div>
                        </MagicCard>
                    </BlurFade>
                </div>
            </section>

            {/* Community Section */}
            <section className="relative py-12 sm:py-16 md:py-24 px-4">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <BlurFade delay={0.25} inView>
                        <div className="text-center mb-8 sm:mb-12 md:mb-16">
                            <SparklesText 
                                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4"
                                sparklesCount={10}
                                colors={{
                                    first: "#22C55E",
                                    second: "#3B82F6"
                                }}
                            >
                                Community Creations
                            </SparklesText>
                            <AnimatedGradientText 
                                className="text-base sm:text-lg md:text-xl px-4"
                                colorFrom="#22C55E"
                                colorTo="#3B82F6"
                            >
                                See what amazing games our community has built
                            </AnimatedGradientText>
                        </div>
                    </BlurFade>

                    <BlurFade delay={0.5} inView>
                        <MagicCard 
                            className="p-4 sm:p-6 md:p-8 relative overflow-hidden bg-white/90 dark:bg-black/50 backdrop-blur-md border-2 border-white/30 dark:border-white/10"
                            gradientSize={500}
                            gradientOpacity={0.15}
                            gradientFrom="#22C55E"
                            gradientTo="#3B82F6"
                        >
                            <div className="relative">
                                <Meteors number={5} />
                                <div className="hidden sm:block absolute top-6 left-6">
                                    <OrbitingCircles
                                        className="size-6 sm:size-8 border-none"
                                        duration={25}
                                        radius={50}
                                        iconSize={24}
                                    >
                                        <Users className="size-3 sm:size-4 text-green-600" />
                                        <Code className="size-3 sm:size-4 text-blue-600" />
                                        <Sparkles className="size-3 sm:size-4 text-purple-600" />
                                    </OrbitingCircles>
                                </div>
                                <CommunityGames />
                            </div>
                        </MagicCard>
                    </BlurFade>
                </div>
            </section>
        </div>
    )
}
