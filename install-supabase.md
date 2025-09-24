# Supabase Migration Instructions

## 1. Install Supabase Dependencies

Run the following command to install Supabase:

```bash
npm install @supabase/supabase-js
```

## 2. Environment Variables

Add these environment variables to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://mlixugscitavyqxigtes.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Privy Authentication (keep existing)
NEXT_PUBLIC_PRIVY_APP_ID=cmfxnx22h007ola0c9x2mi17t
PRIVY_APP_SECRET=your_privy_secret_here

# OpenRouter API (keep existing)
OPENROUTER_API_KEY=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

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 3. Database Setup

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the SQL script from `supabase/schema.sql`

## 4. Authentication Setup

The system now uses:
- **Privy** for wallet-based authentication (frontend)
- **Supabase** for data storage and user profiles (backend)

## 5. What Changed

### Files Created:
- `lib/supabase.ts` - Supabase client configuration
- `lib/supabase-storage.ts` - Database operations
- `lib/supabase-auth.ts` - Enhanced authentication
- `supabase/schema.sql` - Database schema

### Files Updated:
- `app/api/games/route.ts` - Uses Supabase storage
- `app/api/games/[slug]/route.ts` - Uses Supabase storage  
- `app/api/games/my-games/route.ts` - Uses Supabase storage

### Benefits:
- ✅ Real database instead of localStorage
- ✅ User authentication with profiles
- ✅ Row Level Security (RLS)
- ✅ Scalable and production-ready
- ✅ Real-time capabilities (if needed later)

## 6. Testing

After setup, test these endpoints:
- `GET /api/games` - List all games
- `POST /api/games` - Create new game (requires auth)
- `GET /api/games/[slug]` - Get specific game
- `PUT /api/games/[slug]` - Update game (requires auth)
- `GET /api/games/my-games` - Get user's games (requires auth)
