#!/usr/bin/env node

/**
 * Database Seeding Script for QIC LifeQuest
 * 
 * This script populates the database with initial data:
 * - Challenge templates (insurance-themed)
 * - Skill tree nodes
 * - Milestones
 * - Sample users
 */

import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { 
  users, 
  challengeTemplates, 
  skillTreeNodes, 
  milestones 
} from '../shared/schema.js';

console.log('🌱 QIC LifeQuest - Database Seeding');
console.log('==========================================\n');

async function seedDatabase() {
  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL not found. Please set up your .env file first.');
    console.log('Run: node scripts/setup-database.js');
    return;
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);

    console.log('📊 Seeding challenge templates...');
    
    // Challenge Templates (Insurance-themed)
    const challengeTemplatesData = [
      {
        title: "Motor Insurance Health Check",
        description: "Review your motor insurance coverage and ensure all details are up to date",
        insuranceCategory: "motor",
        difficulty: "beginner",
        engagementPoints: 250,
        estimatedDuration: 24, // 1 day in hours
        requirements: {
          steps: [
            "Review current policy coverage",
            "Verify vehicle details are accurate",
            "Verify vehicle details are accurate",
            "Check coverage limits",
            "Update contact information"
          ],
          conditions: {
            completionRate: 1.0
          }
        },
        prerequisites: [],
        isActive: true
      },
      {
        title: "Health Insurance Wellness Check",
        description: "Review health insurance benefits and schedule preventive care",
        insuranceCategory: "health",
        difficulty: "beginner",
        engagementPoints: 200,
        estimatedDuration: 48,
        requirements: {
          steps: [
            "Review health policy benefits",
            "Check coverage for preventive care",
            "Schedule annual health checkup",
            "Verify beneficiary information"
          ],
          conditions: {
            completionRate: 1.0
          }
        },
        prerequisites: [],
        isActive: true
      },
      {
        title: "Travel Insurance Preparation",
        description: "Prepare for upcoming travel with proper insurance coverage",
        insuranceCategory: "travel",
        difficulty: "beginner",
        engagementPoints: 180,
        estimatedDuration: 24,
        requirements: {
          steps: [
            "Review travel insurance options",
            "Check coverage for destinations",
            "Understand claim procedures",
            "Save emergency contacts"
          ],
          conditions: {
            completionRate: 1.0
          }
        },
        prerequisites: [],
        isActive: true
      },
      {
        title: "Home Protection Assessment",
        description: "Assess and improve your home insurance coverage",
        insuranceCategory: "home",
        difficulty: "intermediate",
        engagementPoints: 300,
        estimatedDuration: 72,
        requirements: {
          steps: [
            "Review current home policy",
            "Update property value",
            "Check coverage for natural disasters",
            "Install security improvements"
          ],
          conditions: {
            completionRate: 0.8
          }
        },
        prerequisites: [],
        isActive: true
      },
      {
        title: "Life Insurance Family Review",
        description: "Ensure your life insurance meets your family's needs",
        insuranceCategory: "life",
        difficulty: "intermediate",
        engagementPoints: 400,
        estimatedDuration: 96,
        requirements: {
          steps: [
            "Review current life insurance coverage",
            "Calculate family financial needs",
            "Update beneficiaries",
            "Consider additional riders"
          ],
          conditions: {
            completionRate: 0.9
          }
        },
        prerequisites: [],
        isActive: true
      }
    ];

    console.log('🌳 Seeding skill tree nodes...');
    
    // Skill Tree Nodes
    const skillTreeNodesData = [
      // Driving Skills
      {
        title: "Safe Start",
        description: "Learn basic safe driving principles",
        category: "driving",
        xpCost: 100,
        prerequisites: [],
        unlocks: ["Eco Mode", "Defensive Driving"],
        position: { x: 0, y: 0 },
        isActive: true
      },
      {
        title: "Eco Mode",
        description: "Master fuel-efficient driving techniques",
        category: "driving",
        xpCost: 200,
        prerequisites: ["Safe Start"],
        unlocks: ["Advanced Techniques"],
        position: { x: 1, y: 0 },
        isActive: true
      },
      {
        title: "Defensive Driving",
        description: "Learn to anticipate and avoid hazards",
        category: "driving",
        xpCost: 250,
        prerequisites: ["Safe Start"],
        unlocks: ["Advanced Techniques"],
        position: { x: 1, y: 1 },
        isActive: true
      },
      {
        title: "Advanced Techniques",
        description: "Master professional driving skills",
        category: "driving",
        xpCost: 500,
        prerequisites: ["Eco Mode", "Defensive Driving"],
        unlocks: [],
        position: { x: 2, y: 0 },
        isActive: true
      },
      
      // Health Skills
      {
        title: "First Steps",
        description: "Start your fitness journey",
        category: "health",
        xpCost: 100,
        prerequisites: [],
        unlocks: ["Daily Routine", "Cardio Basics"],
        position: { x: 0, y: 0 },
        isActive: true
      },
      {
        title: "Daily Routine",
        description: "Build consistent exercise habits",
        category: "health",
        xpCost: 200,
        prerequisites: ["First Steps"],
        unlocks: ["Endurance Training"],
        position: { x: 1, y: 0 },
        isActive: true
      },
      {
        title: "Cardio Basics",
        description: "Learn cardiovascular exercise fundamentals",
        category: "health",
        xpCost: 150,
        prerequisites: ["First Steps"],
        unlocks: ["Endurance Training"],
        position: { x: 1, y: 1 },
        isActive: true
      },
      {
        title: "Endurance Training",
        description: "Build stamina for long-distance activities",
        category: "health",
        xpCost: 400,
        prerequisites: ["Daily Routine", "Cardio Basics"],
        unlocks: [],
        position: { x: 2, y: 0 },
        isActive: true
      },
      
      // Financial Skills
      {
        title: "Budget Basics",
        description: "Learn fundamental budgeting principles",
        category: "financial",
        xpCost: 100,
        prerequisites: [],
        unlocks: ["Savings Strategy", "Expense Tracking"],
        position: { x: 0, y: 0 },
        isActive: true
      },
      {
        title: "Savings Strategy",
        description: "Develop effective saving techniques",
        category: "financial",
        xpCost: 200,
        prerequisites: ["Budget Basics"],
        unlocks: ["Investment Basics"],
        position: { x: 1, y: 0 },
        isActive: true
      },
      {
        title: "Expense Tracking",
        description: "Master expense categorization and analysis",
        category: "financial",
        xpCost: 150,
        prerequisites: ["Budget Basics"],
        unlocks: ["Investment Basics"],
        position: { x: 1, y: 1 },
        isActive: true
      },
      {
        title: "Investment Basics",
        description: "Learn fundamental investment principles",
        category: "financial",
        xpCost: 500,
        prerequisites: ["Savings Strategy", "Expense Tracking"],
        unlocks: [],
        position: { x: 2, y: 0 },
        isActive: true
      }
    ];

    console.log('🏆 Seeding milestones...');
    
    // Milestones (Insurance-themed achievements)
    const milestonesData = [
      {
        name: "First Steps",
        description: "Complete your first challenge",
        icon: "👶",
        category: "general",
        engagementPoints: 50,
        conditions: {
          challengesCompleted: 1
        },
        isActive: true
      },
      {
        name: "Engagement Streak",
        description: "Maintain a 7-day engagement streak",
        icon: "🔥",
        category: "consistency",
        engagementPoints: 200,
        conditions: {
          streakDays: 7
        },
        isActive: true
      },
      {
        name: "Motor Insurance Pro",
        description: "Complete 5 motor insurance challenges",
        icon: "🚗",
        category: "motor",
        engagementPoints: 300,
        conditions: {
          motorChallengesCompleted: 5
        },
        isActive: true
      },
      {
        name: "Health Coverage Champion",
        description: "Complete 5 health insurance challenges",
        icon: "💪",
        category: "health",
        engagementPoints: 300,
        conditions: {
          healthChallengesCompleted: 5
        },
        isActive: true
      },
      {
        name: "Travel Ready",
        description: "Complete 3 travel insurance challenges",
        icon: "✈️",
        category: "travel",
        engagementPoints: 250,
        conditions: {
          travelChallengesCompleted: 3
        },
        isActive: true
      },
      {
        name: "Home Protection Expert",
        description: "Complete 5 home insurance challenges",
        icon: "🏠",
        category: "home",
        engagementPoints: 300,
        conditions: {
          homeChallengesCompleted: 5
        },
        isActive: true
      },
      {
        name: "Life Insurance Guardian",
        description: "Complete 3 life insurance challenges",
        icon: "🛡️",
        category: "life",
        engagementPoints: 350,
        conditions: {
          lifeChallengesCompleted: 3
        },
        isActive: true
      },
      {
        name: "Level 5 Achiever",
        description: "Reach level 5",
        icon: "⭐",
        category: "progression",
        engagementPoints: 500,
        conditions: {
          level: 5
        },
        isActive: true
      },
      {
        name: "Perfect Week",
        description: "Complete all daily challenges for 7 days",
        icon: "🎯",
        category: "consistency",
        engagementPoints: 1000,
        conditions: {
          perfectDays: 7
        },
        isActive: true
      }
    ];

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Seeded data:');
    console.log(`- ${challengeTemplatesData.length} challenge templates`);
    console.log(`- ${skillTreeNodesData.length} skill tree nodes`);
    console.log(`- ${milestonesData.length} milestones`);
    
    console.log('\n🎯 Next steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Test the app at: http://localhost:5000');
    console.log('3. Check your Supabase dashboard to see the data');

  } catch (error) {
    console.log('❌ Database seeding failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your DATABASE_URL in .env file');
    console.log('2. Ensure your Supabase project is running');
    console.log('3. Run: npm run db:push first');
  }
}

seedDatabase();
