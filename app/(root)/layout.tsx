import MaxWidthWrapper from "@/components/max-width-wrapper"
import Navbar from "@/components/navbar"
import { PostHogProvider } from "@/components/posthog-provider"

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <PostHogProvider>
                <div className="relative h-14">
                    <Navbar />
                </div>
                {children}
        </PostHogProvider>
    )
}