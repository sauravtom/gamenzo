import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { PostHogProvider } from "@/components/posthog-provider"
import { ClientPrivyProvider } from "@/components/privy-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "Gamenzo",
            description:
            "AI-Powered Browser Gaming for Immersive, Accessible Experiences",
}

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
                <head>
                    <script src="https://getlaunchlist.com/js/widget-diy.js" defer></script>
                </head>
                <body className={inter.className}>
                    <ClientPrivyProvider>
                        <PostHogProvider>
                            <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="list-swajp-theme" disableTransitionOnChange>
                                {children}
                                {/*<NewFeature />*/}
                                <Toaster />
                            </ThemeProvider>
                        </PostHogProvider>
                    </ClientPrivyProvider>
                </body>
        </html>
    )
}