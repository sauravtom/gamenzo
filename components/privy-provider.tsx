'use client'

import { PrivyProvider } from '@privy-io/react-auth'

export function ClientPrivyProvider({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        loginMethods: ['wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#676FFF',
          logo: '/icon.webp'
        }
      }}
    >
      {children}
    </PrivyProvider>
  )
} 