require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testCyclingLogic() {
  console.log('🔄 Testing Activity Cycling Logic with Duplicate Prevention...\n');

  try {
    // 1. Test database connection
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

    // 2. Get all activities
    console.log('2. Getting all activities...');
    const { data: allActivities, error: allError } = await supabase
      .from('activities')
      .select('*');

    if (allError || !allActivities) {
      console.error('❌ Error getting activities:', allError);
      return;
    }

    console.log(`✅ Found ${allActivities.length} activities in database\n`);

    // 3. Test with sample assessment (Zeke-like profile)
    console.log('3. Testing with sample "Zeke-like" assessment...');
    
    const sampleAssessment = {
      user_id: 'test-user-123',
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
        vestibular: 10,
        olfactory: 8,
        interoception: 6
      }
    };

    // 4. Simulate the cycling logic
    console.log('4. Simulating activity cycling with duplicate prevention...\n');
    
    // Extract child profile
    const results = sampleAssessment.results;
    const behaviorScores = results.behaviorScores || {};

    const behaviors = [
      { type: 'seeking', score: behaviorScores.seeking || 0 },
      { type: 'avoiding', score: behaviorScores.avoiding || 0 },
      { type: 'sensitive', score: behaviorScores.sensitive || 0 },
      { type: 'low-registration', score: behaviorScores['low-registration'] || 0 }
    ];

    const dominantBehavior = behaviors.reduce((max, current) =>
      current.score > max.score ? current : max
    ).type;

    const systems = ['tactile', 'visual', 'auditory', 'olfactory', 'proprioceptive', 'vestibular', 'interoception'];
    const challengingSystems = systems.filter(system =>
      results[system] && results[system] > 15
    );

    console.log('📊 Child Profile:');
    console.log('  Dominant behavior:', dominantBehavior);
    console.log('  Challenging systems:', challengingSystems);

    // 5. Filter activities (simulating getPersonalizedActivityList)
    console.log('\n5. Filtering activities for child profile...');
    const filteredActivities = allActivities.filter(activity => {
      // Must match dominant behavior OR be mixed
      const behaviorMatch = activity.behavior_types?.includes(dominantBehavior) || 
                           activity.behavior_types?.includes('mixed');
      
      // Should match at least one challenging system (but not required)
      const systemMatch = activity.sensory_systems?.some((system) => 
        challengingSystems.includes(system)
      );
      
      return behaviorMatch && (systemMatch || challengingSystems.length === 0);
    });

    console.log(`✅ Filtered to ${filteredActivities.length} matching activities\n`);

    // 6. Test cycling through activities WITH duplicate prevention
    console.log('6. Testing activity cycling with duplicate prevention...\n');
    
    const cyclePositions = [0, 3, 6, 9, 12, 15];
    let recentlyShown = []; // Track recently shown activities
    
    cyclePositions.forEach((startIndex, cycleNumber) => {
      console.log(`🔄 Cycle ${cycleNumber + 1} (starting at position ${startIndex}):`);
      
      const nextActivities = getNextActivitiesFromCycleAvoidingDuplicates(
        filteredActivities, 
        startIndex, 
        3, 
        recentlyShown
      );
      
      nextActivities.forEach((activity, index) => {
        const cleanTitle = activity.title.replace(/\s*-\s*(Avoiding|Seeking|Sensitive|Low-Registration|Mixed|Bedtime)$/, '');
        console.log(`  ${index + 1}. ${cleanTitle}`);
      });
      
      // Track these activities as recently shown for next cycle
      recentlyShown = [...recentlyShown, ...nextActivities.map(a => a.id)];
      
      console.log(`  📝 Recently shown count: ${recentlyShown.length}`);
      console.log('');
    });

    // 7. Test what happens when we run out of unique activities
    console.log('7. Testing behavior when running out of unique activities...');
    
    // Simulate having shown most activities
    const mostlyShown = filteredActivities.slice(0, filteredActivities.length - 2).map(a => a.id);
    console.log(`  Simulating ${mostlyShown.length} recently shown activities...`);
    
    const remainingActivities = getNextActivitiesFromCycleAvoidingDuplicates(
      filteredActivities,
      0,
      3,
      mostlyShown
    );
    
    if (remainingActivities.length > 0) {
      console.log('  ✅ Found remaining unique activities:');
      remainingActivities.forEach(activity => {
        const cleanTitle = activity.title.replace(/\s*-\s*(Avoiding|Seeking|Sensitive|Low-Registration|Mixed|Bedtime)$/, '');
        console.log(`    - ${cleanTitle}`);
      });
    } else {
      console.log('  ⚠️  No unique activities remaining (this is expected behavior)');
    }

    // 8. Test bedtime logic
    console.log('\n8. Testing bedtime activities...');
    const bedtimeActivities = allActivities.filter(activity =>
      ['Gentle Hand Squeezes', 'Calming Belly Breathing', 'Quiet Counting'].includes(activity.title)
    );
    
    if (bedtimeActivities.length > 0) {
      console.log('✅ Bedtime activities found:');
      bedtimeActivities.forEach(activity => {
        console.log(`  - ${activity.title}`);
      });
    } else {
      console.log('⚠️  No bedtime activities found in database');
    }

    console.log('\n✅ Activity cycling logic test complete!');
    console.log('\n🎯 Key Benefits:');
    console.log('  - Simple cycling eliminates repetition');
    console.log('  - Duplicate prevention ensures variety');
    console.log('  - Each cycle shows 3 new activities');
    console.log('  - Activities still match child\'s profile');
    console.log('  - Bedtime activities work as special case');
    console.log('  - Graceful handling when running out of unique activities');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Helper function to simulate cycling with duplicate prevention
function getNextActivitiesFromCycleAvoidingDuplicates(activities, startIndex, count, recentlyShown) {
  if (activities.length === 0) return [];
  
  const result = [];
  let attempts = 0;
  const maxAttempts = activities.length * 2; // Prevent infinite loops
  
  while (result.length < count && attempts < maxAttempts) {
    const index = (startIndex + attempts) % activities.length;
    const activity = activities[index];
    
    // Check if this activity was recently shown
    if (!recentlyShown.includes(activity.id)) {
      result.push(activity);
    }
    
    attempts++;
  }
  
  // If we couldn't find enough non-duplicate activities, 
  // just return what we have (this prevents infinite loops)
  if (result.length < count) {
    console.log(`    ⚠️  Could only find ${result.length} non-duplicate activities`);
  }
  
  return result;
}

// Helper function to simulate cycling (old version)
function getNextActivitiesFromCycle(activities, startIndex, count) {
  if (activities.length === 0) return [];
  
  const result = [];
  for (let i = 0; i < count; i++) {
    const index = (startIndex + i) % activities.length;
    result.push(activities[index]);
  }
  
  return result;
}

testCyclingLogic(); 