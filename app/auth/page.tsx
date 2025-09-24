'use client'

import { usePrivy, useLoginWithOAuth } from '@privy-io/react-auth'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Gamepad2, Sparkles, Zap, Loader2, CheckCircle } from 'lucide-react'

function AuthPageContent() {
  const { login, authenticated, ready } = usePrivy()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/platform'

  const { state, loading, initOAuth } = useLoginWithOAuth();

  const handleGoogleLogin = async () => {
    try {
      await initOAuth({ provider: 'google' });
    } catch (error) {
      console.error('Error initializing OAuth:', error);
    }
  };

  useEffect(() => {
    if (ready && authenticated) {
      router.push(redirectTo)
    }
  }, [authenticated, ready, router, redirectTo])

  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          </div>
          <p className="text-muted-foreground text-sm font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <p className="text-muted-foreground text-sm font-medium">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Home</span>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                <Image src="/icon.webp" alt="Gamenzo" width={32} height={32} className="rounded-lg" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Gamenzo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <div className="max-w-md w-full">
          <div className="bg-card rounded-2xl border border-border p-8 text-center shadow-sm">
            {/* Logo/Icon */}
            <div className="mb-8">
              <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg overflow-hidden">
                <Image src="/icon.webp" alt="Gamenzo" width={80} height={80} className="rounded-2xl" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Gamenzo</h1>
              <p className="text-muted-foreground">Sign in to start creating amazing games with AI</p>
            </div>

            {/* Features */}
            <div className="mb-8 space-y-4">
              <div className="flex items-center space-x-3 text-left p-3 rounded-xl bg-muted/50">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-foreground text-sm font-semibold">AI-Powered Game Creation</p>
                  <p className="text-muted-foreground text-xs">Create games with natural language</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-left p-3 rounded-xl bg-muted/50">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-foreground text-sm font-semibold">Instant Publishing</p>
                  <p className="text-muted-foreground text-xs">Share your games with the world</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-left p-3 rounded-xl bg-muted/50">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Gamepad2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-foreground text-sm font-semibold">Browser Gaming</p>
                  <p className="text-muted-foreground text-xs">Play anywhere, no downloads needed</p>
                </div>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              onClick={login}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/25 mb-4"
            >
              Sign In with Wallet
            </button>

            <button
              onClick={handleGoogleLogin}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/25 mb-4"
            >
              Sign In with Google
            </button>

            <p className="text-muted-foreground text-xs">
              Secure authentication powered by Privy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          </div>
          <p className="text-muted-foreground text-sm font-medium">Loading...</p>
        </div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  )
} 