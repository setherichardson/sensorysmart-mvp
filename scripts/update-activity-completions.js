const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateActivityCompletions() {
  try {
    console.log('Updating activity_completions table...')

    // Add the description column
    const { error: addColumnError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE activity_completions 
        ADD COLUMN IF NOT EXISTS description TEXT;
      `
    })

    if (addColumnError) {
      console.log('Description column might already exist, continuing...')
    } else {
      console.log('✅ Added description column')
    }

    // Update the rating constraint to allow new values
    const { error: updateRatingError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE activity_completions 
        DROP CONSTRAINT IF EXISTS activity_completions_rating_check;
        
        ALTER TABLE activity_completions 
        ADD CONSTRAINT activity_completions_rating_check 
        CHECK (rating IN ('worked_well', 'didnt_work', 'okay'));
      `
    })

    if (updateRatingError) {
      console.log('Rating constraint update error:', updateRatingError)
    } else {
      console.log('✅ Updated rating constraint')
    }

    // Update the activity_type constraint to allow new values
    const { error: updateTypeError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE activity_completions 
        DROP CONSTRAINT IF EXISTS activity_completions_activity_type_check;
        
        ALTER TABLE activity_completions 
        ADD CONSTRAINT activity_completions_activity_type_check 
        CHECK (activity_type IN ('proprioceptive', 'vestibular', 'tactile', 'heavy-work', 'calming', 'auditory', 'visual'));
      `
    })

    if (updateTypeError) {
      console.log('Activity type constraint update error:', updateTypeError)
    } else {
      console.log('✅ Updated activity_type constraint')
    }

    // Update existing records to use new rating values
    const { error: updateRecordsError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE activity_completions 
        SET rating = 'worked_well' 
        WHERE rating = 'worked';
        
        UPDATE activity_completions 
        SET rating = 'didnt_work' 
        WHERE rating = 'didnt_work';
        
        UPDATE activity_completions 
        SET rating = 'okay' 
        WHERE rating = 'neutral';
      `
    })

    if (updateRecordsError) {
      console.log('Record update error:', updateRecordsError)
    } else {
      console.log('✅ Updated existing records')
    }

    console.log('✅ Activity completions table updated successfully!')

  } catch (error) {
    console.error('Error updating table:', error)
  }
}

updateActivityCompletions() 