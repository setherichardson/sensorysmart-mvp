-- Apply the activities table schema and insert activity library
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

-- Clear existing activities (for testing)
DELETE FROM activities WHERE id != '00000000-0000-0000-0000-000000000000';

-- Insert activity library
INSERT INTO activities (
    title, description, context, duration_minutes, difficulty, activity_type,
    sensory_systems, behavior_fit, benefits, when_to_use, materials_needed,
    steps, age_range, environment
) VALUES
-- TACTILE ACTIVITIES
(
    'Sensory Bin Exploration',
    'Explore different textures in a contained bin',
    'Quiet time, sensory break',
    15,
    'beginner',
    'tactile',
    ARRAY['tactile'],
    'seeking',
    ARRAY['Improves tactile processing', 'Calming effect', 'Fine motor development'],
    'When child needs calming input or is seeking tactile stimulation',
    ARRAY['Plastic bin', 'Rice/beans/sand', 'Small toys', 'Measuring cups'],
    '[
        {"step_number": 1, "title": "Set up bin", "description": "Fill a plastic bin with rice, beans, or sand", "duration_seconds": 60},
        {"step_number": 2, "title": "Add toys", "description": "Hide small toys in the material", "duration_seconds": 30},
        {"step_number": 3, "title": "Explore", "description": "Let child dig, pour, and explore", "duration_seconds": 840}
    ]'::jsonb,
    '3-8',
    'indoor'
),
(
    'Finger Painting',
    'Create art using fingers and paint',
    'Creative time, sensory play',
    20,
    'beginner',
    'tactile',
    ARRAY['tactile', 'visual'],
    'seeking',
    ARRAY['Tactile exploration', 'Creative expression', 'Hand-eye coordination'],
    'When child enjoys messy play and tactile input',
    ARRAY['Washable paint', 'Paper', 'Plastic tablecloth'],
    '[
        {"step_number": 1, "title": "Prepare space", "description": "Cover table with plastic", "duration_seconds": 60},
        {"step_number": 2, "title": "Set out paint", "description": "Pour paint onto paper", "duration_seconds": 30},
        {"step_number": 3, "title": "Paint", "description": "Use fingers to create art", "duration_seconds": 1110}
    ]'::jsonb,
    '3-6',
    'indoor'
),
(
    'Play Dough Creation',
    'Mold and shape play dough',
    'Fine motor time, creative play',
    15,
    'beginner',
    'tactile',
    ARRAY['tactile', 'proprioceptive'],
    'seeking',
    ARRAY['Hand strength', 'Tactile processing', 'Creativity'],
    'When child needs calming tactile input',
    ARRAY['Play dough', 'Rolling pin', 'Cookie cutters'],
    '[
        {"step_number": 1, "title": "Warm up", "description": "Knead the play dough", "duration_seconds": 120},
        {"step_number": 2, "title": "Roll", "description": "Roll into different shapes", "duration_seconds": 300},
        {"step_number": 3, "title": "Cut shapes", "description": "Use cookie cutters", "duration_seconds": 480}
    ]'::jsonb,
    '3-8',
    'indoor'
),
(
    'Texture Walk',
    'Walk barefoot on different textures',
    'Outdoor time, sensory exploration',
    10,
    'beginner',
    'tactile',
    ARRAY['tactile', 'proprioceptive'],
    'seeking',
    ARRAY['Foot tactile awareness', 'Balance', 'Sensory integration'],
    'When child seeks tactile input through feet',
    ARRAY['Grass', 'Sand', 'Smooth stones', 'Carpet'],
    '[
        {"step_number": 1, "title": "Remove shoes", "description": "Take off shoes and socks", "duration_seconds": 30},
        {"step_number": 2, "title": "Walk on grass", "description": "Step on grass first", "duration_seconds": 120},
        {"step_number": 3, "title": "Explore textures", "description": "Walk on different surfaces", "duration_seconds": 450}
    ]'::jsonb,
    '3-10',
    'outdoor'
),
(
    'Massage Time',
    'Gentle massage with lotion',
    'Calming time, before bed',
    5,
    'beginner',
    'tactile',
    ARRAY['tactile'],
    'avoiding',
    ARRAY['Calming', 'Body awareness', 'Bonding'],
    'When child is overstimulated or avoiding touch',
    ARRAY['Lotion', 'Quiet space'],
    '[
        {"step_number": 1, "title": "Prepare", "description": "Warm lotion in hands", "duration_seconds": 30},
        {"step_number": 2, "title": "Start with hands", "description": "Gentle hand massage", "duration_seconds": 120},
        {"step_number": 3, "title": "Continue to arms", "description": "Gentle arm massage", "duration_seconds": 150}
    ]'::jsonb,
    '3-12',
    'indoor'
),

