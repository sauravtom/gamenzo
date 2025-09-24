'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { 
  Home, 
  Gamepad2, 
  Plus, 
  TrendingUp,
  User,
  Settings
} from 'lucide-react'

const navItems = [
  {
    href: '/',
    label: 'Home',
    icon: Home
  },
  {
    href: '/platform',
    label: 'Create Games',
    icon: Gamepad2
  },
  {
    href: '/kickstart',
    label: 'Browse Campaigns',
    icon: TrendingUp
  },
  {
    href: '/kickstart/create',
    label: 'Start Campaign',
    icon: Plus
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: User
  }
]

export function KickstartNav() {
  const pathname = usePathname()

  return (
    <div className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <nav className="flex items-center space-x-1 lg:space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || 
              (item.href === '/kickstart' && pathname.startsWith('/kickstart') && pathname !== '/kickstart/create')
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "gap-2 transition-all duration-200",
                    isActive && "bg-primary text-primary-foreground shadow-sm"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </nav>
        
        <div className="ml-auto flex items-center space-x-2">
          <div className="text-sm text-muted-foreground hidden md:block">
            Game Kickstart Platform
          </div>
        </div>
      </div>
    </div>
  )
} 