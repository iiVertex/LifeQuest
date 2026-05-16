CREATE TABLE "challenge_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"insurance_category" text NOT NULL,
	"difficulty" text NOT NULL,
	"engagement_points" integer NOT NULL,
	"estimated_duration" integer,
	"requirements" jsonb,
	"prerequisites" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "milestones" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text,
	"category" text NOT NULL,
	"engagement_points" integer DEFAULT 0,
	"conditions" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "skill_tree_nodes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"xp_cost" integer NOT NULL,
	"prerequisites" jsonb DEFAULT '[]'::jsonb,
	"unlocks" jsonb DEFAULT '[]'::jsonb,
	"position" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "smart_advisor_interactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"type" text NOT NULL,
	"message" text NOT NULL,
	"context" jsonb DEFAULT '{}'::jsonb,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "user_behavior_analytics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"challenge_preferences" jsonb DEFAULT '{"preferredCategories":{},"preferredDifficulties":{},"preferredTypes":{}}'::jsonb,
	"total_challenges_accepted" integer DEFAULT 0,
	"total_challenges_completed" integer DEFAULT 0,
	"total_challenges_abandoned" integer DEFAULT 0,
	"average_completion_time" real DEFAULT 0,
	"completion_rate" real DEFAULT 0,
	"total_sessions" integer DEFAULT 0,
	"total_time_spent" integer DEFAULT 0,
	"average_session_duration" real DEFAULT 0,
	"last_session_date" timestamp,
	"protection_score_history" jsonb DEFAULT '[]'::jsonb,
	"average_score_change" real DEFAULT 0,
	"total_rewards_redeemed" integer DEFAULT 0,
	"reward_redemption_frequency" real DEFAULT 0,
	"last_analyzed_at" timestamp,
	"ai_insights" jsonb DEFAULT '{}'::jsonb,
	"ai_simulations_count" integer DEFAULT 0,
	"ai_simulations_today" integer DEFAULT 0,
	"last_simulation_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE "user_challenges" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"template_id" varchar NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"progress" integer DEFAULT 0,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"engagement_points_earned" integer DEFAULT 0,
	"user_data" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "user_milestones" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"milestone_id" varchar NOT NULL,
	"earned_at" timestamp DEFAULT now(),
	"engagement_points_earned" integer DEFAULT 0
);

CREATE TABLE "user_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"start_time" timestamp DEFAULT now(),
	"end_time" timestamp,
	"duration" integer,
	"actions_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "user_skill_nodes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"node_id" varchar NOT NULL,
	"status" text DEFAULT 'locked' NOT NULL,
	"unlocked_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"name" text,
	"email" text,
	"avatar" text,
	"age" integer,
	"gender" text,
	"language" text DEFAULT 'en',
	"life_protection_score" integer DEFAULT 0,
	"streak" integer DEFAULT 0,
	"last_active_date" timestamp,
	"daily_challenges_completed" integer DEFAULT 0,
	"last_challenge_date" timestamp,
	"daily_protection_points" integer DEFAULT 0,
	"focus_areas" jsonb DEFAULT '[]'::jsonb,
	"advisor_tone" text,
	"referral_code" text,
	"referred_by" text,
	"referral_count" integer DEFAULT 0,
	"preferences" jsonb DEFAULT '{"theme":"light","notifications":true}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_referral_code_unique" UNIQUE("referral_code")
);

ALTER TABLE "smart_advisor_interactions" ADD CONSTRAINT "smart_advisor_interactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "user_behavior_analytics" ADD CONSTRAINT "user_behavior_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "user_challenges" ADD CONSTRAINT "user_challenges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "user_challenges" ADD CONSTRAINT "user_challenges_template_id_challenge_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."challenge_templates"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "user_milestones" ADD CONSTRAINT "user_milestones_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "user_milestones" ADD CONSTRAINT "user_milestones_milestone_id_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."milestones"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "user_skill_nodes" ADD CONSTRAINT "user_skill_nodes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "user_skill_nodes" ADD CONSTRAINT "user_skill_nodes_node_id_skill_tree_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."skill_tree_nodes"("id") ON DELETE no action ON UPDATE no action;