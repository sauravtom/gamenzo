"use client"

import { useState, useEffect } from "react"
import DifficultySelection from "./difficulty"
import GameScreen from "./game-screen"

export type Difficulty = "easy" | "medium" | "hard" | null

export default function MathGame() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [ageVerified, setAgeVerified] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if user has already verified their age
    const verified = localStorage.getItem('sexymath_age_verified')
    setAgeVerified(verified === 'true')
  }, [])

  const handleDifficultySelect = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty)
    setGameStarted(true)
  }

  const handleRestart = () => {
    setSelectedDifficulty(null)
    setGameStarted(false)
  }

  const handleAgeConfirm = (isOver18: boolean) => {
    if (isOver18) {
      localStorage.setItem('sexymath_age_verified', 'true')
      setAgeVerified(true)
    } else {
      // Redirect away or show error
      window.location.href = 'https://www.google.com'
    }
  }

  // Show age verification screen if not verified
  if (ageVerified === null) {
    // Loading state
    return (
      <div className="w-full max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  if (!ageVerified) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm rounded-3xl border border-red-500/30 p-8 shadow-2xl">
          {/* Warning Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center">
              <span className="text-4xl">🔞</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
            Age Verification Required
          </h2>

          {/* Warning Text */}
          <div className="text-center mb-8 space-y-4">
            <p className="text-xl text-red-300 font-semibold">
            </p>
            <p className="text-gray-300 leading-relaxed">
              This game contains adult content and is intended for users 18 years of age or older. 
              By continuing, you confirm that you are at least 18 years old and agree to view adult content.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleAgeConfirm(true)}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
            >
              <span>✓</span>
              <span>I am 18 or older</span>
            </button>
            
            <button
              onClick={() => handleAgeConfirm(false)}
              className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold rounded-xl hover:from-gray-700 hover:to-gray-800 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
            >
              <span>✗</span>
              <span>I am under 18</span>
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-xs text-gray-500 text-center">
              If you are under 18, please leave this page immediately. This content is not suitable for minors.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h1 className="text-6xl font-bold text-center mb-12 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-lg">
        Sexy Math
      </h1>

      {!gameStarted ? (
        <DifficultySelection onSelectDifficulty={handleDifficultySelect} />
      ) : (
        <GameScreen difficulty={selectedDifficulty as Difficulty} onRestart={handleRestart} />
      )}
    </div>
  )
}
