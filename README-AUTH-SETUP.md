# Privy Authentication Setup

This project uses Privy for authentication. To set up authentication, follow these steps:

## 1. Create a Privy Account

1. Go to [privy.io](https://privy.io) and create an account
2. Create a new application in your Privy dashboard
3. Configure your login methods (email, wallet, social logins)

## 2. Get Your API Keys

From your Privy dashboard, copy the following keys:

- **App ID**: Found in the "Settings" section
- **App Secret**: Found in the "Settings" section (for server-side authentication)

## 3. Environment Variables

Add these variables to your `.env.local` file:

```env
# Privy Authentication
NEXT_PUBLIC_PRIVY_APP_ID=your_app_id_here
PRIVY_APP_SECRET=your_app_secret_here
```

## 4. Test Authentication

1. Start your development server: `npm run dev`
2. Navigate to `/platform` - you should be prompted to sign in
3. Sign up for a new account or sign in with an existing one
4. You should now be able to access the platform and publish games!

## Features

- **Protected Routes**: Only authenticated users can access `/platform`
- **Game Publishing**: Only signed-in users can create and publish games
- **Game Management**: Users can edit their own published games
- **Community Games**: Published games appear on the homepage for everyone to play
- **Multiple Login Methods**: Support for email, wallet, Google, Discord, GitHub
- **Web3 Integration**: Native wallet connection support

## Troubleshooting

- Make sure your environment variables are properly set
- Check the Privy dashboard for any configuration issues
- Ensure your domain is added to Privy's allowed domains in production
- For wallet authentication, ensure your users have a compatible wallet installed 