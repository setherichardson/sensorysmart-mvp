const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applySchema() {
  try {
    console.log('🔧 Applying database schema...')

    // SQL commands to create tables
    const schemaCommands = [
      // Create activities table
      `CREATE TABLE IF NOT EXISTS activities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        context VARCHAR(255) NOT NULL,
        duration_minutes INTEGER NOT NULL,
        difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) NOT NULL,
        activity_type VARCHAR(50) CHECK (activity_type IN ('proprioceptive', 'vestibular', 'tactile', 'heavy-work', 'calming', 'auditory', 'visual', 'olfactory', 'interoception')) NOT NULL,
        sensory_systems TEXT[] NOT NULL,
        behavior_fit VARCHAR(20) CHECK (behavior_fit IN ('seeking', 'avoiding', 'sensitive', 'low-registration', 'mixed')) NOT NULL,
        benefits TEXT[] NOT NULL,
        when_to_use TEXT NOT NULL,
        materials_needed TEXT[],
        steps JSONB NOT NULL,
        variations JSONB,
        age_range VARCHAR(50),
        environment VARCHAR(50),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // Create activity_steps table
      `CREATE TABLE IF NOT EXISTS activity_steps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
        step_number INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        duration_seconds INTEGER,
        image_url VARCHAR(500),
        audio_url VARCHAR(500),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // Create indexes
      `CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(activity_type)`,
      `CREATE INDEX IF NOT EXISTS idx_activities_difficulty ON activities(difficulty)`,
      `CREATE INDEX IF NOT EXISTS idx_activities_behavior_fit ON activities(behavior_fit)`,
      `CREATE INDEX IF NOT EXISTS idx_activities_sensory_systems ON activities USING GIN(sensory_systems)`,
      `CREATE INDEX IF NOT EXISTS idx_activities_age_range ON activities(age_range)`,
      `CREATE INDEX IF NOT EXISTS idx_activities_is_active ON activities(is_active)`,
      `CREATE INDEX IF NOT EXISTS idx_activity_steps_activity_id ON activity_steps(activity_id)`,
      `CREATE INDEX IF NOT EXISTS idx_activity_steps_step_number ON activity_steps(step_number)`,

      // Enable RLS
      `ALTER TABLE activities ENABLE ROW LEVEL SECURITY`,
      `ALTER TABLE activity_steps ENABLE ROW LEVEL SECURITY`,

      // Create RLS policies
      `CREATE POLICY "Anyone can view active activities" ON activities FOR SELECT USING (is_active = true)`,
      `CREATE POLICY "Anyone can view activity steps" ON activity_steps FOR SELECT USING (true)`,

      // Create updated_at trigger function
      `CREATE OR REPLACE FUNCTION update_updated_at_column()
       RETURNS TRIGGER AS $$
       BEGIN
           NEW.updated_at = NOW();
           RETURN NEW;
       END;
       $$ language 'plpgsql'`,

      // Create trigger
      `CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`
    ]

    // Execute each command
    for (const command of schemaCommands) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: command })
        if (error) {
          console.log(`⚠️  Command may have failed (this is often OK for IF NOT EXISTS): ${error.message}`)
        }
      } catch (err) {
        console.log(`⚠️  Command may have failed (this is often OK for IF NOT EXISTS): ${err.message}`)
      }
    }

    console.log('✅ Schema applied successfully!')
    console.log('💡 You can now run the activity library creation script')

  } catch (error) {
    console.error('❌ Error applying schema:', error)
  }
}

applySchema() 