-- PROPRIOCEPTIVE ACTIVITIES
(
    'Wall Push-ups',
    'Push against a wall to provide deep pressure',
    'Before transitions, calming',
    3,
    'beginner',
    'proprioceptive',
    ARRAY['proprioceptive'],
    'seeking',
    ARRAY['Deep pressure input', 'Calming', 'Body awareness'],
    'When child needs calming or seeking proprioceptive input',
    ARRAY['Wall'],
    '[
        {"step_number": 1, "title": "Stand facing wall", "description": "Stand 2 feet from wall", "duration_seconds": 10},
        {"step_number": 2, "title": "Place hands", "description": "Place hands on wall at shoulder height", "duration_seconds": 10},
        {"step_number": 3, "title": "Push", "description": "Push against wall for 10 seconds", "duration_seconds": 10},
        {"step_number": 4, "title": "Rest", "description": "Rest for 5 seconds", "duration_seconds": 5},
        {"step_number": 5, "title": "Repeat", "description": "Repeat 5-10 times", "duration_seconds": 145}
    ]'::jsonb,
    '4-12',
    'indoor'
),
(
    'Heavy Work Carrying',
    'Carry heavy objects to provide proprioceptive input',
    'Chores, transitions',
    10,
    'beginner',
    'proprioceptive',
    ARRAY['proprioceptive'],
    'seeking',
    ARRAY['Heavy work input', 'Strength building', 'Calming'],
    'When child is seeking proprioceptive input or needs calming',
    ARRAY['Books', 'Laundry basket', 'Groceries'],
    '[
        {"step_number": 1, "title": "Choose object", "description": "Select heavy but safe object", "duration_seconds": 30},
        {"step_number": 2, "title": "Lift properly", "description": "Bend knees and lift", "duration_seconds": 30},
        {"step_number": 3, "title": "Carry", "description": "Walk with object to destination", "duration_seconds": 540}
    ]'::jsonb,
    '4-12',
    'both'
),
(
    'Jumping Jacks',
    'Classic jumping exercise',
    'Exercise time, energy release',
    5,
    'intermediate',
    'proprioceptive',
    ARRAY['proprioceptive', 'vestibular'],
    'seeking',
    ARRAY['Cardiovascular exercise', 'Coordination', 'Energy release'],
    'When child has excess energy or needs proprioceptive input',
    ARRAY['Open space'],
    '[
        {"step_number": 1, "title": "Stand ready", "description": "Stand with feet together, arms down", "duration_seconds": 10},
        {"step_number": 2, "title": "Jump and spread", "description": "Jump, spread legs, raise arms", "duration_seconds": 2},
        {"step_number": 3, "title": "Jump back", "description": "Jump back to starting position", "duration_seconds": 2},
        {"step_number": 4, "title": "Repeat", "description": "Continue for 5 minutes", "duration_seconds": 286}
    ]'::jsonb,
    '5-12',
    'both'
),
(
    'Animal Walks',
    'Walk like different animals',
    'Exercise time, fun movement',
    8,
    'beginner',
    'proprioceptive',
    ARRAY['proprioceptive', 'vestibular'],
    'seeking',
    ARRAY['Coordination', 'Strength', 'Imagination'],
    'When child needs movement or proprioceptive input',
    ARRAY['Open space'],
    '[
        {"step_number": 1, "title": "Bear walk", "description": "Walk on hands and feet", "duration_seconds": 120},
        {"step_number": 2, "title": "Crab walk", "description": "Walk on hands and feet, belly up", "duration_seconds": 120},
        {"step_number": 3, "title": "Frog jump", "description": "Squat and jump", "duration_seconds": 120},
        {"step_number": 4, "title": "Snake slither", "description": "Lie on belly and wiggle", "duration_seconds": 120}
    ]'::jsonb,
    '3-8',
    'both'
),

