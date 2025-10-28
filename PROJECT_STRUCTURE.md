# 🏗️ QIC LifeQuest - Comprehensive Project Structure

## 📋 Project Overview

**Type**: Full-stack TypeScript web application  
**Architecture**: Monorepo with separate client/server structure  
**Primary Goal**: AI-powered insurance engagement & retention layer with gamification  
**Tech Stack**: React + Express + PostgreSQL (Supabase) + DeepSeek AI

---

## 🎯 Core Concept

An AI-driven companion app that helps users improve their lifestyle through personalized missions, skill progression, and intelligent nudges across three focus areas:
- 🚗 **Driving** (e.g., defensive driving courses)
- 💪 **Health** (e.g., fitness routines)
- 💰 **Financial** (e.g., budgeting challenges)

---

## 📁 Root Directory Structure

```
AILifeCompanion/
├── client/              # React frontend application
├── server/              # Express backend API
├── shared/              # Shared TypeScript types & database schema
├── config/              # Configuration files
├── scripts/             # Database setup & seeding scripts
├── attached_assets/     # Design documents & wireframes
├── .env                 # Environment variables (gitignored)
├── package.json         # Root dependencies
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite bundler config
└── drizzle.config.ts    # Drizzle ORM configuration
```

---

## 🎨 Frontend Architecture (`client/`)

### Directory Structure
```
client/
├── index.html           # Entry HTML
├── public/              # Static assets
└── src/
    ├── main.tsx         # React entry point
    ├── App.tsx          # Main router & auth wrapper
    ├── index.css        # Global Tailwind styles
    ├── components/      # Reusable UI components
    ├── pages/           # Route-based page components
    ├── hooks/           # Custom React hooks
    ├── lib/             # Utilities & configurations
    └── types/           # TypeScript type definitions
```

### Key Components (`client/src/components/`)

**Core UI Components:**
- `bottom-nav.tsx` - Floating bottom navigation (4 tabs: Home, Missions, Social, Profile)
- `profile-header.tsx` - User stats display (name, level, XP, streak)
- `mission-card.tsx` - Horizontal scrollable mission cards with progress rings
- `ai-feed-card.tsx` - AI insights & suggestions display
- `ai-status.tsx` - AI availability indicator
- `focus-area-selector.tsx` - Multi-select focus area picker
- `mission-completion.tsx` - Celebration animations for completed missions
- `progress-ring.tsx` - Circular progress indicators
- `reward-badge.tsx` - Achievement badge display
- `scenario-slider.tsx` - Interactive scenario slider
- `skill-tree-node.tsx` - Skill tree node component
- `theme-toggle.tsx` - Dark/light mode switcher

**UI Library (`ui/`):**
- Radix UI primitives (50+ components)
- Components: Button, Card, Dialog, Input, Avatar, Badge, Accordion, Alert, Calendar, Checkbox, Dropdown, Form, Label, Progress, Select, Slider, Switch, Tabs, Toast, Tooltip, etc.
- Fully accessible, customizable with Tailwind

### Pages (`client/src/pages/`)

**Authentication:**
- `login.tsx` - Email/password login with Supabase Auth
- `signup.tsx` - 3-step registration (Personal Info → Focus Areas → Credentials)
- `onboarding.tsx` - Initial user onboarding flow

**Main Application:**
- `dashboard.tsx` - Home screen (profile header, active missions, AI insights)
- `missions.tsx` - Mission browser & tracker
- `social.tsx` - Social features (placeholder)
- `profile.tsx` - User settings, preferences, logout
- `ai-chat.tsx` - Full-page AI companion chat interface
- `rewards.tsx` - Achievement & badge showcase
- `simulator.tsx` - Scenario simulator (not currently in use)
- `not-found.tsx` - 404 error page

**Examples (`pages/examples/`):**
- Component usage examples and prototypes

### Hooks (`client/src/hooks/`)

- `use-auth.ts` - Supabase authentication state management
- `use-api.ts` - TanStack Query hooks for all API endpoints
  - useUser, useUpdateUser
  - useActiveMissions, useCompletedMissions, useRecommendedMissions
  - useCreateMission, useUpdateMissionProgress, useCompleteMission
  - useAIInteractions, useSendAIMessage
  - useAchievements, useUserAchievements
  - useLifeScore, useCalculateLifeScore
- `use-mission-progress.ts` - Mission progress tracking & animations
- `use-toast.ts` - Toast notification system
- `use-mobile.tsx` - Responsive design utilities

### Libraries (`client/src/lib/`)

