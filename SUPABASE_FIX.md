# 🚨 Supabase UUID/DID Fix

## Problem
Privy uses DID format for user IDs like `"did:privy:cmfxpns89007zjt0d5fkevibe"`, but our initial schema expected UUID format, causing the error:

```
invalid input syntax for type uuid: "did:privy:cmfxpns89007zjt0d5fkevibe"
```

## ✅ Solution Applied

### 1. Database Schema Updated
- Changed `profiles.id` from `UUID` to `TEXT` 
- Changed `games.user_id` from `UUID` to `TEXT`
- Updated foreign key relationships
- Simplified RLS policies to work with application-level auth

### 2. TypeScript Types Updated
- Updated `lib/supabase.ts` with correct TEXT types
- Added comments indicating Privy DID format

## 🔧 Quick Fix Steps

### Step 1: Run Migration
Go to your Supabase Dashboard → SQL Editor and run:
```sql
-- Copy and paste the contents of supabase/migration-fix.sql
```

### Step 2: Restart Your App
```bash
npm run dev
```

## ✅ What's Fixed
- ✅ Privy DID format now supported (`did:privy:...`)
- ✅ User profiles can be created with Privy user IDs
- ✅ Games can be associated with Privy users
- ✅ All CRUD operations should work
- ✅ Authentication flow preserved

## 🧪 Test These Endpoints
1. `GET /api/games` - Should work ✅
2. `POST /api/games` - Should work with auth ✅
3. `GET /api/games/my-games` - Should work with auth ✅
4. `PUT /api/games/[slug]` - Should work with auth ✅

## 📊 Database Structure
```
profiles
├── id (TEXT) - "did:privy:..."
├── email (TEXT)
├── wallet_address (TEXT)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

games
├── id (UUID) - Auto-generated
├── name (TEXT)
├── slug (TEXT) - Unique
├── description (TEXT)
├── author (TEXT)
├── code (TEXT)
├── user_id (TEXT) - References profiles.id
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)
```

The error should be resolved now! 🎉
