#!/usr/bin/env node

/**
 * Database Setup Script for QIC LifeQuest
 * 
 * This script helps you set up the Supabase database connection
 * and run the initial migrations.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🗄️  AI Lifestyle Companion - Database Setup');
console.log('==========================================\n');

// Check if .env file exists
const envPath = join(projectRoot, '.env');
const envExamplePath = join(projectRoot, 'config', 'database.example.env');

if (!existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  
  if (existsSync(envExamplePath)) {
    const exampleContent = readFileSync(envExamplePath, 'utf8');
    writeFileSync(envPath, exampleContent);
    console.log('✅ Created .env file from example');
  } else {
    // Create basic .env file
    const basicEnv = `# Supabase Configuration
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Server Configuration
PORT=5000
HOST=127.0.0.1
NODE_ENV=development
`;
    writeFileSync(envPath, basicEnv);
    console.log('✅ Created basic .env file');
  }
  
  console.log('\n🔧 Next Steps:');
  console.log('1. Get your Supabase connection string from: https://supabase.com/dashboard');
  console.log('2. Go to Settings → Database → Connection string');
  console.log('3. Copy the URI and replace the DATABASE_URL in .env file');
  console.log('4. Run: npm run db:push');
  console.log('\n📋 Your connection string should look like:');
  console.log('postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres');
  
} else {
  console.log('✅ .env file already exists');
  
  // Check if DATABASE_URL is set
  const envContent = readFileSync(envPath, 'utf8');
  if (envContent.includes('[YOUR-PASSWORD]') || envContent.includes('[YOUR-PROJECT-REF]')) {
    console.log('\n⚠️  DATABASE_URL needs to be configured:');
    console.log('1. Get your Supabase connection string from: https://supabase.com/dashboard');
    console.log('2. Update the DATABASE_URL in .env file');
    console.log('3. Run: npm run db:push');
  } else {
    console.log('✅ DATABASE_URL appears to be configured');
    console.log('\n🚀 Running database migrations...');
    
    try {
      execSync('npm run db:push', { stdio: 'inherit', cwd: projectRoot });
      console.log('\n✅ Database setup complete!');
      console.log('\n🎯 Next steps:');
      console.log('1. Run: npm run dev');
      console.log('2. Test the app at: http://localhost:5000');
      console.log('3. Check your Supabase dashboard to see the tables');
    } catch (error) {
      console.log('\n❌ Database migration failed. Please check your DATABASE_URL');
      console.log('Error:', error.message);
    }
  }
}

console.log('\n📚 Supabase Setup Guide:');
console.log('1. Go to https://supabase.com/dashboard');
console.log('2. Create a new project');
console.log('3. Go to Settings → Database');
console.log('4. Copy the connection string');
console.log('5. Update your .env file');
console.log('6. Run: npm run db:push');
