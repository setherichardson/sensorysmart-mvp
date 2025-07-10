const fs = require('fs');
const path = require('path');

// Import the activity library directly from the create script
const { activityLibrary } = require('./create-activity-library.js');

function exportDetailedActivities() {
  console.log('📊 Exporting detailed activities with steps...\n');

  // Create detailed CSV with steps
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
    'Steps Count',
    'Step 1 Title',
    'Step 1 Description',
    'Step 1 Duration (seconds)',
    'Step 2 Title',
    'Step 2 Description',
    'Step 2 Duration (seconds)',
    'Step 3 Title',
    'Step 3 Description',
    'Step 3 Duration (seconds)',
    'Step 4 Title',
    'Step 4 Description',
    'Step 4 Duration (seconds)',
    'Step 5 Title',
    'Step 5 Description',
    'Step 5 Duration (seconds)'
  ].join(',');

  // Convert activities to CSV rows with detailed steps
  const csvRows = activityLibrary.map((activity, index) => {
    const steps = activity.steps || [];
    
    // Create base row with activity info
    const baseRow = [
      `"${activity.id || `activity-${index + 1}`}"`,
      `"${activity.title}"`,
      `"${activity.description}"`,
      `"${activity.sensory_systems.join(', ')}"`,
      `"${activity.behavior_fit}"`,
      `"${activity.difficulty}"`,
      `"${activity.duration_minutes}"`,
      `"${activity.materials_needed.join(', ')}"`,
      `"${activity.age_range}"`,
      `"${activity.environment}"`,
      `"${steps.length}"`
    ];

    // Add step details (up to 5 steps)
    const stepDetails = [];
    for (let i = 0; i < 5; i++) {
      const step = steps[i];
      if (step) {
        stepDetails.push(
          `"${step.title || ''}"`,
          `"${step.description || ''}"`,
          `"${step.duration_seconds || ''}"`
        );
      } else {
        stepDetails.push('""', '""', '""');
      }
    }

    return [...baseRow, ...stepDetails].join(',');
  });

  // Combine header and rows
  const csvContent = [csvHeader, ...csvRows].join('\n');

  // Write detailed CSV file
  const csvPath = path.join(__dirname, '../exports/activities-detailed-steps.csv');
  fs.mkdirSync(path.dirname(csvPath), { recursive: true });
  fs.writeFileSync(csvPath, csvContent);

  // Create detailed JSON with full step information
  const detailedActivities = activityLibrary.map((activity, index) => ({
    id: activity.id || `activity-${index + 1}`,
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

  const jsonPath = path.join(__dirname, '../exports/activities-full-details.json');
  fs.writeFileSync(jsonPath, JSON.stringify(detailedActivities, null, 2));

  // Create a readable text report
  let textReport = 'SENSORY SMART ACTIVITY LIBRARY - DETAILED STEPS\n';
  textReport += '='.repeat(60) + '\n\n';

  detailedActivities.forEach((activity, index) => {
    textReport += `${index + 1}. ${activity.name.toUpperCase()}\n`;
    textReport += `   Description: ${activity.description}\n`;
    textReport += `   Sensory Systems: ${activity.sensorySystems.join(', ')}\n`;
    textReport += `   Behavior Types: ${activity.behaviorTypes.join(', ')}\n`;
    textReport += `   Difficulty: ${activity.difficultyLevel}\n`;
    textReport += `   Duration: ${activity.durationMinutes} minutes\n`;
    textReport += `   Materials: ${activity.materials.join(', ')}\n`;
    textReport += `   Age Range: ${activity.ageRange}\n`;
    textReport += `   Environment: ${activity.environment}\n\n`;
    
    textReport += '   STEPS:\n';
    activity.steps.forEach((step, stepIndex) => {
      textReport += `   ${stepIndex + 1}. ${step.title}\n`;
      textReport += `      ${step.description}\n`;
      textReport += `      Duration: ${step.duration_seconds} seconds\n\n`;
    });
    
    textReport += '\n' + '-'.repeat(60) + '\n\n';
  });

  const textPath = path.join(__dirname, '../exports/activities-detailed-report.txt');
  fs.writeFileSync(textPath, textReport);

  // Print summary to console
  console.log('📈 Detailed Activity Library Summary:');
  console.log(`Total Activities: ${detailedActivities.length}\n`);

  console.log('🎯 Activities by Sensory System:');
  const systemCount = {};
  detailedActivities.forEach(activity => {
    activity.sensorySystems.forEach(system => {
      systemCount[system] = (systemCount[system] || 0) + 1;
    });
  });
  Object.entries(systemCount)
    .sort(([,a], [,b]) => b - a)
    .forEach(([system, count]) => {
      console.log(`  ${system}: ${count} activities`);
    });

  console.log('\n📊 Total Steps Across All Activities:');
  const totalSteps = detailedActivities.reduce((sum, activity) => sum + activity.steps.length, 0);
  console.log(`  ${totalSteps} total steps`);

  console.log('\n📁 Files created:');
  console.log(`  📄 Detailed CSV: ${csvPath}`);
  console.log(`  📋 Full JSON: ${jsonPath}`);
  console.log(`  📝 Text Report: ${textPath}`);

  console.log('\n✅ Detailed export complete!');
  console.log('💡 Check the text report for the most readable format with all steps.');
}

// Run the detailed export
exportDetailedActivities(); 