import dynamic from 'next/dynamic';
import { AuthGuard } from '@/components/auth-guard';
import { Loader2, Code } from 'lucide-react';
import { Suspense } from 'react';

const PlaygroundPage = dynamic(() => import('./playground-page'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Code className="w-8 h-8 text-primary" />
            <Loader2 className="w-4 h-4 text-primary animate-spin absolute top-1 right-1" />
          </div>
        </div>
        <p className="text-muted-foreground text-sm font-medium">Loading Playground...</p>
        <p className="text-muted-foreground/70 text-xs mt-1">Preparing your creative workspace</p>
      </div>
    </div>
  ),
});

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Code className="w-8 h-8 text-primary" />
              <Loader2 className="w-4 h-4 text-primary animate-spin absolute top-1 right-1" />
            </div>
          </div>
          <p className="text-muted-foreground text-sm font-medium">Loading Platform...</p>
          <p className="text-muted-foreground/70 text-xs mt-1">Preparing your workspace</p>
        </div>
      </div>
    }>
      <AuthGuard>
        <PlaygroundPage />
      </AuthGuard>
    </Suspense>
  );
} 