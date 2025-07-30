-- Sensorysmart Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  child_name VARCHAR(100) NOT NULL,
  child_age VARCHAR(20) NOT NULL,
  subscription_status VARCHAR(20) DEFAULT inactive CHECK (subscription_status IN ('active', 'inactive', 'canceled', 't_due')),
  stripe_customer_id VARCHAR(255),
  subscription_id VARCHAR(255),
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assessments table
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    responses JSONB NOT NULL, -- Store question responses as {"1": 3, "2": 5, ...}
    results JSONB NOT NULL, -- Store calculated results
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity_completions table
CREATE TABLE IF NOT EXISTS activity_completions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    activity_name TEXT NOT NULL,
    activity_type TEXT CHECK (activity_type IN ('proprioceptive', 'vestibular', 'tactile', 'heavy-work', 'calming', 'auditory', 'visual')) NOT NULL,
    rating TEXT CHECK (rating IN ('regulated', 'calmer', 'neutral', 'distracted', 'dysregulated', 'worked_well', 'didnt_work', 'okay')) NULL,
    duration_minutes INTEGER,
    notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    activity_id TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table (activity library)
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    context VARCHAR(255) NOT NULL, -- "Before school", "After lunch", etc.
    duration_minutes INTEGER NOT NULL,
    difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) NOT NULL,
    activity_type VARCHAR(50) CHECK (activity_type IN ('proprioceptive', 'vestibular', 'tactile', 'heavy-work', 'calming', 'auditory', 'visual', 'olfactory', 'interoception')) NOT NULL,
    sensory_systems TEXT[] NOT NULL, -- Array of sensory systems this targets
    behavior_fit VARCHAR(20) CHECK (behavior_fit IN ('seeking', 'avoiding', 'sensitive', 'low-registration', 'mixed')) NOT NULL,
    benefits TEXT[] NOT NULL, -- Array of benefits
    when_to_use TEXT NOT NULL,
    materials_needed TEXT[], -- Array of materials
    steps JSONB NOT NULL, -- Array of step-by-step instructions
    variations JSONB, -- Different variations for different ages/abilities
    age_range VARCHAR(50), -- "3-5", "6-8", "9-12", etc.
    environment VARCHAR(50), -- "indoor", "outdoor", "both"
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity_steps table for detailed step-by-step instructions
CREATE TABLE IF NOT EXISTS activity_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    duration_seconds INTEGER,
    image_url VARCHAR(500),
    audio_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_completed_at ON assessments(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_completions_user_id ON activity_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_completions_completed_at ON activity_completions(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_completions_activity_type ON activity_completions(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_completions_rating ON activity_completions(rating);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_difficulty ON activities(difficulty);
CREATE INDEX IF NOT EXISTS idx_activities_behavior_fit ON activities(behavior_fit);
CREATE INDEX IF NOT EXISTS idx_activities_sensory_systems ON activities USING GIN(sensory_systems);
CREATE INDEX IF NOT EXISTS idx_activities_age_range ON activities(age_range);
CREATE INDEX IF NOT EXISTS idx_activities_is_active ON activities(is_active);
CREATE INDEX IF NOT EXISTS idx_activity_steps_activity_id ON activity_steps(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_steps_step_number ON activity_steps(step_number);

-- Create updated_at trigger for profiles
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for assessments
CREATE POLICY "Users can view own assessments" ON assessments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments" ON assessments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assessments" ON assessments
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for activity_completions
CREATE POLICY "Users can view own activity completions" ON activity_completions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity completions" ON activity_completions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activity completions" ON activity_completions
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for chat_messages
CREATE POLICY "Users can view own chat messages" ON chat_messages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat messages" ON chat_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to automatically create profile after user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Profile will be created manually after signup with additional info
    -- This is just a placeholder for future automation if needed
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: Create trigger to handle new user signup
-- CREATE TRIGGER on_auth_user_created
--     AFTER INSERT ON auth.users
--     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security for activities
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_steps ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for activities (read-only for all authenticated users)
CREATE POLICY "Anyone can view active activities" ON activities
    FOR SELECT USING (is_active = true);

-- Create RLS policies for activity_steps
CREATE POLICY "Anyone can view activity steps" ON activity_steps
    FOR SELECT USING (true);

-- Create updated_at trigger for activities
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated; 