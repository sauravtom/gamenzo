"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePrivy } from '@privy-io/react-auth'
import { User, LogOut } from 'lucide-react'

export default function Navbar() {
    const [showLinks, setShowLinks] = useState(false)
    const { authenticated, login, logout, user, ready } = usePrivy()

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100) {
                setShowLinks(true)
            } else {
                setShowLinks(false)
            }
        }

        window.addEventListener("scroll", handleScroll)

        return () => {
            window.removeEventListener("scroll", handleScroll)
        }
    }, [])

    return (
        <nav className="h-20 fixed top-0 left-0 right-0 flex items-center z-50 justify-center">
            <div
                className={`flex items-center justify-between gap-3 p-2 px-4 bg-card/80 backdrop-blur-sm border border-border transition-all duration-300 rounded-full shadow-lg ${
                    showLinks ? "max-w-[400px] w-full md:gap-4" : "max-w-[64px] w-auto"
                }`}
            >
                <Link className="flex text-sm items-center gap-2 flex-shrink-0" href={"/"}>
                    <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                        <Image src="/icon.webp" alt="Gamenzo" width={32} height={32} className="rounded-lg" />
                    </div>
                    <span className={`font-bold text-foreground transition-all duration-300 ${showLinks ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
                        Gamenzo
                    </span>
                </Link>

                {ready && (
                    <div className={`flex items-center gap-2 transition-all duration-300 ${showLinks ? 'opacity-100 flex-shrink-0' : 'opacity-0 pointer-events-none w-0 overflow-hidden'}`}>
                        {authenticated ? (
                            <>
                                <Link 
                                    href="/platform" 
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-accent whitespace-nowrap"
                                >
                                    Create
                                </Link>
                                <Link 
                                    href="/kickstart" 
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-accent whitespace-nowrap"
                                >
                                    Kickstart
                                </Link>
                                <div className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg px-2 py-1">
                                    <button
                                        onClick={logout}
                                        className="p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-colors"
                                        title="Sign out"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link 
                                    href="/kickstart" 
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-accent whitespace-nowrap"
                                >
                                    Kickstart
                                </Link>
                                <Link 
                                    href="/auth" 
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-accent whitespace-nowrap"
                                >
                                    Sign In
                                </Link>
                                <Link 
                                    href="/platform" 
                                    className="text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
                                >
                                    Create
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    )
}