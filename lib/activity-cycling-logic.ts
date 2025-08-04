// Simple activity cycling logic - replaces complex scoring system

import { supabase } from './supabase/client'
import type { Activity, Assessment } from './supabase/client'

interface ActivityStep {
  id: number;
  instruction: string;
}

// Get activities for a child's profile using simple cycling
export const getCycledActivities = async (assessment: Assessment | null): Promise<Activity[]> => {
  try {
    console.log('🔄 CYCLING: Starting activity cycling');
    
    // Handle bedtime special case
    const timeSlot = getCurrentTimeSlot();
    if (timeSlot === 'bedtime') {
      console.log('🔄 CYCLING: Bedtime detected, returning bedtime activities');
      return await getBedtimeActivities();
    }
    
    // If no assessment, return general activities
    if (!assessment) {
      console.log('🔄 CYCLING: No assessment, using general activities');
      return getGeneralActivities();
    }
    
    // Get personalized activity list for this child
    const personalizedActivities = await getPersonalizedActivityList(assessment);
    console.log(`🔄 CYCLING: Found ${personalizedActivities.length} personalized activities`);
    
    // Get current cycle position for this user
    const cyclePosition = await getCurrentCyclePosition(assessment.user_id);
    console.log(`🔄 CYCLING: Current cycle position: ${cyclePosition}`);
    
    // Get next 3 activities from the cycle
    const nextActivities = getNextActivitiesFromCycle(personalizedActivities, cyclePosition, 3);
    console.log(`🔄 CYCLING: Selected ${nextActivities.length} activities`);
    
    // Update cycle position for next time
    await updateCyclePosition(assessment.user_id, cyclePosition + 3);
    
    return nextActivities;
    
  } catch (error) {
    console.error('🔄 CYCLING: Error in getCycledActivities:', error);
    return getFallbackActivities();
  }
};

// Get personalized activity list (filtered by assessment, but not scored)
const getPersonalizedActivityList = async (assessment: Assessment): Promise<Activity[]> => {
  try {
    const { data: allActivities, error } = await supabase
      .from('activities')
      .select('*');
    
    if (error || !allActivities) {
      console.log('🔄 CYCLING: Using fallback activities');
      return getFallbackActivities();
    }
    
    // Extract child profile
    const results = assessment.results as any;
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
    
    console.log('🔄 CYCLING: Child profile:', { dominantBehavior, challengingSystems });
    
    // Filter activities to match child's needs
    const filteredActivities = allActivities.filter(activity => {
      // Must match dominant behavior OR be mixed
      const behaviorMatch = activity.behavior_types?.includes(dominantBehavior) || 
                           activity.behavior_types?.includes('mixed');
      
      // Should match at least one challenging system (but not required)
      const systemMatch = activity.sensory_systems?.some((system: string) => 
        challengingSystems.includes(system)
      );
      
      return behaviorMatch && (systemMatch || challengingSystems.length === 0);
    });
    
    console.log(`🔄 CYCLING: Filtered to ${filteredActivities.length} matching activities`);
    return filteredActivities;
    
  } catch (error) {
    console.error('🔄 CYCLING: Error getting personalized list:', error);
    return getFallbackActivities();
  }
};

// Get current cycle position for user
const getCurrentCyclePosition = async (userId: string): Promise<number> => {
  try {
    // For now, use localStorage-style approach with database
    // In production, you might want to store this in a user_preferences table
    const key = `activity_cycle_${userId}`;
    const stored = localStorage.getItem(key);
    return stored ? parseInt(stored) : 0;
  } catch (error) {
    console.log('🔄 CYCLING: Error getting cycle position, starting at 0');
    return 0;
  }
};

// Update cycle position
const updateCyclePosition = async (userId: string, newPosition: number): Promise<void> => {
  try {
    const key = `activity_cycle_${userId}`;
    localStorage.setItem(key, newPosition.toString());
  } catch (error) {
    console.log('🔄 CYCLING: Error updating cycle position');
  }
};

// Get next activities from cycle
const getNextActivitiesFromCycle = (activities: Activity[], startIndex: number, count: number): Activity[] => {
  if (activities.length === 0) return [];
  
  const result = [];
  for (let i = 0; i < count; i++) {
    const index = (startIndex + i) % activities.length;
    result.push(activities[index]);
  }
  
  return result;
};

