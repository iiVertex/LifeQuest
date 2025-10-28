# 🗄️ Database Setup Guide - Supabase

This guide will help you set up your Supabase database for the QIC LifeQuest retention layer.

## 🚀 Quick Start

### Step 1: Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)** and sign in
2. **Click "New Project"**
3. **Fill in project details:**
   - Name: `qic-lifequest`
   - Database Password: (generate a strong one and save it!)
   - Region: Choose closest to you
4. **Click "Create new project"** (takes 2-3 minutes)

### Step 2: Get Connection String

1. **Go to Settings → Database**
2. **Copy the "Connection string"** (URI format)
3. **It should look like:** `postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres`

### Step 3: Configure Environment

```bash
# Run the setup script
npm run db:setup
```

This will:
- Create a `.env` file if it doesn't exist
- Guide you through the configuration process

### Step 4: Update Your .env File

Open `.env` and replace the DATABASE_URL with your Supabase connection string:

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

### Step 5: Run Database Migrations

```bash
# Create all tables
npm run db:push
```

### Step 6: Seed Initial Data

```bash
# Populate with mission templates, skill trees, and achievements
npm run db:seed
```

### Step 7: Test the App

```bash
# Start the development server
npm run dev
```

Visit `http://localhost:5000` and test the app!

## 📊 What Gets Created

### Tables Created:
- `users` - User profiles and progress
- `mission_templates` - Available mission templates
- `user_missions` - User's active and completed missions
- `skill_tree_nodes` - Skill tree progression nodes
- `user_skill_nodes` - User's skill tree progress
- `achievements` - Available achievements
- `user_achievements` - User's earned achievements
- `ai_interactions` - AI companion messages
- `life_scores` - User's LifeScore tracking

### Initial Data Seeded:
- **5 Mission Templates** (driving, health, financial)
- **12 Skill Tree Nodes** (3 categories × 4 levels)
- **7 Achievements** (general, consistency, category-specific)
- **Sample user data** for testing

## 🔧 Troubleshooting

### Common Issues:

1. **"DATABASE_URL not found"**
   - Make sure your `.env` file exists and has the correct DATABASE_URL
   - Check that the connection string is complete

2. **"Connection failed"**
   - Verify your Supabase project is running
   - Check that the password is correct
   - Ensure the connection string format is right

3. **"Tables already exist"**
   - This is normal if you've run migrations before
   - The script will update existing tables

4. **"Permission denied"**
   - Make sure you're using the correct database password
   - Check that your Supabase project is active

### Getting Help:

1. **Check Supabase Dashboard** - Go to your project dashboard to see tables
2. **View Logs** - Check the terminal output for specific error messages
3. **Test Connection** - Try connecting with a database client like pgAdmin

## 🎯 Next Steps

Once your database is set up:

1. **Test the app** - Create a user and try missions
2. **Check Supabase Dashboard** - See your data in the Supabase interface
3. **Customize data** - Modify mission templates and achievements
4. **Add real AI integration** - Connect to OpenAI/Anthropic APIs

## 📚 Supabase Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Reference](https://www.postgresql.org/docs/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)

Happy coding! 🚀
