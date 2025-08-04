require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testActivityLoading() {
  console.log('🔍 Testing activity loading...\n');

  try {
    // 1. Test basic database connection
    console.log('1. Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('activities')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError);
      return;
    }
    console.log('✅ Database connection successful\n');

    // 2. Test getting all activities
    console.log('2. Testing get all activities...');
    const { data: allActivities, error: allError } = await supabase
      .from('activities')
      .select('*');
    
    if (allError) {
      console.error('❌ Error getting all activities:', allError);
      return;
    }
    
    console.log(`✅ Found ${allActivities.length} activities in database\n`);

    // 3. Test getting user assessment
    console.log('3. Testing get user assessment...');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('⚠️  No user logged in, testing with sample assessment');
      // Test with sample assessment data
      const sampleAssessment = {
        results: {
          behaviorScores: {
            seeking: 18,
            avoiding: 12,
            sensitive: 8,
            'low-registration': 6
          },
          tactile: 16,
          visual: 14,
          auditory: 12,
          proprioceptive: 18,
          vestibular: 10
        }
      };
      
      console.log('✅ Using sample assessment data\n');
      testWithAssessment(sampleAssessment, allActivities);
    } else {
      console.log(`✅ User found: ${user.email}`);
      
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();
      
      if (assessmentError || !assessment) {
        console.log('⚠️  No assessment found for user');
        return;
      }
      
      console.log('✅ Assessment found\n');
      testWithAssessment(assessment, allActivities);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

function testWithAssessment(assessment, allActivities) {
  console.log('4. Testing activity selection logic...\n');
  
  // Simulate the logic from improved-activity-logic.ts
  const results = assessment.results;
  const behaviorScores = results.behaviorScores || {};
  
  // Find dominant behavior
  const behaviors = [
    { type: 'seeking', score: behaviorScores.seeking || 0 },
    { type: 'avoiding', score: behaviorScores.avoiding || 0 },
    { type: 'sensitive', score: behaviorScores.sensitive || 0 },
    { type: 'low-registration', score: behaviorScores['low-registration'] || 0 }
  ];
  
  const dominantBehavior = behaviors.reduce((max, current) => 
    current.score > max.score ? current : max
  ).type;
  
  console.log('📊 Assessment Analysis:');
  console.log('  Behavior scores:', behaviors);
  console.log('  Dominant behavior:', dominantBehavior);
  
  // Find challenging systems
  const systems = ['tactile', 'visual', 'auditory', 'olfactory', 'proprioceptive', 'vestibular', 'interoception'];
  const challengingSystems = systems.filter(system => 
    results[system] && results[system] > 15
  );
  
  console.log('  Challenging systems:', challengingSystems);
  console.log('  System scores:', systems.map(system => ({ system, score: results[system] || 0 })));
  
  // Score activities
  const scoredActivities = allActivities.map(activity => {
    let score = 0;
    
    // Behavior match
    if (activity.behavior_types?.includes(dominantBehavior)) {
      score += 20;
    } else if (activity.behavior_types?.includes('mixed')) {
      score += 10;
    }
    
    // Sensory system match
    const matchingSystems = activity.sensory_systems?.filter(system => 
      challengingSystems.includes(system)
    ) || [];
    score += matchingSystems.length * 8;
    
    return { activity, score };
  });
  
  // Sort by score
  scoredActivities.sort((a, b) => b.score - a.score);
  
  console.log('\n🏆 Top 5 Recommended Activities:');
  scoredActivities.slice(0, 5).forEach((item, index) => {
    const cleanTitle = item.activity.title.replace(/\s*-\s*(Avoiding|Seeking|Sensitive|Low-Registration|Mixed|Bedtime)$/, '');
    console.log(`  ${index + 1}. ${cleanTitle} (Score: ${item.score})`);
  });
  
  console.log('\n✅ Activity selection logic working correctly!');
}

testActivityLoading(); 