- `supabase.ts` - Supabase client configuration
- `queryClient.ts` - TanStack Query setup
- `theme-provider.tsx` - Theme context (next-themes)
- `utils.ts` - Utility functions (cn for class merging)

### Types (`client/src/types/`)

- `index.ts` - Shared frontend type definitions

---

## ⚙️ Backend Architecture (`server/`)

### Directory Structure
```
server/
├── index.ts                    # Express server entry point
├── routes.ts                   # API route definitions
├── storage.ts                  # Database access layer
├── vite.ts                     # Vite dev server integration
├── auth/                       # Authentication system
│   ├── jwt.ts                  # JWT token generation/verification
│   ├── password.ts             # bcrypt password hashing
│   ├── middleware.ts           # Auth middleware
│   └── routes.ts               # Auth endpoints
├── ai/                         # AI integration
│   ├── client.ts               # OpenAI-compatible wrapper
│   ├── companion.ts            # AI messaging (nudges, celebrations)
│   └── mission-recommendations.ts  # Smart mission suggestions
├── jobs/                       # Background tasks
│   ├── scheduler.ts            # node-cron job scheduler
│   ├── daily-tasks.ts          # Daily streak checks
│   ├── lifescore-jobs.ts       # LifeScore calculations
│   ├── achievement-checker.ts  # Achievement unlocks
│   └── index.ts                # Job initialization
├── mission-generator.ts        # Mission creation logic
├── life-score-calculator.ts    # LifeScore algorithm
└── ai-companion.ts             # AI companion orchestration
```

### API Routes (`server/routes.ts`)

**Authentication (`/api/auth`):**
- `POST /register` - Create account + profile
- `POST /login` - Login with credentials
- `POST /logout` - Clear auth cookies
- `POST /refresh` - Refresh access token
- `GET /me` - Get current user (protected)

**User Management (`/api/user`):**
- `GET /user/:id` - Fetch user profile (by ID or email)
- `POST /user` - Create new user
- `PUT /user/:id` - Update user profile

**Missions (`/api/user/:userId/missions`):**
- `GET /active` - Get active missions
- `GET /completed` - Get completed missions
- `GET /recommended` - AI-recommended missions
- `POST /` - Create mission from template
- `PUT /:missionId/progress` - Update mission progress
- `PUT /:missionId/complete` - Mark mission complete

**AI Interactions (`/api/user/:userId/ai`):**
- `GET /interactions` - Fetch AI messages
- `POST /message` - Send message to AI companion
- `POST /nudge` - Generate AI nudge

**Achievements (`/api/user/:userId/achievements`):**
- `GET /` - Get all achievements
- `GET /earned` - Get user's earned achievements

**LifeScore (`/api/user/:userId/lifescore`):**
- `GET /` - Get current LifeScore
- `GET /history` - Get LifeScore over time
- `POST /calculate` - Trigger LifeScore calculation

**Testing:**
- `GET /api/test-ai` - Check AI availability

### Authentication System (`server/auth/`)

**Strategy**: JWT with httpOnly cookies + Supabase Auth  

**Files:**
- `jwt.ts` - Token generation/verification (access + refresh tokens)
- `password.ts` - bcrypt hashing utilities
- `middleware.ts` - `authenticateToken()` middleware
- `routes.ts` - Auth endpoints (register, login, logout, refresh, me)

**Security Features:**
- Password hashing with bcrypt (10 salt rounds)
- Access tokens (1 hour expiry)
- Refresh tokens (7 days expiry)
- httpOnly cookies (XSS protection)
- Password validation (8+ chars, uppercase, lowercase, number)

### AI Integration (`server/ai/`)

**Provider**: DeepSeek API (OpenAI-compatible)  
**Model**: `deepseek-chat`  

**Files:**
- `client.ts` - OpenAI SDK wrapper, `generateAIResponse()`, `generateStructuredResponse()`, `isAIAvailable()`
- `companion.ts` - `generateCompanionMessage()` with 4 types (nudge, celebration, guidance, insight) and 3 tone modes
- `mission-recommendations.ts` - `getAIRecommendedMissions()` with user context analysis

**Features:**
- **Mission Recommendations**: Context-aware suggestions based on user level, focus areas, completed missions
- **AI Companion**: 4 message types with personalized tone
- **Tone Modes**: Strict, balanced, soft (user preference)
- **Fallback**: Rule-based recommendations if AI unavailable

**Environment Variables:**
```env
AI_API_KEY=sk-...                    # DeepSeek API key
AI_BASE_URL=https://api.deepseek.com # Optional override
AI_MODEL=deepseek-chat               # Optional model override
```

