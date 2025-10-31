# QIC LifeQuest - Smart Insurance Companion

AI-powered insurance engagement platform built with React, Express, and Supabase.

## Features

- 🎯 Life Protection Score tracking (0-100)
- 🔥 Daily streak system
- 💪 Insurance challenges (Motor, Health, Travel, Home, Life)
- 🤖 AI Smart Advisor with personalized tone (Strict, Balanced, Friendly)
- 📊 Progress tracking and rewards

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4
- **Deployment**: Vercel

## Environment Variables

Required environment variables (add to Vercel):

```
DATABASE_URL=your_supabase_connection_string
OPENAI_API_KEY=your_openai_api_key
SESSION_SECRET=your_random_secret_key
```

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file with required variables

3. Run dev server:
   ```bash
   npm run dev
   ```

## Deployment

This app is configured for Vercel deployment:

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

## License

MIT
