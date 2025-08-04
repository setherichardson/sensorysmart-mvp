const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugActivitySelection() {
  console.log('🔍 Debugging Activity Selection...\n');

  try {
    // 1. Check what activities exist in the database
    console.log('1. Checking all activities in database...');
    const { data: allActivities, error } = await supabase
      .from('activities')
      .select('*');
    
    if (error) {
      console.error('Database error:', error);
      return;
    }

    console.log(`Found ${allActivities.length} total activities`);
    
    // Group by title to see variants
    const activityGroups = {};
    allActivities.forEach(activity => {
      const baseTitle = activity.title.split(' - ')[0];
      if (!activityGroups[baseTitle]) {
        activityGroups[baseTitle] = [];
      }
      activityGroups[baseTitle].push(activity);
    });

    console.log('\nActivity variants found:');
    Object.entries(activityGroups).forEach(([title, variants]) => {
      console.log(`  ${title}: ${variants.length} variants`);
      variants.forEach(variant => {
        console.log(`    - ${variant.title} (${variant.behavior_types?.join(', ') || 'no behavior types'})`);
      });
    });

    // 2. Check for Music and Movement specifically
    console.log('\n2. Checking Music and Movement activities...');
    const musicActivities = allActivities.filter(a => a.title.includes('Music'));
    console.log(`Found ${musicActivities.length} Music activities:`);
    musicActivities.forEach(activity => {
      console.log(`  - ${activity.title}`);
      console.log(`    Behavior types: ${activity.behavior_types?.join(', ') || 'none'}`);
      console.log(`    Sensory systems: ${activity.sensory_systems?.join(', ') || 'none'}`);
    });

    // 3. Check behavior types distribution
    console.log('\n3. Checking behavior types distribution...');
    const behaviorCounts = {};
    allActivities.forEach(activity => {
      if (activity.behavior_types) {
        activity.behavior_types.forEach(behavior => {
          behaviorCounts[behavior] = (behaviorCounts[behavior] || 0) + 1;
        });
      }
    });
    console.log('Behavior type counts:', behaviorCounts);

    // 4. Check sensory systems distribution
    console.log('\n4. Checking sensory systems distribution...');
    const sensoryCounts = {};
    allActivities.forEach(activity => {
      if (activity.sensory_systems) {
        activity.sensory_systems.forEach(system => {
          sensoryCounts[system] = (sensoryCounts[system] || 0) + 1;
        });
      }
    });
    console.log('Sensory system counts:', sensoryCounts);

    // 5. Simulate the scoring logic
    console.log('\n5. Simulating scoring logic...');
    const mockAssessment = {
      results: {
        behaviorScores: {
          seeking: 25,
          avoiding: 15,
          sensitive: 10,
          'low-registration': 5
        },
        tactile: 20,
        visual: 15,
        auditory: 18,
        olfactory: 8,
        proprioceptive: 22,
        vestibular: 12,
        interoception: 10
      }
    };

    // Extract profile (simplified version of the logic)
    const behaviorScores = mockAssessment.results.behaviorScores;
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
      mockAssessment.results[system] && mockAssessment.results[system] > 15
    );

    console.log('Mock Profile:', {
      dominantBehavior,
      challengingSystems
    });

    // Score a few activities
    const sampleActivities = allActivities.slice(0, 10);
    console.log('\nScoring sample activities:');
    sampleActivities.forEach(activity => {
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
      score += matchingSystems.length * 5;
      
      console.log(`  ${activity.title}: ${score} points`);
      console.log(`    Behavior types: ${activity.behavior_types?.join(', ') || 'none'}`);
      console.log(`    Sensory systems: ${activity.sensory_systems?.join(', ') || 'none'}`);
      console.log(`    Matching systems: ${matchingSystems.join(', ')}`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

debugActivitySelection(); 