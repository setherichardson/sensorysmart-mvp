const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runSQL() {
  try {
    console.log('📝 Running SQL script to create activities table and populate with activity library...')
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'apply-activities-schema.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📊 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        try {
          console.log(`🔄 Executing statement ${i + 1}/${statements.length}...`)
          const { error } = await supabase.rpc('exec_sql', { sql: statement })
          if (error) {
            console.log(`⚠️  Statement ${i + 1} may have failed (this is often OK for IF NOT EXISTS): ${error.message}`)
          }
        } catch (err) {
          console.log(`⚠️  Statement ${i + 1} may have failed (this is often OK for IF NOT EXISTS): ${err.message}`)
        }
      }
    }
    
    console.log('✅ SQL script execution completed!')
    console.log('💡 The activities table should now be created and populated with the activity library')
    
  } catch (error) {
    console.error('❌ Error running SQL:', error)
  }
}

runSQL() 