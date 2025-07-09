const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSchema() {
  try {
    console.log('Checking activity_completions table schema...')

    // Check table structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'activity_completions')
      .eq('table_schema', 'public')

    if (tableError) {
      console.error('Error getting table info:', tableError)
      return
    }

    console.log('Table columns:')
    tableInfo.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
    })

    // Check constraints
    const { data: constraints, error: constraintError } = await supabase
      .from('information_schema.check_constraints')
      .select('constraint_name, check_clause')
      .eq('table_name', 'activity_completions')
      .eq('table_schema', 'public')

    if (constraintError) {
      console.error('Error getting constraints:', constraintError)
      return
    }

    console.log('\nCheck constraints:')
    constraints.forEach(constraint => {
      console.log(`  ${constraint.constraint_name}: ${constraint.check_clause}`)
    })

  } catch (error) {
    console.error('Error:', error)
  }
}

checkSchema() 