// Bedtime activities (hardcoded)
const getBedtimeActivities = async (): Promise<Activity[]> => {
  try {
    const { data: lateNightActivities, error } = await supabase
      .from('activities')
      .select('*')
      .in('title', ['Gentle Hand Squeezes', 'Calming Belly Breathing', 'Quiet Counting'])
      .order('title');
    
    if (error || !lateNightActivities || lateNightActivities.length === 0) {
      return getBedtimeFallbackActivities();
    }
    
    return lateNightActivities;
    
  } catch (error) {
    console.error('🔄 CYCLING: Error fetching bedtime activities:', error);
    return getBedtimeFallbackActivities();
  }
};

// Fallback bedtime activities
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
      steps: [],
      age_range: '3-8',
      environment: 'bedroom',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'calming-belly-breathing',
      title: 'Calming Belly Breathing',
      description: 'Simple breathing exercise to calm the mind and body',
      context: 'Bedtime calming',
      duration_minutes: 3,
      difficulty: 'beginner',
      activity_type: 'interoception',
      sensory_systems: ['interoception'],
      behavior_types: ['mixed'],
      benefits: ['Calms nervous system', 'Reduces anxiety', 'Helps with sleep'],
      when_to_use: 'When child needs help relaxing before sleep',
      materials: [],
      steps: [],
      age_range: '3-8',
      environment: 'bedroom',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'quiet-counting',
      title: 'Quiet Counting',
      description: 'Simple counting activity to focus the mind',
      context: 'Bedtime calming',
      duration_minutes: 2,
      difficulty: 'beginner',
      activity_type: 'cognitive',
      sensory_systems: ['visual'],
      behavior_types: ['mixed'],
      benefits: ['Focuses attention', 'Calms racing thoughts', 'Simple and quiet'],
      when_to_use: 'When child\'s mind is busy and needs help settling',
      materials: [],
      steps: [],
      age_range: '3-8',
      environment: 'bedroom',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
};

// General activities (fallback)
const getGeneralActivities = (): Activity[] => {
  return [
    {
      id: 'wall-pushups',
      title: 'Wall Push-ups',
      description: 'Deep pressure input through pushing against a wall',
      context: 'General regulation',
      duration_minutes: 3,
      difficulty: 'beginner',
      activity_type: 'proprioceptive',
      sensory_systems: ['proprioceptive'],
      behavior_types: ['mixed'],
      benefits: ['Provides deep pressure input', 'Helps with regulation'],
      when_to_use: 'When needing proprioceptive input',
      materials: [],
      steps: [],
      age_range: '3-8',
      environment: 'anywhere',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'bear-hugs',
      title: 'Bear Hugs',
      description: 'Firm, deep pressure hugs',
      context: 'General comfort',
      duration_minutes: 2,
      difficulty: 'beginner',
      activity_type: 'proprioceptive',
      sensory_systems: ['proprioceptive', 'tactile'],
      behavior_types: ['mixed'],
      benefits: ['Provides deep pressure', 'Emotional connection', 'Calming'],
      when_to_use: 'During transitions or when seeking comfort',
      materials: [],
      steps: [],
      age_range: '3-8',
      environment: 'anywhere',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'deep-breathing',
      title: 'Deep Breathing',
      description: 'Simple breathing exercise',
      context: 'General calming',
      duration_minutes: 2,
      difficulty: 'beginner',
      activity_type: 'interoception',
      sensory_systems: ['interoception'],
      behavior_types: ['mixed'],
      benefits: ['Calms nervous system', 'Reduces anxiety'],
      when_to_use: 'When feeling overwhelmed or anxious',
      materials: [],
      steps: [],
      age_range: '3-8',
      environment: 'anywhere',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
};

// Fallback activities
const getFallbackActivities = (): Activity[] => {
  return getGeneralActivities();
};

// Get current time slot
const getCurrentTimeSlot = (): string => {
  const now = new Date();
  const hour = now.getHours();
  
  if (hour >= 22 || hour < 6) return 'bedtime';
  if (hour >= 6 && hour < 8) return 'before-breakfast';
  if (hour >= 8 && hour < 10) return 'mid-morning';
  if (hour >= 10 && hour < 12) return 'before-lunch';
  if (hour >= 12 && hour < 14) return 'lunch';
  if (hour >= 14 && hour < 16) return 'mid-afternoon';
  if (hour >= 16 && hour < 18) return 'before-dinner';
  if (hour >= 18 && hour < 20) return 'dinner';
  return 'evening';
};

// Get activity steps (simplified)
export const getActivitySteps = (activityId: string): ActivityStep[] => {
  // For now, return generic steps - this can be enhanced later
  return [
    { id: 1, instruction: 'Get ready for the activity' },
    { id: 2, instruction: 'Follow the activity instructions' },
    { id: 3, instruction: 'Complete the activity safely' }
  ];
}; 