### Background Jobs (`server/jobs/`)

**Scheduler**: node-cron  

**Files:**
- `scheduler.ts` - Job scheduler initialization
- `daily-tasks.ts` - Daily streak checks, mission resets
- `lifescore-jobs.ts` - LifeScore recalculation jobs
- `achievement-checker.ts` - Achievement unlock logic
- `index.ts` - `initializeJobs()`, `shutdownJobs()`

**Jobs:**
- **Daily Tasks** (00:00 UTC) - Streak checks, mission resets
- **LifeScore Updates** (every 6 hours) - Recalculate user scores
- **Achievement Checker** (on mission completion) - Unlock achievements

### Storage Layer (`server/storage.ts`)

Database access abstraction using Drizzle ORM:
- User CRUD operations
- Mission management
- Achievement tracking
- AI interaction storage
- LifeScore queries

---

## 🗄️ Database Schema (`shared/schema.ts`)

**ORM**: Drizzle ORM  
**Database**: PostgreSQL (Supabase)

### Tables

**`users`** - User profiles
```typescript
{
  id: UUID (primary key)
  username: string (unique)
  password: string (hashed)
  email: string (unique)
  name: string
  avatar: string
  level: number (default 1)
  xp: number (default 0)
  xpToNextLevel: number (default 100)
  streak: number (default 0)
  lastActiveDate: timestamp
  focusAreas: string[] (json)
  preferences: {
    theme: "light" | "dark"
    notifications: boolean
    aiTone: "strict" | "balanced" | "soft"
  } (json)
  createdAt: timestamp
  updatedAt: timestamp
}
```

**`mission_templates`** - Mission blueprints
```typescript
{
  id: UUID (primary key)
  title: string
  description: string
  category: string (driving/health/financial)
  difficulty: string (beginner/intermediate/advanced)
  xpReward: number
  estimatedDuration: number (hours)
  requirements: {
    steps: string[]
    conditions: Record<string, any>
  } (json)
  prerequisites: string[] (json)
  isActive: boolean
  createdAt: timestamp
}
```

**`user_missions`** - User's mission instances
```typescript
{
  id: UUID (primary key)
  userId: UUID (foreign key)
  templateId: UUID (foreign key)
  status: string (active/completed/abandoned)
  progress: number (0-100)
  startedAt: timestamp
  completedAt: timestamp
  xpEarned: number
  userData: Record<string, any> (json)
  createdAt: timestamp
}
```

**`skill_tree_nodes`** - Skill tree structure
```typescript
{
  id: UUID (primary key)
  title: string
  description: string
  category: string
  xpCost: number
  prerequisites: string[] (json)
  unlocks: string[] (json)
  position: { x: number, y: number } (json)
  isActive: boolean
  createdAt: timestamp
}
```

**`user_skill_nodes`** - User's skill progress
```typescript
{
  id: UUID (primary key)
  userId: UUID (foreign key)
  nodeId: UUID (foreign key)
  status: string (locked/available/unlocked/completed)
  unlockedAt: timestamp
  completedAt: timestamp
  createdAt: timestamp
}
```

**`achievements`** - Achievement definitions
```typescript
{
  id: UUID (primary key)
  name: string
  description: string
  icon: string
  category: string
  xpReward: number
  conditions: Record<string, any> (json)
  isActive: boolean
  createdAt: timestamp
}
```

**`user_achievements`** - Earned achievements
```typescript
{
  id: UUID (primary key)
  userId: UUID (foreign key)
  achievementId: UUID (foreign key)
  earnedAt: timestamp
  xpEarned: number
}
```

**`ai_interactions`** - AI companion messages
```typescript
{
  id: UUID (primary key)
  userId: UUID (foreign key)
  type: string (nudge/celebration/guidance/insight)
  message: string
  context: Record<string, any> (json)
  isRead: boolean
  createdAt: timestamp
}
```

**`life_scores`** - LifeScore tracking
```typescript
{
  id: UUID (primary key)
  userId: UUID (foreign key)
  category: string (driving/health/financial/overall)
  score: number (0-100)
  factors: Record<string, number> (json)
  calculatedAt: timestamp
}
```

---

## 🔧 Configuration Files

### `package.json` - Dependencies & Scripts

**Key Dependencies:**
- **Frontend**: React 18, TanStack Query, Wouter (routing), Framer Motion
- **Backend**: Express, Drizzle ORM, Supabase client, node-cron
- **UI**: Radix UI (50+ components), Tailwind CSS, next-themes
- **AI**: OpenAI SDK (for DeepSeek compatibility)
- **Auth**: bcrypt, jsonwebtoken, cookie-parser
- **Validation**: Zod, drizzle-zod
- **Utilities**: date-fns, clsx, tailwind-merge

