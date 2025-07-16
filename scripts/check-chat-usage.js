const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkChatUsage() {
  try {
    console.log('📊 Checking chat usage patterns...\n')

    // Get all user messages from the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('user_id, created_at, message_type')
      .eq('message_type', 'user')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching messages:', error)
      return
    }

    if (!messages || messages.length === 0) {
      console.log('📝 No chat messages found in the last 30 days')
      return
    }

    console.log(`📈 Found ${messages.length} user messages in the last 30 days\n`)

    // Group messages by user and date
    const userDailyUsage = {}
    const dailyTotals = {}

    messages.forEach(msg => {
      const date = new Date(msg.created_at).toISOString().split('T')[0]
      const userId = msg.user_id

      // Track per-user daily usage
      if (!userDailyUsage[userId]) {
        userDailyUsage[userId] = {}
      }
      if (!userDailyUsage[userId][date]) {
        userDailyUsage[userId][date] = 0
      }
      userDailyUsage[userId][date]++

      // Track overall daily totals
      if (!dailyTotals[date]) {
        dailyTotals[date] = 0
      }
      dailyTotals[date]++
    })

    // Analyze usage patterns
    const allDailyCounts = Object.values(userDailyUsage).flatMap(userDates => 
      Object.values(userDates)
    )

    const maxDailyUsage = Math.max(...allDailyCounts)
    const avgDailyUsage = allDailyCounts.reduce((sum, count) => sum + count, 0) / allDailyCounts.length
    const medianDailyUsage = allDailyCounts.sort((a, b) => a - b)[Math.floor(allDailyCounts.length / 2)]

    console.log('📊 Usage Statistics:')
    console.log(`   Maximum messages per day by any user: ${maxDailyUsage}`)
    console.log(`   Average messages per day per user: ${avgDailyUsage.toFixed(1)}`)
    console.log(`   Median messages per day per user: ${medianDailyUsage}`)
    console.log(`   Total unique users: ${Object.keys(userDailyUsage).length}`)
    console.log(`   Total active days: ${Object.keys(dailyTotals).length}\n`)

    // Show users who exceed current limit (15)
    const currentLimit = 15
    const usersExceedingLimit = Object.entries(userDailyUsage)
      .filter(([userId, dates]) => 
        Object.values(dates).some(count => count > currentLimit)
      )

    if (usersExceedingLimit.length > 0) {
      console.log(`⚠️  Users who exceeded ${currentLimit} messages in a day:`)
      usersExceedingLimit.forEach(([userId, dates]) => {
        const maxCount = Math.max(...Object.values(dates))
        const dateWithMax = Object.entries(dates).find(([date, count]) => count === maxCount)?.[0]
        console.log(`   User ${userId.slice(0, 8)}...: ${maxCount} messages on ${dateWithMax}`)
      })
      console.log()
    }

    // Show recent daily totals
    console.log('📅 Recent daily message totals:')
    const recentDates = Object.keys(dailyTotals).sort().slice(-7)
    recentDates.forEach(date => {
      console.log(`   ${date}: ${dailyTotals[date]} messages`)
    })
    console.log()

    // Recommendations
    console.log('💡 Recommendations:')
    if (maxDailyUsage <= currentLimit) {
      console.log(`   ✅ Current limit of ${currentLimit} appears sufficient (max usage: ${maxDailyUsage})`)
    } else {
      console.log(`   ⚠️  Consider increasing limit from ${currentLimit} to ${Math.ceil(maxDailyUsage * 1.2)}`)
    }

    if (avgDailyUsage < currentLimit * 0.3) {
      console.log(`   💡 Consider reducing limit to ${Math.ceil(avgDailyUsage * 3)} to save costs`)
    }

    console.log(`   📊 Monitor usage for the next week to validate these recommendations`)

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the analysis
checkChatUsage() 