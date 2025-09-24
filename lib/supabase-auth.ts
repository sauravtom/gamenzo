import { PrivyClient } from '@privy-io/server-auth'
import { supabaseAdmin } from './supabase'

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

// Helper function to ensure user profile exists in Supabase
export async function ensureUserProfile(userId: string, email?: string, walletAddress?: string) {
  try {
    // Check if profile already exists
    const { data: existingProfile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking existing profile:', fetchError);
      return null;
    }

    if (existingProfile) {
      // Profile exists, optionally update it
      if (email || walletAddress) {
        const updateData: any = {};
        if (email) updateData.email = email;
        if (walletAddress) updateData.wallet_address = walletAddress;

        const { data: updatedProfile, error: updateError } = await supabaseAdmin
          .from('profiles')
          .update(updateData)
          .eq('id', userId)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating profile:', updateError);
          return existingProfile;
        }

        return updatedProfile;
      }
      return existingProfile;
    }

    // Create new profile
    const { data: newProfile, error: createError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        email: email || null,
        wallet_address: walletAddress || null,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating profile:', createError);
      return null;
    }

    return newProfile;
  } catch (error) {
    console.error('Error in ensureUserProfile:', error);
    return null;
  }
}

// Enhanced auth function that also ensures Supabase profile
export async function requireAuthWithProfile(request: Request): Promise<{ userId: string; profile: any } | Response> {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof Response) {
    return authResult;
  }
  
  const userId = authResult;
  const profile = await ensureUserProfile(userId);
  
  return { userId, profile };
}
