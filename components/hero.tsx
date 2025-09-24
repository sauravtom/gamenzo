import Link from "next/link"
import { buttonVariants } from "./ui/button"
import { StarIcon } from "lucide-react"
export default function Hero() {
    return (
        <div className="flex flex-col items-center justify-center pt-24 pb-16">
            <div className="flex flex-col items-center gap-4 max-w-4xl text-center">
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                    GAMENZO
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                    AI-Powered Browser Gaming for Immersive, Accessible Experiences
                </p>
            </div>
        </div>
    )
}