-- VESTIBULAR ACTIVITIES
(
    'Swinging',
    'Gentle swinging motion',
    'Calming time, sensory input',
    10,
    'beginner',
    'vestibular',
    ARRAY['vestibular'],
    'seeking',
    ARRAY['Vestibular input', 'Calming', 'Balance'],
    'When child seeks vestibular input',
    ARRAY['Swing', 'Open space'],
    '[
        {"step_number": 1, "title": "Sit on swing", "description": "Sit comfortably on swing", "duration_seconds": 30},
        {"step_number": 2, "title": "Start gentle", "description": "Begin with gentle swinging", "duration_seconds": 120},
        {"step_number": 3, "title": "Continue", "description": "Continue for 10 minutes", "duration_seconds": 450}
    ]'::jsonb,
    '3-10',
    'outdoor'
),
(
    'Spinning',
    'Controlled spinning in circles',
    'Energy release, vestibular input',
    5,
    'intermediate',
    'vestibular',
    ARRAY['vestibular'],
    'seeking',
    ARRAY['Vestibular input', 'Energy release', 'Balance'],
    'When child seeks vestibular input',
    ARRAY['Open space'],
    '[
        {"step_number": 1, "title": "Stand in open space", "description": "Find safe open area", "duration_seconds": 10},
        {"step_number": 2, "title": "Start spinning", "description": "Spin slowly in circles", "duration_seconds": 60},
        {"step_number": 3, "title": "Stop and rest", "description": "Stop and let dizziness pass", "duration_seconds": 30},
        {"step_number": 4, "title": "Repeat", "description": "Repeat 3-5 times", "duration_seconds": 200}
    ]'::jsonb,
    '4-10',
    'both'
),

-- AUDITORY ACTIVITIES
(
    'Sound Scavenger Hunt',
    'Listen for different sounds in environment',
    'Focus time, auditory processing',
    10,
    'beginner',
    'auditory',
    ARRAY['auditory'],
    'seeking',
    ARRAY['Auditory awareness', 'Focus', 'Listening skills'],
    'When child seeks auditory input',
    ARRAY['Quiet environment'],
    '[
        {"step_number": 1, "title": "Close eyes", "description": "Sit quietly with eyes closed", "duration_seconds": 30},
        {"step_number": 2, "title": "Listen", "description": "Listen for different sounds", "duration_seconds": 60},
        {"step_number": 3, "title": "Identify", "description": "Name the sounds you hear", "duration_seconds": 30},
        {"step_number": 4, "title": "Continue", "description": "Repeat for 10 minutes", "duration_seconds": 540}
    ]'::jsonb,
    '4-10',
    'both'
),

-- VISUAL ACTIVITIES
(
    'Visual Tracking',
    'Follow moving objects with eyes',
    'Focus time, visual processing',
    5,
    'beginner',
    'visual',
    ARRAY['visual'],
    'seeking',
    ARRAY['Eye tracking', 'Focus', 'Visual processing'],
    'When child seeks visual input or needs focus',
    ARRAY['Moving object', 'Finger'],
    '[
        {"step_number": 1, "title": "Hold object", "description": "Hold small object in hand", "duration_seconds": 10},
        {"step_number": 2, "title": "Move slowly", "description": "Move object slowly in different directions", "duration_seconds": 60},
        {"step_number": 3, "title": "Follow with eyes", "description": "Follow object with eyes only", "duration_seconds": 240}
    ]'::jsonb,
    '3-8',
    'both'
),
(
    'I Spy',
    'Find objects based on visual clues',
    'Visual processing, focus',
    8,
    'beginner',
    'visual',
    ARRAY['visual'],
    'seeking',
    ARRAY['Visual scanning', 'Focus', 'Language'],
    'When child seeks visual input or needs focus',
    ARRAY['Environment with objects'],
    '[
        {"step_number": 1, "title": "Choose object", "description": "Pick an object in the room", "duration_seconds": 30},
        {"step_number": 2, "title": "Give clue", "description": "Say "I spy something red"', "duration_seconds": 10},
        {"step_number": 3, "title": "Let child guess", "description": "Child looks for object", "duration_seconds": 60},
        {"step_number": 4, "title": "Continue", "description": "Take turns for 8 minutes", "duration_seconds": 390}
    ]'::jsonb,
    '3-8',
    'both'
),

