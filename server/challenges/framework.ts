/**
 * QIC Insurance Challenge Framework
 * Behavior-shaping challenges designed to increase engagement, renewals, and cross-selling
 */

export interface ChallengeTemplate {
  category: 'motor' | 'health' | 'travel' | 'home' | 'life';
  type: 'renewal' | 'awareness' | 'engagement' | 'safety-wellness' | 'cross-product' | 'referral' | 'seasonal';
  name: string;
  description: string;
  steps: string[];
  engagementPoints: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // hours
  practicalReward?: string;
  protectionScoreBoost: number;
  triggers?: {
    userStage?: 'new' | 'active' | 'loyal' | 'inactive';
    daysToRenewal?: number;
    missingProducts?: string[];
    inactiveDays?: number;
    seasonalEvent?: string;
  };
}

/**
 * Pre-defined Challenge Library
 * These are proven, high-impact challenges that drive QIC's business goals
 */
export const CHALLENGE_LIBRARY: ChallengeTemplate[] = [
  // 🚗 MOTOR INSURANCE CHALLENGES
  {
    category: 'motor',
    type: 'renewal',
    name: 'Early Renewal Champion',
    description: 'Renew your motor insurance policy 10+ days before it expires and unlock exclusive rewards',
    steps: [
      'Check your policy expiry date in the app',
      'Review and update your coverage if needed',
      'Complete renewal at least 10 days early',
      'Confirm payment and download your new policy'
    ],
    engagementPoints: 50,
    difficulty: 'beginner',
    estimatedDuration: 1,
    practicalReward: 'QR 50 voucher + Priority Support',
    protectionScoreBoost: 5,
    triggers: { daysToRenewal: 20 }
  },
  {
    category: 'motor',
    type: 'safety-wellness',
    name: 'Safe Driver',
    description: 'Maintain a clean driving record for 30 consecutive days without any claims or incidents',
    steps: [
      'Track your driving habits daily',
      'Avoid traffic violations',
      'Complete 30 days claim-free',
      'Share your achievement'
    ],
    engagementPoints: 40,
    difficulty: 'intermediate',
    estimatedDuration: 720, // 30 days
    practicalReward: '5% renewal discount',
    protectionScoreBoost: 8,
    triggers: { userStage: 'active' }
  },
  {
    category: 'motor',
    type: 'safety-wellness',
    name: 'Car Care Hero',
    description: 'Upload proof of your car maintenance and get rewarded for responsible vehicle ownership',
    steps: [
      'Schedule or complete car maintenance',
      'Take a photo of the service receipt',
      'Upload it through the app',
      'Get your points verified'
    ],
    engagementPoints: 30,
    difficulty: 'beginner',
    estimatedDuration: 2,
    protectionScoreBoost: 3,
  },
  {
    category: 'motor',
    type: 'referral',
    name: 'Refer a Driver',
    description: 'Invite a friend to QIC Motor Insurance and both of you earn rewards',
    steps: [
      'Share your unique referral link',
      'Friend completes a motor quote',
      'Friend purchases a policy',
      'Both receive bonus points'
    ],
    engagementPoints: 100,
    difficulty: 'beginner',
    estimatedDuration: 1,
    practicalReward: 'QR 100 for you + QR 50 for friend',
    protectionScoreBoost: 10,
  },

  // ❤️ HEALTH INSURANCE CHALLENGES
  {
    category: 'health',
    type: 'safety-wellness',
    name: 'Wellness Streak',
    description: 'Track 5 consecutive active days using any fitness app and boost your health score',
    steps: [
      'Connect your fitness app or tracker',
      'Log activity for 5 consecutive days',
      'Reach daily activity goal (5,000 steps or equivalent)',
      'Submit your progress'
    ],
    engagementPoints: 50,
    difficulty: 'beginner',
    estimatedDuration: 120, // 5 days
    protectionScoreBoost: 5,
    triggers: { userStage: 'active' }
  },
  {
    category: 'health',
    type: 'safety-wellness',
    name: 'Preventive Health Hero',
    description: 'Book and complete your annual health check-up to stay ahead of health issues',
    steps: [
      'Browse QIC network hospitals',
      'Schedule annual health screening',
      'Complete the check-up',
      'Upload your health report'
    ],
    engagementPoints: 80,
    difficulty: 'intermediate',
    estimatedDuration: 4,
    practicalReward: 'Free health consultation',
    protectionScoreBoost: 10,
  },
  {
    category: 'health',
    type: 'renewal',
    name: 'Health Renewal Pro',
    description: 'Renew your health insurance policy before expiry and maintain continuous coverage',
    steps: [
      'Review your current coverage',
      'Update family member details if needed',
      'Renew before policy expiry',
      'Confirm continuous coverage'
    ],
    engagementPoints: 40,
    difficulty: 'beginner',
    estimatedDuration: 1,
    protectionScoreBoost: 5,
    triggers: { daysToRenewal: 15 }
  },
  {
    category: 'health',
    type: 'awareness',
    name: 'Health Coverage Explorer',
    description: 'Learn about different health insurance add-ons and customize your coverage',
    steps: [
      'Watch 3-minute health coverage explainer',
      'Complete knowledge quiz (5 questions)',
      'Review recommended add-ons for you',
      'Save your preferences'
    ],
    engagementPoints: 20,
    difficulty: 'beginner',
    estimatedDuration: 1,
    protectionScoreBoost: 2,
  },

  // ✈️ TRAVEL INSURANCE CHALLENGES
  {
    category: 'travel',
    type: 'cross-product',
    name: 'Trip Planner',
    description: 'Get a personalized travel insurance quote for your upcoming trip',
    steps: [
      'Enter your trip destination and dates',
      'Select coverage type (single/annual)',
      'Review quote details',
      'Save quote for later or purchase'
    ],
    engagementPoints: 20,
    difficulty: 'beginner',
    estimatedDuration: 1,
    protectionScoreBoost: 3,
    triggers: { missingProducts: ['travel'] }
  },
  {
    category: 'travel',
    type: 'awareness',
    name: 'Travel Insurance Explorer',
    description: 'Discover why travel insurance is essential and unlock your first-time buyer bonus',
    steps: [
      'Complete "Why Travel Insurance?" mini-course',
      'Take the 5-question quiz',
      'Get your first travel policy quote',
      'Unlock Explorer Badge'
    ],
    engagementPoints: 50,
    difficulty: 'beginner',
    estimatedDuration: 1,
    protectionScoreBoost: 5,
    triggers: { userStage: 'new', missingProducts: ['travel'] }
  },
  {
    category: 'travel',
    type: 'engagement',
    name: 'Post-Trip Feedback Champion',
    description: 'Share your travel experience and help us improve our services',
    steps: [
      'Complete trip satisfaction survey',
      'Rate your travel insurance experience',
      'Share one improvement suggestion',
      'Submit feedback'
    ],
    engagementPoints: 15,
    difficulty: 'beginner',
    estimatedDuration: 0.5,
    protectionScoreBoost: 1,
  },

  // 🏠 HOME INSURANCE CHALLENGES
  {
    category: 'home',
    type: 'cross-product',
    name: 'Home Protector',
    description: 'Activate home insurance coverage and safeguard your most valuable asset',
    steps: [
      'Enter your home details and location',
      'Select coverage level (basic/comprehensive)',
      'Review policy terms',
      'Activate your home insurance'
    ],
    engagementPoints: 60,
    difficulty: 'beginner',
    estimatedDuration: 2,
    practicalReward: 'First month 20% off',
    protectionScoreBoost: 8,
    triggers: { missingProducts: ['home'] }
  },
  {
    category: 'home',
    type: 'awareness',
    name: 'Home Safety Checklist',
    description: 'Complete our fire safety quiz and learn how to protect your home',
    steps: [
      'Watch 2-minute home safety video',
      'Complete fire safety quiz',
      'Download home safety checklist',
      'Share one safety tip you learned'
    ],
    engagementPoints: 25,
    difficulty: 'beginner',
    estimatedDuration: 1,
    protectionScoreBoost: 2,
  },
  {
    category: 'home',
    type: 'safety-wellness',
    name: 'Maintenance Reminder Hero',
    description: 'Set up and confirm your home inspection schedule to prevent issues',
    steps: [
      'Schedule annual home inspection',
      'Review common maintenance issues',
      'Confirm inspection date',
      'Set reminder for next check'
    ],
    engagementPoints: 15,
    difficulty: 'beginner',
    estimatedDuration: 0.5,
    protectionScoreBoost: 2,
  },

  // 🌳 LIFE & FINANCIAL CHALLENGES
  {
    category: 'life',
    type: 'cross-product',
    name: 'Future Planner',
    description: 'Get a personalized life insurance quote and secure your family\'s future',
    steps: [
      'Enter basic family information',
      'Calculate recommended coverage amount',
      'Review life insurance options',
      'Save or request consultation'
    ],
    engagementPoints: 40,
    difficulty: 'intermediate',
    estimatedDuration: 2,
    protectionScoreBoost: 5,
    triggers: { missingProducts: ['life'] }
  },
  {
    category: 'life',
    type: 'awareness',
    name: 'Savings Starter',
    description: 'Set a financial protection goal and create your personalized savings plan',
    steps: [
      'Complete financial health assessment',
      'Set your protection goal amount',
      'Review recommended savings plans',
      'Activate goal tracker'
    ],
    engagementPoints: 30,
    difficulty: 'beginner',
    estimatedDuration: 1,
    protectionScoreBoost: 3,
  },
  {
    category: 'life',
    type: 'cross-product',
    name: 'Family Shield',
    description: 'Add a dependent to your policy and extend protection to your loved ones',
    steps: [
      'Review dependent coverage options',
      'Enter dependent information',
      'Select coverage level',
      'Confirm and activate'
    ],
    engagementPoints: 50,
    difficulty: 'intermediate',
    estimatedDuration: 1,
    practicalReward: '15% family discount',
    protectionScoreBoost: 8,
  },

  // 📱 ENGAGEMENT CHALLENGES (Universal)
  {
    category: 'motor', // Can be applied to any
    type: 'engagement',
    name: 'Streak Master',
    description: 'Log in to the QIC app for 3 consecutive days and build your engagement streak',
    steps: [
      'Open the app and check your dashboard',
      'Review your protection score',
      'Complete at least one action per day',
      'Maintain 3-day streak'
    ],
    engagementPoints: 15,
    difficulty: 'beginner',
    estimatedDuration: 0.25,
    protectionScoreBoost: 2,
    triggers: { inactiveDays: 7 }
  },
  {
    category: 'motor',
    type: 'engagement',
    name: 'Re-Entry Bonus',
    description: 'Welcome back! Claim your returning user bonus just for logging in',
    steps: [
      'Open the QIC app',
      'Review what\'s new since your last visit',
      'Claim your 10 welcome-back points'
    ],
    engagementPoints: 10,
    difficulty: 'beginner',
    estimatedDuration: 0.1,
    protectionScoreBoost: 1,
    triggers: { userStage: 'inactive', inactiveDays: 30 }
  },
];

