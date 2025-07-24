// Script to test activity recommendations based on assessment findings
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Mock the activity recommendation logic from the dashboard
const getDominantBehavior = (behaviorScores) => {
  const scores = [
    { type: 'seeking', score: behaviorScores.seeking || 0 },
    { type: 'avoiding', score: behaviorScores.avoiding || 0 },
    { type: 'sensitive', score: behaviorScores.sensitive || 0 },
    { type: 'low-registration', score: behaviorScores['low-registration'] || 0 }
  ];
  
  return scores.reduce((max, current) => 
    current.score > max.score ? current : max
  ).type;
};

const getChallengingSystems = (results) => {
  const systems = ['tactile', 'visual', 'auditory', 'olfactory', 'proprioceptive', 'vestibular', 'interoception', 'social-emotional'];
  const challenging = [];
  
  systems.forEach(system => {
    if (results[system] && results[system] > 15) {
      challenging.push(system);
    }
  });
  
  return challenging;
};

const getPersonalizedActivities = async (assessment) => {
  if (!assessment?.results) return [];

  const results = assessment.results;
  const behaviorScores = results.behaviorScores || {};
  
  try {
          // Get activities from database
      const { data: activities, error } = await supabase
        .from('activities')
        .select('*');

    if (error || !activities || activities.length === 0) {
      console.log('❌ No activities found in database');
      return [];
    }

    console.log(`📊 Found ${activities.length} activities in database`);

    // Score activities based on child's profile
    const scoredActivities = activities.map(activity => {
      let score = 0;
      
      // Score based on behavior fit
      const dominantBehavior = getDominantBehavior(behaviorScores);
      console.log(`🎯 Dominant behavior: ${dominantBehavior}`);
      console.log(`🎯 Activity behavior_types: ${activity.behavior_types}`);
      
      if (activity.behavior_types && activity.behavior_types.includes(dominantBehavior)) {
        score += 10;
        console.log(`✅ +10 points for behavior match`);
      } else if (activity.behavior_types && activity.behavior_types.includes('mixed')) {
        score += 5;
        console.log(`✅ +5 points for mixed behavior`);
      } else {
        console.log(`❌ No behavior match points`);
      }

      // Score based on sensory system needs
      const challengingSystems = getChallengingSystems(results);
      const activitySystems = activity.sensory_systems || [];
      
      console.log(`🎯 Challenging systems: ${challengingSystems.join(', ')}`);
      console.log(`🎯 Activity systems: ${activitySystems.join(', ')}`);
      
      challengingSystems.forEach(system => {
        if (activitySystems.includes(system)) {
          score += 8;
          console.log(`✅ +8 points for challenging system match: ${system}`);
        }
      });

      // Score based on difficulty (prefer beginner for high avoiding/sensitive)
      if (behaviorScores.avoiding > 15 || behaviorScores.sensitive > 15) {
        if (activity.difficulty === 'beginner') {
          score += 5;
          console.log(`✅ +5 points for beginner difficulty`);
        } else if (activity.difficulty === 'advanced') {
          score -= 3;
          console.log(`❌ -3 points for advanced difficulty`);
        }
      }

      return { ...activity, score };
    });

    // Sort by score and return top 6
    const topActivities = scoredActivities
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    console.log('\n🏆 TOP 6 RECOMMENDED ACTIVITIES:');
    topActivities.forEach((activity, index) => {
      console.log(`${index + 1}. ${activity.title} (Score: ${activity.score})`);
      console.log(`   Behavior Types: ${activity.behavior_types?.join(', ')}`);
      console.log(`   Sensory Systems: ${activity.sensory_systems?.join(', ')}`);
      console.log(`   Difficulty: ${activity.difficulty}`);
      console.log('');
    });

    return topActivities;
  } catch (error) {
    console.error('❌ Error in getPersonalizedActivities:', error);
    return [];
  }
};

async function testActivityRecommendations(email) {
  try {
    console.log(`🔍 Testing activity recommendations for user: ${email}`);
    
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
    
    // Get latest assessment for this user
    const { data: assessments, error: assessmentError } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', profile.id)
      .order('completed_at', { ascending: false })
      .limit(1);
    
    if (assessmentError) {
      console.error('❌ Error fetching assessments:', assessmentError);
      return;
    }
    
    if (!assessments || assessments.length === 0) {
      console.log('❌ No assessments found for this user');
      return;
    }
    
    const assessment = assessments[0];
    console.log(`📊 Assessment Profile: ${assessment.results.profile}`);
    console.log(`📊 Behavior Scores:`);
    console.log(`   Seeking: ${assessment.results.behaviorScores.seeking}`);
    console.log(`   Avoiding: ${assessment.results.behaviorScores.avoiding}`);
    console.log(`   Sensitive: ${assessment.results.behaviorScores.sensitive}`);
    console.log(`   Low Registration: ${assessment.results.behaviorScores['low-registration']}`);
    console.log('');
    
    // Test activity recommendations
    console.log('🎯 TESTING ACTIVITY RECOMMENDATIONS...\n');
    const recommendedActivities = await getPersonalizedActivities(assessment);
    
    console.log(`✅ Activity recommendation test completed!`);
    console.log(`📊 Recommended ${recommendedActivities.length} activities`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: node scripts/test-activity-recommendations.js <email>');
  console.log('Example: node scripts/test-activity-recommendations.js "seth-richardson@outlook.com"');
  process.exit(1);
}

testActivityRecommendations(email); 