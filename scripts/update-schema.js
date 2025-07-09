const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateSchema() {
  console.log('🔧 Updating database schema...')
  
  try {
    // First, let's check the current table structure
    console.log('📋 Checking current table structure...')
    
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'activity_completions')
      .eq('table_schema', 'public')
    
    if (columnsError) {
      console.log('Current columns:', columns)
    }
    
    // Add notes column if it doesn't exist
    console.log('📝 Adding notes column...')
    const { error: notesError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE activity_completions 
        ADD COLUMN IF NOT EXISTS notes TEXT
      `
    })
    
    if (notesError) {
      console.log('Notes column error:', notesError)
    } else {
      console.log('✅ Notes column added/verified')
    }
    
    // Update rating column constraint to include new values
    console.log('⭐ Updating rating column constraints...')
    
    // First, drop the existing constraint
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE activity_completions 
        DROP CONSTRAINT IF EXISTS activity_completions_rating_check
      `
    })
    
    if (dropError) {
      console.log('Drop constraint error:', dropError)
    }
    
    // Add new constraint with updated values
    const { error: addError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE activity_completions 
        ADD CONSTRAINT activity_completions_rating_check 
        CHECK (rating IN ('regulated', 'calmer', 'neutral', 'distracted', 'dysregulated', 'worked_well', 'didnt_work', 'okay') OR rating IS NULL)
      `
    })
    
    if (addError) {
      console.log('Add constraint error:', addError)
    } else {
      console.log('✅ Rating constraint updated')
    }
    
    // Update user_id foreign key to reference auth.users instead of profiles
    console.log('🔗 Updating user_id foreign key...')
    
    // Drop existing foreign key
    const { error: dropFkError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE activity_completions 
        DROP CONSTRAINT IF EXISTS activity_completions_user_id_fkey
      `
    })
    
    if (dropFkError) {
      console.log('Drop FK error:', dropFkError)
    }
    
    // Add new foreign key to auth.users
    const { error: addFkError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE activity_completions 
        ADD CONSTRAINT activity_completions_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
      `
    })
    
    if (addFkError) {
      console.log('Add FK error:', addFkError)
    } else {
      console.log('✅ User ID foreign key updated')
    }
    
    // Remove old columns if they exist
    console.log('🧹 Cleaning up old columns...')
    
    const { error: dropDescError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE activity_completions 
        DROP COLUMN IF EXISTS description
      `
    })
    
    const { error: dropCreatedError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE activity_completions 
        DROP COLUMN IF EXISTS created_at
      `
    })
    
    if (dropDescError) console.log('Drop description error:', dropDescError)
    if (dropCreatedError) console.log('Drop created_at error:', dropCreatedError)
    
    console.log('✅ Schema update completed!')
    
    // Test the updated schema
    console.log('🧪 Testing updated schema...')
    
    const { data: testData, error: testError } = await supabase
      .from('activity_completions')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.log('Test query error:', testError)
    } else {
      console.log('✅ Schema test successful')
      console.log('Sample data structure:', Object.keys(testData[0] || {}))
    }
    
  } catch (error) {
    console.error('❌ Schema update failed:', error)
  }
}

updateSchema() 