# 🧠 Adaptive Learning System

## Overview

The Adaptive Learning System uses **DeepSeek AI** to analyze user behavior patterns and automatically personalize the QIC LifeQuest experience. The system learns from user interactions and adapts challenge recommendations, difficulty levels, and advisor tone to maximize engagement and completion rates.

## How It Works

### 1. **Behavior Data Collection** 📊

The system automatically tracks (behind the scenes, no UI changes):

- **Challenge Patterns**: Which categories, difficulties, and types users prefer
- **Completion Metrics**: Acceptance rate, completion rate, average time to complete
- **Session Data**: Login frequency, time spent per session, total sessions
- **Protection Score Changes**: Score progression over time
- **Reward Behavior**: Redemption frequency and patterns

### 2. **AI Analysis** 🤖

Every **2-3 days**, DeepSeek AI analyzes each active user's behavior and generates:

- **Recommended Difficulty**: Easy, Medium, or Hard based on completion patterns
- **Recommended Categories**: Top 3 insurance categories to focus on
- **Recommended Tone**: Strict, Balanced, or Friendly based on engagement style
- **Engagement Pattern**: highly-engaged, moderate, declining, or new
- **Actionable Insights**: Specific notes on how to improve user experience

### 3. **Adaptive Personalization** ✨

The Smart Advisor automatically uses AI insights to:

- **Generate Better Challenges**: Matches user preferences and skill level
- **Adjust Communication Tone**: Speaks in the style that resonates best
- **Focus on Relevant Categories**: Prioritizes insurance areas user cares about
- **Optimize Difficulty**: Keeps challenges challenging but achievable

## Database Schema

### `user_behavior_analytics`

Stores aggregated behavior metrics:

```sql
- challenge_preferences: { preferredCategories, preferredDifficulties, preferredTypes }
- total_challenges_accepted, completed, abandoned
- average_completion_time, completion_rate
- total_sessions, total_time_spent, average_session_duration
- protection_score_history, average_score_change
- total_rewards_redeemed, reward_redemption_frequency
- ai_insights: { recommendedDifficulty, recommendedCategories, recommendedTone, notes }
- last_analyzed_at
```

### `user_sessions`

Tracks individual sessions:

```sql
- user_id, start_time, end_time, duration
- actions_count (number of interactions)
```

## Implementation Details

### Backend Services

1. **`BehaviorTracker`** (`server/services/behavior-tracker.ts`)
   - Tracks sessions, challenge interactions, score changes, rewards
   - Aggregates data for AI analysis
   - Updates analytics in real-time

2. **`LearningAnalyzer`** (`server/ai/learning-analyzer.ts`)
   - Processes behavior data using DeepSeek AI
   - Generates adaptive learning insights
   - Updates user preferences automatically

3. **`AdaptiveLearningJob`** (`server/jobs/adaptive-learning.ts`)
   - Scheduled job runs every 2 days at 3 AM
   - Analyzes all active users (active in last 14 days)
   - Can be triggered on-demand for individual users

### Frontend Integration

- **`useSessionTracking`** hook tracks sessions automatically
- **`trackAction`** function tracks user interactions
- Integrated into App, Dashboard, Missions pages
- **Zero UI changes** - completely behind the scenes

### API Endpoints

```typescript
POST /api/behavior/session/start          // Start tracking session
POST /api/behavior/session/end            // End session
POST /api/behavior/session/action         // Track action in session
GET  /api/behavior/analytics/:userId      // Get user analytics
POST /api/behavior/analyze/:userId        // Trigger on-demand AI analysis
```

## Usage Examples

### Automatic Session Tracking

```tsx
// In App.tsx - automatically tracks all sessions
import { useSessionTracking } from '@/hooks/use-behavior-tracking';

function App() {
  useSessionTracking(); // That's it!
  return <YourApp />;
}
```

### Track User Actions

```tsx
import { trackAction } from '@/hooks/use-behavior-tracking';

function handleButtonClick() {
  trackAction(); // Tracks this interaction
  // ... rest of your code
}
```

### Trigger Manual Analysis

```bash
POST /api/behavior/analyze/user-id-123
```

Response:
```json
{
  "success": true,
  "message": "Analysis completed",
  "insights": {
    "recommendedDifficulty": "Medium",
    "recommendedCategories": ["motor", "health", "travel"],
    "recommendedTone": "balanced",
    "engagementPattern": "highly-engaged",
    "notes": "User shows consistent engagement with 85% completion rate..."
  }
}
```

## AI Prompts

The system uses comprehensive prompts that include:

- User behavior statistics (completion rate, session data, etc.)
- Category and difficulty preferences
- Recent activity patterns
- Protection score progression
- Contextual insights for better recommendations

Example AI response:
```json
{
  "recommendedDifficulty": "Hard",
  "recommendedCategories": ["motor", "health"],
  "recommendedTone": "strict",
  "engagementPattern": "highly-engaged",
  "notes": "User completes 90% of challenges in under 12 hours. Ready for advanced content.",
  "confidence": 95
}
```

## Performance Considerations

- **Lightweight tracking**: Minimal performance impact
- **Batch processing**: Analysis runs during off-peak hours
- **Graceful degradation**: Falls back to rule-based logic if AI unavailable
- **Indexed queries**: Database indexes on user_id and timestamps
- **Non-blocking**: Tracking failures don't affect user experience

## Scheduled Jobs

The system runs automatically via cron:

```typescript
// Runs every 2 days at 3:00 AM
cron.schedule('0 3 */2 * *', async () => {
  await runAdaptiveLearning();
});
```

Manual trigger:
```typescript
import { analyzeUserOnDemand } from './jobs/adaptive-learning';
await analyzeUserOnDemand('user-id');
```

## Monitoring

Check logs for adaptive learning activity:

```
🧠 Starting adaptive learning analysis...
Found 9 active users for analysis
🎯 Running on-demand analysis for user: abc-123
✅ Analysis complete for abc-123: difficulty=Medium, pattern=moderate, confidence=85
✅ Adaptive learning analysis completed successfully
```

## Future Enhancements

- 🔮 Predictive churn detection
- ⏰ Optimal notification timing
- 📈 A/B testing different AI prompts
- 🎯 Challenge sequence optimization
- 🏆 Personalized milestone suggestions

## Configuration

Environment variables (optional):
```env
AI_API_KEY=your_deepseek_api_key
AI_BASE_URL=https://api.deepseek.com
AI_MODEL=deepseek-chat
```

The system automatically uses DeepSeek AI when configured, falls back to rule-based analysis otherwise.

---

**Built with DeepSeek AI for QIC LifeQuest** 🚀
