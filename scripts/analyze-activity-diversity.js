require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function analyzeActivityDiversity() {
  console.log('🔍 Analyzing Activity Diversity and Repetition Issues...\n');

  try {
    // 1. Get all activities
    console.log('1. Getting all activities...');
    const { data: allActivities, error: activitiesError } = await supabase
      .from('activities')
      .select('*');

    if (activitiesError || !allActivities) {
      console.log('❌ Error getting activities:', activitiesError);
      return;
    }

    console.log(`✅ Found ${allActivities.length} total activities`);

    // 2. Analyze activity distribution
    console.log('\n2. Activity Distribution Analysis:');
    
    const baseNameCounts = {};
    const behaviorTypeCounts = {};
    const sensorySystemCounts = {};
    const activityTypeCounts = {};
    
    allActivities.forEach(activity => {
      // Count base names (without behavior suffixes)
      const baseName = activity.title.replace(/\s*-\s*(Avoiding|Seeking|Sensitive|Low-Registration|Mixed|Bedtime)$/, '');
      baseNameCounts[baseName] = (baseNameCounts[baseName] || 0) + 1;
      
      // Count behavior types
      if (activity.behavior_types) {
        activity.behavior_types.forEach(type => {
          behaviorTypeCounts[type] = (behaviorTypeCounts[type] || 0) + 1;
        });
      }
      
      // Count sensory systems
      if (activity.sensory_systems) {
        activity.sensory_systems.forEach(system => {
          sensorySystemCounts[system] = (sensorySystemCounts[system] || 0) + 1;
        });
      }
      
      // Count activity types
      if (activity.activity_type) {
        activityTypeCounts[activity.activity_type] = (activityTypeCounts[activity.activity_type] || 0) + 1;
      }
    });

    console.log('\n📊 Base Activity Names:');
    Object.entries(baseNameCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([name, count]) => {
        console.log(`  ${name}: ${count} variants`);
      });

    console.log('\n📊 Behavior Types:');
    Object.entries(behaviorTypeCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`  ${type}: ${count} activities`);
      });

    console.log('\n📊 Sensory Systems:');
    Object.entries(sensorySystemCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([system, count]) => {
        console.log(`  ${system}: ${count} activities`);
      });

    console.log('\n📊 Activity Types:');
    Object.entries(activityTypeCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`  ${type}: ${count} activities`);
      });

    // 3. Test with sample "Zeke-like" assessment
    console.log('\n3. Testing with Sample "Zeke-like" Assessment...');
    
    // Based on typical seeking behavior with tactile/proprioceptive challenges
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
        vestibular: 10,
        olfactory: 8,
        interoception: 6
      }
    };

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

    console.log('Sample Profile:');
    console.log('  Dominant behavior:', dominantBehavior);
    console.log('  Challenging systems:', challengingSystems);

    // 4. Score activities for this profile
    console.log('\n4. Scoring activities for sample profile...');
    const scoredActivities = allActivities.map(activity => {
      let score = 0;
      let reasons = [];
      
      // Behavior match
      if (activity.behavior_types?.includes(dominantBehavior)) {
        score += 20;
        reasons.push(`Behavior match (${dominantBehavior})`);
      } else if (activity.behavior_types?.includes('mixed')) {
        score += 10;
        reasons.push('Mixed behavior');
      }
      
      // Sensory system match
      const matchingSystems = activity.sensory_systems?.filter(system => 
        challengingSystems.includes(system)
      ) || [];
      score += matchingSystems.length * 8;
      if (matchingSystems.length > 0) {
        reasons.push(`Sensory systems: ${matchingSystems.join(', ')}`);
      }
      
      // Extract base activity name
      const baseName = activity.title.replace(/\s*-\s*(Avoiding|Seeking|Sensitive|Low-Registration|Mixed|Bedtime)$/, '');
      
      return { 
        activity, 
        score, 
        reasons,
        baseName,
        behaviorTypes: activity.behavior_types || [],
        sensorySystems: activity.sensory_systems || []
      };
    });

    // Sort by score
    scoredActivities.sort((a, b) => b.score - a.score);

    // 5. Analyze top recommendations
    console.log('\n5. Top 20 Recommended Activities:');
    const top20 = scoredActivities.slice(0, 20);
    
    const topBaseNameCounts = {};
    const topBehaviorTypeCounts = {};
    const topSensorySystemCounts = {};
    
    top20.forEach((item, index) => {
      const cleanTitle = item.activity.title.replace(/\s*-\s*(Avoiding|Seeking|Sensitive|Low-Registration|Mixed|Bedtime)$/, '');
      console.log(`  ${index + 1}. ${cleanTitle} (Score: ${item.score})`);
      console.log(`     Reasons: ${item.reasons.join(', ')}`);
      console.log(`     Behavior: ${item.behaviorTypes.join(', ')}`);
      console.log(`     Sensory: ${item.sensorySystems.join(', ')}`);
      console.log('');
      
      // Count base names
      topBaseNameCounts[item.baseName] = (topBaseNameCounts[item.baseName] || 0) + 1;
      
      // Count behavior types
      item.behaviorTypes.forEach(type => {
        topBehaviorTypeCounts[type] = (topBehaviorTypeCounts[type] || 0) + 1;
      });
      
      // Count sensory systems
      item.sensorySystems.forEach(system => {
        topSensorySystemCounts[system] = (topSensorySystemCounts[system] || 0) + 1;
      });
    });

    // 6. Identify repetition issues
    console.log('\n6. Repetition Analysis:');
    console.log('Base Activity Names in Top 20:');
    Object.entries(topBaseNameCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([name, count]) => {
        console.log(`  ${name}: ${count} variants`);
        if (count > 2) {
          console.log(`    ⚠️  HIGH REPETITION: ${count} variants of same activity`);
        }
      });

    const uniqueBaseNames = Object.keys(topBaseNameCounts);
    console.log(`\nUnique base activities in top 20: ${uniqueBaseNames.length}`);
    
    if (uniqueBaseNames.length < 10) {
      console.log('⚠️  LIMITED VARIETY: Only', uniqueBaseNames.length, 'unique activities in top 20');
      console.log('   This explains the repetition you\'re seeing!');
    }

    // 7. Check for gaps
    console.log('\n7. Gap Analysis:');
    
    // Check if we have enough seeking activities
    const seekingActivities = allActivities.filter(activity => 
      activity.behavior_types?.includes('seeking')
    );
    console.log(`Total seeking activities: ${seekingActivities.length}`);
    
    // Check if we have enough tactile/proprioceptive activities
    const tactileActivities = allActivities.filter(activity => 
      activity.sensory_systems?.includes('tactile')
    );
    const proprioceptiveActivities = allActivities.filter(activity => 
      activity.sensory_systems?.includes('proprioceptive')
    );
    console.log(`Total tactile activities: ${tactileActivities.length}`);
    console.log(`Total proprioceptive activities: ${proprioceptiveActivities.length}`);

    // 8. Recommendations
    console.log('\n8. Recommendations:');
    
    if (uniqueBaseNames.length < 10) {
      console.log('🔧 ACTION NEEDED: Create more base activities for seeking behavior');
      console.log('   Current top activities are too similar (lots of balance/music variants)');
      console.log('   Need more variety in activity types for seeking children');
    }
    
    if (seekingActivities.length < 20) {
      console.log('🔧 ACTION NEEDED: Create more seeking-specific activities');
    }
    
    if (tactileActivities.length < 15 || proprioceptiveActivities.length < 15) {
      console.log('🔧 ACTION NEEDED: Create more tactile/proprioceptive activities');
    }

    console.log('\n✅ Analysis complete!');

  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

analyzeActivityDiversity(); 