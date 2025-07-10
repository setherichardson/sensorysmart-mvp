const fs = require('fs');
const path = require('path');

// Import the activity library
const { activityLibrary } = require('../lib/activity-library');

function exportActivities() {
  console.log('📊 Exporting activities for review...\n');

  // Create CSV header
  const csvHeader = [
    'ID',
    'Name',
    'Description',
    'Sensory Systems',
    'Behavior Types',
    'Difficulty Level',
    'Duration (minutes)',
    'Materials',
    'Age Range',
    'Environment',
    'Steps Count'
  ].join(',');

  // Convert activities to CSV rows
  const csvRows = activityLibrary.map(activity => {
    const steps = activity.steps || [];
    return [
      `"${activity.id}"`,
      `"${activity.name}"`,
      `"${activity.description}"`,
      `"${activity.sensorySystems.join(', ')}"`,
      `"${activity.behaviorTypes.join(', ')}"`,
      `"${activity.difficultyLevel}"`,
      `"${activity.durationMinutes}"`,
      `"${activity.materials.join(', ')}"`,
      `"${activity.ageRange}"`,
      `"${activity.environment}"`,
      `"${steps.length}"`
    ].join(',');
  });

  // Combine header and rows
  const csvContent = [csvHeader, ...csvRows].join('\n');

  // Write CSV file
  const csvPath = path.join(__dirname, '../exports/activities.csv');
  fs.mkdirSync(path.dirname(csvPath), { recursive: true });
  fs.writeFileSync(csvPath, csvContent);

  // Create detailed JSON export
  const jsonPath = path.join(__dirname, '../exports/activities-detailed.json');
  fs.writeFileSync(jsonPath, JSON.stringify(activityLibrary, null, 2));

  // Create summary report
  const summary = {
    totalActivities: activityLibrary.length,
    bySensorySystem: {},
    byBehaviorType: {},
    byDifficulty: {},
    byAgeRange: {},
    byEnvironment: {}
  };

  activityLibrary.forEach(activity => {
    // Count by sensory system
    activity.sensorySystems.forEach(system => {
      summary.bySensorySystem[system] = (summary.bySensorySystem[system] || 0) + 1;
    });

    // Count by behavior type
    activity.behaviorTypes.forEach(type => {
      summary.byBehaviorType[type] = (summary.byBehaviorType[type] || 0) + 1;
    });

    // Count by difficulty
    summary.byDifficulty[activity.difficultyLevel] = (summary.byDifficulty[activity.difficultyLevel] || 0) + 1;

    // Count by age range
    summary.byAgeRange[activity.ageRange] = (summary.byAgeRange[activity.ageRange] || 0) + 1;

    // Count by environment
    summary.byEnvironment[activity.environment] = (summary.byEnvironment[activity.environment] || 0) + 1;
  });

  const summaryPath = path.join(__dirname, '../exports/activities-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

  // Print summary to console
  console.log('📈 Activity Library Summary:');
  console.log(`Total Activities: ${summary.totalActivities}\n`);

  console.log('🎯 By Sensory System:');
  Object.entries(summary.bySensorySystem)
    .sort(([,a], [,b]) => b - a)
    .forEach(([system, count]) => {
      console.log(`  ${system}: ${count} activities`);
    });

  console.log('\n🎭 By Behavior Type:');
  Object.entries(summary.byBehaviorType)
    .sort(([,a], [,b]) => b - a)
    .forEach(([type, count]) => {
      console.log(`  ${type}: ${count} activities`);
    });

  console.log('\n📊 By Difficulty Level:');
  Object.entries(summary.byDifficulty)
    .sort(([,a], [,b]) => b - a)
    .forEach(([level, count]) => {
      console.log(`  ${level}: ${count} activities`);
    });

  console.log('\n👶 By Age Range:');
  Object.entries(summary.byAgeRange)
    .sort(([,a], [,b]) => b - a)
    .forEach(([age, count]) => {
      console.log(`  ${age}: ${count} activities`);
    });

  console.log('\n🏠 By Environment:');
  Object.entries(summary.byEnvironment)
    .sort(([,a], [,b]) => b - a)
    .forEach(([env, count]) => {
      console.log(`  ${env}: ${count} activities`);
    });

  console.log('\n📁 Files created:');
  console.log(`  📄 CSV: ${csvPath}`);
  console.log(`  📋 JSON: ${jsonPath}`);
  console.log(`  📊 Summary: ${summaryPath}`);

  console.log('\n✅ Export complete! You can open the CSV file in Excel for review.');
}

// Run the export
exportActivities(); 