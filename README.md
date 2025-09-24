# Gamenzo: The AI-Powered Gaming Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Gamenzo** is an innovative open-source gaming platform that makes it easier than ever to discover, play, and even create your own games. Built with a modern, AI-powered tech stack, Gamenzo provides a seamless experience for both players and creators.

This project was proudly developed as part of the **Build On Aptos Hackathon**.

![Gamenzo Screenshot](https://github.com/user-attachments/assets/c443def5-41fc-4b12-b1e2-5c1f3f9fdeea)

## ✨ Key Features

- **Extensive Game Library**: Discover a wide variety of community-created games across different genres.
- **AI-Powered Game Creation**: Leverage the power of AI to assist in generating game assets and ideas.
- **Seamless Authentication**: Secure and easy-to-use authentication system powered by Privy, supporting email, social logins, and crypto wallets.
- **In-depth Analytics**: Comprehensive game and player analytics using PostHog to track engagement and performance.
- **Automatic Image Generation**: AI-powered script to automatically generate cover art for games using the Replicate API.
- **Sleek & Modern UI**: A clean, intuitive, and responsive user interface built with Next.js, Tailwind CSS, and custom components.
- **Open Source**: Gamenzo is fully open-source and welcomes community contributions.

## 🚀 Getting Started

Follow these instructions to get a local copy of Gamenzo up and running on your machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/)
- [Git](https://git-scm.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/gamenzo.git
   cd gamenzo
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env.local` file in the root of your project and add the following variables. You will need to sign up for accounts with the respective services to get your API keys.

   ```env
   # Privy Authentication (see README-AUTH-SETUP.md for more details)
   NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
   PRIVY_APP_SECRET=your_privy_app_secret

   # AI Playground (Optional)
   CLAUDE_API_KEY=your_anthropic_claude_api_key
   OPENROUTER_API_KEY=your_openrouter_api_key

   # Image Generation (Optional, for generating game images)
   REPLICATE_API_TOKEN=your_replicate_api_token
   ```

4. **Set up the database:**

   This project uses Prisma as an ORM. To set up your database, run:
   ```bash
   npx prisma db push
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🛠️ Tech Stack

Gamenzo is built with a modern and powerful tech stack:

- **Framework**: [Next.js](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Authentication**: [Privy](https://www.privy.io/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (with [Prisma](https://www.prisma.io/))
- **Analytics**: [PostHog](https://posthog.com/)
- **AI & Machine Learning**:
  - [OpenAI](https://openai.com/)
  - [Anthropic Claude](https://www.anthropic.com/claude)
  - [OpenRouter](https://openrouter.ai/)
  - [Replicate](https://replicate.com/) for image generation
- **Deployment**: [Vercel](https://vercel.com/)

## 📈 Analytics

Gamenzo uses [PostHog](https://posthog.com/) for product analytics. A wide range of events are tracked to provide insights into user behavior and game performance. For a full list of tracked events, please see the `README-ANALYTICS.md` file.

## 🔐 Authentication

Authentication is handled by [Privy](https://www.privy.io/), which provides a simple and secure way for users to sign in using email, social accounts, or their crypto wallets. For more details on setting up Privy, refer to the `README-AUTH-SETUP.md` file.

## 🖼️ AI-Powered Image Generation

Gamenzo includes a script to automatically generate cover images for the games in the library using the [Replicate API](https://replicate.com/). This helps to quickly create visually appealing assets for new games. To learn more about this feature, see the `README-image-generation.md` file.

## 🤝 Contributing

We love contributions from the community! If you'd like to contribute to Gamenzo, please feel free to fork the repository and submit a pull request.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<a href="https://buymeacoffee.com/swajp" alt="buyacoffe">
  <img src="https://github.com/user-attachments/assets/37b0e28f-c82f-42a9-bd1e-d937488758ab"/>
</a>