-- OLFACTORY ACTIVITIES
(
    'Scent Exploration',
    'Explore different smells safely',
    'Sensory exploration, calming',
    6,
    'beginner',
    'olfactory',
    ARRAY['olfactory'],
    'seeking',
    ARRAY['Olfactory awareness', 'Calming', 'Sensory exploration'],
    'When child seeks olfactory input',
    ARRAY['Safe scents', 'Cotton balls'],
    '[
        {"step_number": 1, "title": "Prepare scents", "description": "Put drops of scent on cotton balls", "duration_seconds": 60},
        {"step_number": 2, "title": "Smell one", "description": "Smell one scent at a time", "duration_seconds": 30},
        {"step_number": 3, "title": "Describe", "description": "Describe what you smell", "duration_seconds": 30},
        {"step_number": 4, "title": "Continue", "description": "Try different scents", "duration_seconds": 240}
    ]'::jsonb,
    '3-8',
    'indoor'
),

-- INTEROCEPTION ACTIVITIES
(
    'Body Scan',
    'Notice how different parts of body feel',
    'Calming time, body awareness',
    5,
    'intermediate',
    'interoception',
    ARRAY['interoception'],
    'low-registration',
    ARRAY['Body awareness', 'Calming', 'Self-regulation'],
    'When child has low body awareness',
    ARRAY['Quiet space'],
    '[
        {"step_number": 1, "title": "Lie down", "description": "Lie comfortably on back", "duration_seconds": 30},
        {"step_number": 2, "title": "Focus on feet", "description": "Notice how feet feel", "duration_seconds": 30},
        {"step_number": 3, "title": "Move up body", "description": "Focus on each body part", "duration_seconds": 240}
    ]'::jsonb,
    '5-12',
    'indoor'
),

-- HEAVY WORK ACTIVITIES
(
    'Chair Push-ups',
    'Push up from chair to provide heavy work',
    'During seated activities, transitions',
    2,
    'beginner',
    'heavy-work',
    ARRAY['proprioceptive'],
    'seeking',
    ARRAY['Heavy work input', 'Calming', 'Strength'],
    'When child needs calming during seated activities',
    ARRAY['Chair'],
    '[
        {"step_number": 1, "title": "Sit in chair", "description": "Sit with hands on armrests", "duration_seconds": 10},
        {"step_number": 2, "title": "Push up", "description": "Push up from chair", "duration_seconds": 5},
        {"step_number": 3, "title": "Hold", "description": "Hold position for 5 seconds", "duration_seconds": 5},
        {"step_number": 4, "title": "Lower", "description": "Lower back down", "duration_seconds": 5},
        {"step_number": 5, "title": "Repeat", "description": "Repeat 10 times", "duration_seconds": 135}
    ]'::jsonb,
    '4-12',
    'indoor'
),

-- CALMING ACTIVITIES
(
    'Deep Breathing',
    'Practice deep breathing for calming',
    'Calming time, transitions',
    3,
    'beginner',
    'calming',
    ARRAY['interoception'],
    'avoiding',
    ARRAY['Calming', 'Self-regulation', 'Focus'],
    'When child is anxious or overstimulated',
    ARRAY['Quiet space'],
    '[
        {"step_number": 1, "title": "Sit comfortably", "description": "Sit with back straight", "duration_seconds": 10},
        {"step_number": 2, "title": "Breathe in", "description": "Take slow deep breath", "duration_seconds": 4},
        {"step_number": 3, "title": "Hold", "description": "Hold breath for 4 seconds", "duration_seconds": 4},
        {"step_number": 4, "title": "Breathe out", "description": "Slowly breathe out", "duration_seconds": 6},
        {"step_number": 5, "title": "Repeat", "description": "Continue for 3 minutes", "duration_seconds": 156}
    ]'::jsonb,
    '4-12',
    'both'
);

-- Show results
SELECT 
    activity_type,
    COUNT(*) as count,
    STRING_AGG(title, ', ') as activities
FROM activities 
GROUP BY activity_type 
ORDER BY count DESC; 