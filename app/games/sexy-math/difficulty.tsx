"use client"

import Image from "next/image"
import type { Difficulty } from './math-game'

interface DifficultySelectionProps {
  onSelectDifficulty: (difficulty: Difficulty) => void
}

export default function DifficultySelection({ onSelectDifficulty }: DifficultySelectionProps) {
  const difficulties: { label: string; value: Difficulty; image: string; gradient: string; description: string }[] = [
    { 
      label: "Easy", 
      value: "easy", 
      image: "/assets/math/lucy.png?height=300&width=300",
      gradient: "from-green-400 to-emerald-600",
      description: "Basic addition & subtraction"
    },
    { 
      label: "Medium", 
      value: "medium", 
      image: "/assets/math/naty.png?height=300&width=300",
      gradient: "from-yellow-400 to-orange-600",
      description: "Multiplication included"
    },
    { 
      label: "Hard", 
      value: "hard", 
      image: "/assets/math/kelly.png?height=300&width=300",
      gradient: "from-red-400 to-pink-600",
      description: "All operations with division"
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
      {difficulties.map((difficulty) => (
        <button
          key={difficulty.value}
          className="group relative overflow-hidden rounded-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-purple-400/50"
          onClick={() => onSelectDifficulty(difficulty.value)}
        >
          {/* Background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${difficulty.gradient} opacity-80 group-hover:opacity-60 transition-opacity duration-300`} />
          
          {/* Background image with sneak peek on hover */}
          <div className="absolute inset-0">
            <Image
              src={difficulty.image || "/placeholder.svg"}
              alt={difficulty.label}
              fill
              className="object-cover opacity-15 group-hover:opacity-70 transition-opacity duration-500"
            />
            {/* Overlay that reduces on hover for sneak peek */}
            <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-all duration-500" />
          </div>
          
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-64 p-6">
            <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg group-hover:drop-shadow-xl transition-all duration-300">
              {difficulty.label}
            </h2>
            <p className="text-white/90 text-center text-sm font-medium drop-shadow group-hover:text-white transition-all duration-300">
              {difficulty.description}
            </p>
            
            {/* "Sneak Peek" text that appears on hover */}
            <div className="absolute bottom-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <span className="text-xs text-white/80 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
                👀 Sneak Peek
              </span>
            </div>
            
            {/* Shine effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </div>
        </button>
      ))}
    </div>
  )
}
