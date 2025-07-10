-- Apply the new activities table schema
-- Run this in your Supabase SQL Editor

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
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_difficulty ON activities(difficulty);
CREATE INDEX IF NOT EXISTS idx_activities_behavior_fit ON activities(behavior_fit);
CREATE INDEX IF NOT EXISTS idx_activities_sensory_systems ON activities USING GIN(sensory_systems);
CREATE INDEX IF NOT EXISTS idx_activities_age_range ON activities(age_range);
CREATE INDEX IF NOT EXISTS idx_activities_is_active ON activities(is_active);
CREATE INDEX IF NOT EXISTS idx_activity_steps_activity_id ON activity_steps(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_steps_step_number ON activity_steps(step_number);

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
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 