import Link from "next/link"
import MathGame from "./math-game"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative">
      {/* Back Button */}
      <Link 
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-black/20 hover:bg-black/30 text-white/80 hover:text-white rounded-xl border border-white/20 hover:border-white/30 transition-all duration-200 backdrop-blur-sm group"
      >
        <svg 
          className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="font-medium">Back</span>
      </Link>

      <MathGame />
    </main>
  )
}
