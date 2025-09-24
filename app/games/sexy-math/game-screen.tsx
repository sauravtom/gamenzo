"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import type { Difficulty } from "./math-game"
import { generateQuestion } from "./utils"
import { Button } from "@/components/ui/button"

interface GameScreenProps {
  difficulty: Difficulty
  onRestart: () => void
}

export default function GameScreen({ difficulty, onRestart }: GameScreenProps) {
  const [question, setQuestion] = useState<{
    question: string
    options: number[]
    answer: number
  } | null>(null)
  const [revealPercentage, setRevealPercentage] = useState(0)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [isGameComplete, setIsGameComplete] = useState(false)

  // Images for different difficulties
  const images = {
    easy: "/assets/math/lucy.png?height=400&width=400",
    medium: "/assets/math/naty.png?height=400&width=400",
    hard: "/assets/math/kelly.png?height=400&width=400",
  }

  const difficultyColors = {
    easy: "from-green-400 to-emerald-600",
    medium: "from-yellow-400 to-orange-600", 
    hard: "from-red-400 to-pink-600"
  }

  useEffect(() => {
    generateNewQuestion()
  }, [difficulty])

  const generateNewQuestion = () => {
    const newQuestion = generateQuestion(difficulty as Difficulty)
    setQuestion(newQuestion)
    setIsCorrect(null)
  }

  const handleAnswerSelect = (selectedAnswer: number) => {
    if (question) {
      const correct = selectedAnswer === question.answer
      setIsCorrect(correct)

      if (correct) {
        // Increase reveal percentage by 10%
        const newRevealPercentage = Math.min(revealPercentage + 10, 100)
        setRevealPercentage(newRevealPercentage)

        // Check if game is complete
        if (newRevealPercentage >= 100) {
          setIsGameComplete(true)
        } else {
          // Generate new question after a short delay
          setTimeout(() => {
            generateNewQuestion()
          }, 1000)
        }
      } else {
        // Reset reveal percentage on wrong answer
        setRevealPercentage(0)

        // Generate new question after a short delay
        setTimeout(() => {
          generateNewQuestion()
        }, 1000)
      }
    }
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Difficulty Badge */}
      <div className={`px-6 py-2 rounded-full bg-gradient-to-r ${difficultyColors[difficulty as keyof typeof difficultyColors]} text-white font-bold text-lg shadow-lg`}>
        <span className="drop-shadow">{`${difficulty?.charAt(0).toUpperCase()}${difficulty?.slice(1)} Mode`}</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md">
        <div className="flex justify-between text-sm text-gray-300 mb-2">
          <span>Progress</span>
          <span>{revealPercentage}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
          <div 
            className={`h-full bg-gradient-to-r ${difficultyColors[difficulty as keyof typeof difficultyColors]} transition-all duration-500 rounded-full shadow-lg`}
            style={{ width: `${revealPercentage}%` }}
          />
        </div>
      </div>

      {/* Image Container */}
      <div className="relative w-full max-w-md aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-600">
        <Image
          src={images[difficulty as keyof typeof images] || "/placeholder.svg"}
          alt="Hidden Image"
          fill
          className="object-cover"
        />
        {/* Reveal overlay with gradient effect */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black via-gray-900 to-black transition-all duration-500"
          style={{
            height: `${100 - revealPercentage}%`,
          }}
        />
        {/* Shimmer effect when revealing */}
        {isCorrect && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        )}
      </div>

      {isGameComplete ? (
        <div className="text-center space-y-6 p-8 bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl border border-purple-500/30 backdrop-blur-sm">
          <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text">🎉 Congratulations! 🎉</h2>
          <p className="text-gray-300 text-lg">You've successfully revealed the entire image!</p>
          <button
            onClick={onRestart}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            ✨ Play Again ✨
          </button>
        </div>
      ) : (
        question && (
          <div className="w-full max-w-md space-y-6">
            {/* Question */}
            <div className="text-center p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-600/50 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white drop-shadow-lg">{question.question}</div>
            </div>
            
            {/* Answer Options */}
            <div className="grid grid-cols-2 gap-4">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={isCorrect !== null}
                  className={`
                    relative overflow-hidden p-4 text-xl font-bold rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-400/50
                    ${
                      isCorrect === null
                        ? "bg-gradient-to-br from-gray-700 to-gray-800 text-white hover:from-gray-600 hover:to-gray-700 border border-gray-600"
                        : option === question.answer
                          ? isCorrect
                            ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg border border-green-400"
                            : "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg border border-red-400"
                          : "bg-gradient-to-br from-gray-600 to-gray-700 text-gray-400 border border-gray-500"
                    }
                  `}
                >
                  {option}
                  {/* Shine effect */}
                  {isCorrect === null && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-700" />
                  )}
                </button>
              ))}
            </div>

            {/* Feedback Message */}
            {isCorrect !== null && (
              <div className={`text-center p-4 rounded-xl font-medium ${
                isCorrect 
                  ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}>
                {isCorrect 
                  ? "🎯 Correct! Revealing more of the image..." 
                  : "❌ Incorrect! The image has been covered again."
                }
              </div>
            )}
          </div>
        )
      )}

      {/* Back Button */}
      <div className="pt-4">
        <button
          onClick={onRestart}
          className="px-6 py-3 bg-gradient-to-br from-gray-700 to-gray-800 text-gray-300 font-medium rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 border border-gray-600 hover:border-gray-500"
        >
          ← Back to Difficulty Selection
        </button>
      </div>
    </div>
  )
}
