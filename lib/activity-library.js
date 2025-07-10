// Activity library for Sensory Smart MVP
// This file contains all activities that can be imported by other scripts

const { activityLibrary } = require('../scripts/create-activity-library.js');

// Transform activities to match the expected format for the export script
const transformedActivities = activityLibrary.map(activity => ({
  id: activity.id || `activity-${Math.random().toString(36).substr(2, 9)}`,
  name: activity.title,
  description: activity.description,
  sensorySystems: activity.sensory_systems,
  behaviorTypes: [activity.behavior_fit],
  difficultyLevel: activity.difficulty,
  durationMinutes: activity.duration_minutes,
  materials: activity.materials_needed,
  ageRange: activity.age_range,
  environment: activity.environment,
  steps: activity.steps || []
}));

module.exports = {
  activityLibrary: transformedActivities
}; 