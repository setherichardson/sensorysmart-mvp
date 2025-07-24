// Script to check a specific user's assessment data
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSpecificUser(email) {
  try {
    console.log(`🔍 Checking assessment data for user: ${email}`);
    
    // First, find the user by email
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email);
    
    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
      return;
    }
    
    if (!profiles || profiles.length === 0) {
      console.log('❌ No profile found for this email');
      return;
    }
    
    const profile = profiles[0];
    console.log(`✅ Found profile for: ${profile.child_name} (${profile.child_age})`);
    console.log(`👤 User ID: ${profile.id}`);
    
    // Get all assessments for this user
    const { data: assessments, error: assessmentError } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', profile.id)
      .order('completed_at', { ascending: false });
    
    if (assessmentError) {
      console.error('❌ Error fetching assessments:', assessmentError);
      return;
    }
    
    if (!assessments || assessments.length === 0) {
      console.log('❌ No assessments found for this user');
      return;
    }
    
    console.log(`📊 Found ${assessments.length} assessment(s):`);
    console.log('');
    
    assessments.forEach((assessment, index) => {
      console.log(`Assessment ${index + 1} (${assessment.completed_at}):`);
      console.log(`   Current Profile: ${assessment.results.profile}`);
      console.log(`   Behavior Scores:`);
      console.log(`     Seeking: ${assessment.results.behaviorScores.seeking}`);
      console.log(`     Avoiding: ${assessment.results.behaviorScores.avoiding}`);
      console.log(`     Sensitive: ${assessment.results.behaviorScores.sensitive}`);
      console.log(`     Low Registration: ${assessment.results.behaviorScores['low-registration']}`);
      
      // Calculate what the profile should be
      const scores = assessment.results.behaviorScores;
      const dominantBehavior = Object.entries(scores).reduce((max, [type, score]) => 
        score > max.score ? { type, score } : max
      , { type: 'mixed', score: 0 });
      
      const behaviorThreshold = 20;
      let correctProfile = 'Mixed Profile';
      
      if (dominantBehavior.score >= behaviorThreshold) {
        switch (dominantBehavior.type) {
          case 'seeking':
            correctProfile = 'Sensory Seeking';
            break;
          case 'avoiding':
            correctProfile = 'Sensory Avoiding';
            break;
          case 'sensitive':
            correctProfile = 'Sensory Sensitive';
            break;
          case 'low-registration':
            correctProfile = 'Low Registration';
            break;
        }
      }
      
      console.log(`   Should Be: ${correctProfile}`);
      console.log(`   Status: ${assessment.results.profile === correctProfile ? '✅ CORRECT' : '❌ INCORRECT'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: node scripts/check-specific-user.js <email>');
  console.log('Example: node scripts/check-specific-user.js "hi+99@sethrichardsondesign.com"');
  process.exit(1);
}

checkSpecificUser(email); 