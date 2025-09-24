import { PrivyClient } from '@privy-io/server-auth'

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
)

export async function getPrivyUser(authorizationHeader: string | null) {
  if (!authorizationHeader) {
    return null
  }

  try {
    const accessToken = authorizationHeader.replace('Bearer ', '')
    const verifyResult = await privy.verifyAuthToken(accessToken)
    return verifyResult.userId
  } catch (error) {
    console.error('Error verifying Privy token:', error)
    return null
  }
}

export async function requireAuth(request: Request): Promise<string | Response> {
  const authHeader = request.headers.get('authorization')
  const userId = await getPrivyUser(authHeader)
  
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  return userId
} 