**Scripts:**
```bash
npm run dev        # Start dev server (client + server)
npm run build      # Production build (Vite + esbuild)
npm start          # Start production server
npm run check      # TypeScript type checking
npm run db:push    # Apply database migrations
npm run db:setup   # Interactive database setup
npm run db:seed    # Seed initial data
npm run setup      # Complete dev setup
```

### `vite.config.ts` - Build Configuration

```typescript
{
  plugins: [react(), runtimeErrorOverlay()],
  resolve: {
    alias: {
      "@": "client/src",
      "@shared": "shared",
      "@assets": "attached_assets"
    }
  },
  root: "client",
  build: {
    outDir: "dist/public"
  }
}
```

### `drizzle.config.ts` - Database Configuration

```typescript
{
  schema: "./shared/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL
  }
}
```

### `tsconfig.json` - TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"]
    }
  }
}
```

---

## 🎨 Design System

### Color Palette

**Neutral:**
- Light background: `#F7F8FA`
- Mid gray: `#EAEAEA`
- Dark: `#121212`

**Focus Area Accents:**
- Driving: Blue `#3A7BD5`
- Health: Green `#4CAF50`
- Financial: Gold `#FFB300`

**Feedback Colors:**
- Success: Emerald `#2ECC71`
- Warning: Amber `#F39C12`
- Error: Red `#E74C3C`
- Info: Cyan `#00BCD4`

### Typography

**Font Family**: Inter / SF Pro / Manrope (geometric, clean)

**Weight Hierarchy:**
- Headings: 600-700
- Body text: 400
- Labels/Buttons: 500

**Spacing**: 8pt baseline grid with 16-24px card padding

### Component Patterns

**Cards:**
- Rounded corners: 16-24px
- Soft shadows: `rgba(0,0,0,0.08)`
- Padding: `p-4` to `p-6`

**Buttons:**
- Primary: Rounded 16px, gradient fill
- Secondary: Outline style with accent border
- Hover states with smooth transitions

**Icons:**
- Style: Lucide icons (line-based, consistent stroke)
- Size: 16-24px for UI elements

---

## 🚀 Current Implementation Status

### ✅ Completed Features

**Phase 1: Core Frontend**
- ✅ Authentication UI (login, signup with 3-step flow)
- ✅ Dashboard with profile header & mission cards
- ✅ Bottom navigation (4 tabs: Home, Missions, Social, Profile)
- ✅ AI chat interface (full-page with quick actions)
- ✅ Theme system (light/dark mode with next-themes)
- ✅ Profile management with logout
- ✅ Focus area selection
- ✅ Mission progress tracking with animations
- ✅ Real-time password validation

**Phase 2: Backend Services**
- ✅ JWT + Supabase authentication
- ✅ DeepSeek AI integration (working, tested)
- ✅ Background job scheduler (node-cron)
- ✅ Mission recommendation engine
- ✅ AI companion messaging (4 types, 3 tones)
- ✅ Database schema & migrations
- ✅ Environment variable loading (dotenv)
- ✅ All API endpoints implemented

**Phase 3: Improvements**
- ✅ Multi-step onboarding (Personal → Interests → Credentials)
- ✅ Email verification message handling
- ✅ Profile displays real user data from auth metadata
- ✅ Removed simulator tab from navigation
- ✅ AI status indicator hidden from users
- ✅ Error handling improvements

### 🔄 In Progress
- ⚠️ User data sync between Supabase Auth and app database
- ⚠️ AI chat full implementation (currently placeholder responses)
- ⚠️ Mission auto-generation based on user progress

### 📝 Pending
- ❌ Social features (leaderboards, friend system)
- ❌ Skill tree UI & progression system
- ❌ Achievement unlock animations
- ❌ LifeScore visualization dashboard
- ❌ Real-time mission suggestions
- ❌ Push notifications
- ❌ Mobile app (React Native)

---

## 🌐 Environment Configuration

### Required Variables (`.env`)

```env
# Database
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Supabase
VITE_SUPABASE_URL=https://[project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# AI (DeepSeek)
AI_API_KEY=sk-...

# Optional AI overrides
AI_BASE_URL=https://api.deepseek.com
AI_MODEL=deepseek-chat

# Server
PORT=5000
NODE_ENV=development

# JWT (optional, for custom auth)
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
```

---

## 🔐 Security Features

