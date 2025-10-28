# AI Lifestyle Companion - Setup Guide

## Quick Start

The app is configured to work out of the box with in-memory storage for development. No database setup required!

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## Database Setup (Optional)

If you want to use a real database instead of in-memory storage:

### 1. Set up a PostgreSQL database
- Create a database on [Neon](https://neon.tech) or any PostgreSQL provider
- Get your connection string

### 2. Set environment variable
Create a `.env` file in the root directory:
```env
DATABASE_URL=your_postgresql_connection_string_here
```

### 3. Run database migrations
```bash
npm run db:push
```

## Features

✅ **Core Functionality**
- User onboarding with focus area selection
- Personalized mission generation
- AI companion with contextual nudges
- Skill tree progression system
- LifeScore tracking and insights
- Mission completion with reward animations
- Real-time progress updates

✅ **Technical Features**
- Type-safe API with Zod validation
- React Query for efficient data fetching
- Framer Motion animations
- Responsive design with Tailwind CSS
- Modular architecture with clean separation

## Development Notes

- The app uses in-memory storage by default (no database required)
- All data is lost when the server restarts (perfect for development)
- Mock user ID is used for development (`user-123`)
- AI companion provides contextual guidance based on user behavior
- Mission progress is tracked with beautiful animations

## Production Deployment

For production deployment:

1. Set up a production database
2. Configure environment variables
3. Run database migrations
4. Deploy to your preferred platform

The app is designed to scale from development to production seamlessly!
