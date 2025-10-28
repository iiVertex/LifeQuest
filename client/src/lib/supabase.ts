import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rkztknkbwfbwmpoqahjh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrenRrbmtid2Zid21wb3FhaGpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzOTg4MDQsImV4cCI6MjA3Njk3NDgwNH0.CdgHIYqNg3CKpoX5ypPd8Riz4NL0U27nPqxxuO4u8qA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
