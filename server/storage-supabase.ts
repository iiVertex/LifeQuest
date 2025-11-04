import { createClient } from '@supabase/supabase-js';
import { randomUUID } from "crypto";
import type {
  User,
  InsertUser,
  UserChallenge,
  InsertUserChallenge,
  ChallengeTemplate,
  SkillTreeNode,
  UserSkillNode,
  Milestone,
  UserMilestone,
  SmartAdvisorInteraction,
  InsertSmartAdvisorInteraction,
} from "@shared/schema";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('🔗 Connecting to Supabase via REST API...');

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test connection
supabase.from('users').select('count').limit(1).then(
  ({ data, error }) => {
    if (error) {
      console.error("❌ Supabase API failed:", error.message);
    } else {
      console.log("✅ Supabase API connected successfully");
    }
  }
);

console.log("✅ Using Supabase REST API storage (bypassing PostgreSQL drivers)");

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Challenge operations
  getChallenges(): Promise<ChallengeTemplate[]>;
  createChallenge(challenge: Partial<ChallengeTemplate>): Promise<ChallengeTemplate>;
  getActiveChallenges(userId: string): Promise<UserChallenge[]>;
  getUserChallenges(userId: string): Promise<UserChallenge[]>;
  getUserChallenge(challengeId: string): Promise<UserChallenge | undefined>;
  createUserChallenge(userChallenge: InsertUserChallenge): Promise<UserChallenge>;
  updateChallengeProgress(challengeId: string, progress: number): Promise<UserChallenge | undefined>;
  completeChallenge(challengeId: string): Promise<UserChallenge | undefined>;
  
  // Skill Tree operations
  getSkillTreeNodes(): Promise<SkillTreeNode[]>;
  getUserSkillNodes(userId: string): Promise<UserSkillNode[]>;
  unlockSkillNode(userId: string, nodeId: string): Promise<UserSkillNode>;
  
  // Milestone operations
  getMilestones(category?: string): Promise<Milestone[]>;
  getUserMilestones(userId: string): Promise<UserMilestone[]>;
  checkAndAwardMilestones(userId: string): Promise<Milestone[]>;
  
  // Smart Advisor operations
  getSmartAdvisorInteractions(userId: string): Promise<SmartAdvisorInteraction[]>;
  createSmartAdvisorInteraction(interaction: InsertSmartAdvisorInteraction): Promise<SmartAdvisorInteraction>;
  markInteractionAsRead(interactionId: string): Promise<void>;
}

