'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2, Shield } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { authenticated, ready } = usePrivy()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (ready && !authenticated) {
      // Preserve the full URL including search parameters
      const currentUrl = searchParams.toString() 
        ? `${pathname}?${searchParams.toString()}`
        : pathname
      const redirectUrl = `/auth?redirectTo=${encodeURIComponent(currentUrl)}`
      router.push(redirectUrl)
    }
  }, [authenticated, ready, router, pathname, searchParams])

  // Show loading while Privy is initializing
  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          </div>
          <p className="text-muted-foreground text-sm font-medium">Initializing...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-8 h-8 text-destructive" />
            </div>
          </div>
          <p className="text-muted-foreground text-sm font-medium">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  // Render children if authenticated
  return <>{children}</>
} 