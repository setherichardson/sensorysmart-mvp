// Improved and simplified activity selection logic with all edge cases handled

import { supabase } from './supabase/client'
import type { Activity, Assessment } from './supabase/client'

interface ActivityScore {
  activity: Activity;
  personalityScore: number;
  timeScore: number;
  varietyScore: number;
  totalScore: number;
}

interface ChildProfile {
  dominantBehavior: string;
  challengingSystems: string[];  
  intensityLevel: 'low' | 'medium' | 'high';
  preferredDifficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface ActivityStep {
  id: number;
  instruction: string;
}

// Fallback Activity Library (matches the original component's activityLibrary)
const activityLibrary: Activity[] = [
  // Proprioceptive Activities
  {
    id: 'wall-pushups',
    title: 'Wall Push-ups',
    context: 'Great for morning regulation',
    duration_minutes: 3,
    activity_type: 'proprioceptive',
    difficulty: 'beginner',
    sensory_systems: ['proprioceptive'],
    behavior_types: ['seeking'],
    description: 'Deep pressure input through pushing against a wall',
    benefits: ['Provides deep pressure input', 'Helps with regulation', 'Easy to do anywhere'],
    when_to_use: 'When seeking proprioceptive input or needing to calm down',
    materials: [],
    steps: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'resistance-band-pull',
    title: 'Resistance Band Pull',
    context: 'Perfect before lunch to help focus',
    duration_minutes: 5,
    activity_type: 'heavy-work',
    difficulty: 'beginner',
    sensory_systems: ['proprioceptive'],
    behavior_types: ['seeking'],
    description: 'Pulling resistance band for muscle input',
    benefits: ['Provides heavy work', 'Improves focus', 'Strengthens muscles'],
    when_to_use: 'Before tasks requiring concentration',
    materials: ['Resistance band'],
    steps: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'weighted-lap-pad',
    title: 'Weighted Lap Pad',
    context: 'Ideal for afternoon energy',
    duration_minutes: 15,
    activity_type: 'calming',
    difficulty: 'beginner',
    sensory_systems: ['proprioceptive', 'tactile'],
    behavior_types: ['avoiding'],
    description: 'Gentle pressure from weighted pad on lap',
    benefits: ['Provides gentle pressure', 'Calming effect', 'Non-intrusive'],
    when_to_use: 'When feeling overwhelmed or needing gentle input',
    materials: ['Weighted lap pad'],
    steps: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'bear-hugs',
    title: 'Bear Hugs',
    context: 'Great for transitions',
    duration_minutes: 2,
    activity_type: 'proprioceptive',
    difficulty: 'beginner',
    sensory_systems: ['proprioceptive', 'tactile'],
    behavior_types: ['seeking'],
    description: 'Firm, deep pressure hugs',
    benefits: ['Provides deep pressure', 'Emotional connection', 'Calming'],
    when_to_use: 'During transitions or when seeking comfort',
    materials: [],
    steps: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'chair-pushups',
    title: 'Chair Push-ups',
    context: 'Good for focus during seated work',
    duration_minutes: 2,
    activity_type: 'proprioceptive',
    difficulty: 'beginner',
    sensory_systems: ['proprioceptive'],
    behavior_types: ['seeking'],
    description: 'Lifting body from chair using arm strength',
    benefits: ['Provides proprioceptive input', 'Improves focus', 'Strengthens arms'],
    when_to_use: 'During seated activities when needing input',
    materials: ['Chair with armrests'],
    steps: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // Vestibular Activities
  {
    id: 'slow-spinning',
    title: 'Slow Spinning',
    context: 'Calming vestibular input',
    duration_minutes: 3,
    activity_type: 'vestibular',
    difficulty: 'beginner',
    sensory_systems: ['vestibular'],
    behavior_types: ['seeking'],
    description: 'Gentle spinning in a chair or standing',
    benefits: ['Provides vestibular input', 'Calming effect', 'Improves balance'],
    when_to_use: 'When seeking movement input or needing to calm down',
    materials: ['Chair or open space'],
    steps: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // Tactile Activities
  {
    id: 'play-dough-time',
    title: 'Play Dough Time',
    context: 'Great for tactile seekers',
    duration_minutes: 10,
    activity_type: 'tactile',
    difficulty: 'beginner',
    sensory_systems: ['tactile', 'proprioceptive'],
    behavior_types: ['seeking'],
    description: 'Playing with play dough for tactile input',
    benefits: ['Provides tactile input', 'Improves fine motor skills', 'Calming'],
    when_to_use: 'When seeking tactile input or needing to focus',
    materials: ['Play dough'],
    steps: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // Visual Activities
  {
    id: 'i-spy-game',
    title: 'I Spy Game',
    context: 'Good for visual focus',
    duration_minutes: 5,
    activity_type: 'visual',
    difficulty: 'beginner',
    sensory_systems: ['visual'],
    behavior_types: ['seeking'],
    description: 'Looking for objects in the environment',
    benefits: ['Improves visual focus', 'Calming', 'Easy to do anywhere'],
    when_to_use: 'When needing to focus or calm down',
    materials: [],
    steps: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Main function - much simpler flow with proper error handling
export const getPersonalizedActivities = async (assessment: Assessment | null): Promise<Activity[]> => {
  try {
    console.log('🎯 IMPROVED LOGIC: Starting getPersonalizedActivities');
    
    // 1. Get all available activities (unified approach)
    const allActivities = await getAllActivities();
    console.log(`🎯 IMPROVED LOGIC: Loaded ${allActivities.length} activities`);
    
    // 2. Handle bedtime special case first
    const timeSlot = getCurrentTimeSlot();
    console.log(`🎯 IMPROVED LOGIC: Current time slot: ${timeSlot}`);
    
    if (timeSlot === 'bedtime') {
      console.log('🎯 IMPROVED LOGIC: Bedtime detected, returning bedtime activities');
      return await getBedtimeActivities();
    }
    
    // 3. If no assessment, return time-appropriate activities
    if (!assessment) {
      console.log('🎯 IMPROVED LOGIC: No assessment available, using time-based selection');
      return getTimeBasedFallbackActivities(allActivities, timeSlot);
    }
    
    // 4. Get child's profile from assessment
    const profile = extractChildProfile(assessment);
    console.log('🎯 IMPROVED LOGIC: Child profile:', profile);
    
    // 5. Score activities based on child's needs
    const scoredActivities = scoreActivitiesForChild(allActivities, profile);
    console.log(`🎯 IMPROVED LOGIC: Scored ${scoredActivities.length} activities`);
    
    // 6. Apply time-of-day filter (light touch)
    const timeFilteredActivities = applyTimeFilter(scoredActivities, timeSlot);
    console.log(`🎯 IMPROVED LOGIC: After time filter: ${timeFilteredActivities.length} activities`);
    
    // 7. Apply diversity penalty to ensure variety
    const diverseActivities = applyDiversityPenalty(timeFilteredActivities);
    console.log(`🎯 IMPROVED LOGIC: After diversity penalty: ${diverseActivities.length} activities`);
    
    // 8. Return top activities
    const finalActivities = diverseActivities.slice(0, 6);
    console.log('🎯 IMPROVED LOGIC: Final activities:');
    finalActivities.forEach((activity: Activity, index: number) => {
      const cleanTitle = activity.title.replace(/\s*-\s*(Avoiding|Seeking|Sensitive|Low-Registration|Mixed|Bedtime)$/, '');
      console.log(`  ${index + 1}. ${cleanTitle} (${activity.behavior_types?.join(', ') || 'no behavior'})`);
    });
    
    return finalActivities;
    
  } catch (error) {
    console.error('🎯 IMPROVED LOGIC: Error in getPersonalizedActivities:', error);
    return getFallbackActivities();
  }
};

// Special bedtime handling for the 3 hard-coded late-night activities
const getBedtimeActivities = async (): Promise<Activity[]> => {
  try {
    const { data: lateNightActivities, error } = await supabase
      .from('activities')
      .select('*')
      .in('title', ['Gentle Hand Squeezes', 'Calming Belly Breathing', 'Quiet Counting'])
      .order('title');
    
    if (error || !lateNightActivities || lateNightActivities.length === 0) {
      console.log('Late-night activities not found in DB, using fallback');
      return getBedtimeFallbackActivities();
    }
    
    console.log(`Loaded ${lateNightActivities.length} late-night activities`);
    return lateNightActivities;
    
  } catch (error) {
    console.error('Error fetching late-night activities:', error);
    return getBedtimeFallbackActivities();
  }
};

// Fallback bedtime activities if DB lookup fails
const getBedtimeFallbackActivities = (): Activity[] => {
  return [
    {
      id: 'gentle-hand-squeezes',
      title: 'Gentle Hand Squeezes',
      description: 'Calming deep pressure through gentle hand squeezes',
      context: 'Bedtime calming',
      duration_minutes: 2,
      difficulty: 'beginner',
      activity_type: 'tactile',
      sensory_systems: ['tactile', 'proprioceptive'],
      behavior_types: ['mixed'],
      benefits: ['Provides calming deep pressure', 'Helps regulate nervous system'],
      when_to_use: 'When child is awake and needs help calming down to sleep',
      materials: [],
      steps: [
        { step_number: 1, title: 'Sit quietly', description: 'Sit quietly on the edge of their bed', duration_seconds: 30 },
        { step_number: 2, title: 'Gentle squeezes', description: 'Gently squeeze their hands, starting light', duration_seconds: 60 },
        { step_number: 3, title: 'Rhythmic pattern', description: 'Continue with slow, rhythmic pattern', duration_seconds: 30 }
      ],
      age_range: '3-8',
      environment: 'indoor'
    },
    {
      id: 'calming-belly-breathing',
      title: 'Calming Belly Breathing',
      description: 'Simple breathing exercise to help calm and relax',
      context: 'Bedtime calming',
      duration_minutes: 3,
      difficulty: 'beginner',
      activity_type: 'calming',
      sensory_systems: ['interoception'],
      behavior_types: ['mixed'],
      benefits: ['Calms the nervous system', 'Reduces anxiety and stress'],
      when_to_use: 'When child is restless or anxious and needs help relaxing',
      materials: [],
      steps: [
        { step_number: 1, title: 'Lie down', description: 'Have child lie on their back in bed', duration_seconds: 30 },
        { step_number: 2, title: 'Place hands', description: 'Place hands gently on their belly', duration_seconds: 30 },
        { step_number: 3, title: 'Breathe slowly', description: 'Take slow breaths, feel belly rise and fall', duration_seconds: 120 }
      ],
      age_range: '3-8',
      environment: 'indoor'
    },
    {
      id: 'quiet-counting',
      title: 'Quiet Counting',
      description: 'Simple counting activity to help calm and focus the mind',
      context: 'Bedtime calming',
      duration_minutes: 2,
      difficulty: 'beginner',
      activity_type: 'calming',
      sensory_systems: ['interoception'],
      behavior_types: ['mixed'],
      benefits: ['Helps focus the mind', 'Reduces racing thoughts'],
      when_to_use: 'When child\'s mind is racing and they need help focusing to sleep',
      materials: [],
      steps: [
        { step_number: 1, title: 'Lie comfortably', description: 'Have child lie comfortably in their bed', duration_seconds: 30 },
        { step_number: 2, title: 'Count slowly', description: 'Count slowly from 1 to 10, taking a breath between each number', duration_seconds: 60 },
        { step_number: 3, title: 'Keep counting', description: 'Keep counting slowly and rhythmically', duration_seconds: 30 }
      ],
      age_range: '3-8',
      environment: 'indoor'
    }
  ] as Activity[];
};

// Time-based fallback when no assessment is available
const getTimeBasedFallbackActivities = (allActivities: Activity[], timeSlot: string): Activity[] => {
  const timePreferences: Record<string, string[]> = {
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
  
  // Filter activities by time preference and return top 6
  const timeFiltered = allActivities.filter(activity => 
    preferredTypes.includes(activity.activity_type || '')
  );
  
  // If not enough time-specific activities, add some general ones
  if (timeFiltered.length < 6) {
    const generalActivities = allActivities.filter(activity => 
      !timeFiltered.some(tf => tf.id === activity.id)
    );
    timeFiltered.push(...generalActivities.slice(0, 6 - timeFiltered.length));
  }
  
  return timeFiltered.slice(0, 6);
};

// Unified activity source - no more confusion
const getAllActivities = async (): Promise<Activity[]> => {
  try {
    const { data: dbActivities, error } = await supabase
      .from('activities')
      .select('*');
    
    if (error || !dbActivities || dbActivities.length === 0) {
      console.log('Using hardcoded activity library');
      return normalizeActivities(activityLibrary);
    }
    
    console.log(`Loaded ${dbActivities.length} activities from database`);
    return normalizeActivities(dbActivities);
    
  } catch (error) {
    console.log('Database error, using fallback activities');
    return normalizeActivities(activityLibrary);
  }
};

// Normalize activities to have consistent structure
const normalizeActivities = (activities: Activity[]): Activity[] => {
  return activities.map(activity => ({
    ...activity,
    // Ensure consistent behavior types (convert string to array if needed)
    behavior_types: activity.behavior_types || 
                   (activity.behavior_fit ? [activity.behavior_fit] : ['mixed']),
    // Ensure sensory systems exist
    sensory_systems: activity.sensory_systems || ['proprioceptive'],
    // Ensure difficulty exists
    difficulty: activity.difficulty || 'beginner'
  }));
};

// Extract clear child profile from assessment
const extractChildProfile = (assessment: Assessment): ChildProfile => {
  const results = assessment.results as any;
  const behaviorScores = results.behaviorScores || {};
  
  // Find dominant behavior pattern
  const behaviors = [
    { type: 'seeking', score: behaviorScores.seeking || 0 },
    { type: 'avoiding', score: behaviorScores.avoiding || 0 },
    { type: 'sensitive', score: behaviorScores.sensitive || 0 },
    { type: 'low-registration', score: behaviorScores['low-registration'] || 0 }
  ];
  
  const dominantBehavior = behaviors.reduce((max, current) => 
    current.score > max.score ? current : max
  ).type;
  
  // Find challenging sensory systems (score > 15)
  const systems = ['tactile', 'visual', 'auditory', 'olfactory', 'proprioceptive', 'vestibular', 'interoception'];
  const challengingSystems = systems.filter(system => 
    results[system] && results[system] > 15
  );
  
  // Determine intensity level
  const avgScore = behaviors.reduce((sum, b) => sum + b.score, 0) / behaviors.length;
  const intensityLevel = avgScore > 20 ? 'high' : avgScore > 12 ? 'medium' : 'low';
  
  // Determine preferred difficulty
  const preferredDifficulty = (behaviorScores.avoiding > 15 || behaviorScores.sensitive > 15) 
    ? 'beginner' 
    : intensityLevel === 'high' ? 'intermediate' : 'beginner';
  
  console.log('Child Profile:', {
    dominantBehavior,
    challengingSystems,
    intensityLevel,
    preferredDifficulty
  });
  
  return {
    dominantBehavior,
    challengingSystems,
    intensityLevel,
    preferredDifficulty
  };
};

// Simplified scoring - focus on what matters most
const scoreActivitiesForChild = (activities: Activity[], profile: ChildProfile): ActivityScore[] => {
  return activities.map(activity => {
    let personalityScore = 0;
    let timeScore = 0;
    let varietyScore = Math.random() * 2; // Small random factor for variety
    
    // PERSONALITY SCORING (most important)
    
    // 1. Behavior match (highest weight)
    if (activity.behavior_types?.includes(profile.dominantBehavior)) {
      personalityScore += 20;
    } else if (activity.behavior_types?.includes('mixed')) {
      personalityScore += 10;
    }
    
    // 2. Sensory system match (high weight)
    const matchingSystems = activity.sensory_systems?.filter(system => 
      profile.challengingSystems.includes(system)
    ) || [];
    personalityScore += matchingSystems.length * 15;
    
    // 3. Difficulty match (medium weight)
    if (activity.difficulty === profile.preferredDifficulty) {
      personalityScore += 8;
    }
    
    // 4. Intensity match (medium weight)
    if (profile.intensityLevel === 'high' && activity.activity_type === 'heavy-work') {
      personalityScore += 8;
    } else if (profile.intensityLevel === 'low' && activity.activity_type === 'calming') {
      personalityScore += 8;
    }
    
    const totalScore = personalityScore + timeScore + varietyScore;
    
    return {
      activity,
      personalityScore,
      timeScore,
      varietyScore,
      totalScore
    };
  });
};

// Light time filtering - don't override personality, just nudge
const applyTimeFilter = (scoredActivities: ActivityScore[], timeSlot: string): Activity[] => {
  const timePreferences: Record<string, string[]> = {
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
  
  // Give small bonus for time-appropriate activities (don't override personality)
  const timeAdjusted = scoredActivities.map(scored => {
    if (preferredTypes.includes(scored.activity.activity_type || '')) {
      return {
        ...scored,
        timeScore: 5, // Small bonus
        totalScore: scored.totalScore + 5
      };
    }
    return scored;
  });
  
  // Sort by total score and return activities
  return timeAdjusted
    .sort((a, b) => b.totalScore - a.totalScore)
    .map(scored => scored.activity);
};

// Apply diversity penalty to prevent too many activities of the same type
const applyDiversityPenalty = (activities: Activity[]): Activity[] => {
  const activityBaseCounts: Record<string, number> = {};
  const penalizedActivities: Array<{ activity: Activity; penalty: number }> = [];
  
  activities.forEach(activity => {
    // Extract base activity name (before the dash and behavior type)
    const baseActivityName = activity.title.split(' - ')[0] || activity.title;
    const currentCount = activityBaseCounts[baseActivityName] || 0;
    
    // Apply penalty for repeated base activities (regardless of behavior variant)
    let penalty = 0;
    if (currentCount >= 1) {
      penalty = currentCount * 15; // Stronger penalty for same base activity
    }
    
    // Store the activity with its penalty
    penalizedActivities.push({
      activity,
      penalty
    });
    
    activityBaseCounts[baseActivityName] = currentCount + 1;
  });
  
  // Sort by penalty (activities with lower penalties first)
  return penalizedActivities
    .sort((a, b) => a.penalty - b.penalty)
    .map(item => item.activity);
};

// Improved next activity selection with proper error handling
export const getNextActivity = async (
  currentActivities: Activity[], 
  justCompleted: Activity, 
  assessment: Assessment | null
): Promise<Activity> => {
  try {
    // Handle bedtime special case
    const timeSlot = getCurrentTimeSlot();
    if (timeSlot === 'bedtime') {
      const bedtimeActivities = await getBedtimeActivities();
      // Return a different bedtime activity than the one just completed
      const availableBedtime = bedtimeActivities.filter(a => a.id !== justCompleted.id);
      return availableBedtime[0] || bedtimeActivities[0];
    }
    
    // Get all available activities
    const allActivities = await getAllActivities();
    
    // Remove current activities and just completed
    const availableActivities = allActivities.filter(activity => 
      !currentActivities.some(current => current.id === activity.id) &&
      activity.id !== justCompleted.id
    );
    
    // Remove recently completed (last 4 hours)
    const recentCompletions = getRecentCompletions(4); // 4 hours
    const recentTitles = recentCompletions.map((c: { activity_name: string }) => c.activity_name);
    const filteredActivities = availableActivities.filter(activity =>
      !recentTitles.includes(activity.title)
    );
    
    // If we have assessment, use it for scoring
    if (assessment) {
      const profile = extractChildProfile(assessment);
      const scoredActivities = scoreActivitiesForChild(filteredActivities, profile);
      
      // Add variety bonus for different activity type
      const varietyScored = scoredActivities.map(scored => {
        if (scored.activity.activity_type !== justCompleted.activity_type) {
          return {
            ...scored,
            varietyScore: scored.varietyScore + 5,
            totalScore: scored.totalScore + 5
          };
        }
        return scored;
      });
      
      // Return best match
      const sorted = varietyScored.sort((a, b) => b.totalScore - a.totalScore);
      return sorted[0]?.activity || getFallbackActivities()[0];
    }
    
    // No assessment - return random from filtered
    return filteredActivities[Math.floor(Math.random() * filteredActivities.length)] || 
           getFallbackActivities()[0];
           
  } catch (error) {
    console.error('Error getting next activity:', error);
    return getFallbackActivities()[0];
  }
};

// Enhanced activity steps function with proper integration
export const getActivitySteps = (activityId: string): ActivityStep[] => {
  // Special handling for bedtime activities
  if (activityId === 'gentle-hand-squeezes') {
    return [
      { id: 1, instruction: 'Sit quietly on the edge of their bed' },
      { id: 2, instruction: 'Gently squeeze their hands, starting light' },
      { id: 3, instruction: 'Gradually increase to firm but comfortable pressure' },
      { id: 4, instruction: 'Continue with slow, rhythmic pattern' },
      { id: 5, instruction: 'Squeeze for 3 seconds, release for 2 seconds' },
      { id: 6, instruction: 'Continue until they feel calm and sleepy' }
    ];
  }
  
  if (activityId === 'calming-belly-breathing') {
    return [
      { id: 1, instruction: 'Have child lie on their back in bed' },
      { id: 2, instruction: 'Place hands gently on their belly' },
      { id: 3, instruction: 'Take a slow breath in through the nose' },
      { id: 4, instruction: 'Feel the belly rise as you breathe in' },
      { id: 5, instruction: 'Slowly breathe out through the mouth' },
      { id: 6, instruction: 'Feel the belly fall as you breathe out' }
    ];
  }
  
  if (activityId === 'quiet-counting') {
    return [
      { id: 1, instruction: 'Have child lie comfortably in their bed' },
      { id: 2, instruction: 'Count slowly from 1 to 10, taking a breath between each number' },
      { id: 3, instruction: 'Count backwards from 10 to 1, staying focused on the numbers' },
      { id: 4, instruction: 'Keep counting slowly and rhythmically' },
      { id: 5, instruction: 'Focus only on the numbers and breathing' },
      { id: 6, instruction: 'Continue until they feel calm and sleepy' }
    ];
  }
  
  // For other activities, return a generic instruction
  return [
    { id: 1, instruction: 'Follow the activity instructions provided in the app' }
  ];
};

// Helper to get recent completions
const getRecentCompletions = (hours: number) => {
  try {
    const existingCompletions = JSON.parse(localStorage.getItem('activity_completions') || '[]');
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return existingCompletions.filter((comp: { completed_at: string }) => 
      new Date(comp.completed_at) > cutoffTime
    );
  } catch (error) {
    console.error('Error getting recent completions:', error);
    return [];
  }
};

// Clean fallback when everything fails
const getFallbackActivities = (): Activity[] => {
  return activityLibrary;
};

// Time slot helper function
const getCurrentTimeSlot = (): string => {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 8) return 'before-breakfast';
  if (hour >= 8 && hour < 10) return 'mid-morning';
  if (hour >= 10 && hour < 12) return 'before-lunch';
  if (hour >= 12 && hour < 14) return 'lunch';
  if (hour >= 14 && hour < 16) return 'mid-afternoon';
  if (hour >= 16 && hour < 18) return 'before-dinner';
  if (hour >= 18 && hour < 20) return 'dinner';
  if (hour >= 20 && hour < 22) return 'evening';
  if (hour >= 22 || hour < 6) return 'bedtime'; // 10 PM to 6 AM
  
  return 'unknown';
}; 