require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function analyzeZekeActivities() {
  console.log('🔍 Analyzing Zeke\'s Activity Recommendations...\n');

  try {
    // 1. Get Zeke's assessment
    console.log('1. Getting Zeke\'s assessment...');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('❌ No user logged in. Please log in first.');
      return;
    }

    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    if (assessmentError || !assessment) {
      console.log('❌ No assessment found for user');
      return;
    }

    console.log('✅ Found assessment for:', user.email);
    console.log('Assessment date:', new Date(assessment.completed_at).toLocaleDateString());

    // 2. Get all activities
    console.log('\n2. Getting all activities...');
    const { data: allActivities, error: activitiesError } = await supabase
      .from('activities')
      .select('*');

    if (activitiesError || !allActivities) {
      console.log('❌ Error getting activities:', activitiesError);
      return;
    }

    console.log(`✅ Found ${allActivities.length} total activities`);

    // 3. Analyze Zeke's profile
    console.log('\n3. Analyzing Zeke\'s sensory profile...');
    const results = assessment.results;
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

    console.log('📊 Zeke\'s Profile:');
    console.log('  Behavior scores:', behaviors);
    console.log('  Dominant behavior:', dominantBehavior);
    console.log('  Challenging systems:', challengingSystems);
    console.log('  System scores:', systems.map(system => ({ system, score: results[system] || 0 })));

    // 4. Score all activities for Zeke
    console.log('\n4. Scoring activities for Zeke...');
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
      
      // Extract base activity name for diversity analysis
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
    
    const baseNameCounts = {};
    const behaviorTypeCounts = {};
    const sensorySystemCounts = {};
    
    top20.forEach((item, index) => {
      const cleanTitle = item.activity.title.replace(/\s*-\s*(Avoiding|Seeking|Sensitive|Low-Registration|Mixed|Bedtime)$/, '');
      console.log(`  ${index + 1}. ${cleanTitle} (Score: ${item.score})`);
      console.log(`     Reasons: ${item.reasons.join(', ')}`);
      console.log(`     Behavior: ${item.behaviorTypes.join(', ')}`);
      console.log(`     Sensory: ${item.sensorySystems.join(', ')}`);
      console.log('');
      
      // Count base names
      baseNameCounts[item.baseName] = (baseNameCounts[item.baseName] || 0) + 1;
      
      // Count behavior types
      item.behaviorTypes.forEach(type => {
        behaviorTypeCounts[type] = (behaviorTypeCounts[type] || 0) + 1;
      });
      
      // Count sensory systems
      item.sensorySystems.forEach(system => {
        sensorySystemCounts[system] = (sensorySystemCounts[system] || 0) + 1;
      });
    });

    // 6. Analyze diversity
    console.log('\n6. Diversity Analysis:');
    console.log('Base Activity Names (Top 20):');
    Object.entries(baseNameCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([name, count]) => {
        console.log(`  ${name}: ${count} variants`);
      });

    console.log('\nBehavior Types (Top 20):');
    Object.entries(behaviorTypeCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`  ${type}: ${count} activities`);
      });

    console.log('\nSensory Systems (Top 20):');
    Object.entries(sensorySystemCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([system, count]) => {
        console.log(`  ${system}: ${count} activities`);
      });

    // 7. Check for gaps
    console.log('\n7. Potential Gaps Analysis:');
    
    // Check if we have enough variety in base activities
    const uniqueBaseNames = Object.keys(baseNameCounts);
    console.log(`Unique base activities in top 20: ${uniqueBaseNames.length}`);
    
    if (uniqueBaseNames.length < 10) {
      console.log('⚠️  Limited variety in base activities - this could cause repetition');
    }
    
    // Check if dominant behavior has enough activities
    const dominantBehaviorActivities = top20.filter(item => 
      item.behaviorTypes.includes(dominantBehavior)
    );
    console.log(`Activities matching dominant behavior (${dominantBehavior}): ${dominantBehaviorActivities.length}`);
    
    // Check challenging systems coverage
    challengingSystems.forEach(system => {
      const systemActivities = top20.filter(item => 
        item.sensorySystems.includes(system)
      );
      console.log(`Activities for challenging system ${system}: ${systemActivities.length}`);
    });

    console.log('\n✅ Analysis complete!');

  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

analyzeZekeActivities(); 