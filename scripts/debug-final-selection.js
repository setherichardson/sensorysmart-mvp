const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Simplified version of the scoring logic
function scoreActivitiesForChild(activities, profile) {
  return activities.map(activity => {
    let personalityScore = 0;
    let timeScore = 0;
    let varietyScore = Math.random() * 2;
    
    // Behavior match
    if (activity.behavior_types?.includes(profile.dominantBehavior)) {
      personalityScore += 20;
    } else if (activity.behavior_types?.includes('mixed')) {
      personalityScore += 10;
    }
    
    // Sensory system match
    const matchingSystems = activity.sensory_systems?.filter(system => 
      profile.challengingSystems.includes(system)
    ) || [];
    personalityScore += matchingSystems.length * 5;
    
    const totalScore = personalityScore + timeScore + varietyScore;
    
    return {
      activity,
      personalityScore,
      timeScore,
      varietyScore,
      totalScore
    };
  });
}

function applyTimeFilter(scoredActivities, timeSlot) {
  const timePreferences = {
    'before-breakfast': ['proprioceptive', 'heavy-work'],
    'mid-morning': ['visual', 'tactile'], 
    'before-lunch': ['calming', 'tactile'],
    'lunch': ['tactile', 'olfactory'],
    'mid-afternoon': ['vestibular', 'proprioceptive'],
    'before-dinner': ['calming', 'visual'],
    'dinner': ['tactile', 'olfactory'],
    'evening': ['calming', 'auditory']
  };
  
  const preferredTypes = timePreferences[timeSlot] || [];
  
  const timeAdjusted = scoredActivities.map(scored => {
    if (preferredTypes.includes(scored.activity.activity_type || '')) {
      return {
        ...scored,
        timeScore: 5,
        totalScore: scored.totalScore + 5
      };
    }
    return scored;
  });
  
  return timeAdjusted
    .sort((a, b) => b.totalScore - a.totalScore)
    .map(scored => scored.activity);
}

async function debugFinalSelection() {
  console.log('🔍 Debugging Final Activity Selection...\n');

  try {
    // Get all activities
    const { data: allActivities, error } = await supabase
      .from('activities')
      .select('*');
    
    if (error) {
      console.error('Database error:', error);
      return;
    }

    console.log(`Total activities: ${allActivities.length}`);

    // Mock assessment (seeking dominant)
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

    // Extract profile
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

    const profile = {
      dominantBehavior,
      challengingSystems
    };

    console.log('Profile:', profile);

    // Score all activities
    console.log('\n1. Scoring all activities...');
    const scoredActivities = scoreActivitiesForChild(allActivities, profile);
    
    // Show top 20 scored activities
    const topScored = scoredActivities
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 20);
    
    console.log('\nTop 20 scored activities:');
    topScored.forEach((scored, index) => {
      console.log(`${index + 1}. ${scored.activity.title} - ${scored.totalScore.toFixed(1)} points`);
      console.log(`   Behavior: ${scored.activity.behavior_types?.join(', ') || 'none'}`);
      console.log(`   Sensory: ${scored.activity.sensory_systems?.join(', ') || 'none'}`);
      console.log(`   Personality: ${scored.personalityScore}, Time: ${scored.timeScore}, Variety: ${scored.varietyScore.toFixed(1)}`);
    });

    // Apply time filter
    console.log('\n2. Applying time filter...');
    const currentHour = new Date().getHours();
    let timeSlot;
    if (currentHour >= 6 && currentHour < 8) timeSlot = 'before-breakfast';
    else if (currentHour >= 8 && currentHour < 10) timeSlot = 'mid-morning';
    else if (currentHour >= 10 && currentHour < 12) timeSlot = 'before-lunch';
    else if (currentHour >= 12 && currentHour < 14) timeSlot = 'lunch';
    else if (currentHour >= 14 && currentHour < 16) timeSlot = 'mid-afternoon';
    else if (currentHour >= 16 && currentHour < 18) timeSlot = 'before-dinner';
    else if (currentHour >= 18 && currentHour < 20) timeSlot = 'dinner';
    else if (currentHour >= 20 && currentHour < 22) timeSlot = 'evening';
    else timeSlot = 'bedtime';

    console.log(`Current time slot: ${timeSlot}`);

    const timeFilteredActivities = applyTimeFilter(scoredActivities, timeSlot);
    
    // Show final top 6 activities
    console.log('\n3. Final top 6 activities (after time filter):');
    const finalTop6 = timeFilteredActivities.slice(0, 6);
    finalTop6.forEach((activity, index) => {
      console.log(`${index + 1}. ${activity.title}`);
      console.log(`   Behavior: ${activity.behavior_types?.join(', ') || 'none'}`);
      console.log(`   Sensory: ${activity.sensory_systems?.join(', ') || 'none'}`);
      console.log(`   Type: ${activity.activity_type || 'none'}`);
    });

    // Check for Music activities in final selection
    const musicInFinal = finalTop6.filter(a => a.title.includes('Music'));
    console.log(`\nMusic activities in final selection: ${musicInFinal.length}`);
    musicInFinal.forEach(activity => {
      console.log(`  - ${activity.title}`);
    });

    // Check for variety
    const activityTypes = finalTop6.map(a => a.title.split(' - ')[0]);
    const uniqueTypes = [...new Set(activityTypes)];
    console.log(`\nActivity variety: ${uniqueTypes.length} unique types out of 6 activities`);
    console.log('Types:', uniqueTypes);

  } catch (error) {
    console.error('Error:', error);
  }
}

debugFinalSelection(); 