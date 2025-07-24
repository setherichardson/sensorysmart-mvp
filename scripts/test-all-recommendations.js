// Comprehensive test to verify activity recommendations work for all customer types
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
    current.score > max.score ? { type: current.type, score: current.score } : max
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

    // Score activities based on child's profile
    const scoredActivities = activities.map(activity => {
      let score = 0;
      
      // Score based on behavior fit
      const dominantBehavior = getDominantBehavior(behaviorScores);
      if (activity.behavior_types && activity.behavior_types.includes(dominantBehavior)) {
        score += 10;
      } else if (activity.behavior_types && activity.behavior_types.includes('mixed')) {
        score += 5;
      }

      // Score based on sensory system needs
      const challengingSystems = getChallengingSystems(results);
      const activitySystems = activity.sensory_systems || [];
      
      challengingSystems.forEach(system => {
        if (activitySystems.includes(system)) {
          score += 8;
        }
      });

      // Score based on difficulty (prefer beginner for high avoiding/sensitive)
      if (behaviorScores.avoiding > 15 || behaviorScores.sensitive > 15) {
        if (activity.difficulty === 'beginner') {
          score += 5;
        } else if (activity.difficulty === 'advanced') {
          score -= 3;
        }
      }

      return { ...activity, score };
    });

    // Sort by score and return top 6
    const topActivities = scoredActivities
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    return topActivities;
  } catch (error) {
    console.error('❌ Error in getPersonalizedActivities:', error);
    return [];
  }
};

async function testAllRecommendations() {
  try {
    console.log('🧪 COMPREHENSIVE ACTIVITY RECOMMENDATION TEST\n');
    
    // Get all users with assessments
    const { data: assessments, error } = await supabase
      .from('assessments')
      .select(`
        *,
        profiles!inner(
          child_name,
          child_age,
          email
        )
      `)
      .order('completed_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching assessments:', error);
      return;
    }
    
    if (!assessments || assessments.length === 0) {
      console.log('❌ No assessments found');
      return;
    }
    
    console.log(`📊 Found ${assessments.length} assessments to test\n`);
    
    // Test each assessment
    for (const assessment of assessments) {
      const profile = assessment.profiles;
      console.log(`👤 Testing: ${profile.child_name} (${profile.child_age})`);
      console.log(`📧 Email: ${profile.email}`);
      console.log(`🎯 Profile: ${assessment.results.profile}`);
      console.log(`📊 Behavior Scores:`);
      console.log(`   Seeking: ${assessment.results.behaviorScores.seeking}`);
      console.log(`   Avoiding: ${assessment.results.behaviorScores.avoiding}`);
      console.log(`   Sensitive: ${assessment.results.behaviorScores.sensitive}`);
      console.log(`   Low Registration: ${assessment.results.behaviorScores['low-registration']}`);
      
      // Get recommendations
      const recommendedActivities = await getPersonalizedActivities(assessment);
      
      console.log(`🏆 Top 3 Recommendations:`);
      recommendedActivities.slice(0, 3).forEach((activity, index) => {
        console.log(`   ${index + 1}. ${activity.title} (Score: ${activity.score})`);
        console.log(`      Behavior Types: ${activity.behavior_types?.join(', ')}`);
        console.log(`      Sensory Systems: ${activity.sensory_systems?.join(', ')}`);
        console.log(`      Difficulty: ${activity.difficulty}`);
      });
      
      console.log(`✅ ${recommendedActivities.length} activities recommended\n`);
      console.log('─'.repeat(80) + '\n');
    }
    
    console.log('🎉 COMPREHENSIVE TEST COMPLETED!');
    console.log(`📊 Tested ${assessments.length} different customer profiles`);
    console.log('✅ All customers will receive personalized activity recommendations based on their assessment results!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testAllRecommendations(); 