/**
 * Get recommended challenges for a user based on their context
 */
export function getRecommendedChallenges(userContext: {
  stage: 'new' | 'active' | 'loyal' | 'inactive';
  activePolicies: string[];
  daysToRenewal?: number;
  inactiveDays?: number;
  focusAreas?: string[];
  level?: number;
}): ChallengeTemplate[] {
  const { stage, activePolicies, daysToRenewal, inactiveDays, focusAreas, level } = userContext;
  
  const recommended: ChallengeTemplate[] = [];

  // Filter challenges based on triggers
  for (const challenge of CHALLENGE_LIBRARY) {
    const triggers = challenge.triggers;
    
    // Check user stage match
    if (triggers?.userStage && triggers.userStage !== stage) continue;
    
    // Check renewal urgency
    if (triggers?.daysToRenewal && (!daysToRenewal || daysToRenewal > triggers.daysToRenewal)) continue;
    
    // Check missing products
    if (triggers?.missingProducts) {
      const hasMissingProduct = triggers.missingProducts.some(product => !activePolicies.includes(product));
      if (!hasMissingProduct) continue;
    }
    
    // Check inactivity
    if (triggers?.inactiveDays && (!inactiveDays || inactiveDays < triggers.inactiveDays)) continue;
    
    // Check difficulty vs level
    if (level && level < 3 && challenge.difficulty === 'advanced') continue;
    
    // Check focus areas
    if (focusAreas && focusAreas.length > 0) {
      if (!focusAreas.includes(challenge.category)) continue;
    }
    
    recommended.push(challenge);
  }

  return recommended;
}