- ✅ **httpOnly Cookies**: XSS protection for auth tokens
- ✅ **Password Hashing**: bcrypt with 10 salt rounds
- ✅ **Token Expiry**: Access (1h), Refresh (7d)
- ✅ **Email Verification**: Supabase Auth email confirmation flow
- ✅ **CORS Configuration**: Secure cross-origin requests
- ✅ **Input Validation**: Zod schemas on all endpoints
- ✅ **SQL Injection Protection**: Drizzle ORM parameterized queries
- ✅ **Type Safety**: End-to-end TypeScript

---

## 📦 Build & Deployment

### Development

```bash
# 1. Clone repository
git clone <repo-url>
cd AILifeCompanion

# 2. Install dependencies
npm install

# 3. Configure environment
npm run db:setup
# Follow prompts to configure DATABASE_URL, SUPABASE credentials, AI_API_KEY

# 4. Setup database
npm run db:push    # Create tables
npm run db:seed    # Seed initial data (optional)

# 5. Start dev server
npm run dev        # Runs on http://localhost:5000
```

### Production

```bash
# 1. Build for production
npm run build
# Outputs to dist/public (client) and dist/ (server)

# 2. Set production environment variables
export NODE_ENV=production
export DATABASE_URL=<production-db-url>
export AI_API_KEY=<production-api-key>

# 3. Start production server
npm start          # Runs on PORT environment variable or 5000
```

### Deployment Platforms

**Recommended:**
- **Vercel** - Frontend + API routes
- **Railway** - Full-stack with PostgreSQL
- **Render** - Web service + database
- **Supabase** - Database + Auth + Edge Functions

---

## 🎯 Key Design Patterns

1. **Monorepo Structure**: Shared types (`shared/`) between client and server
2. **API Layer Abstraction**: `use-api.ts` React Query hooks wrap all endpoints
3. **Component Composition**: Radix UI primitives + custom themed wrappers
4. **State Management**: 
   - Server state: TanStack Query
   - Auth state: Supabase + React Context
   - UI state: React useState/useReducer
5. **Type Safety**: End-to-end TypeScript with Drizzle ORM type inference
6. **Error Handling**: Toast notifications + try/catch + error boundaries
7. **Optimistic Updates**: Immediate UI feedback with query invalidation
8. **Code Splitting**: Route-based lazy loading
9. **Environment Separation**: Different configs for dev/production

---

## 🧪 Testing Strategy

### Current Status
- ❌ Unit tests not yet implemented
- ❌ Integration tests not yet implemented
- ✅ Manual testing of all core flows

### Planned Testing
- **Frontend**: Vitest + React Testing Library
- **Backend**: Vitest + Supertest
- **E2E**: Playwright
- **Coverage Goal**: 80%+

---

## 📚 Documentation Files

- `README.md` - Project overview & quick start
- `PROJECT_STRUCTURE.md` - This file - comprehensive architecture
- `DATABASE_SETUP.md` - Database configuration guide
- `PHASE2_COMPLETE.md` - Phase 2 implementation details
- `SETUP.md` - Development setup instructions
- `design_guidelines.md` - UI/UX design system
- `attached_assets/` - Design wireframes & blueprints

---

## 🔄 Development Workflow

1. **Feature Development**:
   - Create feature branch
   - Update schema if needed (`shared/schema.ts`)
   - Implement backend routes (`server/routes.ts`)
   - Create React hooks (`client/src/hooks/use-api.ts`)
   - Build UI components
   - Test manually

2. **Database Changes**:
   - Update `shared/schema.ts`
   - Run `npm run db:push`
   - Update `server/storage.ts` if needed
   - Update TypeScript types

3. **API Changes**:
   - Update route handlers in `server/routes.ts`
   - Update React Query hooks in `client/src/hooks/use-api.ts`
   - Update TypeScript types if needed

---

## 🎓 Learning Resources

**Frontend:**
- React Docs: https://react.dev
- TanStack Query: https://tanstack.com/query
- Radix UI: https://radix-ui.com
- Tailwind CSS: https://tailwindcss.com

**Backend:**
- Express: https://expressjs.com
- Drizzle ORM: https://orm.drizzle.team
- Supabase: https://supabase.com/docs

**AI:**
- DeepSeek API: https://platform.deepseek.com
- OpenAI SDK: https://github.com/openai/openai-node

---

## 📞 Support & Contribution

**Current Status**: Solo development project  
**Maintainer**: Ammar Yahia (ammaryahia23@gmail.com)

**Contribution Guidelines**: Not yet established  
**License**: MIT

---

**Last Updated**: October 27, 2025  
**Version**: 1.0.0  
**Status**: Active Development