export class SupabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
    return data as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined; // Not found
      console.error('Error fetching user:', error);
      return undefined;
    }
    return data as User;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined; // Not found
      console.error('Error fetching user:', error);
      return undefined;
    }
    return data as User;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const userData = {
      id: randomUUID(),
      ...insertUser,
      level: 1,
      xp: 0,
      xp_to_next_level: 100,
      streak: 0,
      focus_areas: insertUser.focusAreas || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }
    return data as User;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const { data, error} = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
    return data as User;
  }

  async getChallenges(): Promise<ChallengeTemplate[]> {
    const { data, error } = await supabase
      .from('challenge_templates')
      .select('*');
    
    if (error) {
      console.error('Error fetching challenges:', error);
      return [];
    }
    return data as ChallengeTemplate[];
  }

  async createChallenge(challenge: Partial<ChallengeTemplate>): Promise<ChallengeTemplate> {
    const challengeData = {
      id: randomUUID(),
      ...challenge,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('challenge_templates')
      .insert(challengeData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating challenge:', error);
      throw new Error(`Failed to create challenge: ${error.message}`);
    }
    return data as ChallengeTemplate;
  }

  async getActiveChallenges(userId: string): Promise<UserChallenge[]> {
    const { data, error } = await supabase
      .from('user_challenges')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('started_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching active challenges:', error);
      return [];
    }
    return data as UserChallenge[];
  }

  async getUserChallenges(userId: string): Promise<UserChallenge[]> {
    const { data, error } = await supabase
      .from('user_challenges')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user challenges:', error);
      return [];
    }
    return data as UserChallenge[];
  }

  async getUserChallenge(challengeId: string): Promise<UserChallenge | undefined> {
    const { data, error } = await supabase
      .from('user_challenges')
      .select(`
        *,
        challenge_templates (
          title,
          description,
          difficulty,
          insurance_category,
          engagement_points,
          estimated_duration,
          requirements
        )
      `)
      .eq('id', challengeId)
      .single();
    
    if (error) {
      console.error('Error fetching user challenge:', error);
      return undefined;
    }
    return data as UserChallenge;
  }

  async createUserChallenge(userChallenge: InsertUserChallenge): Promise<UserChallenge> {
    const challengeData = {
      id: randomUUID(),
      ...userChallenge,
      progress: 0,
      status: 'active',
      started_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('user_challenges')
      .insert(challengeData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user challenge:', error);
      throw new Error(`Failed to create user challenge: ${error.message}`);
    }
    return data as UserChallenge;
  }

  async updateChallengeProgress(challengeId: string, progress: number): Promise<UserChallenge | undefined> {
    const { data, error } = await supabase
      .from('user_challenges')
      .update({ progress })
      .eq('id', challengeId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating challenge progress:', error);
      return undefined;
    }
    return data as UserChallenge;
  }

  async completeChallenge(challengeId: string): Promise<UserChallenge | undefined> {
    const { data, error } = await supabase
      .from('user_challenges')
      .update({
        status: 'completed',
        progress: 100,
        completed_at: new Date().toISOString(),
      })
      .eq('id', challengeId)
      .select()
      .single();
    
    if (error) {
      console.error('Error completing challenge:', error);
      return undefined;
    }
    return data as UserChallenge;
  }

  async getSkillTreeNodes(): Promise<SkillTreeNode[]> {
    const { data, error } = await supabase
      .from('skill_tree_nodes')
      .select('*')
      .order('tier');
    
    if (error) {
      console.error('Error fetching skill tree nodes:', error);
      return [];
    }
    return data as SkillTreeNode[];
  }

  async getUserSkillNodes(userId: string): Promise<UserSkillNode[]> {
    const { data, error } = await supabase
      .from('user_skill_nodes')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching user skill nodes:', error);
      return [];
    }
    return data as UserSkillNode[];
  }

  async unlockSkillNode(userId: string, nodeId: string): Promise<UserSkillNode> {
    const nodeData = {
      id: randomUUID(),
      user_id: userId,
      node_id: nodeId,
      unlocked_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('user_skill_nodes')
      .insert(nodeData)
      .select()
      .single();
    
    if (error) {
      console.error('Error unlocking skill node:', error);
      throw new Error(`Failed to unlock skill node: ${error.message}`);
    }
    return data as UserSkillNode;
  }

  async getMilestones(category?: string): Promise<Milestone[]> {
    let query = supabase.from('milestones').select('*');
    
    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching milestones:', error);
      return [];
    }
    return data as Milestone[];
  }

  async getUserMilestones(userId: string): Promise<UserMilestone[]> {
    const { data, error } = await supabase
      .from('user_milestones')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching user milestones:', error);
      return [];
    }
    return data as UserMilestone[];
  }

  async checkAndAwardMilestones(userId: string): Promise<Milestone[]> {
    // This would need business logic to check conditions
    // For now, return empty array
    return [];
  }

  async getSmartAdvisorInteractions(userId: string): Promise<SmartAdvisorInteraction[]> {
    const { data, error } = await supabase
      .from('smart_advisor_interactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching advisor interactions:', error);
      return [];
    }
    return data as SmartAdvisorInteraction[];
  }

  async createSmartAdvisorInteraction(interaction: InsertSmartAdvisorInteraction): Promise<SmartAdvisorInteraction> {
    const interactionData = {
      id: randomUUID(),
      ...interaction,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('smart_advisor_interactions')
      .insert(interactionData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating advisor interaction:', error);
      throw new Error(`Failed to create advisor interaction: ${error.message}`);
    }
    return data as SmartAdvisorInteraction;
  }

  async markInteractionAsRead(interactionId: string): Promise<void> {
    const { error } = await supabase
      .from('smart_advisor_interactions')
      .update({ is_read: true })
      .eq('id', interactionId);
    
    if (error) {
      console.error('Error marking interaction as read:', error);
    }
  }
}

export const storage = new SupabaseStorage();
